<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  import Controller from './Controller'
  import GBK from 'gbk.js'
  /* global localStorage:false */

  export default {
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      query (uuidList) {
        const self = this
        let uuidListStr = ''
        if (_.isArray(uuidList)) {
          uuidListStr = uuidList.join(',')
        } else {
          uuidListStr = uuidList
        }
        let script = `

def tmp = query("QueryHost uuid?=${uuidListStr}")

def HostList = tmp.result
put("host", HostList)

def HostUuidList = HostList.collect{ it.uuid }

def clusterUuidList = HostList.collect{ it.clusterUuid }
def ClusterList = query("QueryCluster uuid?=" + clusterUuidList.join(",")).result
put("cluster", ClusterList)

def ZoneList = query("QueryZone host.uuid?=" + HostUuidList.join(",")).result
put("zone", ZoneList)

def GlobalConfigurations = query("QueryGlobalConfig category=KVM name=reservedMemory").result
def HostAList = []

def systemTagList = query("QuerySystemTag resourceUuid?=" + HostUuidList.join(",")).result

HostUuidList.each{ uuid ->
  tmp = [:]
  tmp["uuid"] = uuid

  tmp["reservedMemory"] = GlobalConfigurations[0].value

  def result = call("org.zstack.header.allocator.APIGetCpuMemoryCapacityMsg", '{"hostUuids": ' + [uuid] +'}').result
  tmp["availableMemoryCapacity"] = result.availableMemoryCapacity

  tmp["updateOS"] = false

  tmp["hostOS"] = 'CentOS'
  def tagsAboutHost = systemTagList.findAll{ it.resourceUuid == uuid }
  def osdistribution = ''
  def osrelease = ''
  def osversion = ''
  def isSetEpt = false
  tagsAboutHost.each{ tag ->
    if (tag.tag.indexOf("os::distribution::") > -1) {
      osdistribution = tag.tag.split('::')[2]
    }
    if (tag.tag.indexOf("os::release::") > -1) {
      osrelease = tag.tag.split('::')[2]
    }
    if (tag.tag.indexOf("os::version::") > -1) {
      osversion = tag.tag.split('::')[2]
    }
    if (tag.tag.indexOf("cpuModelName") > -1) {
      tmp["cpuModel"] = tag.tag.split('::')[1]
    }
    if (tag.tag.indexOf("pageTableExtensionDisabled") > -1) {
      isSetEpt = true
      tmp["eptUuid"] = tag.uuid
    }
  }
  if (osdistribution) {
    tmp["hostOS"] = osdistribution + ' ' + osrelease + ' ' + osversion
  }
  tmp["ept"] = isSetEpt
  HostAList.push(tmp)
}
put("hostA", HostAList)
`
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let result = resp.result
          return self.applyRespToDb(result, self)
        })
      },
      create: function (params) {
        let self = this
        if (!params.useFile) {
          let event = self.createEvent('host.action.add', params[0].name, params.length)
          let tasks = []
          params.forEach(function (param, index) {
            let p = rpc.create('hosts/kvm', param, event).then(() => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
            tasks.push(p)
          })
          return Promise.all(tasks)
        } else {
          let jobUuid = self.genUniqueId()
          let event = self.createEvent('host.action.addByFile', null, undefined, undefined, undefined, {tableName: 'host', resourceUuid: jobUuid, jobUuid})
          let byteArray = GBK.decode(new Uint8Array(params.hostInfo))
          let blob = new window.Blob([byteArray], {
            type: 'text/plain'
          })
          let reader = new window.FileReader()
          let fileInfo
          reader.onload = function (e) {
            fileInfo = e.target.result
            let param = {
              hostInfo: window.btoa(unescape(encodeURIComponent(fileInfo))),
              resourceUuid: jobUuid
            }
            return rpc.create('longjobs', {
              jobName: ' APIAddKVMHostFromConfigFileMsg',
              jobData: JSON.stringify(param)
            }, event, jobUuid)
              .then(() => {
                return self.triggerLongJobTask()
              }, () => {
                self.incEventFail(event)
                return self.longJobHandler(event, self)
              })
          }
          reader.readAsText(blob)
          return new Promise((resolve, reject) => { resolve() })
        }
      },
      delete: function (uuidList) {
        const self = this
        let event = self.createEvent('host.action.delete', uuidList.length === 1 ? self.dbData.host[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(uuid => {
          let p = rpc._delete(`hosts/${uuid}`, null, event)
            .then(() => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      enable: function (uuidList) {
        const self = this
        let event = self.createEvent('host.action.enable', uuidList.length === 1 ? self.dbData.host[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let hostInventory = _.cloneDeep(self.dbData.host[uuid])
            hostInventory.state = 'Starting'
            self.updateDbRow({
              tableName: 'host',
              id: uuid,
              data: hostInventory
            })
            let p = rpc.update('hosts', uuid, {
              'changeHostState': {
                'stateEvent': 'enable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'host',
                  id: uuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      disable: function (uuidList) {
        const self = this
        let event = self.createEvent('host.action.disable', uuidList.length === 1 ? self.dbData.host[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let hostInventory = _.cloneDeep(self.dbData.host[uuid])
            hostInventory.state = 'Stopping'
            self.updateDbRow({
              tableName: 'host',
              id: uuid,
              data: hostInventory
            })
            let p = rpc.update('hosts', uuid, {
              'changeHostState': {
                'stateEvent': 'disable'
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                self.updateDbRow({
                  tableName: 'host',
                  id: uuid,
                  data: resp.inventory
                })
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      reconnect: function (uuidList) {
        return Controller.reconnect(uuidList, this)
      },
      maintain: function (uuidList) {
        const self = this
        let event = self.createEvent('host.action.maintain', uuidList.length === 1 ? self.dbData.host[uuidList[0]].name : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc.update('hosts', uuid, {
              'changeHostState': {
                'stateEvent': 'maintain'
              }
            }, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'host',
                  id: uuid,
                  data: resp.inventory
                })
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      pageDelete: function () {
        const self = this
        let uuidList = []
         uuidList = self.selectedList;
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'common.destroyHost',
            description: 'host.deleteHost',
            warning: 'host.deleteWarning',
            icon: 'host_popupico',
            getName(uuid){
              return self.dbData.host[uuid].name
            },
            uuidList,
            ok: () => {
              return self.delete(uuidList).then(() => {
                if (self.refresh) {
                  self.refresh()
                }
                if (self.queryList) {
                  self.queryList()
                }
              })
            }
          })
        }
      },
      pageEnable: function () {
        let uuidList = [], self = this;
        self.selectedList.forEach((uuid) => {
          if (this.dbData.host[uuid].state !== 'Enabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.enable(uuidList).then(() => self.queryList())
      },
      pageDisable: function () {
        let uuidList = []
        const self = this
        self.selectedList.forEach((uuid) => {
          if (this.dbData.host[uuid].state !== 'Disabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'host.disable',
            description: 'host.disableHost',
            warning: 'host.disableWaring',
            icon: 'host_popupico',
            getName(uuid){
              return self.dbData.host[uuid].name
            },
            uuidList,
            ok: () => {
              self.disable(uuidList).then(() => self.queryList())
            }
          })
        }
      },
      pageReconnect: function () {
        const self = this
        let uuidList = self.selectedList
        if (uuidList.length > 0) {
          return self.openDialog('ConfirmDlg',{
            title: 'host.reconnect',
            warning: 'host.reconnectWarning',
            uuidList: uuidList,
            icon: 'host_popupico',
            ok: () => {
              return self.reconnect(uuidList).then(() => {
                return self.queryList()
              })
            },
            getName(uuid){
              return self.dbData.host[uuid].name
            }
          })
        }
      },
      pageMaintain: function () {
        let uuidList = []
        let self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'common.intoMaintain',
            description: 'host.maintainHost',
            icon: 'host_popupico',
            getName(uuid){
              return self.dbData.host[uuid].name;
            },
            ok: () => {
              self.maintain(uuidList).then(() => self.query())
            }
          })
        }
      },
      openCreateHost: function () {
        const self = this
        self.$router.push({name: 'createHost'})
      },
      openClusterCreateHost: function () {
        const self = this
        self.openFullMainWindow('CreateHostDlg', {
          ok: (param) => {
            return self.create(param).then(() => {
              if (self.refresh) {
                self.refresh()
              }
              if (self.queryList) {
                self.queryList()
              }
            })
          },
          curclusteruuid: self.param.clusterUuid
        })
      },
      updateCount: function () {
        rpc.query('hosts', {
          count: true,
          limit: 100000,
          q: [`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'hypervisorType=KVM']
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      ...Utils
    }
  }
</script>


