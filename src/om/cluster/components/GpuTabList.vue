<template>
  <div class="container">
    <div class="tab-drop">
      <drop-down class="detail-dropdown">
        <span slot="title">{{$t('common.actions')}}</span>
        <span slot="content">
         <div class="dropdown-content">
            <a style="padding-top: 12px;" @click="isSelected && hasOnState('Disabled') &&  pageEnable()"
               :class="{ 'disabled-text': !isSelected || !hasOnState('Disabled') }">{{ $t("common.enable") }}</a>
            <a @click="canDisable() && pageDisable()" :class="{ 'disabled-text': !canDisable() }">{{ $t("common.disable") }}</a>
            <a v-permission="'SHARE-RESOURCE'" v-if="dbData.common.isAdmin"
               @click="isSelected && hasNotSharedToAll() && pageShareToAll()"
               :class="{ 'disabled-text': !isSelected || !hasNotSharedToAll()}">{{$t("common.shareToAll")}}</a>
            <a v-permission="'SHARE-RESOURCE'" v-if="dbData.common.isAdmin"
               @click="isSelected && hasSharedToAll() && pageRecallFromAll()"
               :class="{ 'disabled-text': !isSelected || !hasSharedToAll()}">{{$t("common.recallFromAll")}}</a>
            <a style="padding-bottom: 12px;" @click="isSelected && hasOnStatus('Inactive') && pageDelete()"
               :class="{ 'disabled-text': !isSelected || !hasOnStatus('Inactive') }">{{ $t("common.destroy") }}</a>
          </div>
      </span>
      </drop-down>
    </div>
    <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.availableCount > 0"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="windowData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="windowData.availableCount"
        class="page-table-pagination"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import GpuTabList from 'src/om/gpudevice/List';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "GpuTabList",
    mixins: [GpuTabList, WindowBase, MultiSelectList],
    props: {
      param: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    data() {
      let self = this;
      return {
        conditionNameList: [
          {
            name: 'pciDevice.deviceName',
            value: 'description'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: [],
        selectVal: 'description',
        searchStr: '',
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('description', item),
              getHeaderContent: self.$t('pciDevice.deviceName'),
              tooltip: true,
              sortable: true,
              field: 'deviceName'
            },
            {
              getContent: item => self.getField('pciDeviceAddress', item),
              getHeaderContent: self.$t('pciDevice.pciAddress'),
              tooltip: true,
              field: 'pciAddress'
            },
            {
              getContent: item => self.getField('type', item),
              getHeaderContent: self.$t('common.type'),
              tooltip: true,
              field: 'type'
            },
            {
              getContent: item => self.getField('host', item),
              getHeaderContent: self.$t('common.host'),
              tooltip: true,
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              tooltip: true,
              field: 'state'
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('common.status'),
              tooltip: true,
              field: 'status'
            },
            {
              getContent: item => self.getField('vmUuid', item),
              getHeaderContent: self.$t('common.vm'),
              tooltip: true
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              tooltip: true,
              sortable: true,
              field: 'createDate'
            }
          ]
        }
      }
    },
    computed: {},
    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        conditions: self.param && self.param.conditions ? self.param.conditions : [],
        selectedUuidList: [],
        methods: {
          queryList: self.queryList,
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      formatDatetime,

      getCondition() {
        let self = this, conditionList = [];
        let type = ['GPU_Video_Controller', 'GPU_Audio_Controller', 'GPU_3D_Controller']
        conditionList.push(`type?=${type.join()}`)
        if(self.param.conditions) conditionList.concat(self.param.conditions);
        if(self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList;
      },

      getField(field, item) {
        let self = this, normalFields = ['description', 'pciDeviceAddress', 'state'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'type') return self.getGpuType(item.uuid);
        if(field === 'host') return self.getHostName(item.uuid);
        if(field === 'status') return ['System', 'Active'].includes(item[field]) ? item['status'] = 'Ready' : item[field];
        if(field === 'vmUuid') return item['vmInstanceUuid'] ? self.getVmName(item.uuid) : self.$t('common.noAttach');
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

    }
  }
</script>

<style scoped>
  .tab-drop {
    display: inline-block;
    position: absolute;
    top: 15px;
    left: 323px;
  }
</style>
