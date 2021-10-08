<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('common.setConsolePassword')}}</span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>

    <div slot="body" class="dialog-body">
      <div style="padding: 50px 200px">
        <div class="operation-row" style="width: 100%;">
          <div class="title">{{$t('account.newPassword')}}</div>
          <input type="password"
                 v-model="newPassword"
                 :placeholder="$t('hybridecsinstance.ecsRootPasswordInfo')"
                 :class="{'is-error': invalidnewPassword}"
                 @blur="validate('newPassword')"/>
          <div class="error error-text" v-if="invalidnewPassword">
            {{'请输入' + $t('hybridecsinstance.ecsRootPasswordInfo')}}
          </div>
        </div>
        <div class="operation-row" style="width: 100%;">
          <div class="title">{{$t('account.newPassword')}}</div>
          <input type="password"
                 v-model="ecsRootPassword"
                 :placeholder="$t('hybridecsinstance.ecsRootPasswordInfo')"
                 :class="{'is-error': invalidecsRootPassword}"
                 @blur="validate('ecsRootPassword')"/>
          <div class="error error-text" v-if="invalidecsRootPassword">
            {{'请输入' + $t('hybridecsinstance.ecsRootPasswordInfo')}}
          </div>
          <div class="error error-text" v-if="!invalidecsRootPassword && noEqual">
            {{$t('account.notEqualPassword')}}
          </div>
        </div>
        <div class="operation-row error-text">
          注意：重启后生效。
        </div>
        <div class="operation-row error-text">
          Linux 默认系统用户为：root
        </div>
        <div class="operation-row error-text">
          Windows 默认系统用户为：administrator
        </div>
      </div>
    </div>

    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "HybridModifyRootPassword",

    mixins: [WindowBase],

    data() {
      return {
        ecsRootPassword: '',
        invalidecsRootPassword: false,
        newPassword: '',
        invalidnewPassword: false,
        noEqual: false
      }
    },

    methods: {
      ...Validator,
      //关闭模态框
      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      //单个校验密码
      validate(name){
        let self = this;
        self[`invalid${name}`] = true;
        if(self.isEcsRootPassword(self[name].trim())){
          self[`invalid${name}`] = false;
          return;
        }
        self.noEqual = false;
        if(self.newPassword !== self.ecsRootPassword) {
          self.noEqual = true;
          return;
        }
      },
      //确定修改控制台密码
      confirm() {
        let self = this;
        if(!self.newPassword
          || !self.ecsRootPassword
          || (self.noEqual || self.invalidecsRootPassword || self.invalidnewPassword)) return;
        self.dialogData.param.ok(self.newPassword);
        self.close();
      }
    }
  }
</script>

<style scoped>

</style>
