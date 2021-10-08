<template>
	<dialog-template>
		<div slot="title" class="model-block-plain">
      <div class="modal-title">{{$t(dialogData.param.title)}}</div>
		</div>
		
		<div slot="body">
		  <div style="margin: 50px 100px 0 100px;" :style="{'marginBottom': dialogData.param.uuidList ? '0px' : '50px'}">
        <div v-if="dialogData.param.description">
          <span class="help-icon"></span>{{dialogData.param.uuidList ? $t(dialogData.param.description, {length: dialogData.param.uuidList.length}) : $t(dialogData.param.description)}}
        </div>
       </div>
      <div style="margin: 20px 100px 42px 100px; border: 1px solid #DCECFF; background-color: #F2FAFF; padding: 15px 28px;" v-if="dialogData.param.uuidList">
        <div style="display: inline-block; width: 50%; padding: 5px 0;" v-for="uuid in dialogData.param.uuidList">
          <base-icon :name="dialogData.param.icon" />
        <div class="confirm-dialog-item-name" v-if="dialogData.param.getName">
          {{ dialogData.param.getName(uuid) }}
        </div>
       </div>
      </div>
      <div class="warning" v-if="dialogData.param.type && dialogData.param.type === 'delete'">
				<el-checkbox v-model="deleteOrigin">{{$t('hybrid.deleteOrigin')}}</el-checkbox>
			</div>
		</div>

		<div slot="footer">
			<span class="btn-confirm">{{$t('common.confirm')}}</span>
			<span class="bnt-cancel">{{$t('common.cancel')}}</span>
		</div>
	</dialog-template>
</template>

<script>
import WindowBase from 'src/windows/Window';

export default {
	name: 'DeleteEcsInstaneDlg',

  mixins: [WindowBase],

	data () {
		return {
			deleteOrigin: true
		}
	},

	methods: {
		close () {
			let self = this;
			self.closeDialog(self.windowId);
		},

		confirm () {
			let self = this;
			self.dialogData.param.ok(self.deleteOrigin);
			self.close();
		}
	}
}
</script>

<style lang="less" scoped>
.name {
    display: inline-block;
    position: relative;
    top: -12px;
    width: calc(100% - 52px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre;
  }

  .warning {
    font-size: 14px;
    margin: 8px 100px 70px 100px;
    color: #222;
  }

  .warning-content{
    font-size: 12px;
    padding: 10px 30px;
  }
  .help-icon{
    display: inline-block;
    width: 20px;
    height: 20px;
    vertical-align: middle;
    padding-right: 10px;
    background-image: url('~assets/del_icon.svg');
    background-repeat: no-repeat;
  }
</style>