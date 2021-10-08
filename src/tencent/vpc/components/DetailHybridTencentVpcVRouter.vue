<template>
  <detail-template class="vrouter-detail__container">
    <div slot="header" class="detail-header">
      <span class="detail-title">{{$t('common.vrouterroutetable')}}详情</span>
      <span class="detail-header-item create-back el-icon-back" @click="$emit('close')">
				返回{{$t('common.vrouterroutetable')}}
			</span>
      <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="'路由表策略'" name="vEntry"></el-tab-pane>
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
              content: tencentVpcRouter && tencentVpcRouter.vrId
            }"
          />
          <detail-row
            :param="{
							title: 'common.createDate',
							content: tencentVpcRouter && tencentVpcRouter.createDate && formatDatetime(new Date(tencentVpcRouter.createDate))
						}"
          />
          <detail-row
            :param="{
							title: 'common.lastOpDate',
							content: tencentVpcRouter && tencentVpcRouter.lastOpDate && formatDatetime(new Date(tencentVpcRouter.lastOpDate))
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
              content: tencentVpcRouter && tencentVpcRouter.uuid,
              copy: true
            }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'vEntry'">
      <hybrid-tencent-virtual-entry-tab :param="{ conditions: `virtualRouterUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"/>
    </div>
  </detail-template>
</template>

<script>

  import HybridTencentVirtualEntryTab from '../components/HybridTencentVirtualEntryTab';
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime} from "src/utils/utils";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import { mapGetters } from 'vuex';

  export default {
    name: "DetailHybridTencentVRouter",

    components: {DetailTemplate, HybridTencentVirtualEntryTab},

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    mixins: [WindowBase, PageBase],
    
     inject: ['detailTencentVpc'],
     
    computed: {
      ...mapGetters({
        get: 'hybridTencentVirtualRouter/get'
      }),
      tencentVpcRouter() {
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
        return self.dispatchAction('hybridTencentVirtualRouter/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },

      updateResourceParam(name) {
        let self = this;
        return {
          getValue: () => {
            return self.tencentVpcRouter &&  self.tencentVpcRouter[name];
          },
          setValue: (newVal) => {
            if(self.tencentVpcRouter && _.isEqual(newVal, self.tencentVpcRouter[name])) return;
            let event = self.createEvent(`common.updateInfo${name}`, self.tencentVpcRouter.name);
						let param = {}; param[name] = newVal;
						if(name === 'description') param["name"] = self.dbData.hybridTencentVirtualRouter[self.windowData.dataUuid].name;
            let paramList = {
              "uuid": self.windowData.dataUuid,
							"param": param,
            }
            self.dispatchActionWithEvent('hybridTencentVirtualRouter/update', paramList, null, event);
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
