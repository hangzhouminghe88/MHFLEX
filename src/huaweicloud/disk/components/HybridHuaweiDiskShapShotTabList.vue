<template>
    <div class="container">
      <div class="page-toolbar-container" style="display: flex">
        <div class="page-toolbar-left">
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="padding-top: 12px" @click="createHuaweiShapShot()">
                  创建华为云云盘快照
                </a>
                <a style="padding-bottom: 12px"
                   @click="isSelected && pageDelete()"
                   :class="{'disabled-text': !isSelected}">
                  {{$t('common.destroy')}}
                </a>
              </div>
            </span>
          </drop-down>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
           <span style="display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>
      </div>
      <div class="page-table">
        <mh-table :data-source="dataSource" :loading="windowData.loading"/>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.availableCount > 0"
                         :page-sizes="[10, 20, 50, 100]"
                         :page-size="windowData.pageSize"
                         layout="total, sizes, prev, pager, next, jumper"
                         :total="windowData.availableCount"
                         class="page-table-pagination"
                         @current-change="pageCurrentChange"
                         @size-change="pageSizeChange"
                         :current-page="windowData.pageIndex">
          </el-pagination>
        </div>
      </div>
    </div>
</template>

<script>
    import MultiSelectList from 'src/windows/Base/MultiSelectList';
    import WindowBase from 'src/windows/Window';
    import { formatDatetime, checkBounce } from "src/utils/utils";
    import rpc from 'src/utils/rpc';

    export default {
      name: "HybridHuaweiDiskShapShotTabList",
      mixins: [WindowBase, MultiSelectList],
      props: {
        param: {
          type: Object,
          default: () => {
            return {}
          }
        }
      },
      data() {
        let self = this;
        return {
          conditionNameList: [
            {
              name: 'common.name',
              value: 'name'
            },
            {
              name: 'common.uuid',
              value: 'uuid'
            }
          ],
          itemList: [],
          selectVal: 'name',
          searchStr: '',
          dataSource: {
            getItemList: () => self.itemList,
            handleSelection: self.handleSelect,
            type: 'selection',
            handleSort: self.handleSort,
            fields: [
              {
                getContent: item => self.getField('name', item),
                getHeaderContent: self.$t('common.name'),
                tooltip: true,
                sortable: true,
                field: 'name'
              },
              {
                getContent: item => self.getField('snapshotId', item),
                getHeaderContent: '快照Id',
                field: 'snapshotId'
              },
              {
                getContent: item => self.getField('status', item),
                getHeaderContent: self.$t('common.status'),
                field: 'status'
              },
              {
                getContent: item => self.getField('dataCenterName', item),
                getHeaderContent: self.$t('common.hybridDatacenter'),
                field: 'dataCenterName'
              },
              {
                getContent: item => self.getField('createDate', item),
                getHeaderContent: self.$t('common.createDate'),
                tooltip: true,
                sortable: true,
                field: 'createDate'
              }
            ]
          }
        }
      },
      created() {
        let self = this, dataUuid = '';
        dataUuid = self.param.uuid ? self.param.uuid : '';
        self.updateWindow({
          pageIndex: 1,
          pageSize: 10,
          sortBy: 'createDate',
          sortDirection:  '-',
          dataUuid,
          selectedUuidList: [],
          methods: {
            query: self.queryList
          }
        }).then(() => {
          self.queryList();
        })
      },
      methods: {
        //查找华为云快照列表
        async queryList(){
          let self = this
          let resp = await rpc.query('/hybrid/huawei/snapshot', {
            count: false,
            start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
            limit: self.windowData.pageSize,
            q: self.getCondition(),
            replyWithCount: true,
            sort : `${self.windowData.sortDirection}${self.windowData.sortBy}`
          })
          self.updateWindow({
            availableCount: resp.total
          })
          let uuidList = resp.inventories.map((item)=> item.uuid)
          self.updateWindow({uuidList})
          self.updateDbTable({
            tableName: 'hybridHuaweiSnap',
            list     : resp.inventories
          })
        },
        //填充表格数据
        getField(field, item) {
          let self = this, normalFields = ['name','snapshotId'];
          if(normalFields.includes(field)) return item[field];
          if(field === 'status' && item[field]) return item[field].replace(item[field].charAt(0), item[field].charAt(0).toLocaleUpperCase());
          if(field === 'dataCenterName') return self.getDataCenterName(item.dataCenterUuid);
          if(field === 'createDate') return formatDatetime(new Date(item[field]));
        },
        //获得地域名称
        getDataCenterName(uuid) {
          let value = '', self = this
          try{
            value = self.dbData.hybridHuaweiyunDataCenter[uuid].regionName
          }catch(e){
            if(checkBounce(`getDataCenterName-${uuid}`)) return ''
            value = ''
            rpc.query(`brid/data-center/${uuid}`)
              .then((resp)=>{
                self.updateDbRow({
                  tableName: "hybridHuaweiyunDataCenter",
                  id: resp.inventories[0].uuid,
                  data: resp.inventories[0]
                })
              })
              .then(()=>{
                self.$forceUpdate()
              })
          }
          return value
        },
        //删除快照
        pageDelete() {
          let self = this, uuidList = [];
          if(!self.isSelected) return;
          uuidList = self.selectedUuidList;
          self.openDialog('ConfirmDlg', {
            title: '删除华为云快照',
            description: 'hybridAliyunSnapshot.deleteSnapshot',
            icon: 'snapshot_popupico',
            isChecked: true,
            checkBoxText: '是否删除华为云远端快照',
            uuidList,
            ok: (isChecked) => {
              self.delete(uuidList, isChecked, self.queryList)
            },
            getName:(uuid) => {
              return self.hybridHuaweiSnap[uuid].name;
            }
          })
        },
        //删除快照
        delete(uuidList, deleteOrigin, fn){
          const self = this
          let event  = self.createEvent('hybridHuaweiSnap.action.delete', uuidList.length === 1 ? self.dbData.hybridHuaweiSnap[uuidList[0]].name : '' , uuidList.length)
          let p = null
          let task = []
          let url
          uuidList.forEach((uuid)=>{
            ((uuid)=>{
              if(deleteOrigin) url = `/hybrid/huawei/snapshot/${uuid}/remote`
              else url = `/hybrid/huawei/snapshot/${uuid}`
              p = rpc._delete(url, null, event)
                .then((resp)=>{
                  if(fn) fn()
                  self.incEventSuccess(event)
                },()=>{
                  self.incEventFail(event)
                })
              task.push(p)
            })(uuid)
          })
          return Promise.all(task)
        },
        //创建华为云云盘快照
        createHuaweiShapShot() {
          let self = this;
          self.param.createShap({
            diskUuid: self.windowData.dataUuid,
            ok: (param) => {
              return self.create(param)
            }
          })
          self.$emit('showCreateShap', true)
        },
        //查询列表条件
        getCondition: function () {
          let conditionList = []
          let conditions = this.param && this.param.conditions ? this.param.conditions : []
          conditionList = conditionList.concat(conditions)
          if (this.selectVal !== '' && this.searchStr !== '') {
            conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
          }
          return conditionList
        },
        create(param){
          const self = this
          let event = self.createEvent('hybridHuaweiSnap.action.create', param.name)
          return  rpc.create('/hybrid/huawei/snapshot',param,event)
            .then((resp)=>{
              self.incEventSuccess(event)
            },()=>{
              self.incEventFail(event)
            }).then(()=>{
              self.queryList();
            })
        },
      }
    }
</script>

<style scoped>

</style>
