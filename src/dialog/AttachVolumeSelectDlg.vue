<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{ $t("vm.volume.select") }}</div>
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
      :data="itemList"
      @selection-change="handleSelection"
     >
       <span slot="empty" class="table-nodata">
          <p class="empty-text" v-text="$t('common.noData')"></p>
       </span>
      <el-table-column
      width="50px"
      type="selection">
      </el-table-column>
      <el-table-column
      prop="name"
      :label="$t('common.name')"></el-table-column>
      <el-table-column
      prop="type"
      :label="$t('common.type')"></el-table-column>
      <el-table-column
       :label="$t('common.size')">
        <template slot-scope="scope">
          {{bytesToSize(scope.row.size)}}
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('common.state')">
        <template slot-scope="scope">
          <table-body-item-state slot="item"  :state="scope.row.state"></table-body-item-state>
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('common.status')">
        <template slot-scope="scope">
          <table-body-item-state slot="item"  :state="scope.row.status"></table-body-item-state>
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('common.attached')">
        <template slot-scope="scope">
          {{!!dbData.volume[scope.row.uuid].vmInstanceUuid ? $t('common.yes') : $t('common.no')}}
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('common.sharedVolume')">
        <template slot-scope="scope">
          {{dbData.volume[scope.row.uuid].isShareable ? $t('common.yes') : $t('common.no')}}
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('common.primaryStorage')">
        <template slot-scope="scope">
          {{getPsName(scope.row.uuid)}}
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('common.createDate')">
        <template slot-scope="scope">
          {{formatDatetime(new Date(scope.row.createDate))}}
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import VolumeList from 'src/ecs/volume/List';
  import  WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import TableBodyItemState from "../component/TableBodyItemState";
  export default {
    name: "AttachVolumeSelectDlg",
    components: {TableBodyItemState},
    mixins: [WindowBase, VolumeList],
    props: {
      model: {
        type: Boolean,
        default: false
      },
      message: {
        type: Object,
        default: {}
      }
    },
    data(){
      return  {
        visiabled: false,
        volumeUuidList: [],
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        selectList: [],
        volumeUuidList: [],
        itemList: []
      }
    },
    mounted(){
      let self = this, volumeUuidList = [], taskList = [];
      if(self.message.type==='load'){
        let vmInstanceUuid = self.message.uuid ? self.message.uuid : '';
        let p = rpc.query(`vm-instances/${vmInstanceUuid}/data-volume-candidates`)
          .then((resp) => {
            volumeUuidList = volumeUuidList.concat(resp.inventories.map(it => it.uuid))
          })
        taskList.push(p)

        Promise.all(taskList).then(() => {
          self.volumeUuidList = volumeUuidList
          self.updateWindow({
            pageIndex: 1,
            pageCount: 1,
            pageSize: 5,
            currItemUuid: '',
            sortBy: 'createDate',
            sortDirection: '-',
            methods: {
              queryList: this.queryList
            }
          }).then(() => {
            this.queryList()
          })
        })
      }else{
        self.updateWindow({
          pageIndex: 1,
          pageCount: 1,
          pageSize: 5,
          currItemUuid: '',
          sortBy: 'createDate',
          sortDirection: '-',
          methods: {
            queryList: this.queryList
          }
        }).then(() => {
          this.queryList()
        })
      }
      self.visiabled = self.model;
    },
    methods: {
      close(){
        let self = this;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.$emit('close', {volumeUuidList: self.selectList, selectUuidList: self.message.uuid, type: self.message.type});
      },
      getCondition: function () {
        let conditionList = [], self = this;
        if(self.message.type === 'load')conditionList.push(`uuid?=${this.volumeUuidList.join()}`);
        if(self.message.conditions){
          conditionList = conditionList.concat(self.message.conditions)
        }
        if (this.searchStr !== '' && this.selectVal !== '') {
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
      handleSelection(row){
        let self = this;
        self.selectList = row.map((item) => {
          return item.uuid;
        })
      },
      ...Utils
    },
    watch: {
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
