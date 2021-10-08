<template>
  <dialog-template width="1000px">
    <div slot="title" class="model-plain-header">
      <span class="title">{{$t('common.selectImage')}}</span>
      <span @click="close()" class="el-icon-close dialog-close"></span>
    </div>
    <div slot="body">
      <div style="padding:30px;">
        <div class="page-toolbar-container" style="display: flex">
          <span class="page-toolbar-left">
             <component v-if="dialogData.param.withTab" :is="typeListItem.ctrl" :param="typeListItem.param"/>
          </span>
          <span class="page-toolbar-center"></span>
           <span class="page-toolbar-right">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
               <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                   <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                              v-for="(item, index ) in conditionNameList"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>
        <el-table
          :data="isoItemList"
          @row-click="handleSingleSelect"
          highlight-current-row>
           <span slot="empty" class="table-nodata">
             <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px">
            <template slot-scope="scope">
              <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.name')"
            prop="name"
          ></el-table-column>
          <el-table-column
            :label="$t('common.backupstorage')"
            prop="cpuNum">
            <template slot-scope="scope">
              {{scope.row.backupStorageRefs && scope.row.backupStorageRefs.length > 0 && scope.row.backupStorageRefs[0].backupStorageUuid && dbData.backupstorage[scope.row.backupStorageRefs[0].backupStorageUuid] && dbData.backupstorage[scope.row.backupStorageRefs[0].backupStorageUuid].name}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('image.imageType')"
            prop="mediaType">
            <template slot-scope="scope">
              {{dbData.image[scope.row.uuid].mediaType === 'DataVolumeTemplate' ? $t('image.volumeImage') :
              $t('image.systemImage')}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('image.mediaType')"
            prop="format">
          </el-table-column>
          <el-table-column
            :label="$t('common.platform')"
            prop="platform">
          </el-table-column>
          <el-table-column
            :label="$t('volumeoffering.diskSize')"
            prop="size">
            <template slot-scope="scope">
              {{bytesToSize(scope.row.size)}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-if="windowData.total > 0"
          :current-page="windowData.pageIndex"
          :page-size="5"
          :page-sizes="[5, 10]"
          :total="windowData.total"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next"></el-pagination>
      </div>
    </div>
    <div class="dialog-footer" slot="footer">
      <span @click="confirmDlg" class="btn-confirm">{{$t('common.ok')}}</span>
      <span @click="close" class="btn-cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import PanelTypeList from 'src/component/FullPanel/PanelTypeList';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  import DialogTemplate from "../DialogTemplate";
  import _ from 'lodash';

  export default {
    name: "ImageSingleSelectListDlg",
    components: {DialogTemplate},
    mixins: [WindowBase, Root],
    computed: {
      ...mapGetters({
        getList: 'image/getList'
      }),
    },
    data() {
      let self = this;
      return {
        visiabled: false,
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        typeList: [
          {typeName: 'Legacy', value: 'Legacy'},
          {typeName: 'UEFI', value: 'UEFI'}
        ],
        currSelectTab: 'Legacy',
        templateRadio: '',
        typeListItem: {
          id: 'imageTypeList',
          param: {
            getTypeList: () => {
              return this.typeList
            },
            setIndex: (index) => {
              self.currSelectTab = this.typeList[index].value;
              self.updateWindow({
                sortBy: 'createDate',
                sortDirection: '-',
                pageIndex: 1,
                pageCount: 1,
                total: 0,
                pageSize: 5,
              })
                .then(() => {
                  self.queryList();
                })
            },
            getIndex: () => {
              return _.findIndex(this.typeList, it => it.value === this.currSelectTab)
            }
          },
          ctrl: PanelTypeList
        },
        isoItemList: []
      }
    },
    created() {
      let self = this;
      let imageType = this.dialogData.param.imageType;
      self.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        isVolumeImage: imageType && imageType === 'DataVolumeTemplate',
        pageIndex: 1,
        pageCount: 1,
        pageSize: 5,
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      ...Utils,
      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirmDlg() {
        let self = this;
        self.dialogData.param.select(self.createParam());
        self.closeDialog(self.windowId);
      },
      createParam() {
        let self = this;
        return self.templateRadio;
      },
      handleSingleSelect(row) {
        let self = this;
        self.templateRadio = row.uuid;
      },
      getCondition() {
        let {conditions, withTab} = this.dialogData.param, self = this, conditionList = [];
        conditionList = conditionList.concat(conditions);
        conditionList.push('__systemTag__!=remote');
        if (withTab) {
          let isLegacy = self.currSelectTab === 'Legacy';
          let tag = isLegacy ? '__systemTag__!=bootMode::UEFI' : '__systemTag__=bootMode::UEFI';
          conditionList.push(tag)
        }
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        });
        self.queryList();
      },
      queryList() {
        let self = this;
        return this.dispatchAction('image/query', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        }).then(resp => {
            this.updateWindow({
              uuidList: resp.uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              total: resp.total
            })
          }
        ).then(() => {
          self.isoItemList = self.getList(self.windowData.uuidList);
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
    },
    watch: {
      'windowData.pageIndex': function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.queryList();
        }
      },
      'windowData.pageSize': function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.queryList();
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .search-content {
    text-align: right;
    /* float: right; */
    display: inline-block;
    /* float: right; */
    right: -190px;
    position: relative;
  }
</style>
