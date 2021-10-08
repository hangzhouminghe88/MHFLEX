<template>
   <create-template-no-route>
     <div slot="header">
       <span class="create-title">华为云子网列表</span>
       <span class="create-back el-icon-back" @click="close()">回到华为云子网列表</span>
     </div>
     <div slot="body" class="create-body">
        <mh-input type="slot"
                  :required="true"
                  :show-error="emptyidentityzoneUuid"
                  :error-message="rules.identityzoneUuid.message"
                  :label="'可用区'">
           <add-or-delete-input :value="dbData.hybridHuaweiyunIdentityZone[identityzoneUuid] && dbData.hybridHuaweiyunIdentityZone[identityzoneUuid].zoneName"
                                :class="{'is-error': emptyidentityzoneUuid}"
                                @remove="removeUuid('identityzoneUuid')"
                                @open="openHybridIdentityZoneSelect"/>
        </mh-input>

        <mh-input :label="$t('common.name')"
                  :show-error="emptyname || invalidname"
                  :error-message="rules.name.message"
                  prop="name"
                  @validate="validate"
                  v-model="name"
                  placeholder="请输入用户名"
                  :required="true"/>

         <mh-input :label="$t('common.description')"
                   v-model="description"
                   placeholder="请输入简介"
                   type="textarea"/>

        <mh-input :label="$t('common.cidr')"
                  :show-error="emptycidrBlock || invalidcidrBlock"
                  :error-message="rules.cidrBlock.message"
                  prop="cidrBlock"
                  @validate="validate"
                  v-model="cidrBlock"
                  placeholder="10.10.10.1/24"
                  :required="true"/>
         <p class="text-hint">
            {{ vpccidrBlock ? `VPC CIDR: ${vpccidrBlock}` : ''  }}
          </p>
     </div>
     <div slot="footer" class="create-footer">
       <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
       <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
     </div>
   </create-template-no-route>
</template>

<script>
import CreateTemplateNoRoute from 'src/component/CreateTemplateNoRoute';
import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
import WindowBase from 'src/windows/Window';
import validator from 'src/utils/validator';
export default {
  name: 'CreateHybridHuaweiSubNetPage',
  mixins: [WindowBase],
  components: {
    CreateTemplateNoRoute,
    AddOrDeleteInput
  },
  props: {
    param: {
      type: Object,
      defualt: () => {
        return {}
      }
    }
  },
  data() {
    let _this = this;
    return {
      identityzoneUuid: '',
      name: '',
      description: '',
      cidrBlock: '',
      vpccidrBlock: '',
      emptyidentityzoneUuid: false,
      emptyname: false,
      invalidname: false,
      emptycidrBlock: false,
      invalidcidrBlock: false,
      canCreate: true,
      rules: {
        identityzoneUuid: {message: ''},
        name: {message: ''},
        cidrBlock: {mesage: ''}
      }
    }
  },
  created() {
    let _this = this, vpcUuid = '';
    if (_this.param.vpcUuid) {
      vpcUuid = _this.param.vpcUuid
      _this.vpccidrBlock = _.cloneDeep(_this.dbData.hybridHuaweiVirtualPrivateCloud[vpcUuid].cidrBlock)
    }
    _this.initHybridHuaweiIdentityZone();
  },
  methods: {
    ...validator,
    close(){
      let _this = this;
      _this.$emit('close');
    },
    validate(name) {
      let _this = this, input = '', errorMsg;
      input = _this[name];
      switch(name) {
        case 'identityzoneUuid':
          errorMsg = _this.$t('common.hybrididentityzone');
          break;
        case 'name':
          errorMsg = _this.$t('common.name');
          break;
        case 'cidrBlock':
          errorMsg = _this.$t('common.cidr');
          break;
      }
        _this[`empty${name}`] = false;
      if(/^\s*$/.test(input) || /\s/.test(input)){
        _this[`empty${name}`] = true;
        _this.rules[name].message = _this.$t(`error.emptyInput`) + errorMsg;
         return;
      }
      _this[`invalid${name}`] = false;
      if(name === 'name' && /\d/.test(input)) {
        _this[`invalid${name}`] = true;
        _this.rules[name].message = '名称不能为数字';
         return;
      }
      if(name === 'cidrBlock' && !_this.isCidr(input)) {
        _this[`invalid${name}`] = true;
        _this.rules[name].message = _this.$t('error.invalid') + errorMsg;
        return;
      }
    },
    removeUuid(uuid) {
      let _this = this;
      _this[uuid] = '';
      _this.validate(uuid);
    },
    openHybridIdentityZoneSelect() {
      let _this = this, conditions = [];
      if (_this.param.vpcUuid) {
        debugger;
          let vpc = _.cloneDeep(_this.dbData.hybridHuaweiVirtualPrivateCloud[_this.param.vpcUuid])
          conditions.push(`dataCenterUuid=${vpc.dataCenterUuid}`)
      }
      _this.openDialog('HybridHuaweiIdentityZoneSingleSelect', {
        conditions: conditions,
        select: (uuid)=> self.selectedIdentityZoneUuid(uuid)
      })
    },
    initHybridHuaweiIdentityZone() {
      let vpc = null, _this = this
      if (_this.windowData.vpcUuid) {
       vpc = _.cloneDeep(_this.dbData.hybridHuaweiVirtualPrivateCloud[_this.param.vpcUuid])
       rpc.query('brid/identity-zone', {
          q: `dataCenterUuid=${vpc.dataCenterUuid}`
      }).then((resp) => {
        if (resp.inventories.length === 1) {
            _this.identityZoneUuid = resp.inventories[0].uuid;
          }
        })
      }
    },
    validateAll() {
      let _this = this, props = ['name', 'identityZoneUuid', 'cidrBlock'];
      props.forEach(name => _this.validate(name));
      let invalid = props.some((name) => _this[`empty${name}`] === true || _this[`invalid${name}`] === true);
      return invalid;
    },
    createParam() {
      let _this = this;
      return {
        name: _this.name,
        desciption: _this.description,
        cidrBlock: _this.cidrBlock,
        vpcUuid: _this.vpcUuid,
        identityZoneUuid: identityzoneUuid
      }
    },
    confirm() {
      let _this = this;
      if(_this.validateAll()) return;
      _this.canCreate = false;
      _this.param.ok(_this.createParam())
            .then(() => {
              _this.close();
            })
            .catch(() =>{
              _this.canCreate = true;
            })
    }
  }
}
</script>

<style lang="less" scoped>
 .text-hint{
   text-align: right;
   width: 300px;
   font-size: 12px;
 }
</style>
