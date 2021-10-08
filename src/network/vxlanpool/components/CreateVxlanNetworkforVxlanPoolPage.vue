<template>
  <create-template-no-route>
    <div slot="header">
      <span>{{$t('l2network.createVxlanNetwork')}}</span>
      <span class="create-back el-icon-back" @click="$emit('close')">返回</span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title">vni</div>
        <input type="number" v-model="vni"/>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";

  export default {
    name: "CreateVxlanNetworkforVxlanPoolPage",
    components: {CreateTemplateNoRoute},
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        name: '',
        emptyname: false,
        vni: '',
        description: ''
      }
    },

    methods: {
      validate(name){
        let self = this, input = '';
        self[`empty${name}`] = false;
        input = name === 'name' ? String(self[name]).trim() : self[name];
        if(!input){
          self[`empty${name}`] = true;
          return ;
        }
      },

      confirm(){
        let self = this;
        self.validate('name');
        if(self.emptyname) return ;
        self.param.ok(self.createParam());
        self.$emit('close');
      },

      createParam(){
        let self = this;
        return {
          name: self.name,
          description: self.description,
          vni: self.vni
        }
      }
    }
  }
</script>

<style scoped>

</style>
