<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云数据中心详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'hybridaliclouddatacenter'})">
				<i class="el-icon-back"></i>
				<span style="font-size: 12px">
					回到阿里云数据中心列表
				</span>
			</span>
      <span class="detail-header-item">
				<drop-down class="detail-dropdown">
					<span slot="title">
						<span class="text">{{$t('hybriddatacenter.RegionActions')}}</span>
					</span>
					<span slot="content">
						<div class="dropdown-content">
              <a style="padding: 12px 0px;" @click="detailDelete()">{{$t('common.destroyed')}}</a>
						</div>
					</span>
				</drop-down>
			</span>
      <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom" @tab-click="handleChangeTab">
        <el-tab-pane name="info" :label="$t('common.basicAttributes')"></el-tab-pane>
        <el-tab-pane name="bucket" :label="$t('hybridbucket.bucket')"></el-tab-pane>
        <el-tab-pane name="identityZone" :label="$t('hybrididentityzone.identityzone')"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="zone_detail"/>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResourceParam('regionName')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header" v-text="$t('common.overview')"></div>
          <detail-row
            :param="{
							 title: $t('hybriddatacenter.regionId'),
							 content: model && model.regionId
						}"
          />
          <detail-row
            :param="{
							title: $t('common.createDate'),
							content: model && model.createDate && formatDatetime(new Date(model.createDate))
						}"
          />
          <detail-row
            :param="{
							title: $t('common.lastOpDate'),
							content: model && model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
						}"
          />
          <div class="split-line"></div>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px;"></div>
        <div class="detail-block-header" v-text="$t('common.moreInformation')"></div>
        <detail-row
          :param="{
						title: 'UUID',
						content: model && windowData.dataUuid,
						copy: true
					}"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'bucket'">
      <hybrid-ali-cloud-bucket-tab :param="{ conditions: `dataCenterUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid,
          createBucket: createBucket, detailBucket: detailBucket}"/>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'identityZone'">
      <hybrid-ali-cloud-identity-zone-tab :param="{ conditions: `dataCenterUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"/>
    </div>

    <div slot="footer">
      <create-hybrid-ali-cloud-bucket
        v-if="showAliCloudBucket"
        :param="aliCloudBucketParam" @close="showAliCloudBucket = false;"></create-hybrid-ali-cloud-bucket>
      <hybrid-ali-cloud-bucket-detail-page v-if="showAliCloudDetailBucket"
                                           :param="aliCloudDetailBucketParam"
                                           @close="showAliCloudDetailBucket = false"/>
    </div>
  </detail-template>
</template>

<script>
  import CreateHybridAliCloudBucket from "../../hybridImage/component/CreateHybridAliCloudBucket";
  import HybridAliCloudIdentityZoneTab from "../components/HybridAliCloudIdentityZoneTab";
  import HybridAliCloudBucketDetailPage from "./HybridAliCloudBucketDetailPage";
  import HybridAliCloudBucketTab from "../components/HybridAliCloudBucketTab";
  import DetailTemplate from 'src/component/DetailTemplate';
  import LogList from 'src/component/LogList';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import Methods from '../Methods';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash'

  export default {
    name: 'HybridAliCloudDataCenterDetailPage',

    mixins: [WindowBase, Methods],

    components: {
      HybridAliCloudBucketDetailPage,
      CreateHybridAliCloudBucket,
      HybridAliCloudIdentityZoneTab,
      HybridAliCloudBucketTab,
      DetailTemplate,
      LogList
    },

    data() {
      return {
        hybridDataCenter: {},
        currTab: 'info',
        showAliCloudBucket: false,
        aliCloudBucketParam: {},
        showAliCloudDetailBucket: false,
        aliCloudDetailBucketParam: {}
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid;
      self.updateWindow({
        dataUuid
      }).then(() => {
        self.query();
      })
    },

    computed: {
      model: {
        get() {
          let self = this;
          if (self.hybridDataCenter) {
            return self.hybridDataCenter;
          }
          return {};
        },
        set(val) {
          this.hybridDataCenter = val;
        }
      }
    },

    methods: {
      ...Utils,

      query() {
        let self = this;
        return rpc.query(`hybrid/data-center/${self.windowData.dataUuid}`)
          .then((resp) => {
            return self.updateDbRow({
              tableName: 'hybridDataCenter',
              id: self.windowData.dataUuid,
              data: resp.inventories[0]
            }).then(() => {
              self.model = _.get(self.dbData.hybridDataCenter, self.windowData.dataUuid);
            })
          })
      },

      updateResourceParam(param) {
        let self = this;
        return {
          getValue: () => {
            let self = this;
            return self.model && self.model[param];
          },
          setValue: (value) => {
            let self = this;
            if (value === self.model[param] || !value) return;

          },
          canEdit: () => {
            return false;
          }
        }
      },

      handleChangeTab(e) {
        let self = this;
        self.currTab = e.name;
      },

      detailDelete() {
        let self = this, uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          title: 'hybriddatacenter.Deletedatacenter',
          description: 'hybriddatacenter.delete',
          uuidList,
          icon: 'zone_popupico',
          ok: () => {
            self.delete(uuidList, self.query)
              .then(() => {
                self.$router.push({name: 'hybridaliclouddatacenter'});
              })
          },
          getName: (uuid) => {
            return self.dbData.hybridDataCenter[uuid].regionName;
          }
        })
      },

      //是否展示bucket创建页面
      createBucket(param) {
        let self = this;
        self.aliCloudBucketParam = param;
        self.showAliCloudBucket  = true;
      },

      //是否展示bucket详情页面
      detailBucket(param) {
        let self = this;
        self.aliCloudDetailBucketParam = param;
        self.showAliCloudDetailBucket = true;
      }
    }
  }
</script>

<style scoped lang="less">
  @import url('../../../style/mixins');

  .icon {
    .detail-icon('~assets/zone_detail.svg');
  }
</style>
