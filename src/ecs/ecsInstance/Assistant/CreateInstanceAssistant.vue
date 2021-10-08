<script>
  import _ from 'lodash'
  import rpc from 'src/utils/rpc'
  import { genUniqueId } from 'src/utils/utils'

  export default {
    name: 'AssistantForCreateVmInstance',

    computed: {},

    data() {
      const self = this
      let isAdmin = window.localStorage.getItem('isAdmin')
      let zoneUuid = `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
      let obj = {}
      obj.Host = {
        name: 'Host',
        listRoute: 'host',
        route: 'createHost',
        path: 'hosts',
        getCheckContent: () => {
          return self.$t('assistant.disabledHost')
        },
        getLackContent: () => {
          return self.$t('assistant.lackOfHost')
        },
        generate: 'add',
        existedContion: [zoneUuid],
        availableCondition: ['status=Connected', 'state=Enabled', zoneUuid]
      }
      obj.Image = {
        name: 'Image',
        listRoute: 'image',
        route: 'createImage',
        path: 'images',
        getCheckContent: () => {
          return self.$t('assistant.disabledImage')
        },
        generate: 'add',
        getLackContent: () => {
          return self.$t('assistant.lackOfImage')
        },
        availableCondition: ['state=Enabled', 'type=zstack', 'status=Ready', 'system=false', `backupStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`, 'mediaType!=DataVolumeTemplate', '__systemTag__!=remote'],
        generator: self.createImage,
        existedContion: ['type=zstack', 'status!=Deleted', 'system=false', `backupStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`, 'mediaType!=DataVolumeTemplate', '__systemTag__!=remote'],
        unavailableCallback: self.addImageTimer
      }
      obj.AvaliableNetwork = {
        name: 'AvaliableNetwork',
        listRoute: 'publicnetwork',
        route: 'createpublicnetwork',
        path: 'l3-networks',
        getCheckContent: () => {
          return self.$t('assistant.disabledAvaliableNetwork')
        },
        getLackContent: self.getNetworkLackContent,
        existedContion: self.getNetworkCondition,
        generate: 'create'
      }
      obj.PrimaryStorage = {
        name: 'PrimaryStorage',
        listRoute: 'primarystorage',
        route: 'createprimarystorage',
        path: 'primary-storage',
        generate: 'add',
        isAdminOnly: true,
        existedContion: [zoneUuid],
        availableCondition: [zoneUuid, 'status=Connected', 'state=Enabled', 'type!=VCenter', encodeURIComponent('availableCapacity>=1')],
        getCheckContent: () => {
          return self.$t('assistant.disabledPrimaryStorage')
        },
        getLackContent: () => {
          return self.$t('assistant.lackOfPrimaryStorage')
        },
        unavailableCallback: self.checkPs
      }
      obj.InstanceOffering = {
        name: 'InstanceOffering',
        path: 'instance-offerings',
        listRoute: 'instanceoffering',
        route: 'createInstanceOffering',
        existedContion: ['type=UserVm'],
        availableCondition: ['type=UserVm', 'state=Enabled'],
        generate: 'create',
        getCheckContent: () => {
          return self.$t('assistant.disabledInstanceOffering')
        },
        getLackContent: () => {
          return self.$t('assistant.lackOfInstanceOffering')
        }
      }
      obj.VolumeOffering = {
        name: 'createVolumeOffering',
        path: 'disk-offerings',
        listRoute: 'volumeOffering',
        route: 'createVolumeOffering',
        existedContion: [],
        availableCondition: ['state=Enabled'],
        generate: 'create',
        getCheckContent: () => {
          return self.$t('assistant.disabledVolumeOffering')
        },
        getLackContent: () => {
          return self.$t('assistant.lackOfVolumeOffering')
        }
      }

      _.keys(obj).forEach(resource => {
        obj[resource].handler = () => {
           let self = this;
           debugger
           self.$router.push({name: obj[resource].route})
        }

        if (resource === 'AvaliableNetwork') {
          obj[resource].handler = () => {
            return self.$router.push({name: obj[resource].route})
          }
          if (isAdmin !== 'true') {
            obj[resource].handler = () => {
              return self.$router.push({name:'publicnetwork'})
            }
          }
        }

      })
      if (isAdmin !== 'true') {
        ['Host', 'PrimaryStorage', 'InstanceOffering', 'VolumeOffering'].forEach(resource => {
          obj[resource].hideButton = true
          if (!_.includes(['InstanceOffering', 'VolumeOffering'], resource)) {
            obj[resource].getLackContent = () => {
              return self.$t('assistant.lackOfHardWare') + ', ' + self.$t('assistant.contact')
            }
          } else {
            obj[resource].getLackContent = () => {
              return self.$t(`assistant.lackOf${resource}`) + ', ' + self.$t('assistant.contact')
            }
          }
        })
      }
      return {
        resourceList: obj,
        assistantTitle: '',
        timerId: genUniqueId()
      }
    },
    destroyed() {
      this.deleteCurrAssistant(this.windowData.id)
      this.removeTimerTask(this.windowData.timerId)
    },
    methods: {
      getNetworkCondition: async function () {
        let zoneUuid = `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
        let condition = [zoneUuid, `category?=Private,Public`]
        if (this.networkType === 'ipv4') condition.push('ipVersion=4')
        else if (this.networkType === 'ipv6') condition.push('ipVersion=6')
        if (this.windowData.imageUuid) {
          let resp = await rpc.query(`images-l3networks/dependencies`, {
            zoneUuid: window.localStorage.getItem('currZoneUuid'),
            imageUuid: this.windowData.imageUuid
          })
          if (resp.inventories.length > 0) {
            let uuidList = resp.inventories.map((item) => item.ipRanges.length && item.uuid)
            condition.push(`uuid?=${uuidList}`)
          } else if (resp.inventories.length === 0) {
            condition.push(`uuid?=${[]}`)
          }
        }
        return condition
      },
      queryImageForAssistant() {
        const self = this
        return rpc.query('images', {count: true, q: self.$data.resourceList['Image'].availableCondition}).then(resp => {
          if (resp.total !== 0) {
            self.removeTimerTask(self.$data.timerId)
            self.removeImageAssistant()
          }else{
            self.newAssistant(self.$data.resourceList['Image'], 'create')
          }
        })
      },

      queryInstanceOfferingForAssistant() {
        const self = this
        return rpc.query('instance-offerings', {count: true, q: self.$data.resourceList['InstanceOffering'].availableCondition}).then(resp => {
          if (resp.total !== 0) {
            self.removeInstanceOfferingAssistant()
          }else{
            self.newAssistant(self.$data.resourceList['InstanceOffering'], 'create')
          }
        })
      },

      removeImageAssistant() {
        return this.deleteAssistantItem(this.resourceList['Image'].getCheckContent())
      },

      removeInstanceOfferingAssistant(){
        return this.deleteAssistantItem(this.resourceList['InstanceOffering'].getCheckContent())
      },
      checkPs() {
        const self = this
        debugger
        return rpc.query('clusters', {q: self.$data.zoneUuid}).then(clusterresp => {
          let clusterUuids = clusterresp.inventories.map(item => item.uuid)
          let psUuids = []
          let tasks = []
          let p
          clusterUuids.forEach(clusterUuid => {
            let cluster = `cluster.uuid=${clusterUuid}`
            p = rpc.query('primary-storage', {q: cluster}).then(psresp => {
              if (psresp.inventories.length !== 0) {
                psUuids.push(psresp.inventories.map(item => item.uuid))
              }
            })
            tasks.push(p)
          })
          return Promise.all(tasks).then(() => {
            if (psUuids.length === 0) {
              self.newAssistant(self.$data.resourceList['PrimaryStorage'], 'check')
            }
          })
        })
      },
      getTitle() {
        let title = this.$t('assistant.vmTitle')
        this.$data.assistantTitle = title
        return title
      },
      getContent(item) {
        let resourceList = _.cloneDeep(this.$data.resourceList)
        if (item.controller.name === 'check') {
          return resourceList[item.data.name].getCheckContent()
        } else if (_.includes(['add', 'create'], item.controller.name)) {
          return resourceList[item.data.name].getLackContent()
        } else {
          return ''
        }
      },
      newAssistant(resource, operation) {
        const self = this
        let handler
        if (operation === 'check') {
          handler = () => {
            debugger
            return self.$router.push({name: resource.listRoute})
          }
        } else if (_.includes(['add', 'create'], operation)) {
          handler = resource.handler
        }
        let obj = {
          data: {
            name: resource.name,
            id: `assistant-${self.genUniqueId()}`,
            getTitle: self.getTitle,
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
      addImageTimer() {
        const self = this
        return self.addTimerTask({
          id: self.$data.timerId,
          interval: 2,
          method: () => {
            self.queryImageForAssistant()
          }
        })
      },
      getNetworkLackContent() {
        let self = this
        if (self.networkType === 'double') return self.$t('assistant.lackOfAvaliableNetwork')
        else if (self.networkType === 'IPV4') return self.$t('vm.assistant.lackOfAvaliableNetwork', {ipVersion: '4'})
        else if (self.networkType === self.$t('common.doubleIPv4AndIPv6')) return self.$t('vm.assistant.lackOfAvaliableNetwork', {ipVersion: '6'})
      },
      queryIfNetworkMultiSelected() {
        const self = this
        let hasOtherAssistant = !!self.$data.assistantTitle
        let networkUuidList = []
        if (self.networkType === 'IPV4') networkUuidList = self.windowData.networkUuidList
        else if (self.networkType === 'IPV6') networkUuidList = self.windowData.ipv6NetworkUuidList
        else if (self.networkType === self.$t('common.doubleIPv4AndIPv6')) networkUuidList = self.vmNicConfigList.map((item) => item.ipv4NetworkUuid).concat(self.vmNicConfigList.map((item) => item.ipv6NetworkUuid))
        if (!self.dbData.common.isAdmin || hasOtherAssistant) return
        else self.deleteCurrAssistant(self.windowData.id)
        if (networkUuidList.length <= 1) return
        let l3NetworkNames, clusterName
        let newAssistant = (first, second) => {
          let obj = {
            data: {
              id: `assistant-${self.genUniqueId()}`,
              getTitle: () => {
                return self.$t('assistant.vmMultiNetTitle')
              },
              ownerId: self.windowData.id,
              getContent: () => {
                return self.$t(`assistant.networksAttachedOnDifferentClusters`, {first, second})
              }
            },
            controller: {
              name: 'noResource'
            }
          }
          self.addAssistantItem(obj)
        }
        let clusters = []
        let clusterUuidList = []
        let clusterTasks = []
        let clusterP
        networkUuidList.forEach(network => {
          clusterP = rpc.query('clusters', {q: `l2Network.l3Network.uuid?=${network}`}).then(clusterResp => {
            if (clusterResp.inventories.length > 0) {
              clusters = clusters.concat(clusterResp.inventories)
              clusterUuidList.push(clusterResp.inventories.map(cluster => cluster.uuid))
            }
          })
          clusterTasks.push(clusterP)
        })
        return Promise.all(clusterTasks).then(() => {
          if (_.intersection(...clusterUuidList).length === 0) {
            let tasks = []
            let p
            clusters.forEach(cluster => {
              p = rpc.query(`l3-networks`, {
                fields: 'name',
                q: [`l2Network.cluster.uuid=${cluster.uuid}`, 'system=false']
              }).then(l3networkResp => {
                l3NetworkNames = l3networkResp.inventories.map(l3 => l3.name).join(',')
                clusterName = cluster.name
                newAssistant(l3NetworkNames, clusterName)
              })
              tasks.push(p)
            })
            return Promise.all(tasks)
          }
        })
      },
      getListToCheck(resourceList) {
        const self = this
        let list = []
        list = self.dbData.common.isAdmin ? _.keys(resourceList) : _.keys(resourceList).filter(resource => !resourceList[resource].isAdminOnly)
        _.remove(list, it => it === 'VolumeOffering')
        let imageUuid = self.windowData.imageUuid
        if (imageUuid && self.dbData.image[imageUuid] && self.dbData.image[imageUuid].mediaType !== 'RootVolumeTemplate') {
          list.push('VolumeOffering')
        }
        return list
      },
      queryForAssistant() {
        const self = this
        self.deleteAllAssistant()
        let resourceList = _.cloneDeep(self.$data.resourceList)
        let queryList = self.getListToCheck(resourceList)
        queryList.forEach(async (resource) => {
          let existedContion = resource === 'AvaliableNetwork' ? await self.getNetworkCondition() : resourceList[resource].existedContion
          rpc.query(resourceList[resource].path, {count: true, q: existedContion}).then(resp => {
            if (resp.total === 0) {
              return self.newAssistant(resourceList[resource], resourceList[resource].generate)
            }
            if (resource === 'AvaliableNetwork') {
              if (self.windowData.imageUuid && self.windowData.currL3NetworkList.length === 0 && self.windowData.networkUuidList.length === 0 && self.windowData.ipv6NetworkUuidList.length === 0) {
                return self.newAssistant(resourceList[resource], resourceList[resource].generate)
              }
              return
            }
            rpc.query(resourceList[resource].path, {
              count: true,
              q: resourceList[resource].availableCondition
            }).then(resp => {
              if (resp.total === 0) {
                if (resourceList[resource].unavailableCallback) {
                  resourceList[resource].unavailableCallback()
                }
                return self.newAssistant(resourceList[resource], 'check')
              }
            })
          })
        })
      }
    }
  }

</script>
