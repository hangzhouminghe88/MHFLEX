<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云边界路由器详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name:'hybridalicloudvirtualborderrouter'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到阿里云边界路由器列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('hybridalicloudvirtualborderrouter.Actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding: 12px 0px;" @click="detailDelete()">
                {{$t('common.destroy')}}
              </a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs v-model="activeName" tab-position="bottom" class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.hybridvirtualrouterentry')" name="virtualRouterEntry"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <div class="icon"></div>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
              title: 'hybridvirtualborderrouter.physicalConnectionId',
              content: hybridAliCloudVirtualBorderRouter && hybridAliCloudVirtualBorderRouter.physicalConnectionId,
              copy: true
            }"
          />
          <detail-row
            :param="{
              title: 'hybridvirtualborderrouter.physicalConnectionStatus',
              content: hybridAliCloudVirtualBorderRouter && hybridAliCloudUserVpnGateway.physicalConnectionStatus,
              copy: true
            }"
          />

          <detail-row
            :param="{
              title: 'hybridvirtualborderrouter.peeringSubnetMask',
              content: hybridAliCloudVirtualBorderRouter &&hybridAliCloudUserVpnGateway.peeringSubnetMask,
              copy: true
            }"
          />

          <detail-row
            :param="{
              title: 'hybridvirtualborderrouter.peerGatewayIp',
              content: hybridAliCloudVirtualBorderRouter &&hybridAliCloudVirtualBorderRouter.peerGatewayIp,
              copy: true
            }"
          />

          <detail-row
            :param="{
              title: 'hybridvirtualborderrouter.localGatewayIp',
              content: hybridAliCloudVirtualBorderRouter && hybridAliCloudVirtualBorderRouter.localGatewayIp,
              copy: true
            }"
          />

          <detail-row
            :param="{
              title: 'common.createDate',
              content: hybridAliCloudVirtualBorderRouter && hybridAliCloudVirtualBorderRouter.createDate && formatDatetime(new Date(hybridAliCloudVirtualBorderRouter.createDate)),
            }"
          ></detail-row>

          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: hybridAliCloudVirtualBorderRouter && hybridAliCloudVirtualBorderRouter.lastOpDate && formatDatetime(new Date(hybridAliCloudVirtualBorderRouter.lastOpDate)),
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
        <detail-row
          :param="{
            title: 'UUID',
            content: windowData.dataUuid,
            copy: true
          }"
        />

        <detail-row
          :param="{
            title: 'hybridvirtualborderrouter.accessPoint',
            content: hybridAliCloudVirtualBorderRouter && hybridAliCloudVirtualBorderRouter.accessPointName,
            handler: () => {

            }
          }"
        />

        <detail-row
          :param="{
            title: 'hybridvirtualborderrouter.dataCenter',
            content: hybridAliCloudVirtualBorderRouter && hybridAliCloudVirtualBorderRouter.dataCenterName,
            handler: () => {
              $router.push({name: 'detailHybridAliCloudDataCenter', params: {uuid: hybridAliCloudVirtualBorderRouter.dataCenterUuid}})
            }
          }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'virtualRouterEntry'">

    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import { mapGetters } from 'vuex';

  export default {
    name: "DetailHybridAliCloudVirtualBorderRouterPage",

    components: {DetailTemplate},

    mixins: [WindowBase],

    data() {
      return {
        activeName: 'info'
      }
    },

    computed: {
      ...mapGetters({
        get: 'hybridAliCloudVirtualBorderRouter/get'
      }),
      hybridAliCloudVirtualBorderRouter() {
        return this.get(this.windowData.dataUuid);
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
      formatDatetime,

      detailQuery() {
        return this.dispatchAction('', {
          q: [`uuid=${this.windowData.dataUuid}`]
        })
      }
    }
  }
</script>

<style scoped>

</style>
