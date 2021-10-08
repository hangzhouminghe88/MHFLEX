<script>
  // import _ from 'lodash'
  import rpc from 'src/utils/rpc';
  import ZWatchEndpointMethods from './Methods';
  import WindowBase from 'src/windows/Window';
  import {formatDatetime} from 'src/utils/utils';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "../../component/PageTemplate";
  import TableBodyItemState from "../../component/TableBodyItemState";
  import {mapState} from 'vuex';

  export default {
    mixins: [ZWatchEndpointMethods, WindowBase, MultiSelectList],
    components: {TableBodyItemState, PageTemplate},
    created: function () {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
      }).then(() => {
        self.queryList();
      })
    },
    computed: {
      ...mapState({
        zwatchEndpoint: state => state.db.zwatchEndpoint
      })
    },
    data(){
      return {
        currTab: 'available',
        itemList: [],
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ]
      }
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
      ...formatDatetime,
      getCondition: function () {
        let conditionList = []
        conditionList.push('name!=created-by-SystemHTTPTopicAndEndpointCreator')
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: async function () {
        this.windowData.loading = true;
        let resp = await rpc.query('sns/application-endpoints', {
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
        await this.updateDbTable({
          tableName: 'zwatchEndpoint',
          list: resp.inventories
        })
        await this.updateWindow({ uuidList, table })
        let self = this
        resp.inventories.forEach(async (item) => {
          await self._query(item.type, item.uuid)
          await self.queryAlarmForTopic(item.uuid)
        })
        this.itemList = this.getItemList();
        this.windowData.loading = false;
      },
      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.zwatchEndpoint[uuid]
        })
      },
      pageEnable(param) {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        this[param](selectedUuidList)
      },
      pageDestroy: function () {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        this.openDialog('ConfirmDlg',{
          title: 'zwatchEndpoint.delete',
          description: 'zwatchEndpoint.deleteConfirm',
          icon: 'zwatch_endpoint_n',
          uuidList: selectedUuidList,
          ok: () => {
            this.destroy(selectedUuidList).then(() => this.queryList())
          },
          getName: (uuid) => {
            return this.zwatchEndpoint[uuid].name;
          }
        })
      },
      pageAddAlarm: async function () {
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let endpointUuid = selectedUuidList[0]
        if (!self.dbData.zwatchTopic[endpointUuid]) return
        let topicUuid = self.dbData.zwatchTopic[endpointUuid].uuid
        let uuidList = await this.getAssociatedAlarmUuidList(topicUuid)
        self.openDialog('ZwatchAlaramMultiSelectDlg', {
          conditions: [`uuid!?=${uuidList}`],
          select: (alarmUuidList, alarmObj, alarmItems) => self.addAlarmToEndpoint(endpointUuid, alarmItems).then(() => this.refresh())
        })
      },
      pageRemoveAlarm: function () {
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length > 1) return
        let endpointUuid = selectedUuidList[0]
        if (!self.dbData.zwatchTopic[endpointUuid]) return
        let topicUuid = self.dbData.zwatchTopic[endpointUuid].uuid
        let conditions = [`actions.actionUuid=${topicUuid}`]
        if (this.isSystemAlarmTopic([topicUuid])) {
          conditions.push(`uuid!?=${this.getZWatchSystemAlarmUuidList()}`)
        }
        self.openDialog('ZwatchAlaramMultiSelectDlg', {
          removeMode: true,
          conditions,
          select: (alarmUuidList, alarmObj, alarmItems) => self.removeAlarmFromEndpoint(endpointUuid, alarmItems).then(() => this.refresh())
        })
      },
      pageSubscribeTopic: async function () {
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let endpointUuid = selectedUuidList[0]
        let topicResp = await rpc.query('sns/topics', {
          q: `endpoints.uuid=${endpointUuid}`,
          fields: 'uuid'
        })
        let subscribedTopicUuidList = topicResp.inventories.map(item => item.uuid)
        self.openSidePanel('windows/ZWatchTopic/dialogs/SelectList', {
          conditions: ['state=Enabled', `uuid!?=${subscribedTopicUuidList}`],
          select: (topicUuidList) => self.subscribeTopic(endpointUuid, topicUuidList).then(() => this.refresh())
        })
      },
      pageUnSubscribeTopic: function () {
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let endpointUuid = selectedUuidList[0]
        self.openSidePanel('windows/ZWatchTopic/dialogs/SelectList', {
          conditions: [`endpoints.uuid=${endpointUuid}`],
          select: (topicUuidList) => self.unSubscribeTopic(endpointUuid, topicUuidList).then(() => this.refresh())
        })
      },
      instate(){
        let self = this, states = [];
        if(!self.isSelected) return true;
        if(arguments){
          for(let arg in arguments){
            states.push(arguments[arg]);
          }
        }
        let inState = self.selectedList.every(uuid => {
          return states.some((state) => self.zwatchEndpoint[uuid].state === state)
        })
        return inState;
      },
      goToCreate(){
        let self = this;
        self.$router.push({name: 'createZwatchEndPoint'})
      },
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailZwatchEndpoint', params: {uuid}})
      }
    }
  }
</script>
