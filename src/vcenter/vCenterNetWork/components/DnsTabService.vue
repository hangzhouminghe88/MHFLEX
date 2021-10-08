<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import Controller from 'src/network/l3network/Controller';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "DnsTabService",
    mixins: [WindowBase, MultiSelectList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    data() {
      let self = this;
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
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
              getContent: item => self.getField('dns', item),
              getHeaderContent: 'dns',
              field: 'dns',
            }
          ]
        }
      }
    },

    created () {
      let dataUuid = this.param.uuid
      this.updateWindow({
        dataUuid,
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.queryList()
        this.hasPermission()
      })

    },

    methods: {
      getField(field, item){
        return item;
      },

      //表格多选
      handleSelect(rows){
        let self = this;
        self.updateWindow({
          selectedUuidList: rows,
        })
      },
      //查询dns
      queryList () {
        const self = this
        rpc.query(`l3-networks/${self.windowData.dataUuid}`)
          .then((resp) => {
            if (resp.inventories.length <= 0) return
            let uuidList = resp.inventories[0].dns === undefined ? [] : resp.inventories[0].dns
            let table = {}
            uuidList.forEach((dns) => {
              table[dns] = {
                selected: false
              }
            })
            self.updateWindow({ uuidList, table })
              .then(() => {
                self.itemList = self.windowData.uuidList;
              })
          })
      },
      //获得权限,是admin账户，当前账户是admin
      hasPermission(){
        let self = this;
        return Controller.hasPermission(self);
      },
      //添加dns
      pageAddDns(){
        let self = this;
        self.openDialog('AddDNSDlg', {
          ok: (dns) => self.addDnsToL3Network(self.windowData.dataUuid, dns)
        })
      },
      //删除dns
      pageDeleteDns (l3NetworkUuid) {
        debugger
        let self = this
        let uuidList = []
        self.selectedList.forEach((uuid) => {
          uuidList.push(uuid)
        })
        self.openDialog('ConfirmDlg', {
          title: 'l3network.deleteDns',
          description: 'l3network.info.deleteDns',
          uuidList,
          icon: 'dns',
          getName(uuid){
            return uuid;
          },
          ok: () => {
            self.removeDnsFromL3Network(l3NetworkUuid, uuidList, self.queryList)
          }
        })
      },
      //添加dns回调
      addDnsToL3Network(l3NetworkUuid, dns) {
        let event = this.createEvent('l3network.action.addDns', this.dbData.l3network[l3NetworkUuid].name)
        let self = this
        rpc.create(`l3-networks/${l3NetworkUuid}/dns`, {
          'dns': dns
        }, event).then((resp) => {
          self.detailQuery()
          self.incEventSuccess(event)
        }, () => self.incEventFail(event))
      },
      //删除dns回调
      removeDnsFromL3Network(l3NetworkUuid, dnsList) {
        let event = this.createEvent('l3network.action.deleteDns', this.dbData.l3network[l3NetworkUuid].name)
        const self = this
        dnsList.forEach(function (dns) {
          ((dns) => {
            rpc._delete(`l3-networks/${l3NetworkUuid}/dns/${dns}`, null, event)
              .then((resp) => {
                self.detailQuery()
                self.setEventSuccess(event)
              }, () => self.setEventFail(event))
          })(dns)
        })
      },
      //查询详情
      detailQuery () {
        let self = this
        let uuid = this.windowData.dataUuid
        rpc.query('l3-networks', {
          q: `uuid=${uuid}`
        })
          .then((resp) => {
            if (resp.success === true) {
              if (!_.has(resp.inventories[0], 'dns')) resp.inventories[0].dns = []
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

