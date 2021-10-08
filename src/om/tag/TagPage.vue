<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.tag')}}</span>
        </el-col>
        <el-col :span="2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ?  windowData.availableCount : '0'})`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
        <span class="btn-success" @click="openCreateTagDlg()">
          <i class="el-icon-plus icon"></i>
          <span>{{$t('scheduler.create')}}</span>
        </span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected}" @click="listDelete()">
          <i class="el-icon-remove-outline icon"></i>
          <span>{{$t('common.destroy')}}</span>
        </span>
          <help-trigger name="TagsAdminProjectManagement" v-if="hasProjectManagementLicense() && dbData.common.isAdmin" :style="{ position: 'relative', display: 'inline-block', top: '5px' }" />
          <help-trigger name="TagsAdminNotProjectManagement" v-if="!hasProjectManagementLicense() && dbData.common.isAdmin" :style="{ position: 'relative', display: 'inline-block', top: '5px' }" />
          <help-trigger name="TagsNormalAccountProjectManagement" v-if="hasProjectManagementLicense() && !dbData.common.isAdmin" :style="{ position: 'relative', display: 'inline-block', top: '5px' }" />
          <help-trigger name="TagsNormalAccountNotProjectManagement" v-if="!hasProjectManagementLicense() && !dbData.common.isAdmin" :style="{ position: 'relative', display: 'inline-block', top: '5px' }" />
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
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table
       :data="itemList"
       @selection-change="handleSelection"
       @sort-change="handleSort"
       v-loading="windowData.loading"
       >
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.color')" prop="color" sortable>
          <template slot-scope="scope">
            <span :style="{'background-color': scope.row.color}" class="tag"></span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('tag.allResourceCount')" prop="resourceCount">
          <template slot-scope="scope">
            {{scope.row.resourceCount ? scope.row.resourceCount : '0'}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owner')" prop="ownerName"></el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
          <template slot-scope="scope">
            {{new Date(scope.row.createDate) | formatDatetime}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.availableCount"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex"
        ></el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import TagList from './List';
  import PageTemplate from "../../component/PageTemplate";
  import Utils from 'src/utils/utils';
  export default {
    name: "TagPage",
    components: {PageTemplate},
    mixins: [TagList, WindowBase, MultiSelectList],
    data(){
      return {
        currTab: 'available',
        selectVal: 'name',
        searchStr: '',
        itemList: []
      }
    },
    created () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 10,
        currItemUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        uuidList: [],
        loading: false,
        methods: {
          queryList: this.queryList
        }
      })
      this.queryList()
    },
    computed: {
      isAdmin () {
        return this.dbData.common.isAdmin
      },
      conditionNameList () {
        let list = [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ]
        if (this.isAdmin && _.get(this.dbData, ['common', 'license', 'licenseType']) !== 'Community') {
          list.push({
            name: 'common.owner',
            value: 'owner.name'
          })
        }
        return list
      }
    },
    methods: {
      handleSelection(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      hasProjectManagementLicense () {
        return Utils.getLicensePermission('LICENSE_EXTRA_COMPANY', this) || false
      },
      goToDetail(uuid){
        let self = this;
        self.$router.push({
          name: 'detailTag',
          params: {uuid}
        })
      }
    }
  }
</script>

<style scoped>
.tag{
  display: inline-block;
  width: 15px;
  height: 15px
}
</style>
