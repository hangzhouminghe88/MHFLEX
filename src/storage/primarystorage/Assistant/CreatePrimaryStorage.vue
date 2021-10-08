<script>
  import ZoneMethods from 'src/om/zone/Methods'
  import ClusterMethods from 'src/om/cluster/Methods'
  import SANStorageMethods from 'src/storage/sanstorage/Methods'
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'

  export default {
    name: 'AssistantForCreatePrimaryStorage',
    data () {
      const self = this
      let zoneUuid = `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
      let obj = {}
      obj.Zone = {
        name: 'Zone',
        route: '/main/zone',
        path: 'zones',
        getCheckContent: () => self.$t('assistant.disabledZone'),
        getLackContent: () => self.$t('assistant.lackOfZone'),
        generate: 'add',
        generator: self.createZone,
        existedContion: [],
        availableCondition: ['state=Enabled', `uuid=${window.localStorage.getItem('currZoneUuid')}`]
      }
      obj.Cluster = {
        name: 'Cluster',
        route: '/main/cluster',
        path: 'clusters',
        getCheckContent: () => self.$t('assistant.disabledCluster'),
        generate: 'create',
        getLackContent: () => self.$t('assistant.lackOfCluster'),
        availableCondition: ['state=Enabled', 'type=zstack', zoneUuid, 'hypervisorType=KVM'],
        generator: self.createCluster,
        existedContion: ['type=zstack', zoneUuid, 'hypervisorType=KVM']
      }
      obj.SANStorage = {
        name: 'SANStorage',
        route: '/main/sanstorage',
        filePath: 'windows/WebStorage/dialogs/CreateServer',
        path: 'storage-devices/iscsi/servers',
        generate: 'add',
        existedContion: [],
        availableCondition: ['state=Enabled'],
        generator: self.createSANStorage,
        getCheckContent: () => self.$t('assistant.disabledSANStorage'),
        getLackContent: () => self.$t('assistant.lackOfSANStorage')
      }
      _.keys(obj).forEach(resource => {
        let originName = resource
        obj[resource].handler = () => {
          let param = {
            ok: (param) => {
              obj[originName].generator(param).then(() => {
                self.queryForAssistant()
              }, () => {
                self.queryForAssistant()
              })
            },
            cancel: () => {
              self.queryForAssistant()
            }
          }
          if (resource === 'SANStorage') {
            return self.openFullPanel('windows/WebStorage/dialogs/CreateServer', param)
          } else {
            return self.openFullMainWindow(`Create${resource}Dlg`, param)
          }
        }
      })
      return {
        resourceList: obj,
        assistantTitle: '',
        timerId: self.genUniqueId()
      }
    },
    destroyed () {
      this.deleteCurrAssistant(this.windowData.id)
      this.removeTimerTask(this.windowData.timerId)
    },
    methods: {
      ...{
        createCluster: ClusterMethods.methods.create,
        createSANStorage: SANStorageMethods.methods.create,
        createZone: ZoneMethods.methods.create
      },
      getContent (item) {
        let resourceList = _.cloneDeep(this.$data.resourceList)
        if (item.controller.name === 'check') {
          return resourceList[item.data.name].getCheckContent()
        } else if (_.includes(['add', 'create'], item.controller.name)) {
          return resourceList[item.data.name].getLackContent()
        } else {
          return ''
        }
      },
      newAssistant (resource, operation) {
        const self = this
        let handler
        if (operation === 'check') {
          handler = () => self.$router.push(resource.route)
        } else if (_.includes(['add', 'create'], operation)) {
          handler = resource.handler
        }
        let obj = {
          data: {
            name: resource.name,
            id: `assistant-${self.genUniqueId()}`,
            getTitle: () => this.$t('assistant.psTitle'),
            ownerId: self.windowData.id,
            getContent: self.getContent,
            hideButton: resource.hideButton
          },
          controller: {
            name: operation,
            handler
          }
        }
        self.addAssistantItem(obj)
      },
      getListToCheck (resourceList) {
        let list = _.keys(resourceList).filter(resource => {
          let isSB = this.windowData.type === 'SharedBlock'
          if (!isSB) return resource === 'Zone'
          // let isClusterSelected = !!this.clusterUuid
          // if (!isClusterSelected) return resource !== 'SANStorage'
          // return true
          return resource !== 'SANStorage'
        })
        return list
      },
      queryForAssistant () {
        const self = this
        self.deleteAllAssistant()
        let resourceList = _.cloneDeep(self.$data.resourceList)
        let queryList = self.getListToCheck(resourceList)
        queryList.forEach(resource => {
          rpc.query(resourceList[resource].path, {count: true, q: resourceList[resource].existedContion}).then(resp => {
            if (resp.total === 0) {
              return self.newAssistant(resourceList[resource], resourceList[resource].generate)
            }
            if (resource === 'SANStorage') {
              _.remove(resourceList[resource].availableCondition, it => _.includes(it, 'iscsiCluster.clusterUuid'))
              resourceList[resource].availableCondition.push(`iscsiCluster.clusterUuid=${self.clusterUuid}`)
            }
            rpc.query(resourceList[resource].path, {count: true, q: resourceList[resource].availableCondition}).then(resp => {
              if (resp.total === 0) {
                return self.newAssistant(resourceList[resource], 'check')
              }
            })
          })
        })
      }
    }
  }
</script>
