<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t('common.selectPrimaryStorage')}}</div>
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
       highlight-current-row
       @row-click="handleSingleSelect"
      :data="primaryItemList">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column width="50px">
          <template slot-scope="scope">
            <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
          </template>
        </el-table-column>
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
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import PrimaryStorageList from 'src/storage/primarystorage/List';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import _ from 'lodash';
  export default {
    name: "PrimaryStorageSingleDlg",
    mixins: [WindowBase,PrimaryStorageList],
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
        visiabled: false,
        templateRadio: '',
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
      close(){
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.$emit('close', self.templateRadio);
      },
      getCondition: function () {
        let conditionList = []
        if (this.message.conditions) conditionList = conditionList.concat(this.message.conditions)
        if (this.message.data) conditionList = conditionList.concat(this.message.data)
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        self.queryList();
      }
    },
    watch: {
      model(newVal, oldVal){
        if(newVal, oldVal){
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
