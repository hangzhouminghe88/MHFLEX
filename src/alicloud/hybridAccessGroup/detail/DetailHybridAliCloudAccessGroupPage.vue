<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云文件系统详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'hybridalicloudfilesystem'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到阿里云文件系统列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">阿里云文件系统操作</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a @click="detailDelete(windowData.dataUuid)" style="padding: 12px;">{{$t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.rule')" name="rule"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="eip_ico"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" v-show="hybridAliCloudEip.status" :state="hybridAliCloudEip.status"/>
          </div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
              title: 'common.networkType',
              content: hybridAliCloudAccessGroup.networkType && hybridAliCloudAccessGroup.networkType
            }"
          />
          <detail-row
            :param="{
              title: 'common.hybridDatacenter',
              content: hybridAliCloudAccessGroup && regionList && getRegion(regionList, windowData.dataUuid).regionName
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: hybridAliCloudAccessGroup.createDate && formatDatetime(new Date(hybridAliCloudAccessGroup.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: hybridAliCloudAccessGroup.lastOpDate && formatDatetime(new Date(hybridAliCloudAccessGroup.lastOpDate))
            }"
          />
        </div>
        <div class="split-line"></div>
      </div>
      <div class="right">
        <div style="height: 40px;"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: windowData.dataUuid,
            copy: true
          }"
        />
      </div>
    </div>

    <!--权限组规则列表-->
    <div slot="body" class="detail-body" v-if="currTab === 'rule'">
      <hybrid-access-group-rule-tab-list :param="{uuid: windowData.dataUuid, pageCreateRule: pageCreateRule}"/>
    </div>

   <!--创建权限组规则-->
   <div slot="footer" class="detail-footer">
     <create-hybrid-ali-cloud-security-group-rule :param="createRuleParam" v-if="showCreateRule" @close="showCreateRule = false;"/>
   </div>
  </detail-template>
</template>

<script>
  import HybridAccessGroupRuleTabList from 'src/alicloud/hybridAccessGroup/components/HybridAccessGroupRuleTabList';
  import DetailInfoState from "src/component/DetailInfoState";
  import DetailTemplate from "src/component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import { mapGetters } from 'vuex';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';

  export default {
    name: "HybridAliCloudAccessGroupDetailPage",

    mixins: [WindowBase, Methods],

    components: {DetailInfoState, DetailTemplate, HybridAccessGroupRuleTabList},

    computed: {
      ...mapGetters({
        get: 'hybridAliCloudAccessGroup/get'
      }),
      hybridAliCloudAccessGroup() {
        let self = this;
        return self.get([self.windowData.dataUuid]);
      },
    },

    data() {
      return {
        currTab: 'info',
        regionList: [],
        showCreateRule: false,
        createRuleParam: {}
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          query: self.detailQuery
        }
      }).then( () => {
        self.detailQuery();
        self.queryRegionList();
      })
    },

    methods: {
      ...Utils,
      async queryRegionList () {
        let self = this
        let param = {
          q: ['dcType=privateAliyun']
        }
        let resp = await rpc.query('hybrid/data-center', param);
        self.regionList = resp.inventories
      },
      //更新资源参数
      updateResourceParam(name) {
        return {
          getValue: () => {
            return this.hybridAliCloudFileSystem[name] && this.hybridAliCloudFileSystem[name].replace(/zstack/g, '');
          },
          setValue: (newVal) => {
            if(_.isEqual(newVal, this.hybridAliCloudFileSystem[name])) return;
            let event = this.createEvent(`common.updateInfo${name}`, this.hybridAliCloudFileSystem.name);
            let param = {
              [name]: newVal
            }
            this.dispatchActionWithEvent('hybridAliCloudAccessGroup/update', {param, uuid: this.windowData.dataUuid}, null, event);
          },
          canEdit: () => {
            return true;
          }
        }
      },
      //查询详情数据
      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridAliCloudAccessGroup/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },
      //删除文件系统
      detailDelete(uuid) {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: 'nasFileSystem.delete',
          description: 'nasFileSystem.deleteConfirm',
          icon: 'pop_file_system_n',
          uuidList: [uuid],
          getName: (uuid) => {
            return this.dbData.hybridAliCloudFileSystem[uuid].name.replace(/zstack/g, '');
          },
          ok: () => {
            self.delete([uuid]).then(() => self.$router.push({name:'hybridalicloudfilesystem'}));
          }
        })
      },
      //--创建权限组规则--
      pageCreateRule(param) {
        let self = this;
        self.createRuleParam = param;
        self.showCreateRule = true;
      }
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins";
  .icon{
    .detail-icon('~assets/eip_ico.svg');
  }
</style>
