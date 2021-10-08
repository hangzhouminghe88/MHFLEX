<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('hybridvpcuservpngateway.create')}}</span>
      <span class="create-back" @click="$router.push({name: 'hybridalicloudvpcuservpngateway'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到阿里云用户网关列表</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name"
               :class="{'is-error': emptyname || invalidname}"
               @blur="validate('name')"/>
        <div class="error error-text" v-show="emptyname && !invalidname">
          {{$t('error.emptyInput') + $t('common.name')}}
        </div>
        <div class="error error-text" v-show="!emptyname && invalidname">
          {{$t('error.invalidName') + $t('common.name')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{'MHFLEX ' + $t('common.ip')}}</div>
        <input type="text" v-model="ip"
               :class="{'is-error': emptyip || invalidip}"
               @blur="validate('ip')"/>
        <div class="error error-text" v-show="emptyip && !invalidip">
          {{$t('error.emptyInput') + 'MHFLEX ' + $t('common.ip')}}
        </div>
        <div class="error error-text" v-show="!emptyip  && invalidip">
          {{$t('error.invalid') + 'MHFLEX ' + $t('common.ip')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.hybridDatacenter')}}</div>
        <add-or-delete-input :value="dbData.hybridDataCenter[dataCenterUuid] && dbData.hybridDataCenter[dataCenterUuid].regionName"
                             @open="openDataCenterSelect"
                             :class="{'is-error': emptydataCenterUuid}"
                             @remove="removeUuid('dataCenterUuid')"/>
        <div class="error error-text" v-show="emptydataCenterUuid">
          {{$t('error.emptyInput') + $t('common.hybridDatacenter')}}
        </div>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'hybridalicloudvpcuservpngateway'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import AddOrDeleteInput from "src/component/AddOrDeleteInput";
  import CreateTemplate from "src/component/CreateTemplate";
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import Methods from '../Methods';


  export default {

    name: "CreateHybridAliCloudUserVpcVpnGatewayPage",

    components: {AddOrDeleteInput, CreateTemplate},

    mixins: [WindowBase],

    data() {
      return {
        name:'',
        emptyname: false,
        invalidname: false,
        description: '',
        ip: '',
        emptyip: false,
        invalidip: false,
        dataCenterUuid: '',
        emptydataCenterUuid: false,
        canCreate: true
      }
    },

    methods: {
      ...Validator,

      ...{
        create: Methods.methods.create
      },

      openDataCenterSelect() {
        let self = this;
        self.openDialog('HybridAliCloudDataCenterSingleSelect', {
          conditions: [],
          select: (uuid) => {
            self.dataCenterUuid = uuid;
            self.validate('dataCenterUuid');
          }
        })
      },

      removeUuid(uuid) {
        this[uuid] = '';
        this.validate('dataCenterUuid');
      },

      validate(name) {
        let self = this, input = '';
        self[`empty${name}`] = false;
        self[`invalid${name}`] = false;
        input = String(self[name]).trim();
        if(/^\s*$/.test(input)) {
          self[`empty${name}`] = true;
          return;
        }
        if(name === 'ip') {
          if(!self.isIP(input)) {
            self[`invalid${name}`] = true;
            return;
          }
        }
        if(name === 'name') {
          if(/^[0-9]*$/.test(input)){
            self[`invalid${name}`] = true;
            return;
          }
        }
      },

      validateAll() {
        let self = this, props = ['name', 'ip', 'dataCenterUuid'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return invalid;
      },

      createParam() {
        let self = this;
        return {
          name: self.name.trim(),
          description: self.description,
          dataCenterUuid: self.dataCenterUuid,
          ip: self.ip
        }
      },

      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name:'hybridalicloudvpcuservpngateway'})
          }).catch(() => {
            self.canCreate = true;
        })
      }
    }
  }
</script>

<style scoped>

</style>
