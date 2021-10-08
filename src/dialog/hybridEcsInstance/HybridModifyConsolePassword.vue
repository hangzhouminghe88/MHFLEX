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
                 v-model="ecsConsolePassword"
                 :placeholder="$t('hybridecsinstance.ecsConsolePasswordInfo')"
                 :class="{'is-error': invalidecsConsolePassword}"
                 @blur="validate('ecsConsolePassword')"/>
          <div class="error error-text" v-if="invalidecsConsolePassword">
            {{$t('hybridecsinstance.ecsConsolePasswordInfo')}}
          </div>
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
  import WindowBase from 'src/windows/Window';

  export default {
    name: "HybridModifyConsolePassword",

    mixins: [WindowBase],

    data() {
      return {
        ecsConsolePassword: '',
        invalidecsConsolePassword: false,
      }
    },

    methods: {
      //关闭模态框
      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      //单个校验密码
      validate(name){
        let self = this;
        self[`invalid${name}`] = true;
        if(/^[a-zA-Z0-9]{6}$/.test(self[name].trim())){
          self[`invalid${name}`] = false;
          return;
        }
      },
      //确定修改控制台密码
      confirm() {
        let self = this;
        self.dialogData.param.ok(self.ecsConsolePassword);
        self.close();
      }
    }
  }
</script>

<style scoped>

</style>
