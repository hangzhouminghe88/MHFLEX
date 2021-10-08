<template>
   <div class="container">
     <div class="operation-row">
       <div class="title required">{{$t('common.name')}}</div>
       <input v-model="name" type="text" :class="{'is-error': emptyname}" @blur="validate()"/>
       <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
     </div>
     <div class="operation-row">
       <div class="title required">{{$t('common.description')}}</div>
       <textarea v-model="description" rows="3"/>
     </div>
   </div>
</template>

<script>
  //添加区域导航
  export default {
    name: "WizardZone",
    props: {
      param: {
        type: Object,
      }
    },
    data(){
      return {
        name: 'ZONE-1',
        emptyname: false,
        description: ''
      }
    },
    mounted(){
      let self = this;
      if(!self.param.disabled)
      document.querySelector('.btn-confirm.wizardNext').addEventListener('click', self.updateValue, true)
    },
    methods: {
      validate(){
        let self = this;
        self.emptyname = false;
        if(self.name.trim() === '') {
          self.emptyname = true;
          return ;
        }
      },
      createParam(){
        let self = this;
        return {
          name: self.name,
          description: self.description
        }
      },
      updateValue(){
        let self = this;
        if(self.param.disabled) return;
          self.validate();
          if(self.emptyname) return;
          self.param.update(self.createParam())
      }
    },
    destroyed(){
      let self = this;
      document.querySelector('.btn-confirm.wizardNext').removeEventListener('click', self.updateValue, true)
    }
  }
</script>

<style scoped>

</style>
