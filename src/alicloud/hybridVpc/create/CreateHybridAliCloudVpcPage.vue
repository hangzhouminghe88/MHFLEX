<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('hybridvirtualprivatecloud.createVirtualPrivateCloud')}}</span>
      <span class="create-back el-icon-back" @click="$router.push({name: 'hybridalicloudvpc'})">
        <span class="text" style="font-size: 12px;">回到阿里云Vpc列表</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.hybriddatacenter')}}</div>
        <add-or-delete-input :value="dbData.hybridDataCenter[dataCenterUuid]
                              && dbData.hybridDataCenter[dataCenterUuid].regionName"
                              @open="openHybridDataCenterSelect"
                              :class="{'is-error': emptydataCenterUuid}"
                              @remove="removeUuid('dataCenterUuid')"/>
        <div class="error error-text" v-show="emptydataCenterUuid">
          {{$t('error.unselected') + $t('common.hybriddatacenter')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name"
               :class="{'is-error': emptyname || invalidname}"
        @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
        <div class="error error-text" v-if="!emptyname && invalidname">{{$t('error.invalid') + $t('common.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea v-model="description" rows="3"/>
      </div>
      <div class="operation-row">
        <div class="title required">CIDR</div>
        <help-trigger name="vpcCidr"/>
        <el-select v-model="cidrBlock" style="width: 100%;">
          <el-option value="192.168.0.0/16" label="192.168.0.0/16"></el-option>
          <el-option value="172.16.0.0/12" label="172.16.0.0/12"></el-option>
          <el-option value="10.0.0.0/8" lang="10.0.0.0/8"></el-option>
        </el-select>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel"  @click="$router.push({name: 'hybridalicloudvpc'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import AddOrDeleteInput from "src/component/AddOrDeleteInput";
  import CreateTemplate from "src/component/CreateTemplate";
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';

  export default {
    name: "CreateHybridAliCloudVpcPage",

    components: {AddOrDeleteInput, CreateTemplate},

    mixins: [WindowBase],

    data() {
      return {
        cidrBlock: '192.168.0.0/16',
        name: '',
        description: '',
        emptyname: false,
        invalidname: false,
        dataCenterUuid: '',
        emptydataCenterUuid: false,
        canCreate: true
      }
    },

    methods: {
      ...{
        create: Methods.methods.create
      },

      validate(name){
        let self = this;
        self[`empty${name}`] = false;
        if(/^\s*$/.test(self[name].trim())) {
          self[`empty${name}`] = true;
          return;
        }
        self[`invalid${name}`] = false
        if(name === 'name') {
          if(/^[0-9]*$/.test(self[name].trim())){
            self[`invalid${name}`] = true;
            return;
          }
        }
      },

      openHybridDataCenterSelect() {
        let self = this;
        self.openDialog('HybridAliCloudDataCenterSingleSelect',{
          conditions: [],
          select: (uuid) => self.selectDataCenter(uuid)
        })
      },

      selectDataCenter(uuid) {
        let self = this;
        self.dataCenterUuid = uuid;
        self.validate('dataCenterUuid');
      },

      removeUuid(uuid){
        let self = this;
        self[uuid] = '';
        self.validate(uuid);
      },

      createParam () {
        let self = this;
        return {
          name: self.name,
          description: self.description,
          cidrBlock: self.cidrBlock,
          dataCenterUuid: self.dataCenterUuid,
          vRouterName: `VRouter-VPC-${self.name}`
        }
      },

      validateAll() {
        let self = this, props = ['name', 'dataCenterUuid'];
        props.forEach((name) => {
          self.validate(name)
        });
        let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return invalid;
      },

      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'hybridalicloudvpc'})
          }).catch(() => {
            self.canCreate = true;
        })
      }
    }
  }
</script>

<style scoped>

</style>
