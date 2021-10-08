<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">
        腾讯云可用区详情
      </span>
      <span class="create-back detail-header-item" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">
          回到腾讯云可用区列表
        </span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{'腾讯云' + $t('hybrididentityzone.identityzoneActions')}}</span>
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
      <el-tabs class="detail-tab" v-model="activeName" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="'子网'" name="subNet"></el-tab-pane>
        <el-tab-pane :label="$t('common.hybridecsinstance')" name="ecsInstance"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <div class="icon"></div>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResourceParam('zoneName')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            v-for="(item, index) in leftGroup"
            :key="index"
            :param="{
              title: $t(item.title),
              content: item.content
            }"
          />
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          v-for="(item, index) in rightGroup"
          :key="index"
          :param="{
            title: $t(item.title),
            content: item.content,
            copy:item.copy,
            handler: () => {
              $router.push({name: 'detailHybridTencentDataCenter', params: {uuid: identityZone.dataCenterUuid}})
            }
          }"
        />
      </div>
    </div>

    <div class="detail-body" slot="body" v-if="activeName === 'ecsInstance'">
      <hybrid-tencent-ecs-instance-tab :param="{uuid: windowData.dataUuid, conditions:`identityZoneUuid=${windowData.dataUuid}`}"/>
    </div>

    <div class="detail-body" slot="body" v-if="activeName === 'subNet'">
      <hybrid-tencent-sub-net-tab :param="{uuid: windowData.dataUuid, conditions: `identityZoneUuid=${windowData.dataUuid}`, pageCreateVSwitch: pageCreateVSwitch, goToSubNetDetail: goToSubNetDetail}"/>
    </div>

     <div slot="footer">
			 <create-hybrid-tencent-sub-nets-page :param="createVswitchParam" v-if="showCreateVswitch" @close="showCreateVswitch = false"></create-hybrid-tencent-sub-nets-page>
      <detail-hybrid-tencent-sub-net-page :param="detailVswitchParam" v-if="showDetailVswitch" @close="showDetailVswitch = false;"/>
		 </div>
  </detail-template> 
</template>

<script>

  import CreateHybridTencentSubNetsPage from 'src/tencent/identityZone/create/CreateHybridTencentSubNetsPage';
  import HybridTencentEcsInstanceTab from 'src/tencent/identityZone/component/HybridTencentEcsInstanceTab';
  import DetailHybridTencentSubNetPage from 'src/tencent/vpc/components/DetailHybridTencentSubNetPage';
  import HybridTencentSubNetTab from 'src/tencent/vpc/components/HybridTencentSubNetTab';
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';
  import { mapGetters } from 'vuex';

  export default {
    name: "DetailHybridTencentIdentityZonePage",

    mixins: [WindowBase],

    components: {DetailTemplate, HybridTencentEcsInstanceTab, HybridTencentSubNetTab, CreateHybridTencentSubNetsPage, DetailHybridTencentSubNetPage},

    computed: {
      ...mapGetters({
        get: 'hybridTencentIdentityZone/getList'
      }),
      identityZone() {
        return this.get(this.windowData.dataUuid);
      },
      leftGroup() {
        return [
          {title: 'hybrididentityzone.zoneId', content: this.identityZone && this.identityZone.zoneId, link: false},
          {title: 'common.createDate', content: this.identityZone && this.identityZone.createDate && formatDatetime(new Date(this.identityZone.createDate)), link: false},
          {title: 'common.lastOpDate', content: this.identityZone && this.identityZone.lastOpDate && formatDatetime(new Date(this.identityZone.lastOpDate)), link: false},
        ]
      },
      rightGroup() {
        return [
          {title: 'common.uuid', content: this.windowData.dataUuid, copy: true},
          {title: 'common.hybridDatacenter', content: this.identityZone && this.identityZone.dataCenterName, copy: false},
        ]
      }
    },

    data() {
      return {
        activeName: 'info',
        createVswitchParam: {},
        showCreateVswitch: false,
        detailVswitchParam: {},
			  showDetailVswitch: false
      }
    },

    created() {
      let self = this,
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
      ...{
        delete: Methods.methods.delete
      },
      //返回
      close() {
        this.$router.push({name: 'hybridtencentidentityzone'})
      },
      //查询单条数据
      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridTencentIdentityZone/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },
      //更新名称，描述
      updateResourceParam(param) {
        return {
          getValue: () => {
            return this.identityZone && this.identityZone[param];
          },
          canEdit: () => {
            return false;
          }
        }
      },
      //删除腾讯云可用区
      detailDelete() {
        let self = this, uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          title: 'hybrididentityzone.Deleteidentityzone',
          description: 'hybrididentityzone.delete',
          icon: 'izone_popupico',
          uuidList,
          getName: (uuid) => {
            return self.dbData.hybridTencentIdentityZone[uuid].zoneName;
          },
          ok: () => {
            self.delete(uuidList)
              .then( () => {
                self.close();
              });
          }
        })
      },

      //创建子网
		  pageCreateVSwitch(param) {
			let self = this;
			self.createVswitchParam = param;
			self.showCreateVswitch = true;
      }, 
      //子网详情
		 goToSubNetDetail(param) {
			  let self = this;
			  self.detailVswitchParam = param;
			  self.showDetailVswitch = true;
	  	}
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins.less";
  .icon{
    .detail-icon('~assets/izone_ico.svg');
  }
</style>
