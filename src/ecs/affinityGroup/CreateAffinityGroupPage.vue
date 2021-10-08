<template>
  <create-template>
    <div slot="header" class="create-header">
       <span>
          {{$t('affinityGroup.create')}}
        </span>
      <span class="create-back" @click="$router.push({name: 'affinitygroup'})"><i
        class="el-icon-back"></i>回到亲和组列表</span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required" v-text="$t('common.name')"></div>
        <input type="text" v-model="name" @blur="validate('name')" @keydown.enter="validate('name')" :class="{'is-error': emptyname}"/>
        <div class="error error-text" v-if="emptyname">
          {{$t('common.name')}}{{$t('error.noEmpty')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title" v-text="$t('common.description')"></div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title required" v-text="$t('common.strategy')"></div>
        <help-trigger name="affinityGroupPolicy"/>
        <el-select v-model="getPolicyText" style="width: 100%;">
          <el-option v-for="(strategy, index) in strategyList " :key="index" :value="strategy.value" :label="$t(`${strategy.name}`)"></el-option>
        </el-select>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <div class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confrim()">{{$t('common.ok')}}</div>
      <div class="btn-cancel" @click="$router.push({name: 'affinitygroup'})">{{$t('common.cancel')}}</div>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import rpc from 'src/utils/rpc';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "CreateAffinityGroupPage",
    mixins: [WindowBase],
    components: {CreateTemplate},
    computed: {
      getPolicyText: {
        get(){
          let self = this;
          return self.$t(`affinityGroup.${self.policy.toLocaleUpperCase()}`);
        },
        set(val){
          let self = this;
          self.policy = val;
        }
      }
    },
    data(){
      return {
        name: '',
        emptyname: false,
        invalidInput: false,
        description: '',
        policy: 'antisoft',
        policyText: this.$t('affinityGroup.ANTISOFT'),
        strategyList: [
          {name: 'affinityGroup.ANTISOFT', value: 'antisoft'},
          {name: 'affinityGroup.ANTIHARD', value: 'antihard'}
        ],
        canCreate: true
      }
    },
    methods: {
      validate(name){
        let self = this, input;
        input = name === 'name' ? String(self[name]).trim() : name;
        self[`empty${name}`] = false;
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
      },
      createParam () {
        let policy = this.policy === 'antisoft' ? 'antiSoft' : 'antiHard'
        let obj = {
          name: this.name,
          description: this.description,
          policy
        }
        return obj
      },
      validateAll () {
        let props = ['name'], self = this;
        self.invalidInput = false;
        props.forEach(item => this.validate(item))
        self.invalidInput = props.some(item => this[`empty${item}`])
      },
      confrim(){
        let self = this;
        self.validateAll();
        if(self.invalidInput) return;
        self.canCreate = false;
        let param = self.createParam();
        let event = self.createEvent('affinityGroup.action.create', param.name)
        return rpc.create(`affinity-groups`, param, event).then(resp => {
          self.incEventSuccess(event)
          self.$router.push({name: 'affinitygroup'})
        }, () => {
          self.incEventFail(event)
          self.canCreate = true;
        })
      }
    }
  }
</script>

<style scoped>

</style>
