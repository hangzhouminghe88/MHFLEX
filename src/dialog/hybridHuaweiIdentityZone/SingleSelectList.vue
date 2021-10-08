<template>
    <dialog-template>
      <div slot="title" class="modal-plain-block">
        <span class="model-title">选择可用区</span>
        <span class="dialog-close el-icon-close" @click="close()"></span>
      </div>

      <div slot="body" class="dialog-body" style="padding: 20px;">
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
        <div class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</div>
        <div class="btn-cancel" @click='close()'>{{$t('common.cancel')}}</div>
      </div>
    </dialog-template>
</template>

<script>
    import WindowBase from 'src/windows/Window';
    import { formatDatetime } from 'src/utils/utils';
    import MultiSelectList from 'src/windows/Base/MultiSelectList';
    import HybridHuaweiIdentityZoneList from 'src/huaweicloud/identityzone/List';

    export default {
      name: "SingleSelectList",
      mixins: [WindowBase, HybridHuaweiIdentityZoneList, MultiSelectList],

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
                getContent: item => self.getField('zoneName', item),
                getHeaderContent: self.$t('hybrididentityzone.identityzone'),
                field: 'zoneName',
                sortable: true,
                tooltip: true
              },
              {
                getContent: item => self.getField('zoneId', item),
                getHeaderContent: self.$t('hybrididentityzone.zoneId'),
                field: ' zoneId',
                tooltip: true
              },
              {
                getContent: item => self.getField('dataCenterUuid', item),
                getHeaderContent: self.$t('hybriddatacenter.region'),
                field: 'dataCenterUuid',
                sortable: true
              },
              {
                getContent: item => self.getField('description', item),
                getHeaderContent: self.$t('common.description'),
                field: 'description',
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

      methods: {
        close() {
          let self = this;
          self.closeDialog(self.windowId);
        },

        handleSingleSelect(row) {
          let self = this;
          self.templateRadio = row.uuid;
        },

        getField(field, item) {
          let self = this, normalFields = ['zoneName', 'zoneId', 'description'];
          if (normalFields.includes(field)) return item[field];
          if (field === 'createDate') return formatDatetime(new Date(item[field]));
          if(field === 'dataCenterUuid') return item.dataCenterName;
        },

        getCondition() {
          let conditionList = []
          conditionList = conditionList.concat(this.dialogData.param.conditions)
          if (this.selectVal !== '' && this.searchStr !== '') {
            conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
          }
          return conditionList
        },

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
