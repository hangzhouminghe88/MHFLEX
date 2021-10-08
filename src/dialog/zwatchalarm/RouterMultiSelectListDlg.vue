<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span class="title">{{ $t("vrouterroutetable.selectRouter") }}</span>
      <span class="el-icon-close dialog-close" @click="close()"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div style="margin: 30px 20px;">
        <div class="tab-content">
          <div class="tab-item" :class="{'active': windowData.currSelectTab === 'virtualRouter' }" @click="changeTab('virtualRouter')">{{$t('common.virtualRouterDevice') }}</div>
          <div class="tab-item" :class="{'active': windowData.currSelectTab === 'vpcVRouter'}"  @click="changeTab('vpcVRouter')">{{ $t('common.vpcVRouter') }}</div>
        </div>
        <div class="radio-group" style="text-align: right;display: inline-block;float: right;">
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
          @selection-change="handleSelect">
           <span slot="empty" class="table-nodata">
              <p class="empty-text" v-text="$t('common.noData')"></p>
            </span>
          <el-table-column width="50px" type="selection"></el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.defaultIp')" prop="defaultIp">
            <template slot-scope="scope">
              {{getDefaultL3NetworkIp(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.managementIp')" prop="managementIp">
            <template slot-scope="scope">
              {{getHostIp(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.hypervisorType')" prop="hypervisorType"></el-table-column>
          <el-table-column :label="$t('common.cluster')" prop="cluster">
            <template slot-scope="scope">
              {{getClusterName(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state :state="scope.row.state"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{new Date(scope.row.createDate) | formatDatetime}}
            </template>
          </el-table-column>
        </el-table>
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
    <div slot="footer" class="el-dialog__footer">
      <span class="btn-confirm" @click="ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import MultiSelectedList from 'src/windows/Base/MultiSelectList';
  import VirtualRouterList from 'src/network/virtualRouter/List';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import Utils from 'src/utils/utils';
  import _ from 'lodash'

    export default {
      components: {TableBodyItemState},
      mixins: [VirtualRouterList, WindowBase, MultiSelectedList],
      name: "RouterMultiSelectListDlg",
      created: function () {
        let selectedItems = {
          virtualRouter: [],
          vpcVRouter: []
        }
        this.updateWindow({
          pageIndex: 1,
          pageCount: 1,
          pageSize: 20,
          sortBy: 'createDate',
          sortDirection: '-',
          currSelectTab: 'virtualRouter',
          selectedItems,
          methods: {
            queryList: this.queryList
          }
        }).then(() => this.queryList())
      },
      data () {
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
          searchStr: '',
          selectVal: 'name',
          itemList: []
        }
      },
      methods: {
        changeTab: function (tabName) {
          if (this.windowData.currSelectTab !== tabName) {
            let selectedItems = _.cloneDeep(this.windowData.selectedItems)
            selectedItems[this.windowData.currSelectTab] = this.selectedList
            this.updateWindow({
              currItemUuid: '',
              currSelectTab: tabName,
              pageIndex: 1,
              pageCount: 1,
              pageSize: 20,
              selectedItems,
              sortBy: 'createDate',
              sortDirection: '-',
              selectedUuidList: []
            })
            this.queryList().then(() => {
              let table = _.cloneDeep(this.windowData.table)
              this.updateWindow({ table })
            })
          }
        },
        getCondition: function () {
          let conditionList = []
          switch (this.windowData.currSelectTab) {
            case 'virtualRouter':
              conditionList = ['applianceVmType?=vrouter,VirtualRouter']
              break
            case 'vpcVRouter':
              conditionList = ['applianceVmType=vpcvrouter']
              break
          }
          if (this.dialogData.param.conditions && Array.isArray(this.dialogData.param.conditions)) {
            conditionList = conditionList.concat(this.dialogData.param.conditions)
          }
          if (this.selectVal !== '' && this.searchStr !== '') {
            conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
          }
          return conditionList
        },
        close: function () {
          // this.dialogData.param.ok()
          this.closeDialog(this.windowData.id)
        },
        ok: function () {
          let selectedItems = _.cloneDeep(this.windowData.selectedItems)
          selectedItems[this.windowData.currSelectTab] = this.selectedList
          let selectedUuidList = []
          _.values(selectedItems).forEach(it => {
            if(it)
            selectedUuidList = selectedUuidList.concat(it)
          })
          if (selectedUuidList.length > 0) this.dialogData.param.select(selectedUuidList)
          this.close()
        },
        ...Utils
      }
    }
</script>

<style scoped>
  .tab-content{
    border: 1px solid #39f;
    border-radius: 2px;
    cursor: pointer;
    display: inline-block;

  }
  .tab-item{
    border-radius: 2px;
    display: inline-block;
    text-align: center;
    font-size: 12px;
    padding: 10px 21px;
  }
  .active{
    background: #39f;
    color: #fff;
  }
</style>
