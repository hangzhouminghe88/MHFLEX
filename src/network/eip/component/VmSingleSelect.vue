<template>
  <div style="overflow: hidden;">
    <div class="page-toolbar-container" style="display: flex">
      <div class="page-toolbar-left"></div>
      <div class="page-toolbar-center"></div>
      <div class="page-toolbar-right">
        <div class="radio-group" style="text-align: right">
            <span style="padding: 0 15px;display: inline-block;">
              <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
                 <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
                 </el-select>
                <span slot="append"><i class="el-icon-search icon"></i></span>
              </el-input>
             </span>
        </div>
      </div>
    </div>

    <div class="page-table">
      <mh-table :data-source="dataSource"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.total > 0"
                       :current-page="windowData.pageIndex"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       :total="windowData.total"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       class="page-table-pagination"
                       layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VmList from 'src/ecs/ecsInstance/List';
  import WindowBase from 'src/windows/Window';
  import Utils from  'src/utils/utils';
  export default {
    name: 'VmSingleSelect',
    mixins: [MultiSelectList, WindowBase, VmList],
    data(){
      let self = this;
      return {
        templateRadio: '',
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: [],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handSingleSelect: self.handSingleSelect,
          handleSort: self.handleSort,
          type: 'radio',
          templateRadio: () => self.templateRadio,
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              onClick: (item) => {

              },
              sortable: true
            },
            {
              getContent: item => self.getField('cpuNum', item),
              getHeaderContent: 'CPU',
              field: 'cpu',
            },
            {
              getContent: item => self.getField('memorySize', item),
              getHeaderContent: self.$t('common.memorySize'),
              field: 'memorySize',
              sortable: true
            },
            {
              getContent: item => self.getField('defaultIp', item),
              getHeaderContent: self.$t('common.defaultIp'),
              field: 'defaultIp',
              sortable: true
            },
            {
              getContent: item => self.getField('hostIp', item),
              getHeaderContent: self.$t('common.hostIp'),
              field: 'hostIp',
            },
            {
              getContent: item => self.getField('cluster', item),
              getHeaderContent: self.$t('common.cluster'),
              field: 'cluster',
              sortable: true
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state'
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
    props: {
      getVMCondition: {
        type: Function,
        required: true
      },
      selectVm: {
        type: Function,
        required: true
      },
      closePage: {
        type: Function,
        required: true
      },
      getSelectedVm: {
        type: Function,
        required: true
      }
    },
    created () {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        return self.queryList()
      })
        .then(() => {
          let vmUuid = this.getSelectedVm()
          if (vmUuid) this.select(vmUuid)
        })
    },

    methods: {
      ...Utils,

      getField(field, item) {
        if(_.isUndefined(item)) return '';
        let normalFields = ['name', 'cpuNum', 'state'];
        if(_.includes(normalFields, field)) return item[field];
        if(field ===  'memorySize') return this.bytesToSize(item[field]);
        if(field === 'createDate') return this.formatDatetime(new Date(item[field]));
        if(field === 'hostIp') return this.getHostIp(item.uuid);
        if(field === 'defaultIp') return this.getDefaultL3NetworkIp(item.uuid).join(',');
        if(field === 'cluster') return this.getClusterName(item.uuid);
      },

      getCondition: function () {
        let conditionList = []
        conditionList.push(`state?=Running,Stopped`)
        conditionList.push('type=UserVm')
        if (this.getVMCondition && Array.isArray(this.getVMCondition())) {
          conditionList = conditionList.concat(this.getVMCondition())
        }
        conditionList = conditionList.concat(this.getSearchCondition())
        return conditionList
      },

      handSingleSelect(rows){
        let self = this;
        self.templateRadio = rows.uuid;
        self.selectVm(rows.uuid);
      },

      getClusterName: function (uuid) {
        let value
        try {
          value = this.dbData.cluster[this.dbData.vm[uuid].clusterUuid].name
        } catch (e) {
          // if (checkBounce(`getClusterName-${uuid}`)) return ''
          // value = ''
          // rpc.queryResourceNames(this, 'cluster', this.dbData.vm[uuid].clusterUuid)
          // .then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
      },
    }
  }
</script>

<style scoped>

</style>
