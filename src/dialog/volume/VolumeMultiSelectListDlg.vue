<template>
  <dialog-template width="1020px">
    <div slot="title">
      <span class="modal-title">{{$t('volume.select')}}</span>
      <span class="dialog-close el-icon-close" @click="close"></span>
    </div>
    <div slot="body">
      <div style="padding:30px;overflow: hidden">
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

        <mh-table :data-source="dataSource"></mh-table>
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
    <div class="dialog-footer" slot="footer">
      <span @click="confirmDlg" class="btn-confirm">{{$t('common.ok')}}</span>
      <span @click="close" class="btn-cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VolumeList from 'src/ecs/volume/List';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash'


  export default {
    name: "VolumeMultiSelectDlg",
    mixins: [WindowBase, MultiSelectList, VolumeList],
    data() {
      let self  = this;
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: [],
        volumeUuidList: [],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              sortable: true
            },
            {
              getContent: item => self.getField('type', item),
              getHeaderContent: self.$t('common.type'),
              field: 'type'
            },
            {
              getContent: item => self.getField('size', item),
              getHeaderContent: self.$t('common.size'),
              field: 'size'
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state'
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('common.status'),
              field: 'status'
            },
            {
              getContent: item => self.getField('vmInstanceUuid', item),
              getHeaderContent: self.$t('common.vm'),
              field: 'vmInstanceUuid'
            },
            {
              getContent: item => self.getField('isShareable', item),
              getHeaderContent: self.$t('common.sharedVolume'),
              field: 'isShareable'
            },
            {
              getContent: item => self.getField('primaryStorage', item),
              getHeaderContent: self.$t('common.primaryStorage'),
              field: 'primaryStorage'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            }
          ]
        }
      }
    },
    created() {
      if(this.dialogData.param.uuid) this.init();
      else this.updateWindow({
          pageIndex: 1,
          pageCount: 1,
          pageSize: 5,
          sortBy: 'createDate',
          sortDirection: '-',
          selectedUuidList: [],
          methods: {
            queryList: this.queryList
          }
        }).then(() => {
          this.queryList()
        })
    },
    methods: {
      init(){
        let vmInstanceUuid = this.dialogData.param.uuid
        let volumeUuidList = []
        let taskList = []
        let p = rpc.query(`vm-instances/${vmInstanceUuid}/data-volume-candidates`)
          .then((resp) => {
            volumeUuidList = volumeUuidList.concat(resp.inventories.map(it => it.uuid))
          })
        taskList.push(p)

        Promise.all(taskList).then(() => {
          this.volumeUuidList = volumeUuidList
          this.updateWindow({
            pageIndex: 1,
            pageCount: 1,
            pageSize: 5,
            sortBy: 'createDate',
            sortDirection: '-',
            selectedUuidList: [],
            methods: {
              queryList: this.queryList
            }
          }).then(() => {
            this.queryList()
          })
        })
      },
      ...Utils,
      getField(field, item){
        let self = this;
        if(_.isUndefined(item)) return '';
        let fields = ['name','type', 'state', 'status'];
        if(fields.includes(field)) return item[field];
        if(field === 'size') return self.bytesToSize(item[field]);
        if(field === 'vmInstanceUuid') return !!self.dbData.volume[item.uuid].vmInstanceUuid ? self.$t('state.Attached') : self.$t('state.Unattached');
        if(field === 'isShareable') return self.dbData.volume[item.uuid].isShareable ? self.$t('common.yes') : self.$t('common.no');
        if(field === 'primaryStorage') return self.getPsName(item.uuid);
        if(field === 'createDate') return self.formatDatetime(new Date(item[field]));
      },
      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirmDlg() {
        let self = this;
        if(!self.isSelected) return;
        if(self.dialogData.param.ok)
        self.dialogData.param.ok(self.createParam());
        if(self.dialogData.param.select)
          self.dialogData.param.select(self.createParam());
        self.closeDialog(self.windowId);
      },
      createParam() {
        let self = this;
        return self.selectedList;
      },
      getCondition: function () {
        let conditionList = []
        if(this.dialogData.param.uuid)
        conditionList.push(`uuid?=${this.volumeUuidList.join()}`);
        if(this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions);
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
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
