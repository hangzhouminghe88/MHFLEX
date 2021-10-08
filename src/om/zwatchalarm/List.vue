<script>
  import TableBodyItemState from "../../component/TableBodyItemState";
  import MultiSelectList from '../../windows/Base/MultiSelectList';
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Methods from './Methods';
  export default {
    name: "ZwatchAlarmPage",
    mixins: [Methods, MultiSelectList, WindowBase],
    components: {PageTemplate, TableBodyItemState},
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: [],
      }
    },
    created(){
      let self = this, currTab = '';
      (self.$route.params && self.$route.params.currTab) ? currTab = self.$route.params.currTab : currTab = 'zwatchResourceAlarm';
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        currTab: currTab,
        selectedUuidList: [],
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      getCondition: function () {
        let conditionList = [], self = this;
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: async function () {
        this.updateCount()
        let path = 'zwatch/alarms'
        let tableName = 'zwatchResourceAlarm'
        if (this.windowData.currTab === 'zwatchEventAlarm') {
          path = 'zwatch/events/subscriptions'
          tableName = 'zwatchEventAlarm'
        }
        await this._queryList(path, tableName)
      },
      _queryList: async function (path, tableName) {
        this.itemList = [];
        this.windowData.loading = true;
        let resp = await rpc.query(path, {
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
        await rpc.query('user-tags', {
          q: `resourceUuid?=${uuidList}`
        }).then((resp) => {
          let tasks = []
          resp.inventories.forEach(item => {
            let p = this.updateDbRow({
              tableName: 'zwatchResourceAlarmA',
              id: item.resourceUuid,
              data: item
            })
            tasks.push(p)
          })
          return Promise.all(tasks)
        })
        await this.updateDbTable({
          tableName: tableName,
          list: resp.inventories
        })
        await this.updateWindow({ uuidList, table })
        this.itemList = this.getItemList();
         this.windowData.loading = false;
      },
      //或得列表数据
      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData[self.windowData.currTab][uuid];
        })
      },
      //刷新列表
      refresh: function () {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      //切换Tab重新请求
      handleChangeTab: async function (e) {
          console.log(e);
          await this.updateWindow({
            currItemUuid: '',
            pageIndex: 1,
            currTab: e.name,
            uuidList: [],
            table: {},
            selectedUuidList: []
          })
        await this.queryList()
      },
      //移除接收端
      pageRemoveEndpoint: function () {
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let alarmUuid = selectedUuidList[0]
        let tableName = this.windowData.currTab
        if (!this.dbData[tableName][alarmUuid] || !this.dbData[tableName][alarmUuid]) return
        // let name = this.dbData[tableName][alarmUuid].name
        let topicUuidList = this.dbData[tableName][alarmUuid].actions.map(item => item.actionUuid)
        let removedUuidList = this.filterSystemTopic(alarmUuid)
        topicUuidList = topicUuidList.filter(uuid => !removedUuidList.some(item => item === uuid))
        self.openDialog('ZwatchEndPointerMultiSelectListDlg', {
          removeMode: true,
          conditions: [`topics.uuid?=${topicUuidList}`],
          select: (endpointUuidList) => self.removeEndpointFromAlarm(alarmUuid, endpointUuidList, this.windowData.currTab).then(() => this.refresh())
        })
      },
      pageSubscribeTopic: function () {
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let alarmUuid = selectedUuidList[0]
        let name = this.dbData[this.windowData.currTab][alarmUuid].name
        let subscribedTopicUuidList = this.dbData[this.windowData.currTab][alarmUuid].actions.map(item => item.actionUuid)
        self.openSidePanel('windows/ZWatchTopic/dialogs/SelectList', {
          conditions: ['state=Enabled', `uuid!?=${subscribedTopicUuidList}`],
          select: (topicUuidList) => self.subscribeTopic(alarmUuid, topicUuidList, name).then(() => this.refresh())
        })
      },
      pageUnSubscribeTopic: function () {
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let alarmUuid = selectedUuidList[0]
        let tableName = this.windowData.currTab
        if (!this.dbData[tableName][alarmUuid] || !this.dbData[tableName][alarmUuid]) return
        let name = this.dbData[tableName][alarmUuid].name
        let topicUuidList = this.dbData[tableName][alarmUuid].actions.map(item => item.actionUuid)
        let removedUuidList = this.filterSystemTopic(alarmUuid)
        topicUuidList = topicUuidList.filter(uuid => !removedUuidList.some(item => item === uuid))
        self.openSidePanel('windows/ZWatchTopic/dialogs/SelectList', {
          conditions: [`uuid?=${topicUuidList}`],
          select: (topicUuidList) => self.unSubscribeTopic(alarmUuid, topicUuidList, name).then(() => this.refresh())
        })
      },
      //启用听用告警器
      pageEnable: function (param, fn) {
        let uuidList = [], self = this;
        if (self.selectedList === 0) return
        for(let uuid of self.selectedList){
          if(self.dbData[self.windowData.currTab][uuid].state !== param) uuidList.push(uuid);
        }
        this[param](uuidList, fn)
      },
      //删除告警器
       pageDestroy() {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let tableName = this.windowData.currTab
        let key = 'name'
        let destroy = null
        let getName = null
        if (this.windowData.currTab === 'zwatchEventAlarm') {
          key = 'eventName'
          destroy = this.unSubscribeEvent
          getName = (uuid) => {
            if (!this.dbData.zwatchEventAlarm[uuid]) return ''
            let eventName = this.dbData.zwatchEventAlarm[uuid].eventName
            return this.$t(`zwatchAlarm.eventName.${eventName}`, {name: ''})
          }
        } else {
          destroy = this.destroy
        }
        let self = this;
        this.openDialog('ConfirmDlg', {
          title: 'zwatchAlarm.delete',
          description: 'zwatchAlarm.deleteConfirm',
          icon: 'zwatch_alarm_n',
          uuidList: selectedUuidList,
          ok: () => {
            destroy(selectedUuidList).then(() => this.refresh())
          },
          getName: (uuid)=> {
            return self.getAlarmName(uuid);
          },
        })
      },
      //添加接收端
      addEndPoint(){
        let self = this;
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let alarmUuid = selectedUuidList[0]
        let subscribedTopicUuidList = this.dbData[this.windowData.currTab][alarmUuid].actions.map(item => item.actionUuid)
        self.openDialog('ZwatchEndPointerMultiSelectListDlg',{
          conditions: ['state=Enabled', `topics.uuid!?=${subscribedTopicUuidList}`, 'name!=created-by-SystemHTTPTopicAndEndpointCreator'],
          select: (endpointUuidList) => self.addEndpointToAlarm(alarmUuid, endpointUuidList, this.windowData.currTab).then(() => this.queryList())
        })
      },
      inState(){
        let states = [], self = this;
        if(arguments){
          for(let arg in arguments){
            states.push(arguments[arg]);
          }
        }
        let instate = self.selectedList.every((uuid) => {
          return states.some((state) => {
            return state ===  self.dbData[self.windowData.currTab][uuid].state
          });
        })
        return instate;
      },
      goToCreate(){
        let self = this;
        switch (self.windowData.currTab) {
          case 'zwatchResourceAlarm':
            self.$router.push({name: 'createZwatchalarm'})
            break;
          case 'zwatchEventAlarm':
            self.$router.push({name: 'createZwatchalarmdetail'})
            break;
        }
      },
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailZwatchAlarm', params:{uuid, currTab: self.windowData.currTab}})
      }
    }
  }
</script>
