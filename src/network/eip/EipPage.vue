<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{ $t(`common.eip`) }}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab">
            <el-tab-pane
              :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`"
              name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between">
        <div style="flex-shrink: 0;">
          <span class="btn-success" v-if="windowData.currTab !== 'system'" v-permission="'EIP.CREATE'"
                @click="updateWindow({ currItemUuid: '' }); openCreateEip()"><i class="el-icon-plus icon"></i>{{$t('common.createEip')}}</span>
          <drop-down v-if="windowData.currTab !== 'system'" class="btn-primary more dropdown"
                     :class="{'disabled': !isSelected || windowData.currItemUuid !== ''}"
                     :enabled="isSelected && windowData.currItemUuid === ''">
              <span slot="title">
                 <i class="el-icon-more"></i>
                 <span class="text">{{ $t("common.moreActions") }}</span>
              </span>
            <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a id="eip-attach" v-permission="'EIP.ATTACH'"
                     @click="isSingleSelected && !dbData.eip[selectedList[0]].vmNicUuid && pageAttachEipToVm()"
                     :class="{ 'disabled-text': (selectedList[0] && dbData.eip[selectedList[0]].vmNicUuid) || (selectedList.length > 1)}"
                     style="padding-top: 12px;">{{$t("eip.attach")}}</a>
                  <a id="eip-detach" v-permission="'EIP.DETACH'"
                     :class="{ 'disabled-text': (selectedList[0] && !dbData.eip[selectedList[0]].vmNicUuid) || (selectedList.length > 1)}"
                     @click="isSingleSelected && dbData.eip[selectedList[0]].vmNicUuid && pageDetach()">{{$t("eip.detach")}}</a>
                  <a id="common-changeResourceOwner" :class="{ 'disabled-text': !canChangeResourseOwner() }"
                     v-permission="'LICENSE_BASIC_PAID'" v-if="dbData.common.isAdmin"
                     @click="isSelected && canChangeResourseOwner() && pageChangeResourceOwner()">{{$t("common.changeResourceOwner")}}</a>
                  <a id="common-destroy" v-permission="'EIP.DELETE'" @click="pageDelete()"
                     style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
                </div>
              </transition>
            </span>
          </drop-down>
        </div>
        <div style="text-align: right;flex-shrink: 0;">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
          <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
    </div>

    <div slot="page-table-content" style="max-height: 400px;">
      <el-table
        ref="multipleTable"
        :data="itemList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelect"
        v-loading="windowData.loading"
        @sort-change="handleSort"
      >
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          :label="$t('common.name')"
          prop="name"
          show-tooltip-when-overflow
        >
          <template slot-scope="scope">
            <span class="link" @click="$router.push(`detaileip/${scope.row.uuid}`);">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.publicNetworkIP')"
          prop="vipIp"
          show-tooltip-when-overflow
        >
        </el-table-column>
        <el-table-column
          :label="$t('common.privateNetworkIP')"
          prop="guestIp"
          show-tooltip-when-overflow
        >
        </el-table-column>
        <el-table-column
          :label="$t('common.vm')"
          prop=""
          show-tooltip-when-overflow
        >
          <template slot-scope="scope">
            {{getVmInstanceName(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.state')"
          prop="state"
        >
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.owner')"
          show-tooltip-when-overflow
          prop="owner" v-if="dbData.common.isAdmin && !dbData.common.isOpensource"
        >
          <template slot-scope="scope">
            {{getResourceOwner(scope.row.uuid)}}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.createDate')"
          show-tooltip-when-overflow
          prop="createDate">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
          :current-page="windowData.pageIndex"
          :page-size="windowData.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="windowData.availableCount"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </div>

    <div slot="page-footer">
      <eip-attachable-vm-nics-single-select-list v-if="showAttachNic" :param="attachEiptoVmParam" @close="showAttachNic = false;"/>
    </div>
  </page-template>
</template>

<script>
  import rpc from 'src/utils/rpc'
  import List from 'src/network/eip/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils'
  import TableBodyItemState from "../../component/TableBodyItemState";
  import IAM2ProjectMethods from 'src/IAM2Project/Methods'
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner'
  import EipAttachableVmNicsSingleSelectList from "./component/EipAttachableVmNicsSingleSelectList";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';

  export default {
    name: "VipListPage",
    mixins: [Root, WindowBase, List, MultiSelectList, PageBase],
    components: {EipAttachableVmNicsSingleSelectList, PageTemplate, TableBodyItemState},
    created: function () {
      this.getProjectAdmin = IAM2ProjectMethods.methods.getProjectAdmin.bind(this)
      this.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(this)
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        },
        showSearchBox: false
      })
        .then(() => {
          this.queryList()
        })
      if (this.dbData.common.isAdmin) {
        this.conditionNameList.push({
          name: 'common.owner',
          createCondition: this.createConditionForOwner
        })
      }

    },
    computed: {
    },
    destroyed: function () {

    },
    data() {
      return {
        currTab: 'available',
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
        searchStr: "",
        selectVal: 'name',
        itemList: [],
        showAttachNic: false
      }

    },
    methods: {
      createConditionForOwner: function (ownerName) {
        return rpc.query('accounts', {
          q: `name~=%25${ownerName}%25`
        }).then((resp) => {
          let uuidList = resp.inventories.map(it => {
            return it.uuid
          })
          return rpc.query('accounts/resources/refs', {
            q: [`accountUuid?=${uuidList.join()}`, 'resourceType=EipVO']
          })
        }).then((resp) => {
          let eipUuidList = []
          if (resp.inventories.length > 0) eipUuidList = _.uniq(resp.inventories.map((item) => item.resourceUuid))
          return new Promise((resolve, reject) => {
            resolve(`uuid?=${eipUuidList.join()}`)
          })
        })
      },
      openCreateEip: function () {
        this.$router.push("createeip")
      },
      pageAttachEipToVm: function () {
        if (!this.isSingleSelected) return
        let uuid = this.selectedList[0], self = this;
        self.attachEiptoVmParam = {
          eipUuid: uuid,
          ok: (ipUuid, vmNicUuid) => {
            this.attachEipToVm(uuid, vmNicUuid).then(() => {
              this.queryList()
            })
          }
        }
        self.showAttachNic = true;
      },
      pageDetach: function () {
        let vmNameList = []
        // let eipUuidList = []
        let vmNicUuidList = []
        let self = this
        if (!self.selectedList || self.selectedList.length <= 0) return
        self.selectedList.forEach(function (uuid) {
          if (self.dbData.eip[uuid].vmNicUuid) vmNicUuidList.push(self.dbData.eip[uuid].vmNicUuid)
        })
        rpc.query('vm-instances', {
          q: `vmNics.uuid?=${vmNicUuidList}`,
          fields: 'name'
        }).then((resp) => {
          vmNameList = resp.inventories.map(item => item.name)
          self.openDialog('ConfirmDlg', {
            uuidList: vmNameList,
            title: 'eip.detachVm',
            description: 'eip.action.detachVm',
            icon: 'vm_plain',
            ok: () => {
              self.detach(self.selectedList)
                .then(() => {
                  self.queryList()
                })
            },
            getName: (name) => {
              return name;
            }
          })
        })
      },
      pageChangeResourceOwner: async function () {
        const self = this
        self.changeResourceOwnerDlg(self.selectedList, self.changeResourceToAccountOrProject, self.queryList)
      },
      ...Utils
    },
    watch: {},
    filters: {}
  }
</script>

<style scoped>
  .link{
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
