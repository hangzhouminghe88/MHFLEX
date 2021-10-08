<template>
  <div class="container">
    <div class="operation-row">
      <div class="title required">{{$t('common.zone')}}{{$t('common.colon')}}{{dbData.zone[zoneUuid].name}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.name')}}</div>
      <input maxlength="255" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
      <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput')}}{{$t('common.name')}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.description')}}</div>
      <textarea rows="3" v-model="description"></textarea>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.type')}}</div>
      <help-trigger name="backupStorage"></help-trigger>
      <drop-down class="create-dropdown"
       :param="{
        getIndex(){
          return bsTypes.findIndex((item) => {
            return item.value === type;
          })
        },
        setIndex(index){
          type = bsTypes[index].value;
        },
        getOptionList: () => {
         return bsTypes;
        }
       }"></drop-down>
    </div>
    <div v-if="type === 'ImageStore' || type=== 'Sftp'">
      <div class="operation-row">
        <div class="title required">{{$t('common.backupStorageIp')}}</div>
        <input :class="{'is-error': emptyhostname || invalidhostname}" maxlength="255" v-model="hostname" @blur="validate('hostname')"></input>
        <div class="error error-text" v-if="emptyhostname">
          {{$t('error.emptyInput') + $t('common.backupStorageIp')}}
        </div>
        <div class="error error-text" v-if="!emptyhostname && invalidhostname">
          {{$t('error.invalid') + $t('common.backupStorageIp')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.url')}}</div>
        <input maxlength="255" v-model="url" :class="{'is-error': emptyurl || invalidurl}" @blur="validate('url')"/>
        <div class="error error-text" v-if="(type === 'ImageStorage' || type === 'Sftp') && emptyurl">
          {{$t('error.emptyInput') + $t('common.url')}}
        </div>
        <div class="error error-text" v-if="(type === 'ImageStorage' || type === 'Sftp') && !emptyurl && invalidurl">
          {{$t('error.invalid') + $t('common.url')}}
        </div>
      </div>
    </div>
    <div v-if="type === 'ImageStore' || type=== 'Sftp'" class="operation-row">
      <el-checkbox v-model="importImages">{{$t('common.importImages')}}</el-checkbox>
      <help-trigger name="backupStorageImportImages"/>
    </div>
    <div class="operation-row" v-else>
      <div class="title required">{{$t('common.monIp')}}</div>
      <input maxlength="255" v-model="monIp" :class="{'is-error': emptymonIp || invalidmonIp}" @blur="validate('monIp')"/>
      <div class="error error-text" v-if="(type === 'ImagStore' || type === 'Sftp') && emptymonIp" >
        {{$t('error.emptyInput') + $t('common.monIp')}}
      </div>
      <div class="error error-text" v-if="(type === 'ImagStore' || type === 'Sftp') && !emptymonIp && invalidmonIp" >
        {{$t('error.emptyInput') + $t('common.monIp')}}
      </div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.sshPort')}}</div>
      <input maxlength="255" v-model="sshPort" placeholder="22" :class="{'error-input': emptysshPort || invalidsshPort}" @blur="validate('sshPort')"/>
      <div class="error error-text" v-if="emptysshPort">{{$t('error.emptyInput') + $t('common.sshPort')}}</div>
      <div class="error error-text" v-if="!emptysshPort && invalidsshPort">{{$t('error.invalid') + $t('common.sshPort')}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('user.name')}}</div>
      <input maxlength="255" :class="{'is-error': emptyusername}" @blur="validate('username')" v-model="username"/>
      <div class="error error-text" v-if="emptyusername">{{$t('error.emptyInput') + $t('user.name')}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.password')}}</div>
      <input maxlength="255" type="password" :class="{'is-error': emptypassword}" @blur="validate('password')" v-model="password"/>
      <div class="error error-text" v-if="emptypassword">{{$t('error.emptyInput') + $t('common.password')}}</div>
    </div>
    <div class="operation-row" v-if="type === 'Ceph'">
      <div class="title required">{{$t('common.poolName')}}</div>
      <input maxlength="255" type="text" :class="{'is-error': poolName && invalidpoolName}" @blur="validate('poolName')" v-model="poolName"/>
      <div class="error error-text" v-if="poolName && invalidpoolName">{{$t('error.invalid') + $t('common.poolName')}}</div>
    </div>
  </div>
</template>

<script>
  //添加存储导航
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "WizardStorage",
    mixins: [WindowBase],
    components: {DropDown},
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      },
      parentWindowUuid: {
        type: String,
        default: ''
      }
    },
    data(){
      return {
        zoneUuid: '',
        name: 'BS-1',
        emptyname: '',
        bsTypes: [],
        type: '',
        url: '',
        monIp: '',
        sshPort: '',
        username: '',
        password: '',
        poolName: '',
        hostname: '',
        emptyhostname: false,
        emptymonIp: false,
        invalidmonIp: false,
        emptysshPort: false,
        emptypassword: false,
        invalidpoolName: false,
        invalidhostname: false,
        emptyurl: false,
        invalidurl: false,
        invalidsshPort: false,
        description: '',
        emptyusername: false,
        importImages: false
      }
    },
    created(){
      let wizard =  _.cloneDeep(this.$store.state.windowManager.windows[this.parentWindowUuid].wizard), self = this;
      self.zoneUuid = wizard.zone.uuid;
      if(self.dbData.common.isOpensource){
        self.bsTypes = [
        {name: 'Sftp', value: 'Sftp'},
        {name: 'Ceph', value: 'Ceph'},
        {name: 'Fusionstor', value: 'Fusionstor'}
        ]
        self.type= 'Sftp';
      }else{
        self.bsTypes = [
          {name: 'ImageStore', value: 'ImageStore'},
          {name: 'Ceph', value: 'Ceph'},
          {name: 'Fusionstor', value: 'Fusionstor'}
        ]
        self.type= 'ImageStore';
      }
      self.url = `/${this.$t('common.productionNameForPlaceholderLowerCase')}_bs`
    },
    mounted(){
      let self = this;
      if(!self.param.disabled)
        document.querySelector('.btn-confirm.wizardNext').addEventListener('click', self.updateValue, true);
    },
    methods: {
      ...Validator,
      //添加参数
      createParam: function () {
        let hash = {
          'ImageStore': 'image-store',
          'Ceph': 'ceph',
          'Fusionstor': 'fusionstor',
          'Sftp': 'sftp'
        }
        let data = this;
        let param = {
          name: data.name,
          description: data.description,
          type: hash[data.type],
          zoneUuid: data.zoneUuid
        }
        if (data.type === 'ImageStore') {
          return {
            hostname: data.hostname,
            sshPort: data.sshPort,
            username: data.username,
            password: data.password,
            importImages: data.importImages,
            url: data.url,
            ...param
          }
        } else if (data.type === 'Sftp') {
          return {
            hostname: data.hostname,
            sshPort: data.sshPort,
            username: data.username,
            password: data.password,
            url: data.url,
            ...param
          }
        } else {
          let monUrls = []
          let url = `${data.username}:${data.password}@${data.monIp}:${data.sshPort}`
          monUrls.push(url)
          if (data.type === 'Ceph') {
            let p = {
              monUrls: monUrls,
              ...param
            }
            if (data.poolName !== '') {
              p['poolName'] = data.poolName
            }
            return p
          }
          return {
            monUrls: monUrls,
            ...param
          }
        }
      },
      //单个校验
      validate (name) {
        let self = this;
        self[`empty${name}`] = false
        let propToBeTrimed = ['name', 'hostname', 'url', 'monIp']
        let input = propToBeTrimed.indexOf(name) > -1 ? String(self[name]).trim() : self[name]
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        self[`invalid${name}`] = false
        if (name === 'hostname' || name === 'monIp') {
          if (!this.isIP(input)) {
            self[`invalid${name}`] = true
            return
          }
        }
        if (name === 'url') {
          if (!self.isPath(input)) {
            self[`invalid${name}`] = true
            return
          }
        }
        if (name === 'sshPort') {
          if (!self.isUint(input)) {
            self[`invalid${name}`] = true
            return
          }
        }
        if (name === 'poolName') {
          if (!self.isPoolName(input)) {
            self[`invalid${name}`] = true
          }
        }
      },
      //整体校验
      validateAll () {
        let invalidInput = false
        let props = ['name', 'username', 'password', 'sshPort']
        if (this.type === 'ImageStore' || this.type === 'Sftp') {
          props.push('hostname')
          props.push('url')
        } else {
          props.push('monIp')
        }
        if (this.type === 'Ceph' && this.poolName) {
          props.push('poolName')
        }
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => {
          if (item === 'poolName') return this[`invalid${item}`]
          else this[`empty${item}`] || this[`invalid${item}`]
        })
        if (isInvalid) invalidInput = true
        return invalidInput;
      },
      updateValue(){
        let self = this;
        if(self.param.disabled) return;
        let invalid = self.validateAll();
        if(invalid) return;
        self.param.update(self.createParam());
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
