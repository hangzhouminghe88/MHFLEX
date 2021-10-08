<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "IpRangesTabService",
    mixins: [WindowBase, MultiSelectList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      let self = this;
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList:[
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: [],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('startIp', item),
              getHeaderContent: self.$t('common.startIp'),
              field: 'startIp',
            },
            {
              getContent: item => self.getField('endIp', item),
              getHeaderContent: self.$t('common.endIp'),
              field: 'endIp',
            },
            {
              getContent: item => self.getField('gateway', item),
              getHeaderContent: self.$t('common.gateway'),
              field: 'gateway',
            },
            {
              getContent: item => self.getField('netmask', item),
              getHeaderContent: self.$t('common.netmask'),
              field: 'netmask',
            },
            {
              getContent: item => self.getField('ipVersion', item),
              getHeaderContent:self.$t('common.ipVersion'),
              field: 'ipVersion',
            },
            {
              getContent: item => self.getField('networkCidr', item),
              getHeaderContent: 'CIDR',
              field: 'networkCidr',
            },
          ]
        }
      }
    },
    created(){
      let self = this;
      let dataUuid = this.param.uuid
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        selectedUuidList: [],
        sortDirection: '-',
        dataUuid
      }).then(() => {
        self.queryList();
      })
    },
    methods: {
      getField(field, item){
        if(_.isUndefined(item)) return '';
        let normalField = ['startIp', 'endIp', 'gateway', 'networkCidr', 'netmask'];
        if(normalField.includes(field)) return item[field];
        if(field === 'ipVersion') return `Ipv${item[field]}`
      },

      getCondition() {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
        }
        return conditionList
      },

      queryList: async function () {
        let resp = await rpc.query('l3-networks/ip-ranges', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        this.updateWindow({ uuidList})
        this.updateDbTable({
          tableName: 'ipRange',
          list: resp.inventories
        }).then(() => {
          this.itemList = this.getItemList();
        })
      },

      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.ipRange[uuid];
        })
      },

      pageDelete(){
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let warningText = 'common.warningForDeleteIpRange'
        if (this.dbData.l3network[this.windowData.dataUuid] && this.dbData.l3network[this.windowData.dataUuid].category === 'Public') {
          warningText = 'common.warningForDeleteIpRangeWithPub'
        }
        this.openDialog('ConfirmDlg', {
          title: 'l3network.deleteIpRange',
          description: 'l3network.info.deleteIpRangeConfirm',
          icon: 'ip_range',
          uuidList: selectedUuidList,
          ok: () => self.deleteIpRange(selectedUuidList).then(() => self.detailQuery()),
          getName(uuid){
            return self.dbData.ipRange[uuid].name;
          },
          warning: warningText
        })
      },

      detailQuery() {
        let self = this
        let uuid = this.windowData.dataUuid
        rpc.query('l3-networks', {
          q: `uuid=${uuid}`
        })
          .then((resp) => {
            if (resp.success === true) {
              self.updateDbRow({
                tableName: 'l3network',
                id: uuid,
                data: resp.inventories[0]
              })
              self.queryList()
            }
          })
      },
    }
  }
</script>
