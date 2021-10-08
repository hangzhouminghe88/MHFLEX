<template>
	<detail-template>
		<div slot="header" class="detail-header">
			<span class="detail-title">腾讯云镜像详情</span>
			<span class="detail-header-item create-back" @click="close()">
				<i class="el-icon-back"></i>
				<span style="font-size: 12px;">回到腾讯云镜像列表</span>
			</span>
			<span class="detail-header-item">
				<drop-down class="detail-dropdown">
					<span slot="title">
						<span class="text">腾讯云镜像操作</span>
					</span>
					<span slot="content">
						<div class="dropdown-content">
							<a style="padding: 12px 0px" @click="detailDelete()">{{$t('common.destroy')}}</a>
						</div>
					</span>
				</drop-down>
			</span>
			<el-tabs v-model="activeName" tab-position="bottom" class="detail-tab">
				<el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
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
					  v-for="(item, index) in leftItemGroup"
						:key="index"
						:param="{
							title: $t(item.title),
							content: item.content
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
				  v-for="(item, index) in rightItemGroup"
					:key="index"
					v-if="item.show"
					:param="{
						title: $t(item.title),
						content: item.content,
						copy: item.copy,
						handler: () => {
              if(item.nameSpace === 'dataCenter') {
                 $router.push({name: 'detailHybridTencentDataCenter', params:{uuid: tencentImage.dataCenterUuid}});
							}
							if(item.nameSpace === 'image') {
								$router.push({name: 'detailImage', params:{uuid: tencentImage.localImageUuid}});
							}
						}
					}"
				/>
			</div>
		</div>
	</detail-template>
</template>

<script>

import DetailTemplate from 'src/component/DetailTemplate';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import { mapGetters, mapState } from 'vuex';
import Methods from '../Methods';

export default {
	name: 'DetailHybridfTencentImagePage',

	mixins: [WindowBase, PageBase, Methods],

	components: {DetailTemplate},

	computed: {
		...mapGetters({
			get: 'hybridTencentImage/get'
		}),
		tencentImage() {
			return this.get(this.windowData.dataUuid);
		},
		leftItemGroup() {
			return [
				{title: 'common.platform', content: this.tencentImage && this.tencentImage.platform},
				{title: 'common.format', content: this.tencentImage && this.tencentImage.format},
				{title: 'hybridimage.ecsImageSize', content: this.tencentImage && this.tencentImage.ecsImageSize + 'G'},
				{title: 'hybridimage.type', content: this.tencentImage && this.tencentImage.type && this.$t(`hybridTencentImage.${ this.tencentImage.type}`)},
				{title: 'common.createDate', content: this.tencentImage && this.tencentImage.createDate && formatDatetime(new Date(this.tencentImage.createDate)) }
			]
		},
		rightItemGroup() {
			return [
				{title: 'common.uuid', content: this.tencentImage && this.tencentImage.uuid, copy: true, show: true},
				{title: 'hybridimage.dataCenter', content: this.tencentImage && this.tencentImage.dataCenterName, show: true, nameSpace: 'dataCenter'},
				{title: 'hybridimage.ecsImageId', content: this.tencentImage && this.tencentImage.ecsImageId, copy: true, show: true},
				{title: 'common.image', content: this.tencentImage && this.tencentImage.localImageUuid && this.getImageName(this.tencentImage.localImageUuid), show: this.windowData.currTab === 'privateImage', nameSpace: 'image'}
			]
		}
	},

	data() {
		return {
			activeName: 'info'
		}
	},

	created() {
		let self = this, dataUuid = '', currTab = '';
		dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
		currTab = self.$route.params.currTab ? self.$route.params.currTab : '';
		self.updateWindow({
			dataUuid,
			currTab,
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
			return self.dispatchAction('hybridTencentImage/basicQuery', {
				q: [`uuid=${self.windowData.dataUuid}`]
			});
		},

		updateResourceParam(type) {
			return {
				getValue: () => {
					return this.tencentImage && this.tencentImage[type];
				},
				setValue: (newVal) => {
					if(newVal === this.tencentImage[type]) return;
					let event = self.createEvent('hybrid.action.update', this.tencentImage.name);
					self.dispatchActionWithEvent('hybridTencentImage/update', param, null, event);
				},
				canEdit: () => {
					return this.windowData.currTab === 'privateImage'
				}
			}
		},
		detailDelete() {
			let self = this, uuidList = [];
      uuidList = [self.windowData.dataUuid];
      self.openDialog('ConfirmDlg', {
        uuidList,
        title: 'image.deleteImage',
        description: 'image.info.deleteConfirm',
        icon: 'image_popupico',
        checkBoxText: 'hybrid.deleteOrigin',
        isChecked: !self.isAllSystemImage(),
        warning: !self.isAllSystemImage() ? 'hybrid.info.deleteImage' : '',
        getName: (uuid) => {
         return self.dbData.hybridTencentImage[uuid].name;
        },
        ok: (isChecked) => {
          self.delete(uuidList, isChecked, self.detailQuery)
            .then(() => {
              self.close();
            })

        },
      })
		},
		isAllSystemImage() {
      let self = this;
      return self.dbData.hybridTencentImage[self.windowData.dataUuid].type === 'PUBLIC_IMAGE';
		},
		close() {
			let self = this;
			self.$router.push({name: 'hybridtencentimage', params: {currTab: self.windowData.currTab}});
		}
	}
}
</script>

<style lang="less" scoped>
 @import "../../../style/mixins.less";
  .icon {
    .detail-icon('~assets/image_large.svg')
  }
</style>
