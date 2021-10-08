<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">腾讯云地域详情</span>
      <span class="create-back detail-header-item" @click="$router.push({name: 'hybridtencentdatacenter'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">
          回到腾讯云列表
        </span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">
              {{$t('hybridTencenterDataCenter.Actions')}}
            </span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding:12px 0px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" v-model="activeName" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('hybridbucket.bucket')" name="bucket"></el-tab-pane>
        <el-tab-pane :label="$t('common.hybrididentityzone')" name="iZone"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <div class="icon"></div>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResourceParam('regionName')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row v-for="(item, index) in leftDataGroup"
                      :key="index"
                      :param="{
                        title: $t(`${item.title}`),
                        content: item.content
                      }"/>
        </div>
        <div class="split-line"></div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'common.uuid',
            content: windowData.dataUuid
          }"
        />
        <div class="split-line"></div>
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'bucket'">
      <hybrid-tencent-bucket-tab :param="{ conditions: `dataCenterUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid,
          createBucket: createBucket, detailBucket: detailBucket}"/>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'iZone'">
       <hybrid-tencent-identity-zone-tab-list :param="{conditions: `dataCenterUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid}"/>
    </div>

    <div slot="footer">
      <create-tencent-bucket v-if="showCreateBucket" :param="createBucketParam" @close="showCreateBucket = false;"/>
      <detail-hybrid-tencent-bucket v-if="showDetailBucket" :param="detailBucketParam" @close="showDetailBucket=false;"/>
    </div> 
  </detail-template>
</template>

<script>
  
  import DetailHybridTencentBucket from 'src/tencent/dataCenter/detail/DetailHybridTencentBucket';
  import HybridTencentIdentityZoneTabList from "../components/HybridTencentIdentityZoneTabList";
  import HybridTencentBucketTab from "../components/HybridTencentBucketTab";
  import CreateTencentBucket from '../create/CreateTencentBucket'
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import { mapGetters } from 'vuex';

  export default {
    name: "DetailHybridTencentDataCenterPage",

    components: {HybridTencentIdentityZoneTabList, HybridTencentBucketTab, DetailTemplate, CreateTencentBucket, DetailHybridTencentBucket},

    mixins: [WindowBase, PageBase],

    data() {
      return {
        activeName: "info",
        showCreateBucket: false,
        createBucketParam: {},
        showDetailBucket: false,
        detailBucketParam: {}
      }
    },

    computed: {
      ...mapGetters({
        get: 'hybridTencentDataCenter/getList'
      }),
      //腾讯云数据
      txDataCenter() {
        return this.get(this.windowData.dataUuid);
      },
      //左边参数集合
      leftDataGroup () {
        return [
          {title: 'hybridTencenterDataCenter.regionId', content: this.txDataCenter && this.txDataCenter.regionId},
          {title: 'common.createDate', content: this.txDataCenter && this.txDataCenter.createDate && formatDatetime(new Date(this.txDataCenter.createDate))},
          {title: 'common.lastOpDate', content: this.txDataCenter && this.txDataCenter.lastOpDate && formatDatetime(new Date(this.txDataCenter.lastOpDate))}
        ]
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
      })
    },

    methods: {
      //查询详情
      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridTencentDataCenter/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        });
      },
      //资源名称、描述
      updateResourceParam(param) {
        return {
          getValue: () => {
            return this.txDataCenter && this.txDataCenter[param];
          },
          canEdit: () =>  false
        }
      },
      //删除地域
      detailDelete() {
        let self = this,
          uuidList = [self.windowData.dataUuid],
          options = {
            title: 'hybridTencenterDataCenter.Deletedatacenter',
            description: 'hybridTencenterDataCenter.delete',
            icon: 'zone_popupico',
            uuidList,
            getName: () => {
              return self.txDataCenter && self.txDataCenter.regionName;
            },
            ok: () => {
              let event = self.createEvent('hybridTencenterDataCenter.action.delete', self.txDataCenter.regionName);
              self.dispatchActionWithEvent('hybridTencentDataCenter/delete', uuidList, null, event)
                .then( () => self.$router.push({name: 'hybridtencentdatacenter'}));
            }
          };
        self.openDialog('ConfirmDlg', options)
      },
      //创建桶
      createBucket(param) {
        let self = this;
        self.createBucketParam = param;
        self.showCreateBucket  = true;
      },
      //桶详情
      detailBucket(param) {
        let self = this;
        self.detailBucketParam = param;
        self.showDetailBucket = true;
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
