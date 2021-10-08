<template>
 <create-template>
   <div slot="header" class="create-header">
     <span>{{$t(`hybridKey.Add${$route.params.type.replace(/\b^[a-zA-Z]/, (item) => {
         return item.toUpperCase();
       })}AccessKey`)}}</span>
     <span class="create-back"
           @click="cancel()"
     >
       <i class="el-icon-back"></i>
       <span style="font-size: 12px;">回到Access Key列表</span>
     </span>
   </div>

   <div slot="body" class="create-body">
     <component :is="aliyunItem.ctrl"
                :param="aliyunItem.param"
                v-if="$route.params.type === 'aliyun'"
                ref="accessKey"
     ></component>
     <component :is="dahoItem.ctrl"
                :param="dahoItem.param"
                v-if="$route.params.type === 'daho'"
                ref="dahoAccessKey"
     ></component>
   </div>

   <div slot="footer" class="create-footer">
     <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
     <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
   </div>
 </create-template>
</template>

<script>
  import CreateAliyunAccessKey from 'src/alicloud/accesskey/create/CreateAliyunAccessKey';
  import CreateDahoAccesskey from 'src/alicloud/accesskey/create/CreateDahoAccessKey';
  import CreateTemplate from "src/component/CreateTemplate";
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';

  export default {
    name: "CreateAliCloudAccessKey",

    mixins: [WindowBase],

    components: {
      CreateTemplate,
      CreateAliyunAccessKey,
      CreateDahoAccesskey
    },

    data () {
      let self = this;
      return {
        aliyunItem: {
          param: {
            setName: (value) => self.getName(value),
            setDescription: (value) => self.getDescription(value),
            setAccessKey: (value) => self.getAccessKey(value),
            setPassword: (value) => self.getPassword(value),
            setAsync: (value) =>  self.getSync(value),
            setType: (value) => self.getType(value),
          },
          ctrl: 'CreateAliyunAccessKey'
        },
        dahoItem: {
          param: {
            setName: (value) => self.getName(value),
            setDescription: (value) => self.getDescription(value),
            setAccessKey: (value) => self.getAccessKey(value),
            setPassword: (value) => self.getPassword(value),
            setAsync: (value) =>  self.getSync(value)
          },
          ctrl: 'CreateDahoAccesskey'
        },
        name: '',
        description: '',
        key: '',
        secret: '',
        sync: true,
        type: ''
      }
    },

    methods: {
      getName (value) {
        if(!value) return;
        this.name = value;
      },

      getDescription (value) {
        if(!value) return '';
        this.description = value;
      },

      getAccessKey (value) {
        if(!value) return '';
        this.key = value;
      },

      getType(value) {
        if(!value) return '';
        this.type = value;
      },

      ...{
        create: Methods.methods.create
      },

      getPassword (value) {
        if(!value) return '';
        this.secret = value;
      },

      confirm () {
        let self = this;
        if (self.$route.params.type === 'aliyun') {
          let invalid = self.$refs.accessKey.validateAll();
          if (invalid) return;
          self.create(self.createParam())
            .then( () => {
              self.$router.push({name: 'hybridkeysecret', params: {type: self.$route.params.type}})
            });
        } else {
          let invalid = self.$refs.dahoAccessKey.validateAll();
          if (invalid) return;
          self.create(self.createParam())
            .then( () => {
              self.$router.push({name: 'hybridkeysecret', params: {type: self.$route.params.type}})
            });
        }
      },

      cancel () {
        let self = this;
        self.$router.push({name: 'hybridkeysecret',  params: {type: self.$route.params.type}})
      },

      getSync (value) {
        if(!value) this.sync = true;
        this.sync = value;
      },

      createParam () {
        let self = this, obj = {};
        obj = {
          name: self.name,
          description: self.description,
          key: (self.key).trim(),
          secret: (self.secret).trim(),
          type: self.sync ? self.$route.params.type : self.type,
          sync: self.sync
        }
        if(self.$route.params.type === 'daho'){
          delete obj['sync'];
        }
        return obj;
      },
    }
  }
</script>

<style scoped>

</style>

