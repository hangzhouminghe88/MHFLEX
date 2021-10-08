<script>
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import {formatDatetime} from "src/utils/utils";
  import rpc from 'src/utils/rpc'
  export default {
    name: "EventTabService",
    mixins: [WindowBase, MultiSelectList],
    components: {TableBodyItemState},
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-'
      }).then(() => {
        self.queryList();
      })
    },
    data(){
      return {
        selectVal: 'action',
        searchStr: '',
        itemList: [],
        conditionNameList: [
          {
            name: 'eventFromResourceStack.action',
            value: 'action'
          },
          {
            name: 'eventFromResourceStack.resourceName',
            value: 'resourceName'
          }
        ]
      }
    },
    methods: {
      ...{
        formatDatetime
      },
      getCondition() {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' &&  this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
        }
        return conditionList
      },
      queryList() {
        const self = this
        rpc.query('cloudformation/event', {
          count: false,
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          q: self.getCondition(),
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
        }).then((resp) => {
          self.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
            total: resp.total
          })
          let uuidList = resp.inventories.map((item) => {
            item.uuid = item.stackUuid + item.id
            return item.uuid
          })
          let table = {}
          uuidList.map((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          self.updateDbTable({
            tableName: 'eventFromResourceStack',
            list: resp.inventories
          })
          self.updateWindow({ uuidList, table })
            .then(() => {
              self.itemList = self.getItemList();
            })
        })
      },
      getItemList(){
        let self = this;
        return self.windowData.uuidList.map(uuid => {
          return self.dbData.eventFromResourceStack[uuid];
        })
      },
    }
  }
</script>

<style scoped>

</style>
