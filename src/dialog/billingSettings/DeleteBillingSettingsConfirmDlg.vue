<template>
	<dialog-template>
		<div class="modal-plain-header" slot="title">
      <span>{{$t('common.destroy')}}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
		<div slot="body">
			<div class="dialog-content">
				<div class="operation-row">
				  <div class="title required">{{$t('common.pleaseInputTextToConfirm')}}{{$t('common.colon')}}ok</div>
					<input type="text" v-model="okVal"/>
					<div class="error error-text">
					 {{$t('billingConfig.deleteBillingConfigWarning')}}
				  </div>
				</div>
			</div>
		</div>
		<div slot="footer">
			<span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
			<span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
		</div>
	</dialog-template>
</template>

<script>
import DialogTemplate from 'src/dialog/DialogTemplate';
import WindowBase from 'src/windows/Window';
 export default {
	 name: 'DeleteBillingSettingsConfirmDlg',
	 mixins: [WindowBase],
   components: {
		 DialogTemplate
	 },
	 data(){
		 return {
			 okVal: ''
		 }
	 },
	 methods: {
		 cancel(){
			 let self = this;
			 self.closeDialog(self.windowId);
		 },
		 confirm(){
			 let self = this;
			 decodeURIComponent
			 if(self.okVal !== 'ok') return;
			 self.dialogData.param.ok();
			 self.closeDialog(self.windowId);
		 }
	 }
 }
</script>

<style scoped>

</style>
