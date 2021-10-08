<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <!--详情标题-->
      <div class="detail-header-item detail-title">
         华为云地域列表
      </div>
      <!--返回列表-->
      <div class="detail-header-item create-back" @click="$router.push({name: 'hybridhuaweidatacenter'})">
        <i class="el-icon-back"></i>
        回到华为云地域列表
      </div>
      <!--详情操作下拉框-->
      <div class="detail-header-item">
         <drop-down class="detail-dropdown">
           <span slot="title">
             <span class="text">{{$t('hybriddatacenter.RegionActions')}}</span>
           </span>
           <span slot="content">
             <div class="dropdown-content">
               <a style="padding: 12px 0px" @click="detailDelete()">{{$t('common.destroy')}}</a>
             </div>
           </span>
         </drop-down>
      </div>
      <!--详情tab-->
      <div class="detail-tab">
        <el-tabs v-model="currTab" tab-position="bottom">
          <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
          <el-tab-pane :label="'Obs桶'" name="obs"></el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <!--详情body-->
    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <div class="icon"></div>
          <div class="after-icon"></div>
          <!--修改地域输入框组件-->
          <detail-name class="name" :param="updateResourceParam('regionName')"/>
          <!--修改简介文本输入框-->
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <!--regionId展示组件-->
          <detail-row
            :param="{
              title: 'hybriddatacenter.regionId',
              content: huaweiDataCenter && huaweiDataCenter.regionId
            }"
          />
          <!--创建时间展示组件-->
          <detail-row
            :param="{
               title: 'common.createDate',
               content: huaweiDataCenter && huaweiDataCenter.createDate && formatDatetime(new Date(huaweiDataCenter.createDate))
            }"
          />
          <!--最后操作时间展示组件-->
          <detail-row
            :param="{
               title: 'common.lastOpDate',
               content: huaweiDataCenter && huaweiDataCenter.lastOpDate && formatDatetime(new Date(huaweiDataCenter.lastOpDate))
            }"
          />
        </div>
        <div class="split-line"></div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <!--uuid展示组件copy为true表示可以复制-->
        <detail-row
          :param="{
             title: 'common.uuid',
             content: windowData.dataUuid,
             copy: true
          }"
        />
        <div class="split-line"></div>
      </div>
    </div>

    <div v-if="currTab === 'obs'" class="detail-body" slot="body">
      <hybrid-huawei-bucket-tab :param="{uuid: windowData.dataUuid, conditions: [`dataCenterUuid=${windowData.dataUuid}`], setCreateBucketParam: getCreateBucketParam, openCreateBucket: () => showCreateCreateBucket = true}"></hybrid-huawei-bucket-tab>
    </div>

    <template slot="footer">
      <create-oss-bucket  v-if="showCreateCreateBucket" :param="createBucketParam" @close="showCreateCreateBucket = false"></create-oss-bucket>
    </template>
  </detail-template>
</template>

<script>
  //详情页模板
  import HybridHuaweiBucketTab from 'src/huaweicloud/dataCenter/components/HybridHuaweiBucketTab';
  import CreateOssBucket from 'src/huaweicloud/dataCenter/components/CreateOssBucket';
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import {mapGetters} from  'vuex'
  export default {
    name: "DetailHuaweiDataCenterPage",
    mixins: [WindowBase],
    components: {DetailTemplate, 'hybrid-huawei-bucket-tab': HybridHuaweiBucketTab, CreateOssBucket},
    data() {
      return {
        currTab: 'info',
        showCreateCreateBucket: false,
        createBucketParam: {},
      }
    },
    computed: {
      //计算方法得到华为云地域列表
      ...mapGetters({
        get: 'hybridHuaweiDataCenter/getList'
      }),
      //计算华为云地域详情对象
      huaweiDataCenter() {
        return this.get(this.windowData.dataUuid);
      }
    },
    //初始化查询条件
    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          query: self.detailQuery
        }
      }).then( () => {
        //查询详情
        self.detailQuery();
      })
    },
    methods: {
      //格式化时间格式
      formatDatetime,
      //查询华为云地域详情请求
      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridHuaweiDataCenter/basicQuery',{
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },
      //更新参数
      updateResourceParam(name) {
        return {
          getValue: () => {
            return this.huaweiDataCenter && this.huaweiDataCenter[name]
          },
          canEdit: () => {
            return false;
          }
        }
      },
      //删除地域
      detailDelete() {
        let self = this,
          uuidList = [self.windowData.dataUuid],
          options = {
            title: 'hybridHuaweiDataCenter.Deletedatacenter',
            description: 'hybridHuaweiDataCenter.delete',
            icon: 'zone_popupico',
            uuidList,
            getName: () => {
              return self.huaweiDataCenter && self.huaweiDataCenter.regionName;
            },
            ok: () => {
              let event = self.createEvent('hybridHuaweiDataCenter.action.delete', self.huaweiDataCenter.regionName);
              self.dispatchActionWithEvent('hybridHuaweiDataCenter/delete', uuidList, null, event)
                .then( () => self.$router.push({name: 'hybridhuaweidatacenter'}));
            }
          };
        self.openDialog('ConfirmDlg', options)
      },
      //设置添加Bucketparam
      getCreateBucketParam(param) {
        let _this = this;
        _this.createBucketParam = param;
      }
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins.less";
  .icon{
  .detail-icon('~assets/zone_detail.svg')
  }
</style>
