<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('zwatchEndpoint.select')}}</span>
      <span class="dialog-close el-icon-close" @click="close"></span>
    </div>

    <div slot="body" style="padding: 30px 20px;">
      <div class="page-toolbar-container" style="display: flex">
        <div class="page-toolbar-left"></div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
          <span style="padding: 0 15px;display: inline-block;float: right;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>

      </div>
      <div class="page-table">
        <mh-table :data-source="dataSource"></mh-table>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.availableCount > 0"
                         :page-sizes="[5, 10]"
                         :page-size="5"
                         :total="windowData.availableCount"
                         class="page-table-pagination"
                         layout="total, sizes, prev, pager, next"
                         @current-change="pageCurrentChange"
                         @size-change="pageSizeChange"
                         :current-page="windowData.pageIndex"></el-pagination>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import ZWatchEndpointList from 'src/om/zwatchEndPoint/List'
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash'

  export default {
    name: "ZWatchEndPointSelect",
    mixins: [MultiSelectList, WindowBase, ZWatchEndpointList],
    data(){
      let self = this;
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: [],
        dataSource:{
          getItemList: () => this.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name',  item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              sortable: true
            },
            {
              getContent: item => self.getField('type',  item),
              getHeaderContent: self.$t('zwatchEndpoint.type'),
              field: 'type',
            },
            {
              getContent: item => self.getField('address',  item),
              getHeaderContent: self.$t('zwatchEndpoint.address'),
              field: 'address',
            },
            {
              getContent: item => self.getField('state',  item),
              getHeaderContent: self.$t('common.state'),
              field: 'state',
            },
            {
              getContent: item => self.getField('createDate',  item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            },
          ]
        }
      }
    },

    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
      this.deleteAllAssistant()
      this.queryForAssistant()
    },

    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Utils,
      getField(field,  item){
       let self = this;
       if(_.isUndefined(item)) return '';
       let normalFields = ['name', 'state'];
       if(_.includes(normalFields, field)) return item[field];
       if(field === 'createDate') return self.formatDatetime(new Date(item[field]));
       if(field === 'type') return self.getZWatchEndpointType(item.uuid);
        if(field === 'address') return self.getZWatchEndpointAddress(item.uuid)
      },

      queryForAssistant () {
        if (this.dialogData.param.removeMode) return
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${genUniqueId()}`
          self.createAssistant({
            id,
            operation,
            title: 'zwatchEndpointTitle',
            ownerId: self.windowData.id,
            content: `lackOf${resourceName}`,
            handler: () => {
             self.$router.push({name: 'createEndPoint'})
            }
          })
        }
        rpc.query('sns/application-endpoints', {
          q: this.getCondition(),
          count: true
        }).then((resp) => {
          if (resp.total === 0) newAssistant('zwatchEndpoint', 'create')
        })
      },
      getCondition () {
        let conditionList = []
        conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },

      close(){
        let self = this;
        self.closeDialog(self.windowId);
      },

      confirm(){
        let self = this;
        if(!self.isSelected){
          self.$message('请选择资源！');
          return ;
        }
        self.dialogData.param.select(self.selectedList);
        self.close();
      }
    }
  }
</script>

<style scoped>

</style>
