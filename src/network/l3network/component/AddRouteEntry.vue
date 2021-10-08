<template>
  <create-template-no-route>
    <div slot="header">
      <span></span>
      <span class="create-back el-icon-back"
            @click="$emit('close')"
      >返回</span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('vRouterRouteEntry.destination')}}</div>
        <input type="text" maxLength="255" v-model="destination"
               :class="{'is-error': emptydestination || invaliddestination}"
               @blur="validate('destination')"
               placeholder="192.168.1.0/24"
        />
        <div class="error error-text" v-if="emptydestination">{{$t('error.emptyInput') + $t('vRouterRouteEntry.destination')}}</div>
        <div class="error error-text" v-if="!emptydestination && invaliddestination">{{$t('error.invalid') + $t('vRouterRouteEntry.destination')}}</div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('vRouterRouteEntry.target')}}</div>
        <input type="text" maxLength="255" v-model="target"
               :class="{'is-error': emptytarget || invalidtarget}"
               @blur="validate('target')"
               placeholder="192.168.1.1"
        />
        <div class="error error-text" v-if="emptytarget">{{$t('error.emptyInput') + $t('vRouterRouteEntry.target')}}</div>
        <div class="error error-text" v-if="!emptytarget && invalidtarget">{{$t('error.invalid') + $t('vRouterRouteEntry.target')}}</div>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel"
            v-text="$t('common.cancel')"
            @click="$emit('close')"
      ></span>
    </div>

  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "src/component/CreateTemplateNoRoute";
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "AddRouteEntry",

    mixins: [WindowBase],

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    components: {
      CreateTemplateNoRoute
    },

    data () {
      return {
        destination: '',
        target: '',
        emptydestination: false,
        invaliddestination: false,
        emptytarget: false,
        invalidtarget: false,
        ipVersion: '4',
        l3NetworkUuid: ''
      }
    },

    created () {
      let self = this;
      self.l3NetworkUuid = self.param.conditions[0];
      self.ipVersion = self.dbData.l3network[self.l3NetworkUuid].ipVersion;
    },

    methods: {
      ...Validator,

      confirm(){
        let self = this,
        invalid = self.validateAll();
        if(invalid) return;
        self.param.ok(self.createParam())
        self.$emit('close')
      },

      createParam(){
        let self = this;
        return {
          l3NetworkUuid: self.l3NetworkUuid,
          prefix: self.destination,
          nexthop: self.target
        }
      },

      validate (name) {
        let self = this, input;
        input = String(self[name]).trim();
        self[`empty${name}`] = false;
        if(!input) {
          self[`empty${name}`] = true;
          return;
        }
        self[`invalid${name}`] = false;
        if (name === 'destination') {
          if (self.ipVersion  !== 4 && self.isIPV6Cidr(input)) {
            self[`invalid${name}`] = true;
            return;
          }
          if ((self.ipVersion  === 4 && !self.isCidr(input))) {
            self[`invalid${name}`] = true;
            return;
          }
        }
        self[`invalid${name}`] = false;
        if (name === 'target') {
          if (self.ipVersion  === 4 && !self.isIP(input)) {
            self[`invalid${name}`] = true;
            return;
          }
          if ((self.ipVersion  !== 4 && !self.isIPV6IP(input))) {
            self[`invalid${name}`] = true;
            return;
          }
        }
      },

      validateAll(){
        let self = this, props = ['destination', 'target'], invalid = false;
        props.forEach((name) => {
          self.validate(name);
        })
        invalid = props.some(name => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return  invalid;
      }


    }
  }
</script>

<style scoped>

</style>
