<template>
  <detail-template class="vrouter-detail__container">
    <div slot="header" class="detail-header">
      <span class="detail-title">虚拟交换机详情</span>
      <span class="detail-header-item create-back el-icon-back" @click="$emit('close')">
				返回虚拟交换机
			</span>
      <span class="detail-header-item">
				<drop-down class="detail-dropdown">
					<span slot="title">
						<span class="text">
							{{$t('hybridvswitch.moreActions')}}
						</span>
					</span>
					<span slot="content">
						<div class="dropdown-content">
             <a style="padding-bottom:12px;" @click="detailPageDelete()">{{$t("common.destroy")}}</a>
						</div>
					</span>
				</drop-down>
			</span>
      <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.hybridecsinstance')" name="hybridecsinstance"></el-tab-pane>
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
							title: 'hybridvswitch.vSwitchId',
							content: hybridAliCloudVSwitch && hybridAliCloudVSwitch.vSwitchId
						}"
          />
          <detail-row
            :param="{
							title: 'CIDR',
							content: hybridAliCloudVSwitch && hybridAliCloudVSwitch.cidrBlock
						}"
          />
          <detail-row
            :param="{
							title: 'hybridvswitch.availableIpAddressCount',
							content: hybridAliCloudVSwitch && hybridAliCloudVSwitch.availableIpAddressCount
						}"
          />
          <detail-row
            :param="{
							title: 'common.createDate',
							content: hybridAliCloudVSwitch && hybridAliCloudVSwitch.createDate && formatDatetime(new Date(hybridAliCloudVSwitch.createDate))
						}"
          />
          <detail-row
            :param="{
							title: 'common.lastOpDate',
							content: hybridAliCloudVSwitch && hybridAliCloudVSwitch.lastOpDate && formatDatetime(new Date(hybridAliCloudVSwitch.lastOpDate))
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
						content: hybridAliCloudVSwitch && hybridAliCloudVSwitch.uuid,
						copy: true
					}"
        />
        <detail-row
          :param="{
            title: 'VPC',
            content: hybridAliCloudVSwitch && getVpcName(hybridAliCloudVSwitch.ecsVpcUuid).replace(/ZStack-/ig,  ''),
            handler: () => {
              if(param.type === 'gateWay') $router.push({name: 'detailHybridAliCloudVpc', params: {uuid: hybridAliCloudVSwitch.ecsVpcUuid}})
              $emit('close')
            }
          }"
        />
        <detail-row
          :param="{
            title: 'common.hybrididentityzone',
            content: hybridAliCloudVSwitch && getIdentityZoneName(hybridAliCloudVSwitch.identityZoneUuid),
            handler: () => {
              if($router.currentRoute.name === 'detailHybridAliCloudIdentityZone') $emit('close');
              $router.push({name: 'detailHybridAliCloudIdentityZone', params: {uuid: hybridAliCloudVSwitch.identityZoneUuid}})
            }
          }"
        />
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'hybridecsinstance'">
       <hybrid-ali-cloud-ecs-instance-tab :param="{conditions: `ecsVSwitchUuid=${windowData.dataUuid}`,uuid: windowData.dataUuid}" @close="$emit('close')"/>
    </div>
  </detail-template>
</template>

<script>
  import HybridAliCloudEcsInstanceTab from "./HybridAliCloudEcsInstanceTab";
  import HybridVSMethods from 'src/alicloud/hybridSwitch/Methods';
  import DetailTemplate from "src/component/DetailTemplate";
  import { formatDatetime} from "src/utils/utils";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "DetailHybridAliCloudSwitch",

    components: {HybridAliCloudEcsInstanceTab, DetailTemplate},

    mixins: [WindowBase, HybridVSMethods],

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    provide() {
      return {
        detailRouter: this
      }
    },

    computed: {
      hybridAliCloudVSwitch: {
        get() {
          let self = this;
          return self.model && self.model;
        },
        set(val){
          let self = this;
          self.model = val;
        }
      }
    },

    data() {
      return {
        model: null,
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
        return rpc.query(`hybrid/aliyun/vswitch/${self.windowData.dataUuid}`)
          .then(resp => {
            return self.updateDbRow({
              tableName: 'hybridVSwitch',
              id: self.windowData.dataUuid,
              data: resp.inventories[0]
            }).then( () => {
              self.hybridAliCloudVSwitch = self.dbData.hybridVSwitch[self.windowData.dataUuid];
            })
          })
      },

      updateResourceParam(name) {
        let self = this;
        return {
          getValue: () => {
            return self.hybridAliCloudVSwitch &&  self.hybridAliCloudVSwitch[name].replace(/ZStack-/ig,  '');
          },
          setValue: (newVal) => {
            if(self.hybridAliCloudVSwitch && _.isEqual(newVal, self.hybridAliCloudVSwitch[name])) return;
            let event = self.createEvent(`common.updateInfo${name}`, self.hybridAliCloudVSwitch.name);
            let param = {}; param[name] = newVal;
            self.updateResource(self.windowData.dataUuid, event, param);
          },
          canEdit: () => {
            return true;
          }
        }
      },

      updateResource(uuid, event, param) {
        let self = this;
        return rpc.put(`hybrid/aliyun/vswitch/${uuid}/actions`, {
          "updateEcsVSwitch": param
        }, event)
          .then( () => {
            self.incEventSuccess(event);
            self.detailQuery();
          }).catch(() => {
            self.incEventFail(event);
        })
      },

      detailPageDelete() {
        const self = this
        let selectedUuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          title: 'hybridvswitch.deleteVSwitch',
          description: 'hybridvswitch.delete',
          icon: 'vswitch_popupico',
          uuidList: selectedUuidList,
          warning: 'hybridvswitch.info.deleteWarning',
          isChecked: true,
          checkBoxText: 'hybrid.deleteOrigin',
          getName: (uuid) => {
            return self.dbData.hybridVSwitch[uuid].name;
          },
          ok: (deleteOrigin) => {
            self.delete(selectedUuidList, deleteOrigin, self.queryList)
          }
        })
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
