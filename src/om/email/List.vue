<script>
  import rpc from 'src/utils/rpc';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import Methods from './Methods';
  export default {
    name: "List",
    mixins: [WindowBase, Methods],
    methods: {
      ...Utils,
      getCondition: function () {
        let conditionList = [], self = this;
        // conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      queryList () {
        let self = this
        self.windowData.loading = true;
        let start = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        // let condition = self.getCondition().join(' ')

        this.updateCount()
        let preStep
        let mineUuidList = []
        if (this.dbData.common.isAdmin) {
          preStep = new Promise((resolve, reject) => { resolve() })
        } else {
          preStep = rpc.query('accounts/resources/refs', { // get AccountResourceRef
            q: ['resourceType=SNSEmailPlatformVO', `accountUuid=${localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              mineUuidList = resp.inventories.map((item) => item.resourceUuid)
              return new Promise((resolve, reject) => { resolve() })
            })
        }
        return preStep
          .then(() => {
            let condition = this.getCondition()
            if (!this.dbData.common.isAdmin) {
              if (this.currTab === 'mine') {
                condition = condition.concat(`uuid?=${mineUuidList.join(',')}`)
              } else if (this.currTab === 'share') {
                condition = condition.concat(`uuid!?=${mineUuidList.join(',')}`)
              }
            }
            condition = condition.join(' ')
            let script = `

def tmp = query("QuerySNSEmailPlatform limit=${limit} start=${start} ${condition} sortBy=${self.windowData.sortBy} sortDirection=${self.windowData.sortDirection === '-' ? 'desc' : 'asc'} replyWithCount=true")
put("total", tmp.total)

def EmailServerSettingList = tmp.result
put("emailserversetting", EmailServerSettingList)

`
            if (this.dbData.common.isAdmin) {
              script += `
def uuidList = EmailServerSettingList.collect{ it.uuid }
def EmailServerSettingA = []
def accountResourceRef = query("QueryAccountResourceRef resourceUuid?=" + uuidList.join(",")).result
def sharedResourceRef = query("QuerySharedResource resourceUuid?=" + uuidList.join(",")).result
uuidList.each{ uuid ->
  tmp = [:]
  tmp["uuid"] = uuid
  def accountRef = accountResourceRef.find { it.resourceUuid == uuid }
  tmp["accountUuid"] = ""
  if (accountRef && accountRef.accountUuid) {
    tmp["accountUuid"] = accountRef.accountUuid
  }
  tmp["toPublic"] = false
  def sharedRef = sharedResourceRef.find { it.resourceUuid == uuid }
  if (sharedRef && sharedRef.toPublic) {
    tmp["toPublic"] = true
  }
  EmailServerSettingA.push(tmp)
}
put("emailserversettingA", EmailServerSettingA)
`
            } else {
              script += `
def uuidList = EmailServerSettingList.collect{ it.uuid }
def EmailServerSettingA = []
def accountResourceRef = query("QueryAccountResourceRef resourceUuid?=" + uuidList.join(",")).result
def sharedResourceRef = query("QuerySharedResource resourceUuid?=" + uuidList.join(",")).result
uuidList.each{ uuid ->
  tmp = [:]
  tmp["uuid"] = uuid
  def accountRef = accountResourceRef.find { it.resourceUuid == uuid }
  tmp["accountUuid"] = ""
  if (accountRef && accountRef.accountUuid) {
    tmp["accountUuid"] = accountRef.accountUuid
  }
  tmp["toPublic"] = false
  def sharedRef = sharedResourceRef.find { it.resourceUuid == uuid }
  if (sharedRef && sharedRef.toPublic) {
    tmp["toPublic"] = true
  }
  EmailServerSettingA.push(tmp)
}
put("emailserversettingA", EmailServerSettingA)
`
            }
            return rpc.query('batch-queries', {
              script: encodeURIComponent(script)
            }).then(resp => {
              let result = resp.result
              return self.applyRespToDb(result, self).then(() => {
                let uuidList = result.emailserversetting.map(host => host.uuid)
                let table = {}
                uuidList.forEach(uuid => {
                  table[uuid] = {
                    selected: false
                  }
                })
                return self.updateWindow({
                  pageCount: result.total === 0 ? 1 : Math.ceil(result.total / self.windowData.pageSize),
                  uuidList,
                  table,
                  total: result.total
                }).then(() => {
                 self.itemList = self.getItemList();
                 self.windowData.loading = false;
                })
              })
            })
          })
      },
      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) =>{
          return self.dbData.emailserversetting[uuid]
        })
      },
      updateCount () {
        let searchConditionList = [], self = this;
        if (self.selectVal !== '' && self.searchStr !== '') {
          searchConditionList = searchConditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        let preStep
        let mineUuidList = []
        if (this.dbData.common.isAdmin) {
          preStep = new Promise((resolve, reject) => { resolve() })
        } else {
          preStep = rpc.query('accounts/resources/refs', { // get AccountResourceRef
            q: ['resourceType=SNSEmailPlatformVO', `accountUuid=${localStorage.getItem('accountUuid')}`]
          })
            .then((resp) => {
              mineUuidList = resp.inventories.map((item) => item.resourceUuid)
              return new Promise((resolve, reject) => { resolve() })
            })
        }

        preStep
          .then(() => {
            if (this.dbData.common.isAdmin) {
              rpc.query('sns/application-platforms/email', {
                replyWithCount: true,
                q: [].concat(searchConditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    availableCount: resp.total
                  })
                })
            } else {
              rpc.query('sns/application-platforms/email', {
                replyWithCount: true,
                q: [`uuid?=${mineUuidList.join(',')}`].concat(searchConditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    mineCount: resp.total
                  })
                })

              rpc.query('sns/application-platforms/email', {
                replyWithCount: true,
                q: [`uuid!?=${mineUuidList.join(',')}`].concat(searchConditionList)
              })
                .then((resp) => {
                  this.updateWindow({
                    shareCount: resp.total
                  })
                })
            }
          })
      },
      inStates(){
        let statesList= [], selectStatesList = [], self = this, isInstates = false;
        if(!self.selectedList) return false;
        if(arguments){
          for(let arg in arguments){
            statesList.push(arguments[arg])
          }
        }
        selectStatesList = self.selectedList.map((uuid) => {
          if(self.dbData.emailserversetting[uuid])
          return self.dbData.emailserversetting[uuid].state
        })
        isInstates = selectStatesList.every((item) => {
          return statesList.some(state => {
            return item === state;
          })
        })
        return isInstates;
      },
      //停用与启用
      pageEnable(param, fn){
        let self = this, uuidList = [];
        if(!self.isSelected) return;
        for(let uuid of self.selectedList){
          self.dbData.emailserversetting[uuid].state !== param ? uuidList.push(uuid) : uuidList;
        }
        self[(param.toLowerCase()).slice(0, param.length-1)](uuidList, fn)
      },
      getSharedToAllList () {
        let uuidList = this.selectedList,  list;
          list = uuidList.filter(uuid => {
            return this.dbData.emailserversettingA[uuid].toPublic
          })
        return list
      },
      getNotSharedToAllList () {
        let uuidList = this.selectedList, list;
        list = uuidList.filter(uuid => {
          return !this.dbData.emailserversettingA[uuid].toPublic
        })
        return list
      },
      hasSharedToAll () {
        let list = this.getSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      hasNotSharedToAll () {
        let list = this.getNotSharedToAllList()
        if (list.length > 0) return true
        return false
      },
      //全局共享与召回
      pageShareToAll(param, fn){
        let self = this;
        self.openDialog('SharetoAllConfirmDlg', {
          title: param === 'share' ? 'common.shareToAll' : 'common.recallFromAll',
          warning:  param === 'share' ? 'instanceOffering.shareToAllText' : 'account.recall',
          ok(){
            self[`${param}All`](self.selectedList, fn)
          }
        })
      },
      pageChangeResourceOwner (fn) {
        let uuidList = this.selectedList
        let uuid, select
        if (uuidList.length === 1) {
          uuid = this.dbData.emailserversettingA[uuidList[0]].accountUuid
          select = (accountUuids) => {
            return this.changeResourceOwner(uuidList, accountUuids, fn)
          }
        } else {
          let firstResourceAccountRef = this.dbData.emailserversettingA[uuidList[0]].accountUuid
          let hasSameAccount = uuidList.every(uuid => this.dbData.emailserversettingA[uuidList[0]].accountUuid === firstResourceAccountRef)
          uuid = hasSameAccount ? firstResourceAccountRef : ''
          select = (accountUuids) => {
            let list = []
            uuidList.forEach((item) => {
              if (this.dbData.emailserversettingA[uuidList[0]].accountUuid !== accountUuids[0]) list.push(item)
            })
            if (list.length === 0) return
            return this.changeResourceOwner(list, accountUuids[0], fn)
          }
        }
        this.openDialog('AccountListDlg', {
          type: 'radio',
          uuid,
          select
        })
      },
      pageValidate () {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        this.validateSNSEmailPlatform(selectedUuidList)
      },
      pageDelete (fn) {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            title: 'monitoralarm.deleteMedia',
            description: 'monitoralarm.deleteMediaConfirm',
            uuidList,
            icon: 'mail_popupico',
            ok: () => {
              this.delete(uuidList, fn)
            },
            getName(uuid){
              return self.dbData.emailserversetting[uuid].name;
            }
          })
        }
      },
    }
  }
</script>

<style scoped>

</style>
