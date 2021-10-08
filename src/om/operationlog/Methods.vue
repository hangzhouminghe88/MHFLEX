<script>
  import rpc from '../../utils/rpc'
  import Utils from '../../utils/utils'
  import _ from 'lodash'
  import { getEventByPage, getEventCalls } from '../../utils/message'

  export default {
    methods: {
      getCurrTime: function () {
        let self = this
        return rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            self.end_at = resp.currentTime.MillionSeconds
            self.start_at = self.end_at - 86400000
          })
      },
      queryList: function () {
        if (!this.shortCheckBounce('queryList' + this.windowData.currTab)) {
          if (this.windowData.currTab === 'audit') this.queryAudit()
          if (this.windowData.currTab === 'operationLog') this.queryOperationLog()
          if (this.windowData.currTab === 'processing') this.queryProcessing()
        }
      },
      queryAudit: function () {
        this.windowData.loading = true;
        if (!this.windowData.auditContext.isPageChange) {
          this.updateWindow({
            pageCount: _.chunk(this.windowData.auditList, this.windowData.auditContext.pageSize).length === 0 ? 1 : _.chunk(this.windowData.auditList, this.windowData.auditContext.pageSize).length
          })
          let condition = this.getAuditCondition()
          if (!this.dbData.common.isOpensource) {
            rpc.query('zwatch/audits', condition)
              .then((resp) => {
                resp.audits.forEach((item) => {
                  item.apiName = this.apiNameHandler(item.apiName)
                })
                let auditList = _.chunk(resp.audits, this.windowData.auditContext.pageSize)
                let auditContext = _.cloneDeep(this.windowData.auditContext)
                auditContext.isPageChange = false
                auditContext.pageCount = auditList.length === 0 ? 1 : auditList.length
                let pageCount = this.windowData.pageCount
                if (this.windowData.currTab === 'audit') pageCount = auditContext.pageCount
                this.updateWindow({
                  auditList: resp.audits,
                  auditPageList: auditList[this.windowData.auditContext.pageIndex - 1],
                  auditCount: resp.audits.length,
                  auditContext: auditContext,
                  pageCount: pageCount
                })
              })
          }
        } else {
          let auditList = _.chunk(this.windowData.auditList, this.windowData.auditContext.pageSize)
          let auditContext = _.cloneDeep(this.windowData.auditContext)
          auditContext.isPageChange = false
          auditContext.pageCount = auditList.length === 0 ? 1 : auditList.length
          let pageCount = this.windowData.pageCount
          if (this.windowData.currTab === 'audit') pageCount = auditContext.pageCount
          this.updateWindow({
            auditPageList: auditList[this.windowData.auditContext.pageIndex - 1],
            auditContext: auditContext,
            pageCount: pageCount
          })
        }
          this.windowData.loading = false;
      },
      queryOperationLog: async function () {
         this.windowData.loading = true;
        let condition = this.getOperationLogCondition()
        let resp = await getEventByPage(condition)
        resp.pageDatas.forEach((item) => {
          Object.assign(item, JSON.parse(item.data))
        })
         this.windowData.loading = false;
        this.updateOperationLogList(resp)
      },
      queryProcessing: function () {
        let processingListResp = []
        let eventListName = `eventList-${this.getIdentityUuid()}`
        let eventList = JSON.parse(this.getEventDataFromWindow(eventListName))
        if (!eventList) eventList = []
        eventList.forEach((eventId) => {
          let event = JSON.parse(this.getEventDataFromWindow(eventId))
          if (event) {
            if (event.projectUuid) {
              if (this.dbData.common.currProject && this.dbData.common.currProject.uuid === event.projectUuid) processingListResp.push(event)
            } else {
              processingListResp.push(event)
            }
          }
        })
        let longJobListName = `longJobList-${this.getIdentityUuid()}`
        let longJobList = JSON.parse(this.browserLocalStorageGetItem(longJobListName))
        if (!longJobList) longJobList = []
        longJobList.forEach((longJob) => {
          let longJobId = longJob.id
          let event = JSON.parse(this.browserLocalStorageGetItem(longJobId))
          if (event) {
            if (event.projectUuid) {
              if (this.dbData.common.currProject && this.dbData.common.currProject.uuid === event.projectUuid) processingListResp.push(event)
            } else {
              processingListResp.push(event)
            }
          }
        })
        processingListResp.sort((a, b) => {
          return b.time - a.time
        })
        if (this.windowData.originalStr && this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          processingListResp = this.fullTextSearch(processingListResp, this.windowData.originalStr)
        }
        let processingList = _.chunk(processingListResp, this.windowData.processingContext.pageSize)
        let processingContext = _.cloneDeep(this.windowData.processingContext)
        processingContext.pageCount = processingList.length === 0 ? 1 : processingList.length
        let pageCount = this.windowData.pageCount
        if (this.windowData.currTab === 'processing') pageCount = processingContext.pageCount
        this.updateWindow({
          processingList: processingList,
          processingPageList: processingList[this.windowData.pageIndex - 1],
          processingCount: processingListResp.length,
          processingContext: processingContext,
          pageCount: pageCount
        })
      },
      fullTextSearch: function (list, str) {
        let result = []
        if ((list.length <= 0) || !str) return result
        list.forEach(item => {
          if (item.title.toLocaleLowerCase().indexOf(str.toLocaleLowerCase()) > -1) {
            result.push(item)
          }
        })
        return result
      },
      apiNameHandler: function (apiName) {
        return apiName.slice(apiName.indexOf('API') + 3, -3)
      },
      getEventCalls: async function (uuid) {
        return await getEventCalls(uuid)
      },
      getOperationLogCondition: function () {
        let condition = {
          perPageSize: this.windowData.operationLogContext.pageSize,
          pageNo: this.windowData.operationLogContext.pageIndex,
          startTime: this.start_time.getTime(),
          endTime: this.end_time.getTime(),
          prePage: this.windowData.operationLogContext.prePage
        }
        if (this.windowData.operationLogContext.pageFlag) {
          if (!this.windowData.operationLogContext.isRefresh) {
            condition.flagUuid = condition.prePage ? this.windowData.operationLogContext.pageFlag.firstFlag.flagUuid : this.windowData.operationLogContext.pageFlag.lastFlag.flagUuid
            condition.flagTime = condition.prePage ? this.windowData.operationLogContext.pageFlag.firstFlag.flagTime : this.windowData.operationLogContext.pageFlag.lastFlag.flagTime
          }
          if (this.windowData.operationLogContext.isRefresh && this.windowData.operationLogContext.pageFlag.preFlag) {
            condition.flagUuid = this.windowData.operationLogContext.pageFlag.preFlag.flagUuid
            condition.flagTime = this.windowData.operationLogContext.pageFlag.preFlag.flagTime
          }
        }
        this.updateWindow({
          searchConditionList: [`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`]
        })
        if(this.selectVal !== '' && this.searchStr !== '') {
          let conditionObj = this.operationConditionHandler(this.windowData.searchConditionList[0])
          condition[conditionObj.name] = conditionObj.value
        }
        if (this.windowData.selectStatus !== 'all') {
          condition.status = this.windowData.selectStatus
        }

        if (!this.dbData.common.isAdmin && !this.isProjectOperator()) {
          condition.operators = this.getIdentityUuid()
        } else {
          if (this.windowData.selectOperatorStatus === 'me') {
            if (condition.operators === undefined) {
              condition.operators = this.getIdentityUuid()
            } else {
              if (condition.operators.indexOf(this.getIdentityUuid()) === -1) {
                condition.operators = ''
              } else {
                condition.operators = this.getIdentityUuid()
              }
            }
          }
        }
        if (this.dbData.common.currProject) condition.projectUuid = this.dbData.common.currProject.uuid
        return condition
      },
      updateOperationLogList: async function (resp) {
        let preFlag = null
        let firstFlag = {}
        let lastFlag = {}
        if (this.windowData.operationLogContext.pageFlag && !this.windowData.operationLogContext.isRefresh) {
          preFlag = {}
          preFlag.flagUuid = this.windowData.operationLogContext.prePage ? this.windowData.operationLogContext.pageFlag.firstFlag.flagUuid : this.windowData.operationLogContext.pageFlag.lastFlag.flagUuid
          preFlag.flagTime = this.windowData.operationLogContext.prePage ? this.windowData.operationLogContext.pageFlag.firstFlag.flagTime : this.windowData.operationLogContext.pageFlag.lastFlag.flagTime
        } else if (this.windowData.operationLogContext.pageFlag && this.windowData.operationLogContext.pageFlag.preFlag) {
          preFlag = this.windowData.operationLogContext.pageFlag.preFlag
        }
        if (!this.windowData.operationLogContext.isRefresh && resp.pageDatas.length > 0) {
          firstFlag = {
            flagUuid: resp.pageDatas[0].uuid,
            flagTime: resp.pageDatas[0].createTime
          }
          lastFlag = {
            flagUuid: resp.pageDatas[resp.pageDatas.length - 1].uuid,
            flagTime: resp.pageDatas[resp.pageDatas.length - 1].createTime
          }
        } else if (this.windowData.operationLogContext.pageFlag) {
          firstFlag = this.windowData.operationLogContext.pageFlag.firstFlag
          lastFlag = this.windowData.operationLogContext.pageFlag.lastFlag
        }
        let operationLogContext = _.cloneDeep(this.windowData.operationLogContext)
        operationLogContext.pageCount = resp.pageInfo.totalPage === 0 ? 1 : resp.pageInfo.totalPage
        operationLogContext.pageIndex = resp.pageInfo.pageNo
        operationLogContext.pageFlag = {
          preFlag: preFlag,
          firstFlag: firstFlag,
          lastFlag: lastFlag
        }
        operationLogContext.isRefresh = true
        let pageCount = this.windowData.pageCount
        if (this.windowData.currTab === 'operationLog') pageCount = operationLogContext.pageCount
        this.updateWindow({
          operationLogList: resp.pageDatas,
          operationLogCount: resp.pageInfo.totalCount,
          operationLogContext: operationLogContext,
          pageCount: pageCount
        })
        let condition = this.getOperationLogCondition()
        condition.perPageSize = resp.pageInfo.totalCount
        let respAll = await getEventByPage(condition)
        respAll.pageDatas.forEach((item) => {
          Object.assign(item, JSON.parse(item.data))
        })
        this.updateWindow({
          allOperationLogList: respAll.pageDatas
        })
      },
      createConditionForOwner: function (ownerName) {
        // return rpc.query('accounts', {
        //   q: `name~=%25${ownerName}%25`
        // }).then((resp) => {
        //   let uuidList = resp.inventories.map(it => { return it.uuid })
        //   return new Promise((resolve, reject) => { resolve([encodeURI(`operatorAccountUuid~=%${uuidList.join('|')}%`)]) })
        // })
        let operatorAccountUuidList = []
        let tasks = []
        let p = null

        // API QueryAccount
        p = rpc.query('accounts', {
          q: `name~=%25${ownerName}%25`
        }).then((resp) => {
          operatorAccountUuidList = operatorAccountUuidList.concat(resp.inventories.map(it => { return it.uuid }))
        })
        tasks.push(p)

        // API QueryIAM2VirtualID
        p = rpc.query('iam2/virtual-ids', {
          q: `name~=%25${ownerName}%25`
        }).then((resp) => {
          operatorAccountUuidList = operatorAccountUuidList.concat(resp.inventories.map(it => { return it.uuid }))
        })
        tasks.push(p)

        // API QueryIAM2Project collect linkedAccountUuid
        p = rpc.query('iam2/projects', {
          q: `name~=%25${ownerName}%25`
        }).then((resp) => {
          operatorAccountUuidList = operatorAccountUuidList.concat(resp.inventories.map(it => { return it.linkedAccountUuid }))
        })
        tasks.push(p)

        return Promise.all(tasks).then(() => {
          return [encodeURI(`operatorAccountUuid~=%${operatorAccountUuidList.join('|')}%`)]
        })
      },
      createConditionForOperatorOwner: function (ownerName) {
        let uuidList = []
        let tasks = []
        let p = null

        p = rpc.query('accounts', {
          q: `name~=%25${ownerName}%25`
        }).then((resp) => {
          resp.inventories.forEach((item) => {
            uuidList.push(item.uuid)
          })
        })
        tasks.push(p)

        p = rpc.query('accounts/users', {
          q: `name~=%25${ownerName}%25`
        }).then((resp) => {
          resp.inventories.forEach((item) => {
            uuidList.push(item.uuid)
          })
        })
        tasks.push(p)

        p = rpc.query('iam2/virtual-ids', {
          q: `name~=%25${ownerName}%25`
        }).then((resp) => {
          resp.inventories.forEach((item) => {
            uuidList.push(item.uuid)
          })
        })
        tasks.push(p)

        return Promise.all(tasks).then((resolve, reject) => {
          return [encodeURI(`operators~=%${uuidList.join(',')}%`)]
        })
      },
      getAuditCondition: function () {
        let condition = {
          startTime: this.start_time.getTime(),
          endTime: this.end_time.getTime(),
          limit: this.windowData.auditLimit,
          conditions: []
        }
        if (this.windowData.selectStatus !== 'all') {
          if (this.windowData.selectStatus === 'success') {
            condition.conditions.push('error=')
          }
          if (this.windowData.selectStatus === 'error') {
            condition.conditions.push('error=~.+')
          }
        }
        this.updateWindow({
          searchConditionList: [`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`]
        })
        if (this.selectVal !== '' && this.searchStr !== '') {
          if (this.windowData.searchConditionList[0] !== 'operatorAccountUuid~=%25%25') {
            condition.conditions.push(this.auditConditionHandler(this.windowData.searchConditionList[0]))
          } else {
            condition.conditions.push('operatorAccountUuid=')
          }
        }
        return condition
      },
      auditConditionHandler: function (condition) {
        let value = condition.substr(0, condition.indexOf('~')) + '=~' + condition.substring((condition.indexOf('%25') + 3))
        value = value.slice(0, -3)
        return value
      },
      operationConditionHandler: function (condition) {
        let obj = {}
        obj.name = condition.substr(0, condition.indexOf('~'))
        obj.value = condition.substring((condition.indexOf('%25') + 3))
        obj.value = obj.value.slice(0, -3)
        return obj
      },
      pageSizeToQuery: function (pageSize) {
        let context = _.cloneDeep(this.windowData[this.windowData.currContext])
        context.pageSize = pageSize
        context.pageIndex = 1
        if (this.windowData.currContext === 'operationLogContext') {
          context.prePage = false
          context.pageFlag = null
          context.isRefresh = false
        }
        if (this.windowData.currContext === 'auditContext') {
          context.isPageChange = true
        }
        let obj = {}
        obj[this.windowData.currContext] = context
        this.updateWindow(obj).then(() => {
          this.queryList()
        })
      },
      conditionToQuery: function () {
        let context = _.cloneDeep(this.windowData[this.windowData.currContext])
        context.pageIndex = 1
        if (this.windowData.currContext === 'operationLogContext') {
          context.prePage = false
          context.pageFlag = null
          context.isRefresh = false
        }
        if (this.windowData.currContext === 'auditContext') {
          context.isPageChange = false
        }
        let obj = {}
        obj[this.windowData.currContext] = context
        this.updateWindow(obj).then(() => {
          this.queryList()
        })
      },
      pageIndexToQuery: function (pageIndex) {
        let context = _.cloneDeep(this.windowData[this.windowData.currContext])
        if (this.windowData.currContext === 'operationLogContext') {
          context.isRefresh = false;
          if (pageIndex < context.pageIndex) {
            context.prePage = true
          } else {
            context.prePage = false
          }
        }
        if (this.windowData.currContext === 'auditContext') {
          context.isPageChange = false
        }
        context.pageIndex = pageIndex
        let obj = {}
        obj[this.windowData.currContext] = context
        this.updateWindow(obj).then(() => {
          this.queryList()
        })
      },
      switchContext: function (currContext) {
        this.updateWindow({
          currContext,
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
          }
        }).then(() => {
          if (this.windowData.currTab === 'audit') {
            this.queryOperationLog()
            this.queryProcessing()
          }
          if (this.windowData.currTab === 'operationLog') {
            if (this.dbData.common.isAdmin) this.queryAudit()
            this.queryProcessing()
          }
          if (this.windowData.currTab === 'processing') {
            this.queryOperationLog()
            if (this.dbData.common.isAdmin) this.queryAudit()
          }
          this.queryList()
        })
      },
      shortCheckBounce: function (key) {
        if (!this.debounceList[key]) {
          setTimeout(() => {
            delete this.debounceList[key]
          }, 50)
          this.debounceList[key] = true
          return false
        } else {
          return true
        }
      },
      durationConvert: function (ms) {
        if (ms < 60000) {
          let s = (ms / 1000).toFixed(2)
          if (s === '0.00') s = 0.01
          return s + this.$t('common.secondShort')
        } else {
          let s = Math.round(ms / 1000)
          let time = this.secToTime(s)
          let str = ''
          if (time.hour > 0) {
            str += time.hour + this.$t('common.hourShort')
          }
          if (time.min > 0) {
            str += time.min + this.$t('common.minuteShort')
          }
          if (time.sec > 0) {
            str += time.sec + this.$t('common.secondShort')
          }
          return str
        }
      },
      isProjectOperator: function () {
        if (this.dbData.common.currProject) {
          if (this.dbData.common.currProject.userRole === 'projectAdmin' || this.dbData.common.currProject.userRole === 'projectOperator') {
            return true
          }
        }
        return false
      },
      ...Utils
    }
  }
</script>
