<template>
  <create-template-no-route>
    <div slot="header">
      <span>添加节点监控</span>
      <span class="create-back el-icon-back" @click="$emit('close')">返回</span>
    </div>

    <div slot="body">
      <div class="operation-row">
        <div class="title required">{{$t("common.monIp")}}</div>
        <input type="text" v-model="windowData.monIp" :class="{'is-error': windowData.emptymonIp || windowData.invalidmonIp}" @blur="validate('monIp')"/>
        <div class="error error-text" v-if="windowData.emptymonIp">
          {{$t("error.emptyInput")+$t("common.monIp")}}
        </div>
        <div class="error error-text" v-if="!windowData.emptymonIp && windowData.invalidmonIp">
          {{$t("error.invalid")+$t("common.monIp")}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t("common.sshPort")}}</div>
        <input maxlength="255" type="number"  :class="{'is-error': windowData.emptysshPort || windowData.invalidsshPort}" step="any" @blur="validate('sshPort')" @keywown.enter="validate('sshPort')" v-model="windowData.sshPort" />
        <div class="error error-text" v-if="windowData.emptysshPort">
          {{$t("error.emptyInput")+$t("common.sshPort")}}
        </div>
        <div class="error error-text" v-if="!windowData.emptysshPort && windowData.invalidsshPort">
          {{$t("error.invalid")+$t("common.sshPort")}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required"> {{ $t("common.username") }}</div>
        <input maxlength="255" @blur="validate('userName')"  :class="{'is-error': windowData.emptyuserName}" @keywown.enter="validate('userName')" v-model="windowData.userName"/>
        <div class="error error-text" v-if="windowData.emptyuserName">
          {{$t("error.emptyInput")+$t("user.name")}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t("common.password")}}</div>
        <input maxlength="255" type="password" @blur="validate('passWord')"  :class="{'is-error': windowData.emptypassWord}" @keywown.enter="validate('passWord')" v-model="windowData.passWord"/>
        <div class="error error-text" v-if="windowData.emptypassWord">
          {{$t("error.emptyInput")+$t("common.password")}}
        </div>
      </div>
    </div>

    <div slot="footer">
      <div class="btn-confirm" @click="ok">{{$t('common.confirm')}}</div>
      <div class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</div>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "AddMons",
    components: {CreateTemplateNoRoute},
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    created () {
      this.updateWindow({
        monIp: '',
        sshPort: '',
        userName: '',
        passWord: ''
      })
    },
    methods: {
      ...Validator,
      validate (name) {
        let obj = {}
        obj[`empty${name}`] = false
        let windowData = this.windowData
        let propToBeTrimed = ['name', 'monIp']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        if (name === 'monIp') {
          if (!this.isIP(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name === 'sshPort') {
          if (!this.isUint(input)) {
            obj[`invalid${name}`] = true
          }
        }
        this.updateWindow(obj)
      },
      createParam: function () {
        return {
          monIp: this.windowData.monIp,
          sshPort: this.windowData.sshPort,
          userName: this.windowData.userName,
          passWord: this.windowData.passWord
        }
      },
      validateAll () {
        let obj = {invalid: false}
        let props = ['monIp', 'sshPort', 'userName', 'passWord']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this.windowData[`empty${item}`] === true)
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      ok: function () {
        this.validateAll()
        if (this.windowData.invalidInput) {
          return
        }
        this.param.ok(this.createParam())
        this.$emit('close');
      }
    }
  }
</script>

<style scoped>

</style>
