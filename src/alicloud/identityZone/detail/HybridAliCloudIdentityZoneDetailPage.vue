<template>
  <detail-template>
	  <div slot="header" class="detail-header">
      <span class="detail-title">阿里云可用区详情</span>
			<span class="detail-header-item">
				<span class="create-back" @click="$router.push({name: 'hybridalicloudidentityzone'})">
					<i class="el-icon-back"></i>
					<span style="font-size: 12px;">
						回到可用区列表
					</span>
				</span>
			</span>
      <span class="detail-header-item">
				<drop-down class="detail-dropdown">
					<span slot="title">
						<span class="text">{{$t('hybrididentityzone.identityzoneActions')}}</span>
					</span>
					<span slot="content">
						<div class="dropdown-content">
							<a @click="detailDelete()" style="padding: 12px 0px;">{{$t('common.destroy')}}</a>
						</div>
					</span>
				</drop-down>
			</span>
			<el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
				<el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('hybridvswitch.vSwitch')" name="hybridSwitch"></el-tab-pane>
        <el-tab-pane :label="$t('common.hybridecsinstance')" name="hybridEcs"></el-tab-pane>
			</el-tabs>
		</div>

		<div slot="body" class="detail-body" v-if="currTab === 'info'">
			<div class="left">
				<div class="left-header">
					<base-icon name="izone_ico"/>
					<div class="after-icon"></div>
					<detail-name class="name" :param="updateResourceParam('zoneName')"/>
					<detail-description class="description" :param="updateResourceParam('description')"/>
				</div>
				<div class="left-body">
					<div class="detail-block-header">
						{{$t('common.overview')}}
					</div>
					<detail-row
					  :param="{
							title: 'hybrididentityzone.zoneId',
							content: model && model.zoneId
						}"
					/>
					<detail-row
					  :param="{
							title: 'common.createDate',
							content: model && model.createDate && formatDatetime(new Date(model.createDate))
						}"
					/>
					<detail-row
					  :param="{
							title: 'common.lastOpDate',
							content: model && model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
						}"
					/>
				</div>
			</div>
			<div class="right">
				<div style="height: 40px;"></div>
				<div class="detail-block-header">
					{{$t('common.moreInformation')}}
				</div>
				<detail-row
				  :param="{
						title: 'UUID',
						content: $route.params.uuid,
						copy: true
					}"
				/>
				<detail-row
				  :param="{
						title: 'hybriddatacenter.region',
						content: model && model.dataCenterUuid && getDataCenterName(model.dataCenterUuid),
						handler: (item) => {
							if(model.dataCenterUuid)
              $router.push({name: 'hybridaliclouddatacenter', uuid: model.dataCenterUuid})
						}
					}"
				/>
			</div>
		</div>

		<div slot="body" class="detail-body" v-if="currTab === 'hybridSwitch'">
      <hybrid-ali-cloud-v-switch-tab :param="{ conditions: `identityZoneUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid,
                                     pageCreateVSwitch: pageCreateVSwitch, goToAliCloudVSwitch: goToAliCloudVSwitch}"/>
		</div>

    <div slot="body" class="detail-body" v-if="currTab === 'hybridEcs'">
      <hybrid-ali-cloud-ecs-instance-tab :param="{conditions: `identityZoneUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"/>
    </div>

    <div slot="footer">
      <create-hybrid-ali-cloud-v-switch v-if="showCreateVSwitch"
                                        :param="createVSwitchParam"
                                        @close="showCreateVSwitch = false;"></create-hybrid-ali-cloud-v-switch>
      <detail-hybrid-ali-cloud-switch v-if="showAliCloudSwitch"
                                      :param="aliCloudSwitchParam"
                                      @close="showAliCloudSwitch=false"/>
    </div>
	</detail-template>
</template>

<script>
import HybridAliCloudEcsInstanceTab from "../../hybridVpc/component/HybridAliCloudEcsInstanceTab";
import DetailHybridAliCloudSwitch from "../../hybridVpc/component/DetailHybridAliCloudSwitch";
import CreateHybridAliCloudVSwitch from "../create/CreateHybridAliCloudVSwitch";
import HybridAliCloudVSwitchTab from "../component/HybridAliCloudVSwitchTab";
import DetailTemplate from 'src/component/DetailTemplate';
import WindowBase from 'src/windows/Window';
import Utils from 'src/utils/utils';
import rpc from 'src/utils/rpc';
import Methods from '../Methods';


export default {
	name: 'HybridAliCloudIdentityZoneDetailPage',

	mixins: [WindowBase, Methods],

	components: {
    HybridAliCloudEcsInstanceTab,
    DetailHybridAliCloudSwitch,
    CreateHybridAliCloudVSwitch,
    HybridAliCloudVSwitchTab,
		DetailTemplate
	},

	computed: {
		model: {
			get() {
			  let self = this;
        return self.hybridIdentityZone;
      },
      set(val) {
			  let self = this;
			  self.hybridIdentityZone = val;
      }
		},
	},

	data () {
		return {
			currTab: 'info',
      hybridIdentityZone: {},
      showCreateVSwitch: false,
      createVSwitchParam: {},
      showAliCloudSwitch: false,
      aliCloudSwitchParam:  {}
		}
	},

	created () {
		let self = this, dataUuid = '';
		dataUuid = self.$route.params.uuid;
		self.updateWindow({
			dataUuid
		}).then ( () => {
			self.query();
		})
	},

	methods: {
	  ...Utils,

    query () {
			let self = this;
			return rpc.query(`hybrid/identity-zone/${self.windowData.dataUuid}`)
			.then ( (resp) => {
				self.updateDbRow({
					tableName: 'hybridIdentityZone',
					id: self.windowData.dataUuid,
					data: resp.inventories[0]
				}).then( () => {
          self.model = self.dbData.hybridIdentityZone[self.windowData.dataUuid]
        })
			})
		},

    pageCreateVSwitch(param) {
      let self = this;
      self.createVSwitchParam = param;
      self.showCreateVSwitch = true;
    },

    goToAliCloudVSwitch(item) {
      let self = this;
      self.aliCloudSwitchParam = item;
      self.showAliCloudSwitch = true;
    },

    updateResourceParam (param) {
			let self = this;
      return {
				getValue: () => {
          return self.model && self.model[param]
				},
				setValue: (val) => {
          if(self.model && self.model[param] === val) return;
				},
				canEdit: () => {
					return false;
				}
			}
		},

		detailDelete () {
			let self = this, uuidList = [self.windowData.dataUuid];
				self.openDialog('ConfirmDlg', {
				title: 'hybrididentityzone.Deleteidentityzone',
				description: 'hybrididentityzone.delete',
				icon: 'izone_popupico',
				uuidList:[self.windowData.dataUuid],
				getName: (uuid) => {
           return self.model.zoneName;
				},
				ok: () => {
					self.delete(uuidList)
					.then( () => {
						self.$router.push({name: 'hybridalicloudidentityzone'});
					});
				}
			})
		}
	}
}
</script>

<style scoped lang="less">
	@import '../../../style/mixins';
	.icon{
		.detail-icon('~assets/izone_ico.svg');
	}
</style>
