<template>
  <div class="container">
    <div class="operation-row">
      <div class="title required">{{$t('common.cluster')}}{{$t('common.colon')}}{{dbData.cluster[clusterUuid].name}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.name')}}</div>
      <help-trigger name="host"/>
      <input v-model="name" maxlenght="255" :class="{'is-error': emptyname}" @blur="validate('name')"/>
      <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
    </div>
    <div class="operation-row">
      <div class="title">{{$t('common.description')}}</div>
      <textarea rows="3" v-model="description"/>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.hostIp')}}</div>
      <input v-model="managementIp" maxlength="255" :class="{'is-error': emptymanagementIp || invalidmanagementIp}" placeholder="192.168.0.1" @blur="validate('managementIp')"/>
      <div class="error error-text" v-if="emptymanagementIp && !invalidmanagementIp">{{$t('error.emptyInput')}}{{$t('common.hostIp')}}</div>
      <div class="error error-text" v-if="!emptymanagementIp && invalidmanagementIp">{{$t('error.invalid')}}{{$t('common.hostIp')}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.sshPort')}}</div>
      <input v-model="sshPort" type="number" maxlength="255" :class="{'is-error': emptysshPort || invalidsshPort}" step="any" placeholder="22" @blur="validate('sshPort')"/>
      <div class="error error-text" v-if="emptysshPort && !invalidsshPort">{{$t('error.emptyInput')}}{{$t('common.sshPort')}}</div>
      <div class="error error-text" v-if="!emptysshPort && invalidsshPort">{{$t('error.invalid')}}{{$t('common.sshPort')}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('user.name')}}</div>
      <input v-model="username" maxlength="255" :class="{'is-error': emptyusername}" @blur="validate('username')"/>
      <div class="error error-text" v-if="emptyusername">{{$t('error.emptyInput')}}{{$t('user.name')}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.password')}}</div>
      <input v-model="password"  type="password" maxlength="255" :class="{'is-error': emptypassword}" @blur="validate('password')"/>
      <div class="error error-text" v-if="emptypassword">{{$t('error.emptyInput')}}{{$t('common.password')}}</div>
    </div>
  </div>
</template>

<script>
  //添加物理机导航
  import WindowBase from 'src/windows/Window';
  //校验函数
  import Validator from 'src/utils/validator';
  export default {
    name: "WizardHost",
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        },
      },
      'parentWindowUuid': {
        type: String,
        default: ''
      }
    },
    data(){
      return {
        clusterUuid: '',
        name: 'Host-1',
        emptyname: false,
        description: '',
        managementIp: '',
        emptymanagementIp: false,
        invalidmanagementIp: false,
        username: '',
        emptyusername: '',
        password: '',
        emptypassword: false,
        sshPort: '',
        emptysshPort: false,
        invalidsshPort: false
      }
    },
    created(){
      let wizard = _.cloneDeep(this.$store.state.windowManager.windows[this.parentWindowUuid].wizard), self = this;
      self.clusterUuid = wizard.cluster.uuid;
    },
    mounted(){
      let self = this;
      if(!self.param.disabled)
        document.querySelector('.btn-confirm.wizardNext').addEventListener('click', self.updateValue, true);
    },
    methods: {
      ...Validator,
      //单个校验
      validate (name) {
        let self = this;
        self[`empty${name}`] = false
        let propToBeTrimed = ['name', 'managementIp']
        let input = propToBeTrimed.indexOf(name) > -1 ? String(self[name].trim()) : self[name];
        //如果输入为空给出错误提示
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        self[`invalid${name}`] = false;
        //管理ip如果是ip的话
        if (name === 'managementIp' && !self.isIP(input)) {
          self[`invalid${name}`] = true
        }
        if (name === 'sshPort' && !self.isUint(input)) {
          self[`invalid${name}`] = true
        }
      },
      //整体校验
      validateAll () {
        let obj = {},invalidInput = false
        let props = ['name', 'managementIp', 'sshPort', 'username', 'password', 'clusterUuid']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this[`empty${item}`] || this[`invalid${item}`])
        if (isInvalid) invalidInput = true
        return invalidInput
      },
      //添加参数
      createdParam(){
        let self = this;
        return {
          name: self.name,
          description: self.description,
          managementIp: self.managementIp,
          sshPort: self.sshPort,
          username: self.username,
          password: self.password,
          clusterUuid: self.clusterUuid
        }
      },
      //更新值
      updateValue(){
        let self = this;
        if(self.param.disabled) return;
        let invalid = self.validateAll();
        if(invalid) return;
        self.param.update(self.createdParam());
      }
    },
    destroyed(){
      let self = this;
      document.querySelector('.btn-confirm.wizardNext').removeEventListener('click', self.updateValue, true);
    },
  }
</script>

<style scoped>

</style>
