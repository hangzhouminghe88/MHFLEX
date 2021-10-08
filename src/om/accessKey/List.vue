<script>
  import Utils from 'src/utils/utils';
  import Methods from './Methods';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "List",
    mixins: [Methods, WindowBase],
    methods: {
      getCondition: function () {
        let conditionList = [], self = this;
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      queryList () {
        let self = this;
        self.windowData.loading = true;
        return self.dispatchAction('accessKey/basicQuery', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        }).then(resp => {
          let uuidList = resp.uuidList;
          return self
            .updateWindow({
              uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              pageCount: Utils.computePageCount(
                resp.total,
                self.windowData.pageSize
              ),
              total: resp.total
            })
            .then(() => {
              self.itemList = self.get(self.windowData.uuidList).map((item) => {
                item['isShow'] = false;
                return item;
              });
              self.windowData.loading = false;
            });
        });
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
          if(self.dbData.accesskey[uuid])
            return self.dbData.accesskey[uuid].state
        })
        isInstates = selectStatesList.every((item) => {
          return statesList.some(state => {
            return item === state;
          })
        })
        return isInstates;
      },
      pageEnable(state){
        let self = this, uuidList =  [];
        if(!self.isSelected) return;
        self.selectedList.forEach((uuid) => {
          if(self.dbData.accesskey[uuid].state !== state) uuidList.push(uuid);
        })
        let _options = {
          title: 'common.stopAccessKey',
          description: 'accesskey.disableConfirm',
          icon: 'zone_popupico',
          uuidList,
          warning: 'accesskey.disableWaring',
          getName(uuid){
            return self.dbData.accesskey[uuid].AccessKeyID;
          },
          ok(){
            self[state](uuidList, self.queryList)
          }
        }
        if(state === 'Enabled' && uuidList.length >=1) self[state](uuidList, self.queryList);
        if(state === 'Disabled' && uuidList.length >=1) self.openDialog('ConfirmDlg', _options);
      },
      pageDelete(){
        let self = this;
        let _options = {
          title: 'accesskey.delete',
          description: 'accesskey.deleteConfirm',
          icon: 'zone_popupico',
          uuidList: self.selectedList,
          warning: 'accesskey.deleteWarning',
          getName(uuid){
            return self.dbData.accesskey[uuid].AccessKeyID;
          },
          ok(){
            self.delete(self.selectedList, self.queryList)
          }
        }
        self.openDialog('ConfirmDlg', _options);
      },
      generateAccessKey (param) {
        const self = this
        if (self.getUserUuid() === '' || self.getAccountUuid() === '') {
          return
        }
        let _param= {
          description: '',
          accountUuid: self.getAccountUuid(),
          userUuid: self.getUserUuid()
        }
        self.create(_param, self.queryList);
      },
      getAccountUuid () {
        let accountUuid = ''
        let currProject = this.dbData.common.currProject
        if (currProject !== null) {
          accountUuid = this.dbData.common.currProject.uuid
          return accountUuid
        } else {
          accountUuid = window.localStorage.getItem('accountUuid')
          return accountUuid
        }
      },
      getUserUuid () {
        let userUuid = ''
        let currProject = this.dbData.common.currProject
        if (currProject !== null) {
          userUuid = window.localStorage.getItem('userUuid')
          return userUuid
        } else {
          userUuid = window.localStorage.getItem('accountUuid')
          return userUuid
        }
      },
    }
  }
</script>

<style scoped>

</style>
