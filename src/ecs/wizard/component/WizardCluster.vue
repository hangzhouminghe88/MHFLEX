<template>
  <div class="container">
    <div class="operation-row">
      <div class="title required">{{$t('common.zone')}}{{$t('common.colon')}}{{dbData.zone[zoneUuid].name}}</div>
    </div>
    <div class="operation-row">
      <div class="title required">{{$t('common.name')}}</div>
      <help-trigger name="cluster"/>
      <input maxlength="255" v-model="name" :class="{'is-error': emptyname}" @blur="validate()"/>
      <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
    </div>
    <div class="operation-row">
      <div class="title">{{$t('common.description')}}</div>
      <textarea rows="3" v-model="description"></textarea>
    </div>
  </div>
</template>

<script>
  //添加集群导航
  import WindowBase from  'src/windows/Window';
    export default {
      name: "WizardCluster",
      mixins: [WindowBase],
      props: {
        'parentWindowUuid': {
          type: String,
          default: ''
        },
        param: {
          type: Object,
          default: () => {
            return {}
          }
        }
      },
      data(){
        return {
          zoneUuid: '',
          emptyname: false,
          name: 'Cluster-1',
          description: ''
        }
      },
      mounted(){
        let self = this;
        //监听点击下一步按钮事件
        if(!self.param.disabled)
        document.querySelector('.btn-confirm.wizardNext').addEventListener('click', self.updateValue, true);
      },
      created(){
        let wizard = _.cloneDeep(this.$store.state.windowManager.windows[this.parentWindowUuid].wizard), self = this;
        self.zoneUuid = wizard.zone.uuid;
      },
      methods: {
        //创建参数
        createParam(){
          let self = this;
          return{
            zoneUuid: self.zoneUuid,
            name: self.name,
            description: self.description,
            hypervisorType: 'KVM'
          }
        },
        //校验
        validate(){
          let self = this;
          self.emptyname = false;
          if(self.name === '') {
            self.emptyname = true;
            return;
          }
        },
        //更新值
        updateValue(){
          let self = this;
          if(self.param.disabled) return;
          self.validate();
          if(self.emptyname) return;
          self.param.update(self.createParam());
        }
      },
      destroyed(){
        let self = this;
        //移除监听
        document.querySelector('.btn-confirm.wizardNext').removeEventListener('click', self.updateValue, true);
      },
    }
</script>

<style scoped>

</style>
