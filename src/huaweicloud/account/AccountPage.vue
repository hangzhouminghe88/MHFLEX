<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2" class="page-header-title">AccountKey</el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab" >
            <el-tab-pane :label="$t('common.available') + `(${windowData.availableCount ? windowData.availableCount : '0'})`"
                         name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
         <!--添加accountkey-->
          <span class="btn-success" @click="goToCreate()">
            <i class="el-icon-plus"></i>
            添加AccountKey
          </span>
          <!--更多操作-->
          <drop-down :enabled="isSelected"
                     :class="{'disabled': !isSelected}"
                     class="more btn-primary dropdown">
            <!--此标签必须为span-->
            <span slot="title">
              <i class="el-icon-more"></i>
              {{$t('common.moreActions')}}
            </span>
            <!--此标签必须为span-->
            <span slot="content">
              <div class="dropdown-content">
                 <a style="padding-top: 12px;" @click="isSingleSelected && (dbData.hybridHuaweiyunKeySecret[selectedList[0]].current === 'false') && pageAttach()" :class="{ 'disabled-text': !(isSingleSelected && dbData.hybridHuaweiyunKeySecret[selectedList[0]].current === 'false' )}">{{$t("common.setDefault")}}</a>
                 <a @click="isSingleSelected && (dbData.hybridHuaweiyunKeySecret[selectedList[0]].current === 'true') && pageDetach()" :class="{ 'disabled-text': !(isSingleSelected && dbData.hybridHuaweiyunKeySecret[selectedList[0]].current === 'true')}">{{$t("common.cancelDefault")}}</a>
                 <a @click="pageDelete()" style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
              </div>
            </span>
          </drop-down>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
          <!--搜索组合框-->
          <span style="padding: 0 15px;display: inline-block;">
             <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
             </el-input>
           </span>
          <!--刷新按钮-->
          <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
    </div>
    <!--表格模板使用template不额外添加div-->
    <template slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <!--表格分页-->
      <el-pagination @size-change="pageSizeChange" v-show="windowData.availableCount > 0"
                     @current-change="pageCurrentChange"
                     layout="total, sizes, prev, pager, next, jumper, ->"
                     :total="windowData.availableCount"
                     :current-page="windowData.pageIndex"
                     :page-sizes="[10,20,50,100]"
                     :page-size="windowData.pageSize"></el-pagination>
    </template>
  </page-template>
</template>

<script>
  //处理多选、搜索、刷新、公共方法
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  //请求接口
  import AccountKeyList from 'src/huaweicloud/account/List';
  import PageTemplate from 'src/component/PageTemplate';
  //公共方法
  import { formatDatetime } from 'src/utils/utils';
  //处理状态管理的公共方法
  import WindowBase from 'src/windows/Window';
  export default {
    name: "AccountPage",
    mixins: [WindowBase, MultiSelectList, AccountKeyList],
    components: {
      PageTemplate
    },
    data() {
      let self = this;
      return {
        currTab:  'available', //当前选中的Tab页
        searchStr: '',//搜索字符串
        selectVal: 'name',//选择搜索条件
        conditionNameList: [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],//搜索条件数组
        itemList: [],//源数据,
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),//展示数据方法
              getHeaderContent: self.$t('common.name'),//表格头
              onClick: (item) => {
                self.$router.push({name: 'detailHybridHuaWeiAccountKey', params: {uuid: item.uuid}})
              },//跳转至详情页
              className: 'link',
              tooltip: true,//是否展示提示
              sortable: true//是否排序
            },
            {
              getContent: item => self.getField('secretId', item),
              getHeaderContent: self.$t('hybridTencentKey.secretId'),
              tooltip: true,
              sortable: true
            },
            {
              getContent: item => self.getField('secretKey', item),
              getHeaderContent: self.$t('hybridTencentKey.secretKey'),
              tooltip: true
            },
            {
              getContent: item => self.getField('current', item),
              getHeaderContent: self.$t('common.default'),
              tooltip: true
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              sortable: true,
              tooltip: true
            }
          ]
        }
      }
    },
    created() {
      let self = this;
      //初始化pageSize, currentPage, loading, 表格多选数组
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        selectedUuidList: [],
        loading: false,
      }).then(() => {
        self.queryList();
      })
    },
    methods: {
      refresh() {
        let self = this;
        //刷新时pageIndex设置为1
        self.updateWindow({
          pageIndex: 1,
        }).then(() => {
          self.queryList();
        })
      },
      //填充表格数据
      getField(field, item)  {
        let self = this, normalFields = ['name', 'secretId', 'secretKey'];
        //if(!item[field]) return '';
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'current') return item[field] === 'true' ? self.$t('common.yes') : self.$t('common.no');
        //格式化创建时间
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },
      //跳转到创建页面
      goToCreate() {
        let self = this;
        self.$router.push({name: 'createHybridHuaWeiAccountKey'})
      }
    }
  }
</script>

<style scoped>

</style>
