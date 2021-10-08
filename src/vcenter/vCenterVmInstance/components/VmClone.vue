<template>
  <create-template-no-route>
    <div slot="header">
      <span class="">{{$t('vm.clone')}}</span>
      <span class="create-back" @click="$emit('close')">
        <i class="el-icon-back"></i>
        <span>返回</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.number')}}</div>
        <input type="number" v-model="numbers" :class="{'is-error': emptynumbers}" @blur="validate('numbers')"/>
        <div class="error error-text" v-if="emptynumbers">{{$t('error.emptyInput') + $t('common.number')}}</div>
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
    name: "VmClone",
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
        numbers: 1,
        emptyname: false,
        emptynumbers: false
      }
    },
    methods: {
      createParam(){
        let self = this;
        return {
          numbers: self.numbers,
          name: self.name,
          strategy: 'InstantStart',
          systemTags: [],
        }
      },


      validate(name){
        let self = this , input = null;
        self[`empty${name}`] = false;
        input = String(self[name]).trim();
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
      },

      validateAll(){
        let self = this, props = ['name', 'numbers'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true);
        return invalid;
      },
      confirm(){
        let self = this;
        let invalid = self.validateAll();
        debugger
        if(invalid) return;
        self.param.ok(self.createParam());
        self.$emit('close');
      }
    }
  }
</script>

<style scoped>

</style>
