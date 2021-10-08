<template>
  <div class="container">
    <div class="page-toolbar-container" style="display: flex">
      <div class="page-toolbar-left">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a @click="!isSelected && pageCreate()"
                 :class="{'disabled-text': isSelected}"
                 style="padding-top: 12px;"
              >{{$t('vRouterRouteEntry.add')}}</a>
              <a @click="isSelected && pageDelete()"
                 :class="{'disabled-text': !isSelected}"
                 style="padding-bottom: 12px"
              >{{$t('vRouterRouteEntry.delete')}}</a>
            </div>
          </span>
        </drop-down>
      </div>
    </div>

    <div class="page-table">
      <mh-table :data-source="dataSource"></mh-table>
      <div class="page-table-pagination">
      </div>
    </div>
  </div>
</template>

<script>

  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from "src/utils/utils";
  import WindowBase from  'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';

  export default {
    name: "FlatRouteEntryTabList",

    props: {
      param: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },

    mixins: [MultiSelectList, WindowBase],

    data () {
      let self = this;
      return {
        itemList: [],
        tableData: {},
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('prefix', item),
              getHeaderContent: self.$t('vRouterRouteEntry.destination'),
              field: 'prefix'
            },
            {
              getContent: item => self.getField('nexthop', item),
              getHeaderContent: self.$t('vRouterRouteEntry.target'),
              field: 'nexthop'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            }
          ]
        }
      }
    },

    created () {
      let self = this;
      self.updateWindow({selectedUuidList: []})
      self.L3networkUuid = self.param.uuid;
      self.queryTableList(self.L3networkUuid);
    },

    methods: {
      ...{
        deleteRouterEntry: Methods.methods.deleteRouterEntry
      },

      handleSelect(rows){
        let self = this, uuidList =[];
        uuidList = rows.map((row) => {
          return row.id;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },

      queryTableList (l3Uuid) {
        let self = this, list = [], uuidList = [];
        list = self.dbData.l3network[l3Uuid].hostRoute;
        if(typeof (list) === 'undefined'){
          return;
        }
        for (let i in list) {
          if(list[i].nexthop !== self.dbData.l3network[l3Uuid].dhcpip) {
            self.tableData[list[i].id] =  list[i];
            uuidList.push(list[i].id);
          }
        }
        self.itemList = uuidList.map(uuid => {
          return self.tableData[uuid];
        });
      },

      getField (field, item) {
        let normalField = [];
        if(_.isUndefined(item)) return '';
        normalField = ['prefix', 'nexthop'];
        if(_.includes(normalField, field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      pageCreate(){
        let self = this;
        self.param.addRouteEntry({
          conditions: [self.L3networkUuid],
          ok: (param) => self.createRouterEntry(self.L3networkUuid, param)
        });
      },

      createRouterEntry (L3Uuid, param) {
        const self = this
        let event = self.createEvent('l3network.action.addHostRoute', self.dbData.l3network[L3Uuid].name)
        return rpc.create(`l3-networks/${L3Uuid}/hostroute`, param, event)
          .then((resp) => {
            self.incEventSuccess(event)
            self.updateDbRow({
              tableName: 'l3network',
              id: L3Uuid,
              data: resp.inventory
            }).then(() => {
              self.queryTableList(L3Uuid)
            })
          }, (e) => {
            self.incEventFail(event)
          })
      },

      pageDelete(){
        const self = this
        debugger
        if (!self.isSelected || self.selectedList.length <= 0) return
        self.openDialog('SimpleConfirmDlg', {
          title: self.$t('vRouterRouteEntry.delete'),
          text: self.$t('vRouterRouteEntry.deleteEntry'),
          uuidList: self.selectedList,
          ok: () => {
            self.deleteRouterEntry(self.L3networkUuid, self.selectedList)
          }
        })
      }
    }
  }

</script>

<style scoped>

</style>
