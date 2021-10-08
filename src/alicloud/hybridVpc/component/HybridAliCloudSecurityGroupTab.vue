<template>
  <div class="container">
    <div slot="page-toolbar" class="page-toolbar-container" style="display: flex;">
      <div class="page-toolbar-left">
        <span class="title">{{$t('common.hybridsecuritygroup') + $t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
           <div class="dropdown-content">
              <a style="padding-top: 12px;" @click="goToCreate()">{{$t('common.create')}}</a>
              <a style="padding-bottom: 12px;" :class="{'disabled-text': !isSelected}" @click="isSelected && pageDelete()">{{$t('common.destroy')}}</a>
           </div>
          </span>
        </drop-down>
      </div>
      <div class="page-toolbar-center"></div>
      <div class="page-toolbar-right">
        <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
              <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                <el-option
                  v-for="(item, index ) in conditionNameList"
                  :label="$t(`${item.name}`)"
                  :key="index"
                  :value="item.value"
                ></el-option>
              </el-select>
              <span slot="append">
                <i class="el-icon-search icon"></i>
              </span>
            </el-input>
          </span>
        <span @click="refresh()" class="btn-refresh">
            <i class="el-icon-refresh icon"></i>
          </span>
      </div>
    </div>

    <div slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
                       :page-sizes="[10, 20, 50, 100]"
                       :page-size="windowData.pageSize"
                       :total="windowData.availableCount"
                       class="page-table-pagination"
                       layout="total, sizes, prev, pager, next"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       :current-page="windowData.pageIndex"></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import HybridSgList from 'src/alicloud/hybridAliCloudSecurityGroup/List';
  import  MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "HybridAliCloudSecurityGroupTab",

    mixins: [MultiSelectList, PageBase, WindowBase, HybridSgList],

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
        selectVal: 'name',
        searchStr: '',
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
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              className: 'link',
              sortable: true,
              tooltip: true,
              onClick: (item) => {
                self.$router.push({name: 'detailHybridAliCloudSecurityGroup', params: {uuid: item.uuid}});
              }
            },
            {
              getContent: item => self.getField('vpcName', item),
              getHeaderContent: self.$t('hybridesecuritygroup.vpc'),
              field: 'vpcName',
              sortable: true
            },
            {
              getContent: item => self.getField('securityGroupId', item),
              getHeaderContent: self.$t('hybridesecuritygroup.securityGroupId'),
              field: 'securityGroupId',
              sortable: true
            },
            {
              getContent: item => self.getField('ecsInstanceNum', item),
              getHeaderContent: self.$t('hybridvirtualprivatecloud.ecsInstanceNum'),
              field: 'ecsInstanceNum'
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

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        dataUuid,
        loading: false,
        methods: {
          queryList: self.queryList
        }
      }).then( () => {
        self.queryList();
      })
    },

    methods: {
      formatDatetime,

      getField(field, item) {
        if(!String(item[field])) return '';
        let normalFields = ['name', 'securityGroupId', 'ecsInstanceNum'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'vpcName') return item[field].replace(/ZStack-/ig,  '');
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      goToCreate() {
        let self = this;
        self.$router.push({name: 'createHybridAliCloudSecurityGroup', params: {vpcUuid: self.windowData.dataUuid}})
      },

      getCondition: function () {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
    }
  }
</script>

<style scoped>

</style>
