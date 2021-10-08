<script>
  // import Vue from 'vue'
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'

  export default {
    created: function () {
    },
    methods: {
      delete: function (uuidList) {
        const self = this
        let event = self.createEvent('loadbalancer.action.deleteListener', uuidList.length === 1 ? self.dbData.loadBalancerListener[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`load-balancers/listeners/${uuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
                if (!self.windowData.uuidList) return
                let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
                let newTable = _.cloneDeep(self.windowData.table)
                delete newTable[uuid]
                self.updateWindow({
                  uuidList: newUuidList,
                  table: newTable
                })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      addListener: function (param) {
        let event = this.createEvent('loadbalancer.action.addListener', param.name)
        let self = this
        let CreateLoadBalancerListenerMsg = {
          name: param.name,
          loadBalancerPort: param.loadBalancerPort,
          instancePort: param.instancePort,
          description: param.description,
          protocol: param.protocol,
          systemTags: param.systemTags
        }
        if (param.protocol === 'https' && param.certificateUuid !== '') {
          CreateLoadBalancerListenerMsg.certificateUuid = param.certificateUuid
        }
        return rpc.create(`load-balancers/${param.loadbalancerUuid}/listeners`, CreateLoadBalancerListenerMsg, event)
          .then((resp) => {
            self.incEventSuccess(event)
            self.$router.push({name: 'loadbalancerlistener'})
          }, () => {
            self.incEventFail(event)
          })
      },
      addListenerVmNics: function (param, uuid) {
        if (!param || (param.vmNicUuidList.length <= 0)) return
        let event = this.createEvent('vm.action.addVmNicToLoadBalancer', param.vmNicUuidList.length === 1 ? this.dbData.vm[this.dbData.vmNicRefs[param.vmNicUuidList[0]].vmInstanceUuid].name : '', param.vmNicUuidList.length)
        let self = this
        let msg = {
          vmNicUuids: param.vmNicUuidList
        }
        return rpc.create(`load-balancers/listeners/${uuid}/vm-instances/nics`, msg, event)
          .then((resp) => {
            self.setEventSuccess(event)
          }, () => {
            self.setEventFail(event)
          })
      },
      canDetachVmNic: function (uuid) {
        return this.dbData.loadBalancerListener[uuid].vmNicRefs && this.dbData.loadBalancerListener[uuid].vmNicRefs.length > 0
      },
      deleteListenerVmNics: function (uuidList, listenerUuid) {
        let event = this.createEvent('vm.action.detachVmNicToLoadBalancer', uuidList.length === 1 ? this.dbData.vm[this.dbData.vmNicRefs[uuidList[0]].vmInstanceUuid].name : '', uuidList.length)
        const self = this
        return rpc._delete(`load-balancers/listeners/${listenerUuid}/vm-instances/nics`, {
          vmNicUuids: uuidList
        }, event)
          .then((resp) => {
            self.setEventSuccess(event)
          }, () => {
            self.setEventFail(event)
          })
      },
      getLoadBalancerName: function (uuid) {
        const self = this
        let value
        try {
          value = self.dbData.loadBalancer[self.dbData.loadBalancerListener[uuid].loadBalancerUuid].name
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (this.checkBounce(`getLoadBalancerName-${uuid}`)) return ''
          value = ''
          rpc.query('load-balancers', {
            q: [`uuid=${self.dbData.loadBalancerListener[uuid].loadBalancerUuid}`]
          }).then((resp) => {
            if (resp.inventories.length > 0) {
              return self.updateDbRow({
                tableName: 'loadBalancer',
                id: self.dbData.loadBalancerListener[uuid].loadBalancerUuid,
                data: resp.inventories[0]
              })
            } else {
              return ''
            }
          }).then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
      },
      getResourceOwner: function (uuid) {
        const self = this
        let value = ''
        try {
          value = self.dbData.resourceOwner[uuid].name
          if (self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid].projectName) {
            value = self.dbData.accountA[self.dbData.resourceOwner[uuid].uuid].projectName
          }
        } catch (e) {
        }
        return value
      },
      canAttachCert: function (listenerUuids) {
        let self = this
        let canAttach = true
        for (let uuid of listenerUuids) {
          let listener = self.dbData.loadBalancerListener[uuid]
          if (!listener) break
          if (listener.protocol.toUpperCase() !== 'HTTPS') {
            canAttach = false
            break
          }
          if (listener.certificateRefs.length > 0) {
            canAttach = false
            break
          }
        }
        return canAttach
      },
      canDetachCert: function (listenerUuids) {
        let self = this
        let canDetach = true
        for (let uuid of listenerUuids) {
          let listener = self.dbData.loadBalancerListener[uuid]
          if (!listener) break
          if (listener.protocol.toUpperCase() !== 'HTTPS') {
            canDetach = false
            break
          }
          if (listener.certificateRefs.length === 0) {
            canDetach = false
            break
          }
        }
        return canDetach
      },
      attachCertificate: function (listenerUuids, isList) {
        const self = this
        self.openSideWindow('CertificateListSingleSelectList', {
          type: 'confirm',
          conditions: [],
          select: (certificateUuid) => {
            self.attach(listenerUuids, certificateUuid).then((resp) => {
              if (isList) {
                self.queryList()
              } else {
                self.query()
              }
            })
          }
        })
      },
      detachCertificate: function (listenerUuids, isList) {
        let self = this
        self.openConfirmDialog({
          title: 'certificate.detach',
          desc: 'certificate.detachConfirm',
          icon: 'certificate_n',
          uuidList: listenerUuids,
          ok: () => {
            self.detach(listenerUuids).then((resp) => {
              if (isList) {
                self.queryList()
              } else {
                self.query()
              }
            })
          },
          tableName: 'loadBalancerListener'
        })
      },
      detach: function (listenerUuids) {
        if (!Array.isArray(listenerUuids)) return
        const self = this
        let event = self.createEvent(`certificate.action.detach`, listenerUuids.length === 1 ? self.dbData.loadBalancerListener[listenerUuids[0]].name : '', listenerUuids.length)
        let tasks = []
        listenerUuids.forEach(function (uuid) {
          ((uuid) => {
            let certificateUuid = self.dbData.loadBalancerListener[uuid].certificateRefs[0].certificateUuid
            let p = rpc._delete(`load-balancers/listeners/${uuid}/certificate`, {
              certificateUuid: certificateUuid,
              listenerUuid: uuid
            }, event)
              .then(() => {
                self.incEventSuccess(event)
              }, (e) => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      attach: function (listenerUuids, certificateUuid) {
        if (!Array.isArray(listenerUuids)) return
        const self = this
        let event = self.createEvent(`certificate.action.attach`, listenerUuids.length === 1 ? self.dbData.loadBalancerListener[listenerUuids[0]].name : '', listenerUuids.length)
        let tasks = []
        listenerUuids.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc.create(`load-balancers/listeners/${uuid}/certificate`, {certificateUuid: certificateUuid,
              listenerUuid: uuid
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, (e) => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      ...Utils
    }
  }
</script>
