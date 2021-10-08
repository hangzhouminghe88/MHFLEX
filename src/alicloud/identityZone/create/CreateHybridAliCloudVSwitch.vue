<template>
  <create-template-no-route>
    <div slot="header">
      <span>{{$t('hybridvswitch.create')}}</span>
      <span class="create-back" @click="$emit('close')">
        <i class="el-icon-back"></i>
        <span class="font-size: 12px;">
          返回
        </span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.hybridVpc')}}</div>
        <add-or-delete-input :value="dbData.hybridVirtualPrivateCloud[vpcUuid]
                             && dbData.hybridVirtualPrivateCloud[vpcUuid].name.replace(/-ZStack/g, '')"
                             @open="openHybridIdentityZoneSelect"
                             :class="{'is-error': emptyvpcUuid}"
                             @remove="removeUuid('vpcUuid')"/>
        <div class="error error-text" v-if="emptyvpcUuid">
          {{$t('error.emptyInput') + $t('common.hybridVpc')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name"
               :class="{'is-error': emptyname || invalidname}"
               @blur="validate('name')"
               :placeholder="$t('hybridvswitch.vSwitchNameinfo')"/>
        <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
        <div class="error error-text" v-if="!emptyname && invalidname">{{$t('error.invalid') + $t('common.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea v-model="description" rows="3"/>
      </div>
      <div class="operation-row">
        <div class="title required">CIDR</div>
        <input type="text" v-model="cidrBlock"
               :class="{'is-error': emptycidrBlock || invalidcidrBlock}"
               @blur="validate('cidrBlock')"/>
        <div class="error error-text" v-if="emptycidrBlock">{{$t('error.invalid') + $t('common.cidr')}}</div>
        <div class="error error-text" v-if="!emptycidrBlock && invalidcidrBlock">{{$t('error.invalid') + $t('common.cidr')}}</div>
        <p class="text-hint">
          {{vpcCidrBlock ? `VPC CIDR: ${vpcCidrBlock}` : ''  }}
        </p>
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
  import AddOrDeleteInput from "src/component/AddOrDeleteInput";
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash'

  export default {
    name: "CreateHybridAliCloudVSwitch",

    components: {AddOrDeleteInput, CreateTemplateNoRoute},

    props: {
      param: {
        type: Object,
        default: () => {
          return ''
        }
      }
    },

    mixins: [WindowBase],

    data() {
      return {
        name: '',
        emptyname: false,
        invalidname: false,
        description: '',
        cidrBlock: '',
        emptycidrBlock: false,
        invalidcidrBlock: false,
        vpcCidrBlock: '',
        identityZoneUuid: '',
        emptyidentityZoneUuid: false,
        vpcUuid: '',
        emptyvpcUuid: false,
        canCreate: true
      }
    },

    created() {
      let self = this;
      if (self.param) {
        if (self.param.identityZoneUuid) {
          self.identityZoneUuid = self.param.identityZoneUuid
         // self.vpcCidrBlock = _.cloneDeep(self.dbData.hybridVirtualPrivateCloud[self.vpcUuid].cidrBlock)
        }
      }
      self.initHbridVirtualPrivateCloud();
    },

    methods: {
      ...Validator,

      validate(name) {
        let self = this, input = '';
        self[`empty${name}`] = false;
        self[`invalid${name}`] = false;
        input = String(self[name]).trim();
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
        if(name === 'name') {
          if(!(/^[a-zA-Z\u4e00-\u9fa5][\u4e00-\u9fa5_a-zA-Z0-9-]{1,127}$/.test(input))) {
            self[`invalid${name}`] = true;
            return;
          }
        }
        if(name ==='cidrBlock') {
          if(!self.isCidr(input)) {
            self[`invalid${name}`] = true;
            return;
          }
        }
      },


      initHbridVirtualPrivateCloud () {
        let identityZone = null, self = this;
        if (this.param.identityZoneUuid) {
          identityZone = _.cloneDeep(this.dbData.hybridIdentityZone[this.param.identityZoneUuid])
          rpc.query('hybrid/aliyun/vpc', {
            q: `dataCenterUuid=${identityZone.dataCenterUuid}`
          }).then((resp) => {
            if (resp.inventories.length === 1) {
               self.vpcUuid =resp.inventories[0].uuid;
               self.vpcCidrBlock = _.cloneDeep(self.dbData.hybridVirtualPrivateCloud[self.vpcUuid].cidrBlock)
            }
          })
        }
      },

      validateAll() {
        let self = this, props = ['name', 'identityZoneUuid', 'cidrBlock'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return invalid;
      },

      openHybridIdentityZoneSelect() {
        let self = this;
        self.vpcCidrBlock = '';
        self.openDialog('HybridAliCloudVpcSingSelectList', {
          conditions: [],
          select: (uuid) => self.selectHybridVpc(uuid)
        })
      },

      selectHybridVpc(uuid)  {
        let self = this;
        self.vpcUuid = uuid;
        self.vpcCidrBlock = _.cloneDeep(self.dbData.hybridVirtualPrivateCloud[self.vpcUuid].cidrBlock)
        self.validate('vpcUuid');
      },

      removeUuid(uuid) {
        let self = this;
        self[uuid] = '';
        self.validate('vpcUuid');
      },

      createParam() {
        let self = this;
        return {
          name: self.name,
          description: self.description,
          identityZoneUuid: self.identityZoneUuid,
          vpcUuid: self.vpcUuid,
          cidrBlock: self.cidrBlock
        }
      },

      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.param.ok(self.createParam())
          .then( () => {
            self.$emit('close');
          }).catch(() => {
          self.canCreate = true;
        });
      }
    }
  }
</script>

<style scoped>
 .text-hint{
   display: inline-block;
   text-align: right;
   width: 100%;
   font-size: 12px;
 }
</style>
