<template>
 <page-template>
   <div slot="page-header">
     <el-row :gutter="10">
       <el-col :span="2">
         <span class="page-header-title">{{$t('common.certificate')}}</span>
       </el-col>
       <el-col :span="2">
         <el-tabs v-model="currTab">
           <el-tab-pane :label="`${$t('common.available')}(${windowData.total ? windowData.total : '0'})`" name="available"></el-tab-pane>
         </el-tabs>
       </el-col>
     </el-row>
   </div>
   <div slot="page-toolbar" class="page-toolbar-container">
     <el-row type="flex">
       <div class="page-toolbar-left">
       <span class="btn-success" @click="goToCreate()">
         <i class="el-icon-plus icon"></i>
         <span>{{$t('certificate.create')}}</span>
       </span>
         <span class="btn-primary" @click="isSelected && pageDelete(queryList)" :class="{'disabled': !isSelected}">
         <i class="el-icon-remove-outline icon"></i>
         <span>{{$t('common.destroy')}}</span>
       </span>
       </div>
       <div class="page-toolbar-center"></div>
       <div class="page-toolbar-right">
         <span style="padding: 0 15px;display: inline-block;">
              <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
                 <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)"
                              :key="index" :value="item.value">
                   </el-option>
                 </el-select>
                <span slot="append"><i class="el-icon-search icon"></i></span>
              </el-input>
            </span>
         <span @click="refresh()" class="btn-refresh"><i class="el-icon-refresh icon"></i></span>
       </div>
     </el-row>
   </div>
   <div slot="page-table-content">
     <el-table
      :data="itemList"
      @selection-change="handleSelection"
      v-loading="windowData.loading"
      >
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
       <el-table-column type="selection" width="50px"></el-table-column>
       <el-table-column :label="$t('common.name')" prop="name" sortable>
         <template slot-scope="scope">
           <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
         </template>
       </el-table-column>
       <el-table-column :label="$t('common.serviceType')" sortable>
         <template slot-scope="scope">
           {{getCertServerType(scope.row.uuid)}}
         </template>
       </el-table-column>
       <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
         <template slot-scope="scope">
           {{(new Date(scope.row.createDate)) | formatDatetime}}
         </template>
       </el-table-column>
     </el-table>
     <div class="page-table-pagination">
       <el-pagination v-if="windowData.total > 0"
         :page-sizes="[10, 20, 50, 100]"
         :page-size="windowData.pageSize"
         layout="total, sizes, prev, pager, next, jumper"
         :total="windowData.total"
         class="page-table-pagination"
         @current-change="pageCurrentChange"
         @size-change="pageSizeChange"
         :current-page="windowData.pageIndex">
       </el-pagination>
     </div>
   </div>
 </page-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "../../component/PageTemplate";
  import certificateList from 'src/om/certificate/List';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "CertificatePage",
    components: {PageTemplate},
    mixins: [WindowBase, certificateList, MultiSelectList],
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: self.queryList
        }
      }).then(() => {
        self.queryList();
      })
    },
    data(){
      return {
        itemList: [],
        currTab: 'available',
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ]
      }
    },
    methods: {
      handleSelection(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        });
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      goToCreate(){
        let self = this;
        self.$router.push({name: 'createCertificate'})
      },
      goToDetail(uuid){
        let self = this;
        self.$router.push({name: 'detailCertificate', params:{uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
