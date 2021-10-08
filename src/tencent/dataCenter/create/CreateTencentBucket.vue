<template>
  <create-template-no-route>
    <div slot="header">
			<span class="title"> {{ $t("hybridbucket.AddBucket") }}</span>
			<span class="create-back" @click="close()">
				<i class="el-icon-back"></i>
				<span style="font-size: 12px">
					回到Bucket列表
				</span>
			</span>
		</div>

		<div slot="body" class="create-body">
			<mh-input type="slot" 
			          :label="'添加方式'" 
								:required="true">
         <el-radio-group v-model="bucketCreateMethod" @change="handleMethodChange">
           <el-radio :label="false">{{ $t("hybridbucket.UseAlreadyAvailable") }}</el-radio>
					 <el-radio :label="true">{{ $t("hybridbucket.CreateBucket ") }}</el-radio>
				 </el-radio-group>
			</mh-input>

			<mh-input :label="'hybridbucket.region'" 
			          :show-error="emptydataCenterUuid"
								:required="true"
								type="slot" 
								:error-message="rules.dataCenterUuid.message">
				<add-or-delete-input :value="dbData.hybridTencentDataCenter[dataCenterUuid] && dbData.hybridTencentDataCenter[dataCenterUuid].regionName" 
				                     @open="openDataCenterSelect" 
														 @remove="removeUuid('dataCenterUuid')" 
														 :class="{'is-error': emptydataCenterUuid}"/>
			</mh-input>

			<mh-input :label="'hybridbucket.bucketName'" v-if="!bucketCreateMethod"
								v-model="bucketName"
								:selectGroup="bucketNameList"
								:required="true"
								type="select" 
								@changeOption="handleChangeBucketName"></mh-input>

			<mh-input :label="'hybridbucket.bucketName'" v-if="bucketCreateMethod"
								 v-model="bucketName"
								:required="true"
								:show-error="emptybucketName || invalidbucketName"
								:error-message="rules.bucketName.message" 
								helper-name="bucketName"
								placeholder="请输入以小写字母或数字开头内含小写字母数字中划线以小写字母或数字结尾的字符"
								@validate="validate" 
								prop="bucketName"></mh-input>
			
			<mh-input :label="'common.description'" 
								 v-model="description"
								 type=textarea></mh-input>

			<mh-input type="slot" label="">
				<el-checkbox v-model="setDefault" :disabled="canUpdateDefault">{{$t("common.setDefault")}}</el-checkbox>
			</mh-input>
		</div>

		<div slot="footer" class="create-footer">
			<div class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</div>
			<div class="btn-cancel" @click="close()">{{$t('common.cancel')}}</div>
		</div>
	</create-template-no-route>
</template>

<script>
	
	import AddOrDeleteInput from 'src/component/AddOrDeleteInput'
	import CreateTemplateNoRoute from 'src/component/CreateTemplateNoRoute';
	import WindowBase from 'src/windows/Window';
	import rpc from 'src/utils/rpc';

	export default {
		name:'CreateTencentBucket',

		mixins: [WindowBase],

		props: {
			param: {
				type:Object,
				default: () => {
					return {}
				}
			}
		},

		components: {CreateTemplateNoRoute, AddOrDeleteInput},

		data() {
			return {
				bucketCreateMethod: false,
				bucketNameList: [],
				bucketName: '',
				canUpdateDefault: false,
				setDefault: false,
				dataCenterUuid: '',
				emptydataCenterUuid: false,
				description: '',
				emptybucketName: false,
				invalidbucketName: false,
				rules: {
					dataCenterUuid: {message: ''},
					bucketName: {message: ''}
				}
			}
		},
		
		created() {
			let self = this;
			self.dataCenterUuid = self.param.dataCenterUuid ? self.param.dataCenterUuid : '';
			self.isFirstBucket(self.dataCenterUuid);
			self.getOssBucketNameFromRemote(self.dataCenterUuid);
		},

		methods: {
      close() {
				this.$emit('close');
			},

			isFirstBucket(dataCenterUuid) {
        const self = this
        rpc.query('hybrid/tencent/oss-bucket', {
          q: [`dataCenterUuid=${dataCenterUuid}`, 'current=true'],
          count: true
        })
          .then((resp) => {
            if (resp.total === 0) {
							self.canUpdateDefault = false;
							self.setDefault = true;
            }
          })
      },
      getOssBucketNameFromRemote(uuid) {
        let bucketName = null
        let bucketNameList = []
        rpc.query(`hybrid/tencent/oss/${uuid}/remote`)
          .then((resp) => {
            bucketNameList = resp.inventories
            if (bucketNameList.length > 0) bucketName = bucketNameList[0].bucketName
						this.bucketNameList = bucketNameList.map((item) => {
              return {
								label: item.bucketName,
								value: item.bucketName
							}
						});  
						this.bucketName = bucketName;
          })
			},
			
			handleChangeBucketName(item) {
				let self = this;
				self.bucketName = item.value;
			},

			openDataCenterSelect() {
				let self = this;
				self.openDialog('HybridTencentDataCenterSingleSelect', {
					conditions: [],
					select: (uuid) => {
						self.dataCenterUuid = uuid;
						self.validate('dataCenterUuid');
						self.getOssBucketNameFromRemote(uuid);
						this.isFirstBucket(uuid)
					}
				})
			},
			
			removeUuid(uuid) {
				let self = this;
				self[uuid] = "";
				self.validate(uuid);
			},

			validate(name) {
				let self = this, input = '', errorMsg = '';
				input = name === 'bucketName' ? String(self[name]).trim() : self[name];
				self[`empty${name}`] = false;
				self[`invalid${name}`] = false; 
				self.rules[name].message = '';
				name === 'bucketName' ? errorMsg = 'hybridbucket.bucketName' : name === 'dataCenterUuid' ? errorMsg = 'hybridbucket.region' : errorMsg = `common.${name}`;
				if(!input) {
					self[`empty${name}`] = true;
					self.rules[name].message = self.$t('error.emptyInput') + self.$t(errorMsg);
					return;
				}
				if(name === 'bucketName') {
					let regx = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
					debugger
					if(!regx.test(input)) {
	           self[`invalid${name}`] = true;
					   self.rules[name].message = self.$t('error.invalid') + self.$t(errorMsg);
					   return;
					}
				}
			},

			//整体校验
			validateAll() {
				let self = this, props = ['bucketName', 'dataCenterUuid'];
				let invalid = props.every((name) => {
					self.validate(name);
					return props.some((name) => {
						return self[`empty${name}`] === true || self[`invalid${name}`] === true;
					})
				})
				return invalid;
			},
			//添加参数
			createParam() {
				return {
					bucketName: this.bucketName,
          description: this.description,
          dataCenterUuid: this.dataCenterUuid,
          setDefault: true,
          showBucketCreateMethod: this.bucketCreateMethod
				}
			},
			//添加
			confirm() {
				let self = this;
				if(self.validateAll()) return;
				self.param.ok(self.createParam());
				self.close();
			},
			//切换添加方式
			handleMethodChange() {
				this.bucketName = "";
				this.dataCenterUuid = "";
			}
		}
	}
</script>

<style scoped>

</style>
