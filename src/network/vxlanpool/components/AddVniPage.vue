<template>
  <create-template-no-route>
    <div slot="header">
      <span>
        {{$t("l2network.createVniRange")}}
      </span>
      <span class="create-back" @click="$emit('close')"><i class="el-icon-back"></i>返回</span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required"  v-text="$t('common.name')"></div>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required" v-text="$t('l2network.startVni')"></div>
        <input type="number" v-model="startVni" :class="{'is-error': emptystartVni || invalidstartVni}" @blur="validate('startVni')"/>
        <div class="error error-text" v-if="emptystartVni">{{$t('error.emptyInput') + $t('l2network.startVni')}}</div>
        <div class="error error-text" v-if="!emptystartVni && invalidstartVni">{{$t('error.emptyInput') + $t('l2network.startVni')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required" v-text="$t('l2network.endVni')"></div>
        <input type="number" v-model="endVni" :class="{'is-error': emptyendVni || invalidendVni}" @blur="validate('endVni')"/>
        <div class="error error-text" v-if="emptyendVni">{{$t('error.emptyInput') + $t('l2network.startVni')}}</div>
        <div class="error error-text" v-if="!emptyendVni && invalidendVni">{{$t('error.emptyInput') + $t('l2network.startVni')}}</div>
      </div>
    </div>

    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import Validator from 'src/utils/validator';

  export default {
    name: "AddVniPage",
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
        startVni: '',
        emptystartVni: false,
        invalidstartVni: false,
        endVni: '',
        emptyendVni: false,
        invalidendVni: false
      }
    },

    methods: {
      ...Validator,
      validate(name){
        let self = this;
        self[`empty${name}`] = false
        let input = name === 'name' ? String(self[name]).trim() : self[name]
        if (input === undefined || input === '' || input === null) {
          self[`empty${name}`] = true
          return
        }
        self[`invalid${name}`] = false
        let numbers = ['startVni', 'endVni']
        let range = {
          maxValue: 16777214,
          minValue: 1
        }
        if (numbers.indexOf(name) > -1) {
          if (!Number.isInteger(Number(input)) || !self.isIn(input, range)) {
            self[`invalid${name}`] = true
            return
          }
          let isInvalid
          if (name === 'startVni' && self.endVni) {
            let endVni = self.endVni
            isInvalid = (input - endVni) > 0
          }
          if (name === 'endVni' && self.startVni) {
            let startVni = self.startVni
            isInvalid = (input - startVni) < 0
          }
          if (isInvalid) {
            self[`invalid${name}`] = true
          }
        }
      },

      validateAll () {
        let invalidInput = false
        let props = ['name', 'startVni', 'endVni']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this[`empty${item}`] || this[`invalid${item}`])
        if (isInvalid) invalidInput = true
        return invalidInput;
      },

      confirm(){
        let self = this, invalidInput = self.validateAll();
        if(invalidInput) return;
        self.param.ok(self.createParam());
        self.$emit('close');
      },

      createParam(){
        let self = this;
        return {
          name: self.name,
          startVni: Number(self.startVni),
          endVni: Number(self.endVni)
        }
      }
    }
  }
</script>

<style scoped>

</style>
