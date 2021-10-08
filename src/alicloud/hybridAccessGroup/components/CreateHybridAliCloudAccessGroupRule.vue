<template>
  <create-template>
    <div slot="header" class="create-header">
     <span> {{ $t("nasAccessGroupRule.create")}}</span>
     <span class="create-back el-icon-back" @click="$emit('close')">
        <span class="text" style="font-size: 12px;">回到权限组列表</span>
      </span>
   </div>

   <div slot="body">
     <mh-input type="input"
               required="true"
               label="nasAccessGroupRule.info.sourceCidr"
               :showError="emptysourceCidr || invalidsourceCidr"
               v-model="sourceCidr"
               prop="sourceCidr"
               :validate="validate"
               :error-message="rules.sourceCidr.message"/>

       <mh-input type="input"
               required="true"
               label="nasAccessGroupRule.info.priority"
               :showError="emptypriority || invalidpriority"
               v-model="priority"
               prop="priority"
               :validate="validate"
               :error-message="rules.priority.message"/>

       <mh-input type="select"
               :label="'nasAccessGroupRule.info.rw'"
               required="true"
               :selectGroup="rwAccessTypeGroup"
               :showError="emptyrwAccessType"
               v-model="rwAccessType"
                prop="rwAccessType"
               :error-message="rules.rwAccessType.message"/>

   </div>

   <div slot="footer" class="create-footer">
     <span class="btn-confirm"
           :class="{'disabled': !canCreate}"
           @click="canCreate && create()">{{$t('common.confirm')}}</span>
     <span class="btn-cancel"@click="$emit('close')">{{$t('common.cancel')}}</span>
   </div>
  </create-template>
</template>

<script>
import CreateTemplate from 'src/component/CreateTemplate';
import rpc from 'src/utils/rpc';
import Methods from '../Methods';

export default {
  components: {
    CreateTemplate,
  },
  props: {
    param: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      canCreate: true,
      emptysourceCidr: false,
      invalidsourceCidr: false,
      sourceCidr: '',
      priority: '',
      emptypriority: false,
      invalidpriority: false,
      rwAccessType: '',
      emptyrwAccessType: false,
      rwAccessTypeGroup: [
        {label: 'RDWR', value: 'RDWR'},
        {label:'RDONLY', value:'RDONLY'}
      ],
      rules: {
        sourceCidr: {message: ''},
        priority: {message: ''},
        rwAccessType: {message: ''}
      }
    }
  },

  created() {
   this.queryRegionList()
  },

  methods: {
   ...{
     create: Methods.methods.create
    },
    validate(name) {
      let errorMsg = '', input = '',  self = this;
      input = name === 'name' ? String(self[name]).trim() : self[name];
      switch(name) {
        case 'sourceCidr':
          errorMsg = self.$t('error.emptyInput') + self.$t('nasAccessGroupRule.info.sourceCidr');
          break;
        case 'priority':
           errorMsg = self.$t('error.unselected') + self.$t('nasAccessGroupRule.info.priority');
          break;
        case 'rwAccessType':
          errorMsg = self.$t('error.unselected') + self.$t('nasAccessGroupRule.info.rwAccessType');
          break;
      }
       self[`empty${name}`] = false;
        self.rules[name].message = '';
      if(!input) {
        self[`empty${name}`] = true;
        self.rules[name].message = errorMsg;
      }
      self[`invalid${name}`] = false;
      self.rules[name].message = '';
       if (name === 'sourceCidrIp') {
        if (!Validator.isCidr(value)) {
          self[`invalid${name}`] = true;
          self.rules[name].message = self.$t('error.invalid') + self.$t('nasAccessGroupRule.info.sourceCidr');
        }
      }
    },
    //整体验证
    validateAll() {
      let self = this, props = ['sourceCidr', 'priority', 'rwAccessType'];
      props.forEach((name) => {
        self.validate(name);
      })
     let invalid =  props.some((name) => {
        return self[`empty${name}`] === true || self[`invalid${name}`] === true;
      })
      return invalid;
    },
    //添加参数
     createParam () {
      return {
        accessGroupUuid: this.param.accessGroupUuid,
        sourceCidrIp: this.sourceCidrIp,
        rwAccessType: this.rwAccessType,
        priority: this.priority
      }
    },
    create() {
      let self = this;
      if(self.validateAll()) return;
       self.canCreate = false;
       self.param.ok(self.createParam())
       .then(() => {
         self.$emit('close');
       }).catch(() => {
         self.canCreate = true;
       })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
