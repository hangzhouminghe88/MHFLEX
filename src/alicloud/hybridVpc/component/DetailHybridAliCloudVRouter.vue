<template>
  <detail-template class="vrouter-detail__container">
    <div slot="header" class="detail-header">
      <span class="detail-title">虚拟路由器详情</span>
      <span class="detail-header-item create-back el-icon-back" @click="$emit('close')">
				返回虚拟路由器
			</span>
      <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('hybridvirtualrouterentry.virtualrouterentry')" name="virtualrouterentry"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
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
              title: 'hybridaliyunvirtualrouter.virtualrouterId',
              content: hybridAliCloudVirtualRouter && hybridAliCloudVirtualRouter.vrId
            }"
          />
          <detail-row
            :param="{
							title: 'common.createDate',
							content: hybridAliCloudVirtualRouter && hybridAliCloudVirtualRouter.createDate && formatDatetime(new Date(hybridAliCloudVirtualRouter.createDate))
						}"
          />
          <detail-row
            :param="{
							title: 'common.lastOpDate',
							content: hybridAliCloudVirtualRouter && hybridAliCloudVirtualRouter.lastOpDate && formatDatetime(new Date(hybridAliCloudVirtualRouter.lastOpDate))
						}"
          />
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div id="common-moreInformation" class="detail-block-header">
          {{$t("common.moreInformation")}}
        </div>
        <detail-row
          :param="{
              title: 'UUID',
              content: hybridAliCloudVirtualRouter && hybridAliCloudVirtualRouter.uuid,
              copy: true
            }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'virtualrouterentry'">
      <hybrid-ali-cloud-virtual-entry-tab :param="{ conditions: `virtualRouterUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime} from "src/utils/utils";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import { mapGetters } from 'vuex';
  import HybridAliCloudVirtualEntryTab from "./HybridAliCloudVirtualEntryTab";

  export default {
    name: "DetailHybridAliCloudVRouter",

    components: {HybridAliCloudVirtualEntryTab, DetailTemplate},

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    mixins: [WindowBase, PageBase],

    computed: {
      ...mapGetters({
        get: 'hybridAliCloudVirtualRouter/get'
      }),
      hybridAliCloudVirtualRouter() {
        let self = this;
        return self.get(self.windowData.dataUuid);
      }
    },

    data() {
      return {
        currTab: 'info'
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
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
        let self = this;
        return self.dispatchAction('hybridAliCloudVirtualRouter/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },

      updateResourceParam(name) {
        let self = this;
        return {
          getValue: () => {
            return self.hybridAliCloudVirtualRouter &&  self.hybridAliCloudVirtualRouter[name];
          },
          setValue: (newVal) => {
            if(self.hybridAliCloudVirtualRouter && _.isEqual(newVal, self.hybridAliCloudVirtualRouter[name])) return;
            let event = self.createEvent(`common.updateInfo${name}`, self.hybridAliCloudVirtualRouter.name);
            let param = {}; param[name] = newVal;
            let paramList = {
              uuid: self.windowData.dataUuid,
              param: param
            }
            self.dispatchActionWithEvent('hybridAliCloudVirtualRouter/update', paramList, null, event);
          },
          canEdit: () => {
            return true;
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
  @import url('../../../style/mixins');
  .vrouter-detail__container {
    position: absolute;
    top: 0px;
    width: 100%;
    height: 100%;
    z-index: 9;
    background: #fff;
  }

  .icon {
  .detail-icon('~assets/snapshot.svg')
  }
</style>
