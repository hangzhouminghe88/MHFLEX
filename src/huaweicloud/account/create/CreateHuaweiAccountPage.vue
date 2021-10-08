<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>添加AccountKey</span>
      <span class="create-back" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到Account Key列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <!--required标明是必填项、label为输入框标签-->
      <mh-input v-model="key" type="text"
                :label="'common.key'" required="true"
                :errorMessage="rules.key.message"
                placeholder="请输入名称"
                :showError="emptykey" :prop="'key'" @validate="validate"/>

      <mh-input v-model="secret" type="text"
                :label="'common.secret'" required="true"
                :errorMessage="rules.secret.message"
                placeholder="请输入名称"
                :showError="emptysecret" :prop="'secret'" @validate="validate"/>
      <!--名称输入框errorMessage为校验反应信息；showError为是否校验通过为true则表示为通过校验；validate为校验函数；prop为校验的域； type为输入框、文本框、选择框-->
      <mh-input v-model="name" type="text"
                :label="'common.name'"
                required="true"
                :errorMessage="rules.name.message"
                helperName="huaweiAccessKey"
                placeholder="请输入名称"
                :showError="emptyname" :prop="'name'" @validate="validate"/>
      <!--简介输入框类型为文本框-->
      <mh-input v-model="description" type="textarea"
                :label="'common.description'"
                placeholder="请输入简介"
                :prop="'description'"/>
      <!--accountId-->
      <mh-input v-model="accountId" type="text"
                :placeholder="`请输入${$t('common.accountId')}`"
                :label="'common.accountId'" required="true"
                :errorMessage="rules.accountId.message"
                :showError="emptyaccountId" :prop="'accountId'" @validate="validate"/>
      <!--accountName-->
      <mh-input v-model="accountName" type="text"
                :label="'common.accountName'" required="true"
                :placeholder="`请输入${$t('common.accountName')}`"
                :errorMessage="rules.accountName.message"
                :showError="emptyaccountName" :prop="'accountName'" @validate="validate"/>
      <!--userId-->
      <mh-input v-model="userId" type="text"
                :label="'common.userId'" required="true"
                :errorMessage="rules.userId.message"
                :placeholder="`请输入${$t('common.userId')}`"
                :showError="emptyuserId" :prop="'userId'" @validate="validate"/>
      <!--userName-->
      <mh-input v-model="userName" type="text"
                :label="'common.userName'" required="true"
                :errorMessage="rules.userName.message"
                :placeholder="`请输入${$t('common.userName')}`"
                :showError="emptyuserName" :prop="'userName'" @validate="validate"/>
      <!--userPassword-->
      <mh-input v-model="userPassword" type="password"
                :placeholder="`请输入${$t('common.userPassword')}`"
                :label="'common.userPassword'" required="true"
                :errorMessage="rules.userPassword.message"
                :showError="emptyuserPassword" :prop="'userPassword'" @validate="validate"/>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm"
            :class="{'disabled': !canCreate}"
            @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <!--点击取消回到account key列表-->
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  //创建页面模板
  import CreateTemplate from 'src/component/CreateTemplate';
  //创建请求
  import Methods from 'src/huaweicloud/account/Methods';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "CreateHuaWeiAccountPage",
    mixins: [WindowBase],
    components: {
      CreateTemplate
    },
    data() {
      return {
        canCreate: true,//是否可以创建，当发出请求后设置为false，防止多次添加
        name: '',
        description: '',
        accountId: '',
        userId: '',
        userName: '',
        userPassword: '',
        accountName: '',
        key:'',
        secret: '',
        emptysecret: false,
        emptykey: false,
        emptyname: false,
        emptyaccountId: false,
        emptyaccountName: false,
        emptyuserId: false,
        emptyuserName: false,
        emptyuserPassword: false,
        rules: {
          name: {message: ''},
          accountId: {message: ''},
          accountName: {message:''},
          userPassword: {message:''},
          userName: {message: ''},
          userId: {message:''},
          key: {message: ''},
          secret: {message: ''}
        }
      }
    },
    methods: {
      ...{
        create: Methods.methods.create
      },
      //跳转到Account Key页面
      close() {
        let self = this;
        self.$router.push({name: 'hybridhuaweiaccountkey'})
      },
      //校验
      validate(name) {
        let self = this, input = '';
        input = name === 'name' ? String(self[name]).trim() :  self[name];
        self[`empty${name}`] = false;
        if(!input){
          self.rules[name].message =  self.$t(`common.${name}`)  + self.$t('error.noEmpty');
          self[`empty${name}`] = true;
        }
      },
      //整体校验
      validateAll() {
        let self = this, props = ['name', 'accountId', 'accountName', 'userPassword', 'userName', 'userId', 'key', 'secret'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true);
        return invalid;
      },
      //添加参数
      createParam() {
        let self = this;
        return{
          key: self.key,
          secret: self.secret,
          name: self.name,
          hybridUserName: self.userName,
          description: self.description,
          password: (self.userPassword).trim(),
          hybridUserId: (self.userId).trim(),
          hybridAccountId: (self.accountId).trim(),
          hybridAccountName: (self.accountName).trim()
        }
      },
      //确定添加
      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.close();
          })
          .catch(() => {
            self.canCreate = true;
          })
      }
    }
  }
</script>

<style scoped>

</style>
