<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('hybridTencentKey.AddTencentSecretKey')}}</span>
      <span class="create-back" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到Secret Key列表</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <mh-input v-model="name" type="text"
             :label="'common.name'" required="true"
             :errorMessage="rules.name.message"
             :showError="emptyname" :prop="'name'" @validate="validate"/>

      <mh-input v-model="description" type="textarea"
             :label="'common.description'"
             :prop="'description'"/>

      <mh-input v-model="secretId" type="text"
             :label="'hybridTencentKey.secretId'" required="true"
             :errorMessage="rules.secretId.message"
             :showError="emptysecretId" :prop="'secretId'" @validate="validate"/>

      <mh-input v-model="secretKey" type="text"
             :label="'hybridTencentKey.secretKey'" required="true"
             :errorMessage="rules.secretKey.message"
             :showError="emptysecretKey" :prop="'secretKey'" @validate="validate"/>

      <mh-input v-model="appId" type="text"
             :label="'appId'" required="true"
             :errorMessage="rules.appId.message"
             :showError="emptyappId" :prop="'appId'" @validate="validate"/>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "src/component/CreateTemplate";
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';

  export default {
    name: "CreateTencentSecretKeyPage",

    components: {CreateTemplate},

    mixins: [WindowBase],

    data() {
      return {
        name: '',
        description: '',
        secretId: '',
        secretKey: '',
        emptyname: false,
        emptysecretId: false,
        emptysecretKey: false,
        appId: '',
        emptyappId: false,
        rules: {
          appId:{message: ''},
          name: {message: ''},
          secretKey: {message: ''},
          secretId: {message: ''}
        }
      }
    },

    methods: {
      ...{
        create: Methods.methods.create
      },
      close: function () {
        this.$router.push({name: 'hybridtencentkeysecret'})
      },
      //单行校验
      validate(name) {
        let self = this, input = '';
        input = name === 'name' ? String(self[name]).trim() : self[name];
        this.rules[`${name}`].message = '';
        self[`empty${name}`] = false;
        if(!input) {
          this.rules[`${name}`].message = self.$t('error.emptyInput') + self.$t(`hybridTencentKey.${name}`);
          self[`empty${name}`] = true;
          return;
        }
      },
      //整体校验
      validateAll() {
        let self = this, props = ['name', 'secretId', 'secretKey','appId'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid =props.some((name) => self[`empty${name}`] === true);
        return invalid;
      },
      //添加参数
      createParam() {
        let self = this;
        return {
          name: self.name,
          description: self.description,
          secretId: self.secretId,
          secretKey: self.secretKey,
          appId: self.appId
        }
      },
      //确定添加
      confirm() {
        let self =  this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then( () => {
            self.canCreate = true;
          }).catch(() => {
            self.canCreate = false;
        });
      }
    }
  }
</script>

<style scoped>

</style>
