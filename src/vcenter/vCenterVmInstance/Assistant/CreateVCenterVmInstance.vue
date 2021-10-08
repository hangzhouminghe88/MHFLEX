<script>
// import HostMethods from 'src/windows/Host/Methods'
import vCenterImageMethods from 'src/vcenter/vCenterImage/Methods'
import VolumeOfferingMethods from 'src/ecs/volumeOffering/Methods'
import VCenterNetworkMethods from 'src/vcenter/vCenterNetWork/Methods'
import PrimaryStorageMethods from 'src/storage/primarystorage/Methods'
import InstanceOfferingModels from 'src/ecs/intanceOffing/Methods'
import _ from 'lodash'
import rpc from 'src/utils/rpc'
import Utils from 'src/utils/utils'

export default {
  name: 'AssistantForCreateVmInstance',
  data () {
    const self = this
    let isAdmin = window.localStorage.getItem('isAdmin')
    let zoneUuid = `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
    let obj = {}
    obj.vCenterImages = {
      name: 'vCenterImages',
      route: 'createvCenterImage',
      path: 'images',
      getCheckContent: () => { return self.$t('assistant.disabledImage') },
      generate: 'add',
      getLackContent: () => { return self.$t('assistant.lackOfImage') },
      availableCondition: [
        'format=vmtx',
        'system=false',
        'status=Ready',
        'state=Enabled',
        `backupStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`,
        'backupStorage.type=vcenter'
      ],
      generator: self.createImage,
      existedContion: [
        'format=vmtx',
        'system=false',
        `backupStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`,
        'backupStorage.type=vcenter',
        'status!=Deleted'
      ],
      unavailableCallback: self.addImageTimer
    }
    obj.vCenterNetwork = {
      name: 'vCenterNetwork',
      route: 'createvCenterNetwork',
      path: 'l3-networks',
      getCheckContent: () => { return self.$t('assistant.disabledAvaliableNetwork') },
      getLackContent: () => { return self.$t('assistant.lackOfAvaliableNetwork') },
      generator: self.createPrivateNetwork,
      existedContion: [zoneUuid, `category?=Private,Public`],
      generate: 'create'
    }
    obj.PrimaryStorage = {
      name: 'PrimaryStorage',
      route: 'createprimarystorage',
      path: 'primary-storage',
      generate: 'add',
      isAdminOnly: true,
      existedContion: [zoneUuid],
      availableCondition: [zoneUuid, 'status=Connected', 'state=Enabled', 'type=VCenter'],
      hideButton: true,
      generator: self.createPrimaryStorage,
      getCheckContent: () => { return self.$t('assistant.disabledPrimaryStorage') },
      getLackContent: () => { return self.$t('assistant.lackOfPrimaryStorage') },
      unavailableCallback: self.checkPs
    }
    obj.InstanceOffering = {
      name: 'InstanceOffering',
      path: 'instance-offerings',
      route: 'createInstanceOffering',
      existedContion: ['type=UserVm'],
      availableCondition: ['type=UserVm', 'state=Enabled'],
      generate: 'create',
      generator: self.createInstanceOffering,
      getCheckContent: () => { return self.$t('assistant.disabledInstanceOffering') },
      getLackContent: () => { return self.$t('assistant.lackOfInstanceOffering') }
    }
    obj.VolumeOffering = {
      name: 'VolumeOffering',
      path: 'disk-offerings',
      route: 'createVolumeOffering',
      existedContion: [],
      availableCondition: ['state=Enabled'],
      generate: 'create',
      generator: self.createVolumeOffering,
      getCheckContent: () => { return self.$t('assistant.disabledVolumeOffering') },
      getLackContent: () => { return self.$t('assistant.lackOfVolumeOffering') }
    }
    _.keys(obj).forEach(resource => {
      obj[resource].handler = () => {
        self.$router.push({name: resource.router})
      }
    })
    if (isAdmin !== 'true') {
      ['PrimaryStorage', 'InstanceOffering', 'VolumeOffering', 'vCenterNetwork'].forEach(resource => {
        obj[resource].hideButton = true
        if (!_.includes(['InstanceOffering', 'VolumeOffering', 'vCenterNetwork'], resource)) {
          obj[resource].getLackContent = () => { return self.$t('assistant.lackOfHardWare') + ', ' + self.$t('assistant.contact') }
        } else {
          obj[resource].getLackContent = () => { return self.$t(`assistant.lackOf${resource}`) + ', ' + self.$t('assistant.contact') }
        }
      })
    }
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
    ...Utils,
    queryImageForAssistant () {
      const self = this
      return rpc.query('images', {count: true, q: self.$data.resourceList['vCenterImages'].availableCondition}).then(resp => {
        if (resp.total !== 0) {
          self.removeTimerTask(self.$data.timerId)
          self.removeImageAssistant()
        }
      })
    },
    removeImageAssistant () {
      return this.deleteAssistantItem(this.resourceList['vCenterImages'].getCheckContent())
    },
    checkPs () {
      const self = this
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
    getTitle () {
      let title = this.$t('assistant.vmTitle')
      this.$data.assistantTitle = title
      return title
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
        handler = () => {
          return self.$router.push(resource.route)
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
    addImageTimer () {
      const self = this
      return self.addTimerTask({
        id: self.$data.timerId,
        interval: 2,
        method: () => {
          self.queryImageForAssistant()
        }
      })
    },
    queryIfNetworkMultiSelected () {
      const self = this
      let hasOtherAssistant = !!self.$data.assistantTitle
      let networkUuidList = self.l3NetworkUuidList
      if (!self.dbData.common.isAdmin || hasOtherAssistant) return
      else self.deleteCurrAssistant(self.windowData.id)
      if (networkUuidList.length <= 1) return
      let l3NetworkNames, clusterName
      let newAssistant = (first, second) => {
        let obj = {
          data: {
            id: `assistant-${self.genUniqueId()}`,
            getTitle: () => { return self.$t('assistant.vmMultiNetTitle') },
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
    getListToCheck (resourceList) {
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
          if (resource === 'vCenterNetwork') {
            if (self.imageUuid && self.availableL3NetworkList.length === 0) {
              return self.newAssistant(resourceList[resource], resourceList[resource].generate)
            }
            return
          }
          rpc.query(resourceList[resource].path, {count: true, q: resourceList[resource].availableCondition}).then(resp => {
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
