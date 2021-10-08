<template>
   <dialog-template>
     <div slot="title" class="modal-plain-block">
       <div class="modal-title">选择子网</div>
       <div class="dialog-close el-icon-close"></div>
     </div>

     <div slot="body" class="dialog-body">
          <div class="page-toolbar-container" style="display: flex; justify-content: space-between;">
          <div class="left"></div>
          <div class="right">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
              <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                           v-for="(item, index ) in conditionNameList"></el-option>
              </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </div>
        </div>

        <div class="page-table">
          <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
          <el-pagination v-if="windowData.availableCount > 0"
                         :current-page="windowData.pageIndex"
                         :page-size="5"
                         :page-sizes="[5, 10]"
                         :total="windowData.availableCount"
                         @current-change="pageCurrentChange"
                         @size-change="pageSizeChange"
                         class="page-table-pagination"
                         layout="total, sizes, prev, pager, next"></el-pagination>
        </div>
     </div>

     <div slot="footer" class="dialog-footer">
       <span class="btn-confirm">{{$t('common.confirm')}}</span>
       <span class="btn-cancel">{{$t('common.cancel')}}</span>
     </div>
   </dialog-template>
</template>

<script>
    import HybridHuaweiSubNetList from 'src/huaweicloud/hybridSubNet/List';
    import MultiSelectList from 'src/windows/Base/MultiSelectList';
    import { formatDatetime } from 'src/utils/utils';
    import WindowBase from 'src/windows/Window';

    export default {
        name: "SingleSelectList",
        mixins: [MultiSelectList, WindowBase, HybridHuaweiSubNetList],
        //初始化数据绑定
        data() {
           let self = this;
        return {
          itemList: [],
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
          templateRadio: '',
          dataSource: {
            getItemList: () => self.itemList,
            handSingleSelect: self.handleSingleSelect,
            type: 'radio',
            handleSort: self.handleSort,
            templateRadio: () => self.templateRadio,
            fields: [
              {
                getContent: item => self.getField('name', item),
                getHeaderContent: self.$t('common.name'),
                field: 'name',
                sortable: true,
                tooltip: true
              },
              {
                getContent: item => self.getField('izoneName', item),
                getHeaderContent: self.$t('hybridHuaweiSubNets.iZoneName'),
                field: ' izoneName',
                tooltip: true
              },
              {
                getContent: item => self.getField('subnetId', item),
                getHeaderContent: self.$t('hybridHuaweiSubNets.subNetsId'),
                field: ' subnetId',
                tooltip: true
              },
              {
                getContent: item => self.getField('status', item),
                getHeaderContent: self.$t('hybridHuaweiSubNets.status'),
                field: 'status',
                sortable: true,
                tooltip: true
              },
              {
                getContent: item => self.getField('cidr', item),
                getHeaderContent: 'CIDR',
                field: 'cidr',
                sortable: true,
                tooltip: true
              },
              {
                getContent: item => self.getField('availableIpAddressCount', item),
                getHeaderContent: self.$t('hybridHuaweiSubNets.availableCount'),
                field: 'availableIpAddressCount',
                sortable: true,
                tooltip: true
              },
              {
                getContent: item => self.getField('createDate', item),
                getHeaderContent: self.$t('common.createDate'),
                field: 'createDate',
                sortable: true,
                tooltip: true
              }
            ]
          }
         }
      },
    
      created() {
        let self = this;
        self.updateWindow({
          pageIndex: 1,
          pageSize: 5,
          sortBy: 'createDate',
          sortDirection: '-',
          selectedUuidList: [],
          loading: false,
        }).then(() => {
          self.queryList();
        })
      },

      
      methos: {
        //关闭弹框
         close() {
          let self = this;
          self.closeDialog(self.windowId);
        },
        //单选表格数据
        handleSingleSelect(row) {
          let self = this;
          self.templateRadio = row.uuid;
        },
        //填充表格数据
        getField(field, item) {
          let self = this, normalFields = ['izoneName','subNetId', 'cidr', 'status', 'availableIpAddressCount'];
          if (normalFields.includes(field)) return item[field];
          if (field === 'createDate') return formatDatetime(new Date(item[field]));
          if(field === 'name') return item[field] === '' ? self.$t('common.noName') : item[field];
        },
        //构造查询条件
        getCondition() {
          let conditionList = []
          conditionList = conditionList.concat(this.dialogData.param.conditions)
          if (this.selectVal !== '' && this.searchStr !== '') {
            conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
          }
          return conditionList
        },
        //确定选择
        confirm() {
          let self = this;
          if (!self.templateRadio) {
            self.$message('您还没有选择任何资源！');
            return;
          }
          self.dialogData.param.select(self.templateRadio);
          self.close();
        }
      }
    }
</script>

<style scoped>

</style>
