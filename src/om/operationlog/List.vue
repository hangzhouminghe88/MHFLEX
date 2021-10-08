<script>
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from '../../windows/Window';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import OperationLogMethods from './Methods'
  import rpc from 'src/utils/rpc';
  import Utils from '../../utils/utils';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
    export default {
      name: "List",
      mixins: [WindowBase,OperationLogMethods, MultiSelectList],
      components: {PageTemplate,TableBodyItemState},
      created: async  function () {
        this.self = this
        let initTab = 'operationLog';
        if(this.self.$route.params && this.self.$route.params.currTab) initTab = this.self.$route.params.currTab
        await this.updateWindow({
          auditContext: {
            isPageChange: false,
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20
          },
          processingContext: {
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20
          },
          operationLogContext: {
            pageFlag: null,
            prePage: false,
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            isRefresh: false
          },
          pageIndex: 1,
          pageCount: 1,
          pageSize: 20,
          sortBy: 'createTime',
          sortDirection: '+'
        })
        this.updateWindow({
          selectStatus: 'all',
          selectName: 'operationLog.all',
          selectOperatorStatus: 'me',
          selectOperatorName: 'operationLog.me',
          auditLimit: 300,
          account: {},
          user: {},
          virtualID: {},
          auditList: [],
          operationLogList: [],
          processingList: [],
          processingPageList: [],
          currTab: initTab,
          currContext: initTab + 'Context',
          showSearchBox: false,
          operationLogCount: 0,
          auditCount: 0,
          processingCount: 0,
          showMoreDropdown: true,
          loading: false,
          methods: {
            queryList: this.queryList
          }
        }).then(() => {
          this.getCurrTime().then(() => {
            this.queryProcessing();
            if (this.dbData.common.isAdmin) this.queryAudit()
            this.queryOperationLog();
            this.addTimer();
            this.initSelectVal();
          })
        })
      },
      computed:{
        start_time: {
          get(){
            let self = this;
            return new Date(self.start_at);
          },
          set(val){
            let self = this;
            return self.start_at = val;
          }
        },
        end_time:{
          get(){
            let self = this;
            return new Date(self.end_at);
          },
          set(val){
            let self = this;
            self.end_at = val;
          }
        },
        getOperationTitle:{
          get(){
            let self = this;
            return `${self.$t('operationLog.result')}(${self.$t(this.windowData.selectName)})`
          },
        },
        getOperatorTitle(){
          return `${this.$t('operationLog.operator')}(${this.$t(this.windowData.selectOperatorName)})`
        }
      },
      destroyed: function () {
      },
      data () {
        return {
          debounceList: {},
          timerId: `timerTask-${this.genUniqueId()}`,
          currMessage: null,
          disabled: true,
          start_at: 0,
          end_at: 0,
          clear: true,
          format: 'yyyy-MM-dd HH:mm',
          searchStr:'',
          selectVal: '',
          auditConditionNameList: [
            {
              name: 'operationLog.resourceType',
              value: 'resourceType'
            },
            {
              name: 'operationLog.resourceUuid',
              value: 'resourceUuid'
            },
            {
              name: 'operationLog.api',
              value: 'apiName'
            },
            {
              name: 'operationLog.operator',
              createCondition: this.createConditionForOwner
            }
          ],
          operationLogConditionNameList: [
            {
              name: 'operationLog.description',
              value: 'title'
            },
            {
              name: 'operationLog.ip',
              value: 'ip'
            }
          ],
          operationLogConditionNameListAdmin: [
            {
              name: 'operationLog.description',
              value: 'title'
            },
            {
              name: 'operationLog.ip',
              value: 'ip'
            },
            {
              name: 'operationLog.operator',
              createCondition: this.createConditionForOperatorOwner
            }
          ],
          processingConditionNameList: [
            {
              name: 'operationLog.description',
              value: 'title'
            }
          ],
          operationLogDropdownList: [
            {
              name: 'operationLog.all',
              value: 'all'
            },
            {
              name: 'common.success',
              value: 'OK'
            },
            {
              name: 'common.failed',
              value: 'ERR'
            },
            {
              name: 'operationLog.other',
              value: 'MIX'
            }
          ],
          auditDropdownList: [
            {
              name: 'operationLog.all',
              value: 'all'
            },
            {
              name: 'common.success',
              value: 'success'
            },
            {
              name: 'common.failed',
              value: 'error'
            }
          ],
          operatorDropdownList: [
            {
              name: 'operationLog.all',
              value: 'all'
            },
            {
              name: 'operationLog.me',
              value: 'me'
            }
          ],
          conditionNameList: [],
          pickerOptions0: {
            disabledDate: (time) => {

            }
          },
          pickerOptions1: {
            disabledDate: (time) => {
              let self = this;
              return time.getTime() < self.start_at;
            }
          },
        }
      },
      methods: {
        ...Utils,
        initSelectVal(){
          let self = this;
          switch (self.windowData.currTab) {
            case 'audit':
              self.selectVal = 'resourceType';
              self.conditionNameList = self.auditConditionNameList;
              break;
            case 'operationLog':
              self.selectVal = 'title';
              self.conditionNameList = self.dbData.common.isAdmin ? self.operationLogConditionNameListAdmin : self.operationLogConditionNameList;
              break;
            case 'processing':
              self.selectVal = 'title';
              self.conditionNameList = self.processingConditionNameList;
              break;
            default:
              self.selectVal = 'resourceType';
          }
        },
        handleSelectResult(command, type){
          let self = this;
          switch (type) {
            case 'result':
              self.updateWindow({selectStatus: command.value, selectName: command.name, pageIndex:1})
                .then(() => {self.queryList()});
              break;
            case 'operator':
              self.updateWindow({selectOperatorName: command.value, selectOperatorName: command.name, pageIndex:1})
                .then(() => {self.queryList()});
              break;
          }
        },
        pageCurrentChange(val){
          let self = this;
          self.updateWindow({
            pageIndex: val,
          })
        },
        pageSizeChange(val){
          let self = this;
          self.updateWindow({
            pageIndex: 1,
            pageSize: val
          })
        },
        search(){
          let self = this;
          self.updateWindow({
            pageIndex: 1
          }).then(() => {
            self.queryList()
          })
        },
        addTimer: function () {
          return this.addTimerTask({
            id: this.$data.timerId,
            interval: 4,
            method: () => {
              this.queryProcessing()
            }
          })
        },
        changeCurrTab: function (e) {
            this.currMessage = null
            return this.updateWindow({
              selectStatus: 'all',
              selectName: 'operationLog.all',
              showSearchBox: false,
              searchConditionList: [],
              currTab: e.name,
              pageIndex: 1,
              pageSize: 20
            }).then(() => {
              this.initSelectVal()
              return this.getCurrTime()
            }).then(() => {
              return this.switchContext(e.name + 'Context')
            })
        },
        restartRefresh: function () {
          this.currMessage = null
          this.refreshList()
        },
        isError: function (audit) {
          if (audit.apiName === 'CreateResourceStack') {
            let response = JSON.parse(audit.responseDump)
            if (response.inventory.status === 'Rollbacked' && response.inventory.reason) {
              return true
            }
          }
          if (audit.error) {
            return true
          }
          return false
        },
        getCurrTime: function () {
          let self = this
          return rpc.put('management-nodes/actions', {
            'getCurrentTime': {}
          })
            .then((resp) => {
              self.end_at = resp.currentTime.MillionSeconds
              self.start_at = self.end_at - 604800000
            })
        },
        handleChangeDate(value){
          let self = this;
          if(Date.parse(self.start_time) > Date.parse(self.end_time)) {
            self.$message({message: '开始时间不能大于结束时间', type: 'warning'})
            return;
          }
          self.queryList();
        },
        downloadCurrPage: function () {
          if (this.windowData.currTab === 'operationLog') {
            let str = ''
            if (this.dbData.common.isAdmin) {
              str = `\ufeff"${this.$t('operationLog.description')}","${this.$t('operationLog.result')}","${this.$t('operationLog.operator')}","${this.$t('operationLog.ip')}","${this.$t('operationLog.createTime')}","${this.$t('operationLog.finishTime')}"\n`
            } else {
              str = `\ufeff${this.$t('operationLog.description')}","${this.$t('operationLog.result')}","${this.$t('operationLog.ip')}","${this.$t('operationLog.createTime')}","${this.$t('operationLog.finishTime')}"\n`
            }
            this.windowData.operationLogList.forEach((operationLog) => {
              let description = this.$t(operationLog.action, operationLog)
              let createTime = this.formatDatetime(new Date(operationLog.time))
              let finishTime = operationLog.endTime ? this.formatDatetime(new Date(operationLog.endTime)) : ''
              let result = ''
              switch (operationLog.status) {
                case 'OK': {
                  result = this.$t('common.success')
                  break
                }
                case 'UNDONE': {
                  result = this.$t('operationLog.processing')
                  break
                }
                case 'ERR': {
                  result = this.$t('common.failed')
                  break
                }
                case 'MIX': {
                  result = this.$t('operationLog.other')
                  break
                }
              }
              let operationLogRow = ''
              if (this.dbData.common.isAdmin) {
                let operator = this.getOperator(operationLog.creator, operationLog.creatorType)
                operationLogRow = `"${description}","${result}","${operator}","${operationLog.ip}","${createTime}","${finishTime}"\n`
              } else {
                operationLogRow = `"${description}","${result}","${operationLog.ip}","${createTime}","${finishTime}"\n`
              }
              str += operationLogRow
            })
            this.downloadFile('operationLog.csv', str)
          }
          if (this.windowData.currTab === 'audit') {
            let str = `\ufeff${this.$t('operationLog.api')},${this.$t('operationLog.duration')},${this.$t('operationLog.result')},${this.$t('operationLog.operator')},${this.$t('operationLog.createTime')},${this.$t('operationLog.finishTime')}\n`
            this.windowData.auditPageList.forEach((audit) => {
              let duration = audit.duration + ' ms'
              let result = audit.error ? this.$t('common.failed') : this.$t('common.success')
              let operator = this.getAccountName(audit.operatorAccountUuid)
              let createTime = this.formatDatetime(new Date(audit.time - audit.duration))
              let finishTime = this.formatDatetime(new Date(audit.time))
              let auditRow = `${audit.apiName},${duration},${result},${operator},${createTime},${finishTime}\n`
              str += auditRow
            })
            this.downloadFile('audit.csv', str)
          }
        },
       getOperator (uuid, uuidType) {
          let value = '', _this = this;
          // if (this.dbData.common.isAdmin) {
          if (uuidType === 'USER') {
            if (_this.windowData.user[uuid]) {
              value = _this.windowData.user[uuid]
            } else {
              if (_this.checkBounce(`getUserName-${uuid}`)) return ''
              rpc.query('accounts/users', {
                q: `uuid?=${uuid}`
              }).then((resp) => {
                if (resp.inventories.length <= 0) return ''
                let user = _this.windowData.user
                user[uuid] = resp.inventories[0].name
                _this.updateWindow({user}).then(() => {
                  value = _this.windowData.user[uuid]
                  _this.$forceUpdate();
                })
              })
            }
          } else if (uuidType === 'VIRTUALID') {
            if (_this.windowData.virtualID[uuid]) {
              value = _this.windowData.virtualID[uuid]
            } else {
              if (_this.checkBounce(`getVirtualIdName-${uuid}`)) return ''
              rpc.query('iam2/virtual-ids', {
                q: `uuid?=${uuid}`
              }).then((resp) => {
                if (resp.inventories.length <= 0) return
                let virtualID = _this.windowData.virtualID
                virtualID[uuid] = resp.inventories[0].name
                _this.updateWindow({virtualID}).then(() => {
                  value = _this.windowData.virtualID[uuid]
                  _this.$forceUpdate();
                })
              })
            }
          } else {
            if (_this.windowData.account[uuid]) {
              value = _this.windowData.account[uuid]
            } else {
              if (_this.checkBounce(`getAccountName-${uuid}`)) return ''
             rpc.query('accounts', {
                q: `uuid?=${uuid}`
              }).then((resp) => {
                if (resp.inventories.length <= 0) return ''
                let account = _this.windowData.account
                account[uuid] = resp.inventories[0].name
                _this.updateWindow({account}).then(() => {
                  //value = _this.windowData.account[uuid]
                  console.log('value =' + value)
                  _this.$nextTick( _this.$forceUpdate);
                 })
              })
            }
          }
          console.log('final value=' + value);
           return value;
        },
        getLocalOperator: function (uuid) {
          let value = ''
          if (this.browserLocalStorageGetItem('loginType') === 'user') {
            value = this.browserLocalStorageGetItem('userName')
          } else {
            value = this.browserLocalStorageGetItem('accountName')
          }
          return value
        },
        getAccountName: function (uuid) {
          let value = ''
          if (this.windowData.account[uuid]) {
            value = this.windowData.account[uuid]
          } else {
            if (this.checkBounce(`getAccountName-${uuid}`)) return ''
            rpc.query('accounts', {
              q: `uuid?=${uuid}`
            }).then((resp) => {
              if (resp.inventories.length <= 0) return ''
              let account = this.windowData.account
              account[uuid] = resp.inventories[0].name
              this.updateWindow({account}).then(() => this.$nextTick(this.$forceUpdate))
            })
          }
          return value
        },
        async goToDetail(message){
          let self = this;
          if (this.windowData.currTab === 'operationLog') {
            message.apiList = await this.getEventCalls(message.uuid)
            if (message.apiList.length > 0) message.apiList = message.apiList.filter(api => api !== null)
          }
          if (this.windowData.currTab === 'processing') {
            let messageResp = await this.getAction(message.id)
            Object.assign(message, messageResp)
          }
          this.currMessage = message
          window.localStorage.setItem('operationItem', JSON.stringify(self.currMessage));
          let dataUuid = self.windowData.currTab ===  'operationLog' ?  message.uuid :  message.resourceUuid;
          self.$router.push({name: 'detailOperationLog', params: {uuid: dataUuid, currTab: self.windowData.currTab}})
        }
      },
      watch: {
        'windowData.pageSize': function (val, oldVal) {
          if (oldVal !== undefined && val !== oldVal) {
            this.updateWindow({
              pageIndex: 1
            }).then(() => {
              this.pageSizeToQuery(val)
            })
          }
        },
        'windowData.selectStatus': function (val, oldVal) {
          if (oldVal !== undefined && val !== oldVal) {
            this.updateWindow({
              pageIndex: 1
            }).then(() => {
              this.conditionToQuery()
            })
          }
        },
        'windowData.selectOperatorStatus': function (val, oldVal) {
          if (oldVal !== undefined && val !== oldVal) {
            this.updateWindow({
              pageIndex: 1
            }).then(() => {
              this.conditionToQuery()
            })
          }
        },
        'windowData.pageIndex': function (val, oldVal) {
          if (oldVal !== undefined && val !== oldVal) {
            this.pageIndexToQuery(val)
          }
        },
        'start_time': function (val, oldVal) {
          if (oldVal !== undefined && val !== oldVal) {
            this.updateWindow({
              pageIndex: 1
            }).then(() => {
              this.conditionToQuery()
            })
          }
        },
        'end_time': function (val, oldVal) {
          if (oldVal !== undefined && val !== oldVal) {
            this.updateWindow({
              pageIndex: 1
            }).then(() => {
              this.conditionToQuery()
            })
          }
        }
      },
    }
</script>

<style scoped>

</style>
