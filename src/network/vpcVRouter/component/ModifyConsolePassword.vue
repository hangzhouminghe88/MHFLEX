<style scoped>
  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #dae0e6;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 40px;
    box-sizing: border-box;
    width:303px
  }
  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    height: 23px;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }
  .delete{
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }
  .rule-body{
    width: 100%;
    border: 1px solid #dae0e6;
    border-radius: 2px;
    padding-bottom: 20px;
  }
  .rule-content{
    height: 30px;
    font-size: 14px;
    color: #333;
    width: 100%;
    padding: 10px;
    border-radius: 2px;
    position: relative;
    box-sizing: border-box;
  }
  .operation-block-header {
    border-bottom: 1px solid #dae0e6;
    padding-bottom: 8px;
    margin-bottom: 15px;
    color: #1a2736;
    font-size: 16px;
    cursor: pointer;
    max-width: 400px;
  }
  .el-radio-group{line-height: 40px;padding-top: 5px}
</style>

<template>
  <div>
    <create-template-no-route>
      <div slot="header">
        <span>
          {{$t('common.setConsolePassword')}}
        </span>
        <span class="create-back" @click="$emit('close')"><i class="el-icon-back"></i>返回</span>
      </div>
      <div slot="body">
          <el-form :model="windowData" :rules="rules" ref="form">
            <el-form-item :label="$t('virtualRouter.newPassword')+$t('common.colon')" label-width="100px" prop="destination">
              <el-input show-password style="width:300px;" v-model="windowData.newPassword" :placeholder="$t('common.passwordLengthLimit')"/>
            </el-form-item>

            <el-form-item :label="$t('virtualRouter.confirmPassword')+$t('common.colon')" label-width="100px" prop="destination">
              <el-input show-password style="width:300px;" v-model="windowData.checkPassword" :placeholder="$t('common.passwordLengthLimit')"/>
            </el-form-item>

            <el-form-item label-width="100px" v-if="state!=='Stopped'">
              <el-checkbox v-model="isReboot">{{$t("common.rebootRouter")}}</el-checkbox>
            </el-form-item>
            <div class="warning">
              <div id="account-notEqualPassword" v-show="windowData.isNotEqual">
                {{$t("account.notEqualPassword")}}
              </div>
              <div id="account-accountWarning">
                {{$t("account.accountWarning")}}
              </div>
            </div>
          </el-form>

      </div>
      <div slot="footer">
        <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
      </div>
    </create-template-no-route>
  </div>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import WindowBase from 'src/windows/Window';

  export default {
    name: "ModifyConsolePasswordConfirmDlg",
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    mixins: [WindowBase],
    components: {CreateTemplateNoRoute},
    data(){
      return {
        state: '',
        isReboot: false,
        rules: {

        }
      }
    },
    computed: {

    },
    created(){
      this.updateWindow({
        newPassword: '',
        checkPassword: '',
        isNotEqual: false
      })
      if (this.param.state) {
        this.state = this.param.state
      }
    },
    methods: {
      validate (name) {
        let obj = {}
        obj[`empty${name}`] = false
        obj[`invalid${name}`] = false
        let input = name === 'name' ? String(this.windowData[name]).trim() : this.windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
        } else {
          if (this.windowData[name].length > 18 || this.windowData[name].length < 6) {
            obj[`invalid${name}`] = true
          }
        }
        if (this.windowData.newPassword && this.windowData.checkPassword && this.windowData.newPassword !== this.windowData.checkPassword) {
          obj.isNotEqual = true
        } else {
          obj.isNotEqual = false
        }
        this.updateWindow(obj)
      },
      cancel: function () {
        this.closeDialog(this.windowId)
      },
      validateAll () {
        let obj = {invalidInput: false}
        let props = ['newPassword', 'checkPassword']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this.windowData[`empty${item}`])
        if (isInvalid) {
          obj.invalidInput = true
        }
        this.updateWindow(obj)
      },
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      ok: function () {
        this.validateAll()
        if (this.windowData.invalidInput) {
          return
        }
        if (this.windowData.newPassword !== this.windowData.checkPassword) {
          this.updateWindow({ isNotEqual: true })
          return
        }
        if (this.windowData.newPassword.length > 18 || this.windowData.newPassword.length < 6) return
        this.param.ok(this.windowData.newPassword, this.isReboot)
        this.$emit('close');
      }

    }
  }
</script>

