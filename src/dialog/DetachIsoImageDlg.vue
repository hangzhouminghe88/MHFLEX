<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t('vm.iso.detach')}}</div>
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
        :data="isoItemList"
        @selection-change="handleSelection">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column width="50px" type="selection">
        </el-table-column>
        <el-table-column
          :label="$t('common.name')"
          prop="name"
        ></el-table-column>
        <el-table-column
          :label="$t('common.backupstorage')"
          prop="cpuNum">
          <template slot-scope="scope">
            {{dbData.image[scope.row.uuid].backupStorageRefs && dbData.image[scope.row.uuid].backupStorageRefs.length > 0 && dbData.backupstorage[dbData.image[scope.row.uuid].backupStorageRefs[0].backupStorageUuid].name}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('image.imageType')"
          prop="mediaType">
          <template slot-scope="scope">
            {{dbData.image[scope.row.uuid].mediaType === 'DataVolumeTemplate' ? $t('image.volumeImage') : $t('image.systemImage')}}
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
        :page-sizes="[5, 10]"
        :page-size="5"
        :total="windowData.total"
        class="page-table-pagination"
        layout="total, sizes, prev, pager, next"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex"></el-pagination>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';
  export default {
    name: "IsoImageSingleDlg",
    mixins: [WindowBase, Root],
    props: {
      model: {
        type: Boolean,
        default:false
      },
      message:{
        type: Object,
        default:{}
      }
    },
    computed:{
      ...mapGetters({
        getList: 'image/getList'
      }),
    },
    data(){
      return{
        visiabled: false,
        selectVal: 'name',
        searchStr:'',
        conditionNameList: [
          {name:'common.name', value: 'name'},
          {name:'UUID', value: 'uuid'}
        ],
        templateRadio: '',
        isoItemList: []
      }
    },
    created(){
      let self = this;
      self.visiabled = this.model;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-'
      })
      let vmInstanceUuid = self.message.vmInstanceUuid
      let { cdRom } = this.$store.state.vm[vmInstanceUuid]
      let isoUuidList = _.map(_.filter(_.values(cdRom), v => v.isoUuid), v => v.isoUuid)
      return this.updateWindow({
        conditionList: [`uuid?=${isoUuidList.join(',')}`]
      })
        .then(()=>{
          self.queryList();
        })
    },
    methods: {
      ...Utils,
      close(){
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.$emit('close',{uuid: this.templateRadio, index: this.message.index});
      },
      handleSelection(row){
        let self = this;
        self.templateRadio = row.map((item) => {return item.uuid});
      },
      getCondition () {
        let conditionList = []
        let conditions = this.message.conditions;
        if(conditions){
          conditionList = conditionList.concat(conditions);
        }
        this.windowData.conditionList ? conditionList = conditionList.concat(this.windowData.conditionList) : conditionList;
        conditionList.push('__systemTag__!=remote')
        if (conditions && _.isArray(conditions)) {
          conditionList = conditionList.concat(conditions)
        }
        if (this.selectVal !=='' && this.searchStr!=='' ) {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
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
      queryList(){
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
      pageCurrentChange(val){
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val){
        this.updateWindow({
          pageSize:val
        })
      },
    },
    watch: {
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visiabled = newVal;
        }
      },
      'windowData.pageIndex': function(newVal, oldVal){
        if(newVal !== oldVal){
          this.queryList();
        }
      },
      'windowData.pageSize': function(newVal, oldVal){
        if(newVal !== oldVal){
          this.queryList();
        }
      }
    }
  }
</script>

<style scoped>

</style>
