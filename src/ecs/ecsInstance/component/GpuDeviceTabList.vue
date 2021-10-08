<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
            {{$t("common.gpu")}}{{$t("common.colon")}}
            <help-trigger name="selectGpu" :style="{ position: 'absolute', top: 0, right: '2px' }"/>
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="padding-top:12px;" @click="!isSelected && inStates('Running', 'Stopped') && pageAttach()" :class="{'disabled-text': isSelected || !inStates('Running', 'Stopped')}">{{ $t("common.attach") }}</a>
                <a style="padding-bottom:12px;" @click="isSelected && inStates('Running', 'Stopped') && pageDetach()" :class="{'disabled-text': !isSelected || !inStates('Running', 'Stopped')}">{{ $t("common.detach") }}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
      </el-row>
    </div>
    <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from "src/utils/utils";
  import GpuList from 'src/ecs/gpuDevice/List';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "GpuDeviceTabList",

    mixins: [MultiSelectList, WindowBase, GpuList],

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
        selectVal: 'description',
        searchStr: '',
        conditionNameList: [
          {name: 'pciDevice.deviceName', value: 'description'}
        ],
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
              sortable: true
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              tooltip: true,
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('common.status'),
              tooltip: true,
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              tooltip: true,
              sortable: true
            }
          ]
        }
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        dataUuid,
        pageIndex: 1,
        pageSize: 20,
        selectedUuidList: [],
        loading: false,
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: self.queryList
        }
      }).then( () => {
        self.queryList();
      })
    },

    methods: {
      formatDatetime,

      getCondition() {
        let self = this, conditionList = [];
        if(self.param.conditions) conditionList.concat(self.param.conditions);
        if(self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList;
      },

      getField(field, item) {
        let self = this, normalFields = ['description', 'pciDeviceAddress', 'state'];
        if(_.includes(normalFields, item)) return item[field];
        if(field === 'type') return self.getGpuType(item.uuid);
        if(field === 'host') return self.getHostName(item.uuid);
        if(field === 'status') return ['System', 'Active'].includes(item[field]) ? item['status'] = 'Ready' : item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      inStates: function () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        return !stateList.every((item, index, array) => {
          return item !== this.dbData.vm[this.windowData.dataUuid].state
        })
      },
    }
  }
</script>

<style scoped>

</style>
