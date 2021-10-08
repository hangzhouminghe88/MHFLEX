<template>
  <create-template class="container">
    <div slot="header" class="header">
      <div class="progress">
        <span class="progress-item">
        <img src="~assets/wizard_db.svg"/>
        <div class="text">{{$t('backupData.prepareServer')}}</div>
      </span>
        <div class="operation-course">
          <div :class="{'icon-process': step < 1, 'icon-process-hover': step > 0}"></div>
        </div>
        <span class="progress-item">
           <img src="~assets/wizard_data_n.svg" v-if="step < 1"/>
           <img src="~assets/wizard_data_h.svg" v-if="step >= 1"/>
           <span class="text">{{$t('backupData.prepareBackupData')}}</span>
        </span>
      </div>
    </div>

    <div slot="body" class="create-body" v-if="step === 0">
      <div class="operation-row">
        <div class="title required">{{$t('backupServer.serverIp')}}</div>
        <input type="text" v-model="ip" placeholder="192.168.0.1" :class="{'is-error': emptyip || invalidip}" @blur="validate('ip')"/>
        <div class="error error-text" v-if="emptyip">{{$t('error.emptyInput') + $t('backupServer.serverIp')}}</div>
        <div class="error error-text" v-if="!emptyip && invalidip">{{$t('error.invalid') + $t('backupServer.serverIp')}}</div>
      </div>

      <div class="operation-row">
        <div class="title required">URL</div>
        <input type="text" v-model="url" placeholder="/mhflex_bs" :class="{'is-error': emptyurl || invalidurl}" @blur="validate('url')"/>
        <div class="error error-text" v-if="emptyurl">{{$t('error.emptyInput') + 'URL'}}</div>
        <div class="error error-text" v-if="!emptyurl && invalidurl">{{$t('error.invalid') + 'URL'}}</div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.sshPort')}}</div>
        <input type="number" v-model="sshPort" :class="{'is-error': emptysshPort || invalidsshPort}" @blur="validate('sshPort')"/>
        <div class="error error-text" v-if="emptysshPort">{{$t('error.emptyInput') + $t('common.sshPort')}}</div>
        <div class="error error-text" v-if="!emptysshPort && invalidsshPort">{{$t('error.invalid') + $t('common.sshPort')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.username')}}</div>
        <input type="text" v-model="username" :class="{'is-error': emptyusername}" @blur="validate('username')"/>
        <div class="error error-text" v-if="emptyusername">{{$t('error.emptyInput') + $t('common.username')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.password')}}</div>
        <input type="password" v-model="password" :class="{'is-error': emptypassword}"  @blur="validate('password')"/>
        <div class="error error-text" v-if="emptypassword">{{$t('error.emptyInput') + $t('common.password')}}</div>
      </div>
    </div>

    <div slot="body" class="create-body" v-if="step === 1">
      <div class="operation-row">
        <div class="title">{{$t('backupData.dbBackupData')}}</div>
        <add-or-delete-input @open="openBackupDataSelect"/>
        <div class="error error-text"></div>
      </div>
      <p class="warning">检测到当前许可证授权物理机（CPU插槽）数量为1，请选择适当数据进行还原或<a class="link" @click="$router.push({name: 'about'})">更新许可证</a>，避免还原后许可证授权配额不足导致管理节点启动失败。</p>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="next" v-if="step === 0">{{$t('common.nextStep')}}</span>
      <span class="btn-confirm" @click="step --" v-if="step === 1">{{$t('common.prevStep')}}</span>
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  //添加页面的模板
  import CreateTemplate from "../../../component/CreateTemplate";
  //校验的方法
  import Validator from 'src/utils/validator';
  //添加或者删除Input选择框
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  //跟创建窗口有关的方法
  import WindowBase from 'src/windows/Window';


  export default {
    name: "DbBackupWizard",
    components: {AddOrDeleteInput, CreateTemplate},
    mixins: [WindowBase],
    data(){
      return {
        step: 0,
        ip: '',
        emptyip: false,
        invalidip: false,
        url: '',
        emptyurl: false,
        invalidurl: false,
        sshPort: '22',
        emptysshPort: false,
        invalidsshPort: false,
        username: 'root',
        emptyusername: false,
        password: '',
        emptypassword: false,
      }
    },

    methods: {
      //校验方法
      ...Validator,
      //校验函数
      validate(name){
        let self = this, input= '' ;
        self[`empty${name}`] = false;
        input = String(self[name]).trim();
        //校验是否为空
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
        self[`invalid${name}`] = false;
        //校验ip
        if(name === 'ip'){
          if(!this.isIP(input)){
            self[`invalid${name}`] = true;
          }
        }
        if(name === 'sshPort'){
          if(!!isNaN(parseInt(input))){
            self[`invalid${name}`] = true;
          }
        }
      },
      //整体校验
      validateAll(){
        let self = this,
        props = ['ip', 'sshPort', 'username', 'password', 'url'] ;
        props.forEach((name) => self.validate(name));
        let invalid = props.some((name) => self[`empty${name}`] || self[`invalid${name}`]);
        return invalid;
      },
      //点击下一步
      next(){
        let self = this;
        let invalid = self.validateAll();
        if(invalid) return;
        self.step ++;
      },
      //点击取消
      cancel(){
        let self = this;
        self.$router.push({name: 'home'})
      },
      //点击确定
      confirm(){

      },
      //打开备份数据选择框
      openBackupDataSelect(){
        let self = this;
        self.openDialog ('BackUpDataBaseDataSelect', {
          backupStorageUrl: `ssh://${self.username}:${self.password}@${self.ip}:22${self.url}`,
          select(param){

          }
        })
      }
    }
  }
</script>

<style scoped>
  .header{
    height: 110px;
    border-bottom: 1px solid #eef3f7;
  }
  .progress-item{
    display: inline-block;
    height: 100%;
    vertical-align: middle;
    padding: 10px 30px;
  }

  .progress{
    height: 100%;
    padding: 0px 100px;
  }

  .container{
    background-color: #fff;
    height: 100%;
  }

  .icon-process {
    position: absolute;
    display: inline-block;
    height: 2px;
    width: 37px;
    background-image: url('~assets/wizard_process.svg');
    color: #EFF9FF;
    position: absolute;
    left: 50%;
    margin-left: -19px;
  }

  .icon-process-hover {
    position: absolute;
    display: inline-block;
    height: 2px;
    width: 37px;
    background-image: url('~assets/wizard_process_hover.svg');
    color: #EFF9FF;
    position: absolute;
    left: 50%;
    margin-left: -19px;
  }

  .operation-course {
    padding-top: 30px;
    height: 27px;
    display: inline-block;
    flex: 1;
    position: relative;
  }
  .text{
    width: 100%;
    margin: 0 auto;
    display: inline-block;
  }

  .warning{
    width: 300px;
    padding-top: 30px;
  }
</style>
