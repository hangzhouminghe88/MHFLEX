<template>
	<detail-template class="vxlan-detail-container">
		<div slot="header" class="detail-header">
			<span class="detail-title">Vxlan网络详情</span>
			<span class="detail-header-item create-back" @click="$emit('close')">
				<i class="el-icon-back"></i>
				<span style="font-size: 12px;">
					返回
				</span>
			</span>
			<span class="detail-header-item">
				<drop-down class="detail-dropdown">
					<span slot="title">
						<span class="text">{{'Vxlan' + $t('common.actions')}}</span>
					</span>
				</drop-down>
			</span>
			<el-tabs class="detail-tab" v-model="activeName" tab-position="bottom">
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
				<div class="left-body"></div>
			</div>
			<div class="right"></div>
		</div>
	</detail-template>
</template>

<script>
import DetailTemplate from 'src/component/DetailTemplate';
import WindowBase from 'src/windows/Window';

export default {
	name: 'VxlanNetWorkDetailPage',

	components: {DetailTemplate},

	mixins: [WindowBase],

	props: {
		param: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	
	created() {
		let self = this, dataUuid = '';
		dataUuid = self.param.uuid;
		self.updateWindow({
			dataUuid,
			methods: {
				query: self.detailQuery
			}
		})
	},
	
	data() {
		return {
			activeName: 'info'
		}
	},

	methods: {
		updateResourceParam(param) {}
		
	}
}
</script>

<style lang="less" scoped>
  .vxlan-detail-container{
		position: absolute;
    width: 100%;
    min-height: 100%;
    background: #fff;
    top: 0;
    z-index: 2;
	}
</style>