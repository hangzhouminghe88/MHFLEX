<template>
	 <detail-template class="detail__tencent-bucekt">
		 <div slot="header" class="detail-header">
			 <span class="detail-title">腾讯云对象存储详情</span>
			 <div class="detail-header-item create-back" @click="close()">
				 <i class="el-icon-back"></i>
				 <span style="font-size: 12px;">回到腾讯云对象存储列表</span>
			 </div>
			 <div class="detail-header-item">
				 <drop-down class="detail-dropdown">
					 <span slot="title">
						 <span class="text">腾讯云对象存储操作</span>
					 </span>
					 <span slot="content">
						 <div class="dropdown-content">
							 <a id="common-setDefault" style="padding-top: 12px;" @click="(tencentBucekt && tencentBucekt.current === 'false') && detailAttach(windowData.dataUuid)" :class="{ 'disabled-text': !(tencentBucekt && tencentBucekt.current === 'false' )}">{{$t("common.setDefault")}}</a>
               <a id="common-destroy" style="padding-bottom: 12px;" @click="detailDelete(windowData.dataUuid)">{{ $t("common.destroy")}}</a>
						 </div>
					 </span>
				 </drop-down>
			 </div>
			 <el-tabs class="detail-tab" v-model="activeName" tab-position="bottom">
				 <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
			 </el-tabs>
		 </div>

		 <div slot="body" class="detail-body" v-if="activeName === 'info'">
			 <div class="left">
				 <div class="left-header">
					 <div class="icon"></div>
					 <div class="after-icon"></div>
					 <detail-name class="name" :param="updatResourceParam('bucketName')"/>
					 <detail-description class="description" :param="updatResourceParam('description')"/>
				 </div>
				 <div class="left-body">
					 <div class="detail-block-header">
						 {{$t('common.overview')}}
					 </div>
					 <detail-row
					   v-for="(item, index) in leftItemGroup"
						 :key="index"
						 :param="{
							 title: $t(item.title),
							 content: item.content
						 }"
					 />
					 <div class="split-line"></div>
				 </div>
			 </div>
			 <div class="right">
				 <div style="height: 40px;"></div>
				 <div class="detail-block-header">
					 {{$t('common.moreInformation')}}
				 </div>
				 <div class="split-line"></div>
				  <detail-row
					   v-for="(item, index) in rightItemGroup"
						 :key="index"
						 :param="{
							 title: $t(item.title),
							 content: item.content,
							 copy: item.copy,
							 handler: () => {
								 if($route.name !== 'detailHybridTencentDataCenter')
								  $router.push({name: 'detailHybridTencentDataCenter', params: {uuid: tencentBucekt.dataCenterUuid}})
								 else close();
							 }
						 }"
					 />
			 </div>
		 </div>
	 </detail-template>
</template>

<script>

import DetailTemplate from 'src/component/DetailTemplate';
import Methods from 'src/tencent/bucket/Methods';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import { mapGetters } from 'vuex';

export default {
	 name: 'DetailHybridTencentBucket',

	 mixins: [WindowBase,PageBase, Methods],

	 components: {DetailTemplate},

	 props: {
		 param: {
			 type: Object,
			 default: () => {
				 return {}
			 }
		 }
	 },

	 computed: {
		 ...mapGetters({
			 get: 'hybridTencentBucket/get'
		 }),
		 tencentBucekt() {
			 return this.get(this.windowData.dataUuid);
		 },
		 leftItemGroup() {
			 return [
				 {title: 'hybridbucket.region', content: this.tencentBucekt && this.tencentBucekt.regionName},
				 {title: 'hybridbucket.regionId', content: this.tencentBucekt && this.tencentBucekt.regionId},
				 {title: 'common.default', content: (this.tencentBucekt && this.tencentBucekt.current && this.tencentBucekt.current === 'true') ? this.$t('common.yes') : this.$t('common.no')},
				 {title: 'common.createDate', content: this.tencentBucekt && this.tencentBucekt.createDate && formatDatetime(new Date(this.tencentBucekt.createDate))},
				 {title: 'common.lastOpDate', content: this.tencentBucekt && this.tencentBucekt.lastOpDate && formatDatetime(new Date(this.tencentBucekt.lastOpDate))}
			 ]
		 },
		 rightItemGroup() {
			 return [
				 {title:'common.uuid', content: this.windowData.dataUuid, copy: true},
				 {title: 'hybridbucket.region', content: this.tencentBucekt && this.tencentBucekt.regionName}
			 ]
		 }
	 },

	 data() {
		 return {
			 activeName: 'info'
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
		 }).then(() => {
			 self.detailQuery()
		 })
	 },

	 methods: {
     detailQuery() {
			 let self = this;
			 self.dispatchAction('hybridTencentBucket/basicQuery', {
				 q: [`uuid=${self.windowData.dataUuid}`]
			 });
		 },
		 //回到腾讯云对象存储列表
		 close() {
			 this.param.refresh()
			 this.$emit('close');
		 },
		 //腾讯云对象存储修改参数
		 updatResourceParam(type) {
       return {
				 getValue: () => {
					 return this.tencentBucekt && this.tencentBucekt[type];
				 },
				 setValue: (newVal) => {
					 if(newVal === this.tencentBucekt[type]) return;
					 let event = this.createEvent(`common.updateInfo${type}`, this.tencentBucekt.name),
					 parmaList = {
						 uuid: self.windowData.dataUuid,
						 param: {
							 [type]: newVal
						}
					 }
					 self.dispatchActionWithEvent('hybridTencentBucket/update', parmaList, event);
				 }
			 }
		 },

    detailDelete () {
      let self = this,
        uuidList = [self.windowData.dataUuid],
        options = {
          title: '删除Bucket',
          description: 'hybridbucket.delete',
          icon: 'zone_popupico',
					uuidList,
					isChecked: true,
					checkBoxText: '确定要删除腾讯云上的资源吗?',
          getName: () => {
            return self.tencentBucekt && self.tencentBucekt.bucketName;
          },
          ok: (isOrigin) => {
            self.delete(uuidList, isOrigin)
              .then( () => self.close());
          }
        };
      self.openDialog('ConfirmDlg', options)
		},

		detailAttach() {
			let self = this;
			self.attach([self.windowData.dataUuid]);
		}
	 }
}
</script>

<style scoped lang="less">
  @import "../../../style/mixins";
 .detail__tencent-bucekt{
	 position: absolute;
	 top: 0px;
	 right: 0px;
	 left: 0px;
	 bottom: 0px;
	 width: 100%;
	 background: #fff;
	 z-index: 99
 }
  .icon{
    .detail-icon('~assets/oss_ico.svg')
  }
</style>
