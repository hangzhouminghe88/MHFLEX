<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('usergroup.create')}}</span>
      <span class="create-back" @click="$router.push({name: 'groupuser'})"><i class="el-icon-back"></i>回到用户组列表</span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <help-trigger name="userGroup"></help-trigger>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea v-model="description" rows="3"/>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'groupuser'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import WindowBase from 'src/windows/Window';

  export default {
    name: "CreateUserGroupPage",
    mixins: [WindowBase],
    components: {CreateTemplate},
    data(){
      return {
        name: '',
        emptyname: false,
        description: '',
        canCreate: true
      }
    },
    methods: {
      validate(name){
        let self = this;
        self[`empty${name}`] = false;
        let input = name === 'name' ? String(self[name]).trim() : self[name];
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
      },
      createParam(){
        let self = this;
        return {
          name: self.name,
          description: self.description
        }
      },
      confirm(){
        let self = this;
        self.validate('name');
        if(self.emptyname) return;
        self.canCreate = false;
        let event = self.createEvent('usergroup.action.create', self.name);
        self.dispatchActionWithEvent('userGroup/create', self.createParam(), null, event)
          .then(() => {
            self.$router.push({name: 'groupuser'});
          }).catch(() => {
            self.canCreate = true;
          });
      }
    }
  }
</script>

<style scoped>

</style>
