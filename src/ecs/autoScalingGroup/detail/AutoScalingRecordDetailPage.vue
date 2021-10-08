<template>
	<detail-template>
     <div slot="header" class="detail-header">
			 <span>伸缩记录详情</span>
			 <span class="detail-header-item create-back" @click="$emit('close')">
				 <i class="el-icon-back"></i>
				 <span style="font-size: 12px;">
					 回到伸缩记录详情
				 </span>
			 </span>
			 <el-tabs class="detail-tab" tab-position="bottom" v-model="activeName">
				 <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
			 </el-tabs>
		 </div>

		 <div slot="body" class="detail-body" v-if="activeName === 'info'">
			  <div class="left">
					<div class="left-header">
						<div class="icon"></div>
						<div class="after-icon">
							<detail-info-state outer-class-name="detail-page-state" v-show="autoScalingGroupActivity && autoScalingGroupActivity.status" :state="autoScalingGroupActivity.status" />
						</div>
						<detail-name class="name" :param="getActivityName"/>
					</div>
					<div class="left-body">
						<div class="detail-block-header">
							{{$t('common.overview')}}
						</div>
						<detail-row
						  :param="{
								title: 'common.actions',
								content: autoScalingGroupActivity && autoScalingGroupActivity.activityAction
							}"
						/>

						<detail-row
						  :param="{
								title: 'autoScaling.cause',
								content: autoScalingGroupActivity && autoScalingGroupActivity.cause
							}"
						/>

						<detail-row
						  :param="{
								title: 'common.createDate',
								content: autoScalingGroupActivity && autoScalingGroupActivity.createDate && formatDatetime(new Date(autoScalingGroupActivity.createDate))
							}"
						/>

						<detail-row
						  :param="{
								title: 'common.lastOpDate',
								content: autoScalingGroupActivity && autoScalingGroupActivity.lastOpDate && formatDatetime(new Date(autoScalingGroupActivity.lastOpDate))
							}"
						/>
					</div>
				</div>
				<div class="right">
					<div style="height: 40px;"></div>
					<div class="detail-bock-header">
						{{$t('common.moreInformation')}}
					</div>
					<detail-row
					  :param="{
							 title:'UUID',
							 content: windowData.dataUuid
						}"
					/>

					<detail-row
					  :param="{
			        	title: 'autoScaling.activityActionResultMessage',
							  content: autoScalingGroupActivity && autoScalingGroupActivity.activityActionResultMessage && 
							   JSON.stringify(JSON.parse(autoScalingGroupActivity.activityActionResultMessage), null, 4),
							  getContentClass:() => {
								 return 'content-pre error-text'
							}
						}"
					/>
				</div>
		 </div>
	</detail-template>
</template>

<script>
import DetailInfoState from 'src/component/DetailInfoState';
import DetailTemplate from 'src/component/DetailTemplate';
import { formatDatetime } from 'src/utils/utils';
import WinodwBase from 'src/windows/Window';
import {mapGetters, mapState} from 'vuex';
import rpc from 'src/utils/rpc';

export default {
	name: 'AutoScalingRecordDetailPage',

	mixins: [WinodwBase],

	components: {DetailTemplate, DetailInfoState},

	props: {
		param: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},

	data() {
		return {
			activeName: 'info'
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
		}).then( () => {
			self.detailQuery()
		})
	},
 
    computed:{
      ...mapGetters({
        getObj: 'autoScalingGroupActivity/get'
      }),
      autoScalingGroupActivity () {
        let self = this;
        return self.getObj(self.windowData.dataUuid)
			},
			getActivityName() {
				let self = this;
				return {
					getValue: () => {
						return self.autoScalingGroupActivity && self.autoScalingGroupActivity.name
					},
					canEdit: () => {
						return false;
					}
				}
			}
		},
		
	methods: {
		formatDatetime,
		detailQuery() {
      return this.dispatchAction('autoScalingGroupActivity/query', this.windowData.dataUuid);
		},
	}
}
</script>

<style lang="less" scoped>
	 @import url('../../../style/mixins.less');
	.icon{
		.detail-icon('~assets/detail_auto_scaling_message.svg');
	}
</style>

