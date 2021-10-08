<template>
  <dialog-template>
    <span slot="title">
      <span>{{ $t("loadbalancer.select") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </span>
    <div slot="body">
      <div style="margin: 30px 20px;">
        <div style="padding:30px;overflow-y: hidden;">
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
          <el-table
            @selection-change="handleSelect"
            :data="primaryItemList">
             <span slot="empty" class="table-nodata">
              <p class="empty-text" v-text="$t('common.noData')"></p>
            </span>
            <el-table-column width="50px" type="selection"></el-table-column>
            <el-table-column
              prop="name"
              :label="$t('common.name')"></el-table-column>
            <el-table-column
              :label="$t('visualizationEditor.Type')"
              prop="type"></el-table-column>
            <el-table-column
              label="URL"
              prop="url"></el-table-column>
            <el-table-column
              :label="$t('common.availableCapacity')">
              <template slot-scope="scope">
                {{bytesToSize(scope.row.availableCapacity)}}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('home.total')">
              <template slot-scope="scope">
                {{bytesToSize(scope.row.totalCapacity)}}
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
                         :page-sizes="[5, 10]"
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
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="ok()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import PrimaryStorageList from 'src/storage/primarystorage/List';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import _ from 'lodash'

  export default {
    name: "PrimaryStorageListMultiSelectList",
    mixins: [WindowBase,PrimaryStorageList, MultiSelectList],
    computed: {
      primaryItemList(){
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.primarystorage[uuid]
        )
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.primarystorage[uuid]
          }
        )
      }
    },
    data(){
      return{
        selectVal: 'name',
        searchStr:  '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ]
      }
    },
    mounted(){
      let self = this;
      self.visiabled = this.model;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-'
      }).then(()=>{
        self.queryList();
      })
    },
    methods: {
      ...Utils,
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.dialogData.param.data) conditionList = conditionList.concat(this.dialogData.param.data)
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
        }
        return conditionList
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        self.queryList();
      },
      close(){
        let self = this;
        self.closeDialog(self.windowId)
      },
      ok() {
        if (!this.isSelected || this.selectedList.length === 0) return
        if (this.dialogData.param.select) {
          this.dialogData.param.select(this.selectedList)
        } else if (this.dialogData.param.ok) {
          this.dialogData.param.ok(this.selectedList)
        }
        this.closeDialog(this.windowData.id)
      },
    },
  }
</script>

<style scoped>

</style>
