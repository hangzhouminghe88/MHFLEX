<template>
  <create-template>
    <div class="create-header" slot="header">
      <span class="create-header-title">
        创建华为云专有网络VPC
      </span>
      <span class="create-back el-icon-back" @click="close()">
        回到华为云专有网络VPC列表
      </span>
    </div>
    <div class="create-body" slot="body">
      <!--地域-->
      <mh-input  :label="$t('hybriddatacenter.region')"
                 :show-error="emptydataCenterUuid"
                 :error-message="rules.dataCenterUuid.message"
                 :required="true"
                 type="slot">
        <add-or-delete-input :value="dbData.hybridHuaweiyunDataCenter[dataCenterUuid] && dbData.hybridHuaweiyunDataCenter[dataCenterUuid].regionName"
                             @open="openDataCenterSelect"
                             @remove="removeUuid('dataCenterUuid')"
                             :class="{'is-error': emptydataCenterUuid}"/>
      </mh-input>
      <!--名称-->
      <mh-input :label="$t('common.name')"
                :show-error="emptyname || invalidname"
                v-model="name"
                :required="true"
                prop="name"
                @validate="validate"
                placeholder="请输入名称"
                :error-message="rules.name.message"/>

      <!--简介-->
      <mh-input :label="$t('common.description')"
                v-model="description"
                placeholder="请输入简介"
                type="textarea"/>
      <!--cidr-->
      <!-- <mh-input :label="$t('common.cidr')"
                :select-group="cidrBlockGroup"
                helperName="vpcHuaweiCidr"
                v-model="cidrBlock"
                :required="true"
                type="select"/> -->
      <mh-input type="slot"
                :required="true"
                :error-message="rules.cidrBlock.message"
                helperName="vpcHuaweiCidr"
                :label="$t('common.cidr')"
                :show-error="emptycidrBlock || invalidcidrBlock">
          <input class="cidr-input" v-model="cidrPos1" @input="updatecidrPos1()" :class="{'is-error': emptycidrBlock || invalidcidrBlock}"/>:
          <input class="cidr-input disabled" v-model="cidrPos2" disabled/>:
          <input class="cidr-input disabled" v-model="cidrPos3" disabled/>:
          <input class="cidr-input disabled" v-model="cidrPos4" disabled/>/
          <el-select style="width:84px" v-model="cidrPos5">
            <el-option v-for="(item, index) in cidrPos5List" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
      </mh-input>
    </div>
    <div class="create-footer" slot="footer">
      <span class="btn-confirm"
            :class="{'disabled': !canCreate}"
            @click="canCreate && confirm()">
        {{$t('common.confirm')}}
      </span>
      <span class="btn-cancel" @click="close()">
        {{$t('common.cancel')}}
      </span>
    </div>
  </create-template>
</template>

<script>
import { huaweiAsync } from 'src/windows/asyncData/asyncData';
import AddOrDeleteInput  from 'src/component/AddOrDeleteInput';
import CreateTemplate from 'src/component/CreateTemplate';
import WindowBase from 'src/windows/Window';
import Methods from '../Methods';
export default {
  name: 'CreateHybridHuaweiCloudVpcPage',
  mixins: [WindowBase],
  components: {
    CreateTemplate,
    AddOrDeleteInput
  },
  data() {
    return{
      dataCenterUuid: '',
      name: '',
      description: '',
      cidrBlock: '',
      cidrPos1: 192,
      cidrPos2: 168,
      cidrPos3: 0,
      cidrPos4: 0,
      cidrPos5: 19,
      cidrPos5List: [],
      emptyname: false,
      emptydataCenterUuid: false,
      invalidname: false,
      canCreate: true,
      emptycidrBlock: false,
      invalidcidrBlock: false,
      rules: {
        name: {message: ''},
        dataCenterUuid: {mesage: ''},
        cidrBlock: {message: ''}
      }
    }
  },
  created() {
    let _this = this;
    huaweiAsync(_this);
    for(let i = 16;i<=24;i++) {
      _this.cidrPos5List.push({label: i, value: i})
    }
    _this.cidrBlock = _this.cidrPos1 + '.' + _this.cidrPos2 + '.' + _this.cidrPos3 + '.' + _this.cidrPos4 + '/' + this.cidrPos5;
  },
  methods: {
    ...{
      create: Methods.methods.create
    },
    close() {
      let _this =  this;
      _this.$router.push({name: 'hybridhuaweivpc'})
    },
    updatecidrPos1() {
      let _this = this;
      _this.cidrPos5List = [];
      debugger;
      switch(_this.cidrPos1) {
        case '192':
          _this.cidrPos2 = 168;
          for(let i = 16;i<=24;i++) {
           _this.cidrPos5List.push({label: i, value: i})
          }
          break;
        case '172':
           _this.cidrPos2 = 16;
        for(let i = 12;i<=24;i++) {
           _this.cidrPos5List.push({label: i, value: i})
          }
          break;
        case '10':
           _this.cidrPos2 = 0;
          for(let i = 8;i<=24;i++) {
           _this.cidrPos5List.push({label: i, value: i})
          }
          break;
      }
      _this.cidrBlock = _this.cidrPos1 + '.' + _this.cidrPos2 + '.' + _this.cidrPos3 + '.' + _this.cidrPos4 + '/' + this.cidrPos5;
      _this.validate('cidrBlock');
    },
    validate(name) {
      let _this = this,  input = '', errorMsg = '';
      switch(name) {
        case 'dataCenterUuid':
          errorMsg = _this.$t('hybriddatacenter.region')
          break;
        case 'name':
          errorMsg = _this.$t('common.name');
          break;
        case 'cidrBlock':
          errorMsg = _this.$t('common.cidr');
          break;
      }
      input = _this[name];
      _this[`empty${name}`] = false;
      _this[`invalid${name}`] = false;
      _this.rules[name].message = "";
      if(/^\s*$/.test(input) || /\s/.test(input)) {
        _this[`empty${name}`] = true;
        _this.rules[name].message = _this.$t('error.emptyInput') + errorMsg;
        return;
      }
      _this[`invalid${name}`] = false;
      if(name === 'cidrBlock' && !/^(192|10|172)$/.test(_this.cidrPos1)) {
         _this[`invalid${name}`] = true;
        _this.rules[name].message = _this.$t('error.invalid') + errorMsg;
        return;
      }
    },
    openDataCenterSelect() {
      let _this = this;
      _this.validate('dataCenterUuid');
      _this.openDialog('HybridHuaweiDataCenterSingleSelect', {
        conditions: [],
        select: (uuid) => {
          _this.dataCenterUuid  = uuid;
          _this.validate('dataCenterUuid');
        }
      })
    },
    createParam() {
      let _this = this;
      return {
        name: _this.name,
        description: _this.description,
        dataCenterUuid: _this.dataCenterUuid,
        vRouterName: `VRouter-VPC-${_this.name}`,
        cidrBlock: _this.cidrBlock
      }
    },
    removeUuid(uuid) {
      let _this = this;
      _this[uuid] = "";
      _this.validate(uuid);
    },
    validateAll() {
      let _this = this, props=['name', 'dataCenterUuid', 'cidrBlock'];
      props.forEach(name => _this.validate(name));
      let invalidInput = props.some(name => _this[`empty${name}`] === true || _this[ `invalid${name}`] === true);
      return invalidInput;
    },
    confirm() {
      let _this = this;
      if(_this.validateAll()) return;
      _this.canCreate = false;
      _this.create(_this.createParam())
           .then(() => {
             _this.close();
           })
           .catch(() => {
             _this.canCreate = true;
           })
    }
  },

  destroyed() {
    let _this = this;
    _this.deleteAllAssistant();
  },
}
</script>

<style lang="less" scoped>
  .cidr-input{
    width: calc(300px / 6 - 26px);
  }
</style>
