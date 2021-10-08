<template>
    <page-template>
      <div slot="page-header" style="height: 60px; line-height: 60px;">
        <el-row :gutter="10">
          <el-col :span="2">
            <span class="page-header-title">{{ $t(`common.loadbalancerlistener`) }}</span>
          </el-col>
          <el-col :span="2.2">
            <el-tabs v-model="windowData.currTab">
              <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available" ></el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </div>
      <div slot="page-toolbar" class="page-toolbar-container">
        <el-row type="flex" justify="space-between">
          <div style="flex-shrink: 0;">
            <span class="btn-success" v-permission="'LB_LISTENER.CREATE'" @click="updateWindow({ currItemUuid: '' }); openCreateLoadBalancerListenrDlg()"><i class="el-icon-plus icon"></i>{{$t('loadbalancer.createListener')}}</span>
            <drop-down v-if="windowData.currTab !== 'system'"  class="btn-primary more dropdown" :class="{'disabled': !isSelected || windowData.currItemUuid !== ''}" :enabled="isSelected && windowData.currItemUuid === ''">
              <span slot="title">
                 <i class="el-icon-more"></i>
                 <span class="text">{{ $t("common.moreActions") }}</span>
              </span>
              <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                    <a id="loadbalancer-attachVmNic" v-permission="'LB_VMNIC.ADD'" style="padding-top: 12px;" @click="isSingleSelected && pageAddVmNic()" :class="{ 'disabled-text': !isSingleSelected }">{{$t("loadbalancer.attachVmNic")}}</a>
                    <a id="loadbalancer-detachVmNic" v-permission="'LB_VMNIC.REMOVE'" @click="isSingleSelected && canDetachVmNic(selectedList[0]) &&  pageDetachVmNic()" :class="{ 'disabled-text': !(isSingleSelected && canDetachVmNic(selectedList[0])) }">{{$t("loadbalancer.detachVmNic")}}</a>
                    <a id="loadbalancer-attachCertificate" v-permission="'LB_CERT.ADD_CERT_2_LISTENER'" :class="{'disabled-text': !canAttachCert(selectedList)}" @click="canAttachCert(selectedList) && pageAttachCertificate(selectedList)">{{$t("certificate.attach")}}</a>
                    <a id="loadbalancer-detachCertificate" v-permission="'LB_CERT.REMOVE_CERT_FROM_LISTENER'" :class="{'disabled-text': !canDetachCert(selectedList)}" @click="canDetachCert(selectedList) && pageDetachCertificate(selectedList)">{{$t("certificate.detach")}}</a>
                    <a id="common-destroy" v-permission="'LB_LISTENER.DELETE'" @click="pageDelete()" style="padding-bottom: 12px;">{{ $t("common.destroy") }}</a>
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
          >
            <template slot-scope="scope">
              <a class="link" @click="$router.push(`detailloadbalancerlistener/${scope.row.uuid}`);">{{scope.row.name}}</a>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.protocol')"
            prop="protocol"
          >
          </el-table-column>
          <el-table-column
            :label="$t('loadbalancer.loadBalancerPort')"
            prop="loadBalancerPort"
          >
          </el-table-column>
          <el-table-column
            :label="$t('loadbalancer.instancePort')"
            prop=""
          >
            <template slot-scope="scope">
              {{getLoadBalancerName(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.loadbalancer')"
            prop="instancePort"
          >
          </el-table-column>

          <el-table-column
            :label="$t('common.owner')"
            prop="owner" v-if="dbData.common.isAdmin && !dbData.common.isOpensource"
          >
            <template slot-scope="scope">
              {{getResourceOwner(scope.row.uuid)}}
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('loadbalancer.loadBalancerStatus')"
            prop="" v-if="!dbData.common.isOpensource"
          >
            <template slot-scope="scope">
              {{`${dbData.loadBalancerListenerA[scope.row.uuid].up} / ${dbData.loadBalancerListenerA[scope.row.uuid].total}`}}
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('common.createDate')"
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
        <load-balancer-listener-attach-vm-nic v-if="showLoaderListenerAttachNic" :param="loadBalancerListenerAttachVmNicParam" @close="showLoaderListenerAttachNic = false;"/>
      </div>
    </page-template>
</template>

<script>
  import rpc from 'src/utils/rpc'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils'
  import LoadBalancerList from './List'
  import LoadBalancerListenerAttachVmNic from "./component/LoadBalancerListenerAttachVmNic";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';

  export default {
    name: "LoadBalancerListPage",
    mixins: [Root,WindowBase,LoadBalancerList, MultiSelectList, PageBase],
    components: {LoadBalancerListenerAttachVmNic, PageTemplate},
    created: function () {
      this.self = this
      const initTab = 'available'
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        currTab: initTab,
        selectedUuidList: [],
        condition: this.conditions[initTab],
        sortBy: 'createDate',
        sortDirection: '-',
        loading: false,
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        return this.getIsOpensource()
      })
        .then(() => this.queryList())
    },
    computed:{
    },
    destroyed: function () {

    },
    data () {
      return {
        conditions: {
          'available': 'state!=Destroyed',
          'destroyed': 'state=Destroyed'
        },
        availableCount: 0,
        destroyedCount: 0,
        checkboxWidth: '100px',
        nameWidth: '100px',
        cpuWidth: '100px',
        memoryWidth: '100px',
        stateWidth: '100px',
        createDateWidth: '100px',
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
        itemList:[],
        showLoaderListenerAttachNic: false,
        loadBalancerListenerAttachVmNicParam: {}
      }

    },
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`loadBalancer.vip.l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      getIsOpensource () {
        return rpc.query('licenses').then(licensesResp => {
          return rpc.query('meta-data/opensource').then(opensourceResp => {
            let isOpensource = false
            if (opensourceResp.opensource || licensesResp.inventory.licenseType === 'Community') {
              isOpensource = true
            }
            return this.updateDbObject({
              name: 'common',
              data: {
                isOpensource
              }
            })
          })
        })
      },
      changeCurrTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          this.updateWindow({
            currItemUuid: '',
            currTab: tabName,
            condition: this.conditions[tabName]
          })
          this.queryList()
        }
      },
      pageAttachCertificate: function (listenerUuids) {
        this.attachCertificate(listenerUuids, true)
      },
      pageDetachCertificate: function (listenerUuids) {
        this.detachCertificate(listenerUuids, true)
      },
      ...Utils
    },
    watch: {
    },
    filters: {


    }
  }
</script>

<style scoped>

</style>
