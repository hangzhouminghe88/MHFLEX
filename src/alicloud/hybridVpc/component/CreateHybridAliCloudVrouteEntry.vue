<template>
  <create-template-no-route style="z-index: 99">
    <div slot="header">
      <span>{{$t('hybridvirtualrouterentry.add')}}</span>
      <span class="create-back " @click="$emit('close')">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">返回</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('hybridvirtualrouterentry.destinationCidrBlock')}}</div>
        <input type="text" :class="{'is-error': emptydestinationBlock || invaliddestinationBlock}"
               @blur="validate('destinationBlock')"
               placeholder="192.168.1.0/24"
               v-model="destinationBlock"/>
        <div class="error error-text" v-if="emptydestinationBlock">
          {{$t('error.emptyInput') + $t('hybridvirtualrouterentry.destinationCidrBlock')}}
        </div>
        <div class="error error-text" v-if="!emptydestinationBlock && invaliddestinationBlock">
          {{$t('error.invalid') + $t('hybridvirtualrouterentry.destinationCidrBlock')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{$t('hybridvirtualrouterentry.nextHopType')}}
        </div>
        <el-select style="width: 100%;" v-model="nextHop">
          <el-option v-for="(next, item) in nextHopTypeList"
                     :value="next.value"
                     :label="next.label"
                     :key="item"></el-option>
        </el-select>
      </div>
      <!--路由器接口-->
      <div class="operation-row" v-if="nextHop === 'RouterInterface'">
        <div class="title required">{{$t('common.hybridRouterInterfacepair')}}</div>
        <add-or-delete-input :value="dbData.hybridRouterInterface[nextHopUuid] && dbData.hybridRouterInterface[nextHopUuid].name" 
                             @open="openHybridVRInterfaceSelect" 
                             @remove="removeUuid('nextHopUuid')" 
                             :class="{'is-error': emptynextHopUuid}"/>
        <div class="error error-text" v-show="emptynextHopUuid">{{$t('error.unselected') + $t('common.hybridvirtualrouterinterface')}}</div>
      </div>
      <!--选择云主机-->
      <div class="operation-row" v-if="nextHop === 'Instance'">
          <div class="title required">{{$t('hybridecsinstance.instance')}}</div>
        <add-or-delete-input :value="dbData.hybridEcsInstance[nextHopUuid] && dbData.hybridEcsInstance[nextHopUuid].name" 
                             @open="openHybridEcsInstanceSelect" 
                             @remove="removeUuid('nextHopUuid')" 
                             :class="{'is-error': emptynextHopUuid}"/>
        <div class="error error-text" v-show="emptynextHopUuid">{{$t('error.unselected') + $t('common.hybridvirtualrouterinterface')}}</div>
      </div>
       <!--选择vpn网关-->
      <div class="operation-row" v-if="nextHop === 'VpnGateway'">
          <div class="title required">{{$t('hybridvpcvpngateway.vpnGateway')}}</div>
        <add-or-delete-input :value="dbData.hybridVpcVpnGateway[nextHopUuid] && dbData.hybridVpcVpnGateway[nextHopUuid].name" 
                             @open="openHybridVpcVpnGatewaySelect" 
                             @remove="removeUuid('nextHopUuid')" 
                             :class="{'is-error': emptynextHopUuid}"/>
        <div class="error error-text" v-show="emptynextHopUuid">{{$t('error.unselected') + $t('common.hybridvirtualrouterinterface')}}</div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "src/component/CreateTemplateNoRoute";
  import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "CreateHybridAliCloudVrouteEntry",

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    components: {CreateTemplateNoRoute, AddOrDeleteInput},

    mixins: [WindowBase],

    data() {
      let self = this;
      return {
        destinationBlock: '',
        emptydestinationBlock: false,
        invaliddestinationBlock: false,
        nextHop: 'RouterInterface',
        canCreate: true,
        nextHopTypeList: [{
          value: 'Instance',
          label: self.$t('hybridvirtualrouterentry.Instance')
        }, {
          value:'RouterInterface',
          label: self.$t('hybridvirtualrouterentry.RouterInterface')
        }, {
          value: 'VpnGateway',
          label: self.$t('hybridvirtualrouterentry.VpnGateway')
        }],
        nextHopUuid: '',
        emptynextHopUuid: false
      }
    },

    created() {
      let self = this;
      let vRouterType = ''
      if (this.param && this.param.vRouterType) {
        vRouterType = this.param.vRouterType
      }
      if (vRouterType === 'vbr') {
        self.nextHopTypeList.push({
          value: 'PhysicalLineInterface',
          label: self.$t('hybridvirtualrouterentry.PhysicalLineInterface')
        })
      }
    },

    methods: {
      ...Validator,

      validate(name) {
        let self = this, input = '';
        input = String(self[name]).trim();
         self[`empty${name}`] = false;
          self[`invalid${name}`] = false;
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
        if(name === 'destinationBlock' && !this.isCidr(input)) {
          self[`invalid${name}`] = true;
          return;
        }
      },

      validateAll() {
        let self = this, props = ['destinationBlock', 'nextHop', 'nextHopUuid'];
        if(self.nextHop === 'PhysicalLineInterface') {
          props.push('vlanInterfaceId')
        }
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return invalid;
      },

      createParam() {
        let self = this;
        return {
          dstCidrBlock: self.destinationBlock,
          nextHopUuid: self.nextHop === 'PhysicalLineInterface' ? self.vlanInterfaceId : self.nextHopUuid,
          nextHopType: self.nextHop === 'PhysicalLineInterface' ? 'RouterInterface' : self.nextHop
        }
      },

      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.param.ok(self.createParam())
        self.$emit('close')
    
      },

      openHybridVRInterfaceSelect() {
        let self = this;
        self.openDialog('hybridAliCloudVirtualRouterInterfaceSelect', {
           conditions: [],
           ok: (uuid) => {
             self.nextHopUuid = uuid;
             self.validate('nextHopUuid');
           }
        })
      },

      openHybridEcsInstanceSelect() {
        let self = this;
         self.openDialog('HybridAliCloudEcsSingleSelect', {
           conditions: [],
            select: (uuid) => {
              self.nextHopUuid = uuid;
              self.validate('nextHopUuid');
            }
         })
      },

      openHybridVpcVpnGatewaySelect() {
         let self = this;
         self.openDialog('HybridAliCloudVpnGatewaySingleSelectList', {
           conditions: [],
            ok: (uuid) => {
              self.nextHopUuid = uuid;
              self.validate('nextHopUuid');
            }
         })
      },

      removeUuid(uuid) {
        let self = this;
        self[uuid] = '';
        self.validate('nextHopUuid');
      }
    }
  }
</script>

<style scoped>

</style>
