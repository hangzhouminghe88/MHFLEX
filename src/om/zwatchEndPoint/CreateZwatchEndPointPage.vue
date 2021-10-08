<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('zwatchEndpoint.create')}}</span>
      <span class="create-back" @click="$router.push({name: 'zwatchendpoint'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到接收端列表</span>
      </span>
    </div>
    <div slot="body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea v-model="description" rows="3"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('zwatchEndpoint.type')}}</div>
        <el-select v-model="getType" style="width: 100%;">
          <el-option v-for="(item, index) in typeList"
                     :key="index" :value="item.value"
                     :label="$t(item.name)"
                     @click.native="type = typeList[index].value;"></el-option>
        </el-select>
      </div>
      <div v-if="type === 'Email'">
        <div class="operation-row">
          <div class="title required">{{$t('common.mail')}}</div>
          <input type="text" v-model="email" placeholder="example@xxx.xxx" :class="{'is-error': emptyemail || invalidemail}" @blur="validate('email')"/>
          <div class="error error-text" v-if="emptyemail && !invalidemail">{{$t('common.mail')}}{{$t('error.noEmpty')}}</div>
          <div class="error error-text" v-if="!emptyemail && invalidemail">{{$t('error.invalid')}}{{$t('common.mail')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.emailserversetting')}}</div>
          <add-or-delete-input :class="{'is-error': emptyemailserversettingUuid}" @open="openEmailSelect()" :value="dbData.emailserversetting[emailserversettingUuid] && dbData.emailserversetting[emailserversettingUuid].name" @remove="removeUuid('emailserversettingUuid')"/>
          <div class="error error-text" v-if="emptyemailserversettingUuid">{{$t('common.emailserversetting')}}{{$t('error.noEmpty')}}</div>
          <div class="btn-primary" style="position: absolute;right: -80px;top: 60px;padding: 10px 11px;" :class="{'disabled': !emailserversettingUuid}" @click="emailserversettingUuid && testEmail()">测试</div>
        </div>
      </div>
      <div v-if="type === 'DingTalk'">
        <div class="operation-row">
          <div class="title required">{{$t('zwatchEndpoint.urlAddress')}}</div>
          <input type="text" v-model="urlAddress" :placeholder="$t('zwatchEndpoint.dingTalkPlaceholder')" :class="{'is-error': emptyurlAddress || invalidurlAddress}" @blur="validate('urlAddress')"/>
          <div class="error error-text" v-if="emptyurlAddress && !invalidurlAddress">{{$t('zwatchEndpoint.urlAddress')}}{{$t('error.noEmpty')}}</div>
          <div class="error error-text" v-if="!emptyurlAddress && invalidurlAddress">{{$t('error.invalid')}}{{$t('zwatchEndpoint.urlAddress')}}</div>
        </div>

        <div class="operation-row">
          <div class="title required">{{$t('zwatchEndpoint.target')}}</div>
          <el-select v-model="getDingTalk" style="width: 100%;">
            <el-option v-for="(item, index) in dingTalkObjList"
                       :key="index" :value="item.value"
                       :label="$t(item.name)"
                       @click.native="() => {
                         atPersonPhoneNumbers = [];
                          member = dingTalkObjList[index].value;
                          if(member === 'appointMember')
                          atPersonPhoneNumbers.push({prefix: '+86', number: ''})
                       }"></el-option>
          </el-select>
        </div>
        <div class="operation-row" v-if="member === 'appointMember'">
          <div class="title required">{{$t('zwatchEndpoint.appointMember')}}</div>
          <span v-for="(number, index) in atPersonPhoneNumbers" class="number-wrapper">
            <input type="text" v-model="atPersonPhoneNumbers[index].prefix" style="width: 20%;display: inline-block"
            :class="{'is-error': atPersonPhoneNumbers[index].prefix === ''}"/>
            <input v-model="atPersonPhoneNumbers[index].number" type="text" style="display: inline-block; width: 80%;margin-left:-3px"
            :class="{'is-error': validatePhoneNumber(index)}"
             @blur="validatePhoneNumber(index)"
            :placeholder="$t('zwatchEndpoint.inputPhoneNumber')"/>
             <div class="error error-text" v-if="validatePhoneNumber(index)" style="top:42px;">{{$t('error.invalid')}}{{$t('zwatchEndpoint.appointMember')}}</div>
            <div class="delete" v-if="index>0" @click="removeNumbers(index)"></div>
          </span>
          <add-or-delete-input @open="addPersonPhoneNumber()"/>
        </div>
      </div>
      <div v-if="type === 'HttpApplication'">
        <div class="operation-row">
          <div class="title required">{{$t('zwatchEndpoint.urlAddress')}}</div>
          <input type="text" :placeholder="$t('zwatchEndpoint.httpPlaceholder')" v-model="urlAddress" :class="{'is-error': emptyurlAddress || invalidurlAddress}"
                 @blur="validate('urlAddress')"/>
          <div class="error-text error" v-if="emptyurlAddress &&  !invalidurlAddress">{{$t('zwatchEndpoint.urlAddress')}}{{$t('error.noEmpty')}}</div>
          <div class="error-text error" v-if="!emptyurlAddress &&  invalidurlAddress">{{$t('error.invalid')}}{{$t('zwatchEndpoint.urlAddress')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.username')}}</div>
          <input type="text" v-model="username" :class="{'is-error': emptyusername}" @blur="validate('username')"/>
          <div class="error error-text" v-if="emptyusername">{{$t('common.username')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.password')}}</div>
          <input type="password" v-model="password" :class="{'is-error': emptypassword}" @blur="validate('password')"/>
          <div class="error error-text" v-if="emptypassword">{{$t('common.password')}}{{$t('error.noEmpty')}}</div>
        </div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'zwatchendpoint'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import CreateTemplate from "../../component/CreateTemplate";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  import Methods from './Methods';
  import rpc from 'src/utils/rpc';

  export default {
    name: "CreateZwatchEndPointPage",
    mixins: [Methods, WindowBase],
    components: {AddOrDeleteInput, CreateTemplate, DropDown},
    data() {
      return {
        name: '',
        description: '',
        typeList: [
          {name: 'zwatchEndpoint.email', value: 'Email'},
          {name: 'zwatchEndpoint.dingTalk', value: 'DingTalk'},
          {name: 'zwatchEndpoint.httpApplication', value: 'HttpApplication'}
        ],
        type: 'Email',
        dingTalkObjList: [
          {name: 'zwatchEndpoint.nobody', value: 'nobody'},
          {name: 'zwatchEndpoint.allMember', value: 'allMember'},
          {name: 'zwatchEndpoint.appointMember', value: 'appointMember'}
        ],
        member: 'nobody',
        atPersonPhoneNumbers: [
          {prefix: '+86', number: ''}
        ],
        email: '',
        emptyname: false,
        emptyemail: false,
        invalidemail: false,
        emailserversettingUuid: '',
        emptyemailserversettingUuid: false,
        emptyurlAddress: false,
        invalidurlAddress: false,
        urlAddress: '',
        username: '',
        password: '',
        emptypassword: false,
        emptyusername: false
      }
    },
    computed: {
      getType:{
        get(){
          let index = this.typeList.findIndex((item) => {
            return item.value === this.type;
          })
          return this.$t(this.typeList[index].name);
        },
        set(){

        }
      },
      getDingTalk:{
        get(){
          let index = this.dingTalkObjList.findIndex((item) => {
            return item.value === this.member;
          })
          return this.$t(this.dingTalkObjList[index].name);
        },
        set(){

        }
      }
    },
    methods: {
      ...validator,
      //添加电话号码；
      addPersonPhoneNumber(){
        let self = this;
        self.atPersonPhoneNumbers.push({prefix: '+86', number: ''})
      },
      //移除电话号码
      removeNumbers(index){
        let self = this;
        self.atPersonPhoneNumbers.splice(index,1)
      },
      //校验电话号码；
      validatePhoneNumber(index){
        let self = this;
       if(self.atPersonPhoneNumbers[index].number === ''){
         return true;
       }
       if(!/^(([1-9]\d{10}))$/.test(self.atPersonPhoneNumbers[index].number)){
         return true;
       }
       return false;
      },
      //校验
      validate(name){
        let self = this;
        let input = 'name' ? String(self[name]).trim() : self[name];
        self[`empty${name}`] = false;
        if(self.type === 'Email'){
          if(!input){
            self[`empty${name}`] = true;
            return;
          }
          self[`invalid${name}`] = false;
          if(!/([\d[a-zA-Z]+)@([\d[a-zA-Z]+)\.([\d[a-zA-Z]+)$/.test(self.email)){
            self[`invalid${name}`] = true;
            return;
          }
        }
        if(self.type === 'DingTalk'){
          if(!input){
            self[`empty${name}`] = true;
            return;
          }
          self[`invalid${name}`] = false;
          if(!self.isUrl(self.urlAddress)){
            self[`invalid${name}`] = true;
            return;
          }
        }
        if(self.type ===  'HttpApplication'){
          if(!input){
            self[`empty${name}`] = true;
            return;
          }
          self[`invalid${name}`] = false;
          if(!self.isUrl(self.urlAddress)){
            self[`invalid${name}`] = true;
            return;
          }
        }
      },
      //整体校验当点击确定按钮时；
      validateAll(){
        let self = this, props = [];
        if(self.type === 'Email') props = ['name', 'email',  'emailserversettingUui'];
        if(self.type === 'DingTalk')props = ['name','urlAddress'];
        if(self.type === 'HttpApplication') props = ['name','urlAddress', 'username', 'password'];
        props.forEach(name => {
          self.validate(name);
        })
        let invalid = props.some(name => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return invalid;
      },
      createParam: function () {
        let atPersonPhoneNumbers = null;
        if(this.atPersonPhoneNumbers[0].number){
          atPersonPhoneNumbers = this.atPersonPhoneNumbers.map((item, index) => {
              return item.prefix + '-' + item.number
          })
        }
        let self = this;
        let param = {
          name: this.name,
          description: self.description,
          email: self.email,
          platformUuid: self.emailserversettingUuid,
          applicationType: self.type.replace(/^[A-Z]/, self.type.slice(0,1).toLocaleLowerCase()),
          url: self.urlAddress,
          atAll: self.member === 'allMember' ? true : false,
          atPersonPhoneNumbers: atPersonPhoneNumbers,
          username: self.username,
          password: self.password
        }
        return param
      },
      //确定创建所发请求与回调；
      confirm(){
        let self = this;
        let invalid = self.validateAll();
        if(invalid) return;
        if(self.type === 'DingTalk' && self.member === 'appointMember') {
          let isPhone = self.atPersonPhoneNumbers.some((item, index) => {
            return self.validatePhoneNumber(index);
          })
          if(isPhone) return;
        }
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'zwatchendpoint'})
          });
      },
      //邮箱选择弹出框
      openEmailSelect(){
        let self = this;
        self.validate('emailserversettingUuid');
        self.openDialog('EmailServerSingleSelectDlg', {
          conditions: ['state=Enabled'],
          select: (uuid) => self.selectEmailServer(uuid)
        })
      },
      //选择邮箱服务器
      selectEmailServer(uuid){
        let self = this;
        self.emailserversettingUuid = uuid;
        self.validate('emailserversettingUuid');
      },
      removeUuid(uuid){
        let self = this;
        self[uuid] = '';
      },
      //测试邮箱服务器是否连通
      testEmail(){
        let self = this;
        let event = self.createEvent('monitoralarm.action.validateSNSEmailPlatform',self.dbData.emailserversetting[self.emailserversettingUuid].name)
        rpc.update('sns/application-platforms/email', self.emailserversettingUuid, {
          'validateSNSEmailPlatform': {
            'uuid': 'enable'
          }
        }, event)
          .then(() => {
            self.incEventSuccess(event);
          }).catch(() => {
            self.incEventFail(event);
        })
      }
    }
  }
</script>

<style scoped>
  .delete {
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    position: absolute;
    right: -30px;
  }

  .number-wrapper{
    display: flex;
    position: relative;
    margin-bottom: 15px;
  }
</style>
