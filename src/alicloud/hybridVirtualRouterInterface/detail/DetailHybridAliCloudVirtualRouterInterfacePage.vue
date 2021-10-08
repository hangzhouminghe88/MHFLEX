<template>
  <detail-template>
    <div slot="header" class="detail-header">
			<span class="detail-title">阿里云路由器接口详情</span>
			<div class="detail-header-item" @click="$router.push({name: 'hybridalicloudvirtualrouterinterface', params: {currTab: currTab}})">
				<span class="create-back el-icon-back">
					<span style="font-size: 12px">回到阿里云路由器列表</span>
				</span>
			</div>
			<el-tabs v-model="activeName" tab-position="bottom" class="detail-tab">
				<el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
			</el-tabs>
		</div>

		<div slot="body" class="detail-body">
			<div class="left">
				<div class="left-header">
					<base-icon name="ri_ico"/>
					<div class="after-icon">
						<detail-info-state outer-class-name="detail-page-state" v-show="hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.status" :state="hybridAliCloudVirtualRouterInterface.status"/>
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
							title: 'hybridrouterinterfacepair.id',
							content: hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.routerInterfaceId,
						}"
					/>
						<detail-row
					  :param="{
							title: 'hybridrouterinterfacepair.vRouterType',
							content: hybridAliCloudVirtualRouterInterface && $t(`hybridrouterinterfacepair.${hybridAliCloudVirtualRouterInterface.vRouterType}`),
						}"
					/>
						<detail-row
					  :param="{
							title: 'hybridrouterinterfacepair.spec',
							content: hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.spec,
						}"
					/>
						<detail-row
					  :param="{
							title: 'hybridrouterinterfacepair.role',
							content: hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.role && $t(`hybridrouterinterfacepair.${hybridAliCloudVirtualRouterInterface.role.toLowerCase()}`),
						}"
					/>
						<detail-row
					  :param="{
							title: 'hybridrouterinterfacepair.accessPoint',
							content: hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.accessPointName,
						}"
					/>
					<detail-row
					  :param="{
							title: 'hybridrouterinterfacepair.oppositeInterfaceUuid',
							content: hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.oppositeInterfaceName,
						}"
					/>
					<detail-row
					  :param="{
							title: 'hybridaliyunvirtualrouter.virtualrouterId',
							content: hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.vRouterType && getVirtualRouterId(windowData.dataUuid),
						}"
					/>
					<detail-row
					  :param="{
							title: 'common.createDate',
							content: hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.createDate && formatDatetime(new Date(hybridAliCloudVirtualRouterInterface.createDate)),
						}"
					/>
					<detail-row
					  :param="{
							title: 'common.lastOpDate',
							content: hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.lastOpDate && formatDatetime(new Date(hybridAliCloudVirtualRouterInterface.lastOpDate)),
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
				  :param="{
						 title: 'UUID',
						 content: windowData.dataUuid,
						 copy: true
					}"
				/>
					<detail-row
				  :param="{
						 title: 'common.hybriddatacenter',
						 content: hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.dataCenterName,
						 handler: () => {
							 $router.push({name: 'detailHybridAliCloudDataCenter', params: {uuid: hybridAliCloudVirtualRouterInterface.dataCenterUuid}})
						 }
					}"
				/>
					<detail-row
				  :param="{
						 title: 'hybridaliyunvirtualrouter.virtualrouter',
						 content: hybridAliCloudVirtualRouterInterface && hybridAliCloudVirtualRouterInterface.virtualRouterUuid && getAliyunVirtualRouterName(windowData.dataUuid),
						 handler: () => {
							 //if(currTab === 'vbr')
							  goToVrouterDetail();
						 }
					}"
				/>
			</div>
		</div>

		<div slot="footer">
      <detail-hybrid-alicloud-vrouter v-if="showAliCloudVrouter"
                                      :param="aliCloudVrouterParam"
                                      @close="showAliCloudVrouter = false"></detail-hybrid-alicloud-vrouter>
		  <create-hybrid-alicloud-vroute-entry v-if="showCreateEntry"
                                            :param="createEntryParam"
                                            @close="showCreateEntry = false"/>
		</div>
	</detail-template>
</template>

<script>
import CreateHybridAliCloudVrouteEntry from 'src/alicloud/hybridVpc/component/CreateHybridAliCloudVrouteEntry';
import DetailHybridAliCloudVRouter from 'src/alicloud/hybridVpc/component/DetailHybridAliCloudVRouter';
import DetailTemplate from 'src/component/DetailTemplate';
import DetailInfoState from 'src/component/DetailInfoState';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import { mapGetters } from 'vuex';
import Methods from '../Methods';

export default {
	name: 'DetailHybridVirtaulRouterIntefacePage',

	mixins: [WindowBase, Methods],

  components:{
	 DetailTemplate,
	 DetailInfoState,
	 'detail-hybrid-alicloud-vrouter': DetailHybridAliCloudVRouter,
	 'create-hybrid-alicloud-vroute-entry': CreateHybridAliCloudVrouteEntry
 },


    provide() {
      return {
        detailAliCloudVpc: this
      }
		},

 computed: {
	 ...mapGetters({
      get: 'hybridAlicloudVirtualRouterInterface/get'
	 }),
	 hybridAliCloudVirtualRouterInterface() {
		 return this.get([this.windowData.dataUuid]);
	 }
 },

 data() {
	 return {
		currTab: '',
		activeName: 'info',
		showAliCloudVrouter: false,
		aliCloudVrouterParam: {},
		showCreateEntry: false
	 }
 },

 created() {
	 let self = this, dataUuid = '';
	 dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
	 self.currTab = self.$route.params.currTab ? self.$route.params.currTab :  '';
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
		 return self.dispatchAction('hybridAlicloudVirtualRouterInterface/basicQuery' ,  {
			 q: [`uuid=${self.windowData.dataUuid}`]
		 });
	 },

	 //更新参数
	 updateResourceParam(name) {
		 return {
			 getValue: () => {
				 return this.hybridAliCloudVirtualRouterInterface && this.hybridAliCloudVirtualRouterInterface[name];
			 },
			 setValue: () => {

			 },
			 canEdit: () => {
				 return false;
			 }
		 }
	 },

	 goToVrouterDetail() {
		 let self = this;
		 self.aliCloudVrouterParam = {
			 uuid: self.hybridAliCloudVirtualRouterInterface.virtualRouterUuid
		 }
		 self.showAliCloudVrouter = true;
	 }
 }
}
</script>

<style scoped lang="less">
 @import url('../../../style/mixins');
 .icon{
	 .detail-icon('~assets/ri_ico.svg')
 }
</style>

