<script>
  import rpc from 'src/utils/rpc'
  import ZWatchTopicMethods from './Methods'
  // import Vue from 'vue'

  export default {
    mixins: [ZWatchTopicMethods],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList()
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList()
      }
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList: async function () {
        let resp = await rpc.query('sns/topics', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
        await this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.map(uuid => {
          table[uuid] = {
            selected: false
          }
        })
        await this.queryAdditionFields(uuidList)
        await this.updateDbTable({
          tableName: 'zwatchTopic',
          list: resp.inventories
        })
        await this.updateWindow({ uuidList, table })
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      pageAddAlarm: async function () {
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let topicUuid = selectedUuidList[0]
        let uuidList = await this.getAssociatedAlarmUuidList(topicUuid)
        self.openSidePanel('windows/ZWatchAlarm/dialogs/SelectList', {
          conditions: [`uuid!?=${uuidList}`],
          select: (alarmUuidList) => self.addAlarm(topicUuid, alarmUuidList).then(() => this.refresh())
        })
      },
      pageRemoveAlarm: function () {
        let self = this
        if (this.selectedList.length > 1) return
        let topicUuid = this.selectedList[0]
        let conditions = [`actions.actionUuid=${topicUuid}`]
        if (this.isSystemAlarmTopic([topicUuid])) {
          conditions.push('namespace!=ZStack/System')
        }
        self.openSidePanel('windows/ZWatchAlarm/dialogs/SelectList', {
          conditions,
          select: (alarmUuidList) => self.removeAlarm(topicUuid, alarmUuidList).then(() => this.refresh())
        })
      },
      pageAddEndpoint: async function () {
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let topicUuid = selectedUuidList[0]
        let uuidList = await this.getAssociatedEndpointUuidList(topicUuid)
        self.openSidePanel('windows/ZWatchEndpoint/dialogs/SelectList', {
          conditions: ['state=Enabled', `uuid!?=${uuidList}`, 'name!=created-by-SystemHTTPTopicAndEndpointCreator'],
          select: (endpointUuidList) => self.addEndpoint(topicUuid, endpointUuidList).then(() => this.refresh())
        })
      },
      pageRemoveEndpoint: function () {
        let self = this
        if (this.selectedList.length > 1) return
        let topicUuid = this.selectedList[0]
        self.openSidePanel('windows/ZWatchEndpoint/dialogs/SelectList', {
          conditions: [`topics.uuid=${topicUuid}`],
          select: (endpointUuidList) => self.removeEndpoint(topicUuid, endpointUuidList).then(() => this.refresh())
        })
      },
      pageDestroy: function () {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        this.openConfirmDialog({
          title: 'zwatchTopic.delete',
          desc: 'zwatchTopic.deleteConfirm',
          icon: 'zwatch_topic_n',
          uuidList: selectedUuidList,
          ok: () => {
            this.destroy(selectedUuidList).then(() => this.queryList())
          },
          tableName: 'zwatchTopic'
        })
      },
      pageEnable: function () {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        this.enable(selectedUuidList)
      },
      pageDisable: function () {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        this.disable(selectedUuidList)
      }
    }
  }
</script>
