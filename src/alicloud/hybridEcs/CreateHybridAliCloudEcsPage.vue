<template>
  <create-template>
    <div slot="header" class="create-header">
      <span class="title">{{$t('hybridecsinstance.createecsinstance')}}</span>
      <span class="create-back el-icon-back" @click="$router.push({name: 'hybridalicloudecs'})">
				返回阿里云云主机列表
			</span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('vm.addType')}}</div>
        <el-radio-group v-model="isSingle">
          <el-radio :label="true">{{$t('common.single')}}</el-radio>
          <el-radio :label="false">{{$t('common.multiple')}}</el-radio>
        </el-radio-group>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" maxlength="255" v-model="name"
               :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-show="emptyname">{{$t('error.emptyInput') + $t('common.name')}}</div>
      </div>

      <div class="operation-row" v-if="!isSingle">
        <div class="title required">{{$t('common.number')}}</div>
        <input type="text" v-model="number" maxlength="255"
               :class="{'is-error': emptynumber || invalidnumber}" @blur="validate('number')"/>
        <div class="error error-text" v-show="emptynumber">{{$t('error.emptyInput') + $t('common.number')}}</div>
        <div class="error error-text" v-show="!emptynumber && invalidnumber">{{$t('error.invalid') +
          $t('common.number')}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea v-model="description" maxlength="255" rows="3"/>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.image')}}</div>
        <help-trigger name="hybirdImage"/>
        <add-or-delete-input @open="openSelectImage()"
                             :value="dbData.hybridImage[hybridImageUuid] && dbData.hybridImage[hybridImageUuid].name"
                             :class="{'is-error': emptyhybridImageUuid}"
                             @remove="removeUuid('hybridImageUuid')"/>
        <div class="error error-text" v-show="emptyhybridImageUuid">
          {{$t('error.unselected') + $t('common.image')}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('hybridesecuritygroup.securitygroup')}}</div>
        <help-trigger name="ecs_securityGroup"/>
        <add-or-delete-input @open="openSecurityGroupSelect"
                             :value="dbData.hybridSecurityGroup[hybridSecurityGroupUuid] && dbData.hybridSecurityGroup[hybridSecurityGroupUuid].name.replace(/-ZStack/g, '')"
                             :class="{'is-error': emptyhybridSecurityGroupUuid}"
                             @remove="removeUuid('hybridSecurityGroupUuid')"/>
        <div class="error error-text" v-show="emptyhybridSecurityGroupUuid">
          {{$t('error.unselected') + $t('hybridesecuritygroup.securitygroup')}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('hybridvswitch.vSwitch')}}</div>
        <add-or-delete-input @open="openVsWitchSelect"
                             :value="dbData.hybridVSwitch[hybridvswitchUuid] && dbData.hybridVSwitch[hybridvswitchUuid].name.replace(/-ZStack/g, '')"
                             :class="{'is-error': emptyhybridvswitchUuid}"
                             @remove="removeUuid('hybridvswitchUuid')"/>
        <div class="error error-text" v-show="emptyhybridvswitchUuid">
          {{$t('error.unselected') + $t('hybridvswitch.vSwitch')}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.instanceOffering')}}</div>
        <help-trigger name="hybirdInstanceOffering"/>
        <add-or-delete-input @open="openInstanceOfferingDlg"
                             :value="dbData.ecsInstanceType[instanceOfferingUuid] && dbData.ecsInstanceType[instanceOfferingUuid].typeId"
                             :class="{'is-error': emptyinstanceOfferingUuid}"
                             @remove="removeUuid('instanceOfferingUuid')"/>
        <div class="error error-text" v-show="emptyinstanceOfferingUuid">
          {{$t('error.unselected') + $t('common.instanceOffering')}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title">{{$t('common.privateNetworkIP')}}</div>
        <input v-model="privateIpAddress"
               :class="{'is-error':privateIpAddress && invalidprivateIpAddress}"
               @blur="validate('privateIpAddress')"
               placeholder="192.168.1.1"
        />
        <p class="text-hint">
          {{cidr ? `CIDR: ${cidr}` : ''}}
        </p>
        <p class="text-hint">
          {{availableIpAddressCount ? `${$t(`common.ipNumber`)}: ${availableIpAddressCount}` : '' }}
        </p>
        <div class="error error-text" v-show="invalidprivateIpAddress">
          {{$t('error.invalid') + $t('common.privateNetworkIP')}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.publicNetworkIP')}}</div>
        <el-select v-model="allocatePublicIpText" style="width: 100%;">
          <el-option v-for="(item, index) in allocatePublicIpList"
                     :key="index"
                     :value="item"
                     :label="item ? $t('hybridecsinstance.allocatePublicIpTrue') : $t('hybridecsinstance.allocatePublicIpFalse')"></el-option>
        </el-select>
      </div>

      <div class="operation-row" v-if="allocatePublicIp">
        <div class="title required">{{$t('hybridecsinstance.ecsBandWidth')}}</div>
        <input v-model="ecsBandWidth" :class="{'is-error': emptyecsBandWidth || invalidecsBandWidth}"
               style="width:73%"/>
        <div class="unit">Mbps</div>
        <div class="error error-text" v-show="emptyecsBandWidth">
          {{$t('error.emptyInput')+$t('hybridecsinstance.ecsBandWidth')}}
        </div>
        <div class="error" v-show="!emptyecsBandWidth && invalidecsBandWidth">
          {{$t('error.invalid')+$t('hybridecsinstance.ecsBandWidth')}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('hybridecsinstance.ecsConsolePassword')}}</div>
         <help-trigger name="hybirdConsolePassword"/>
        <input :placeholder="$t('hybridecsinstance.ecsConsolePasswordInfo')"
               v-model="ecsConsolePassword"
               type="password"
               :class="{'is-error': emptyecsConsolePassword || invalidecsConsolePassword}"
               maxlength="255"
               @blur="validate('ecsConsolePassword')"
        />
        <div class="error error-text" v-show="emptyecsConsolePassword">{{$t('error.emptyInput') +
          $t('hybridecsinstance.ecsConsolePasswordInfo')}}
        </div>
        <div class="error error-text" v-show="!emptyecsConsolePassword && invalidecsConsolePassword">
          {{$t('error.invalid') + $t('hybridecsinstance.ecsConsolePasswordInfo')}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('hybridecsinstance.ecsRootPassword')}}</div>
        <help-trigger name="hybirdRootPassword"/>
        <input :placeholder="$t('hybridecsinstance.ecsRootPasswordInfo')"
               v-model="ecsRootPassword"
               type="password"
               :class="{'is-error': emptyecsRootPassword || invalidecsRootPassword}"
               maxlength="255"
               @blur="validate('ecsRootPassword')"
        />
        <div class="error error-text" v-show="emptyecsRootPassword">{{$t('error.emptyInput') +
          $t('hybridecsinstance.ecsRootPassword')}}
        </div>
        <div class="error error-text" v-show="!emptyecsRootPassword && invalidecsRootPassword">{{$t('error.invalide') +
          $t('hybridecsinstance.ecsRootPassword')}}
        </div>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'hybridalicloudecs'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
  import CreateTemplate from 'src/component/CreateTemplate';
  import Validator from 'src/utils/validator';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import {genUniqueId} from 'src/utils/utils';
  import Methods from './Methods';
  import _ from 'lodash'


  export default {
    name: 'CreateHybridAliCloudEcsPage',

    mixins: [WindowBase],

    components: {
      CreateTemplate,
      AddOrDeleteInput
    },

    data() {
      return {
        isSingle: true,
        name: '',
        emptyname: false,
        number: 1,
        emptynumber: false,
        invalidnumber: false,
        description: '',
        hybridImageUuid: '',
        emptyhybridImageUuid: false,
        hybridSecurityGroupUuid: '',
        emptyhybridSecurityGroupUuid: false,
        hybridvswitchUuid: '',
        emptyhybridvswitchUuid: false,
        instanceOfferingUuid: '',
        emptyinstanceOfferingUuid: false,
        privateIpAddress: '',
        invalidprivateIpAddress: false,
        availableIpAddressCount: null,
        cidr: '',
        allocatePublicIp: false,
        allocatePublicIpList: [false, true],
        ecsBandWidth: '',
        emptyecsBandWidth: false,
        invalidecsBandWidth: false,
        ecsConsolePassword: '',
        emptyecsConsolePassword: false,
        invalidecsConsolePassword: false,
        ecsRootPassword: '',
        emptyecsRootPassword: false,
        invalidecsRootPassword: false,
        canCreate: true
      }
    },

    computed: {
      allocatePublicIpText: {
        get() {
          let self = this;
          return self.allocatePublicIp ? self.$t('hybridecsinstance.allocatePublicIpTrue') : self.$t('hybridecsinstance.allocatePublicIpFalse');
        },
        set(value) {
          let self = this;
          self.allocatePublicIp = value;
        }
      }
    },

    created() {
      let self = this;
      self.queryForAssistant();
    },

    methods: {
      ...Validator,

      ...{
        create: Methods.methods.create
      },

      queryForAssistant() {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${genUniqueId()}`
          let content, hide, handler
          if(operation === 'add'){
            handler = () => {
              self.$router.push({name: `create${resourceName.replace(/Hybrid/, 'HybridAliCloud')}`})
            }
          }
          content = `lackOf${resourceName}`
          hide = false
          if (operation === 'check') {
            content = `disabled${resourceName}`
            let table = {
              HybridDatacenter: 'hybridaliclouddatacenter',
              HybridIdentityZone: 'hybridalicloudidentityzone'
            }
            handler = () => {
              this.$router.push({name: table[resourceName]})
            }
          }
          if (operation === 'jump') {
            content = `lackOf${resourceName}`
            handler = () => {
              window.open('https://common-buy.aliyun.com/?commodityCode=vpn_pre#/buy')
            }
          }
          self.createAssistant({
            id,
            hide,
            title: 'hybridVpnWizardTitle',
            ownerId: self.windowData.id,
            content,
            operation,
            handler
          })
        }
        rpc.query('hybrid/data-center', {count: true}).then(resp => {
          if (resp.total === 0) {
            newAssistant('HybridDataCenter', 'add')
          } else {
            return rpc.query('hybrid/identity-zone', {
              count: true
            }).then(resp => {
              if (resp.total === 0) {
                newAssistant('HybridIdentityZone', 'add')
              }
            })
          }
        })
      },

      validate(name) {
        let obj = this;
        obj[`empty${name}`] = false
        let propToBeTrimed = ['name', 'privateIpAddress']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : this[name]
        if (!input) {
          obj[`empty${name}`] = true
          return
        }
        obj[`invalid${name}`] = false
        if (name === 'privateIpAddress' && !this.isIP(input)) {
          obj[`invalid${name}`] = true
        }
        if (name === 'ecsConsolePassword' && !this.isEcsPassword(input)) {
          obj[`invalid${name}`] = true
        }
        if (name === 'ecsRootPassword' && !this.isEcsRootPassword(input)) {
          obj[`invalid${name}`] = true
        }
        if (name === 'name' && !this.isEcsInstanceName(input)) {
          obj[`invalid${name}`] = true
        }
        let range = {
          maxValue: 200,
          minValue: 1
        }
        if (this.allocatePublicIp) {
          if (name === 'ecsBandWidth') {
            if (!this.isIn(input, range)) {
              obj[`invalid${name}`] = true
            }
          }
        }
      },

      trimProp(name) {
        let self = this;
        return String(self[name]).trim();
      },

      openSelectImage() {
        let self = this;
        self.openDialog('HybridAliCloudImageSingleSelect', {
          conditions: [],
          ok: (uuid) => {
            self.hybridImageUuid = uuid;
            self.validate('hybridImageUuid');
          }
        })
      },

      removeUuid(uuid) {
        let self = this;
        self[uuid] = '';
        self.validate(uuid);
      },

      openSecurityGroupSelect() {
        let self = this;
        if (self.hybridImageUuid === '') {
          self.validate('hybridImageUuid');
          return
        } else {
          let tasks = []
          let p = null
          let hybridImage = _.cloneDeep(self.dbData.hybridImage[self.hybridImageUuid])
          let vpcUuidList = []
          p = rpc.query('hybrid/aliyun/vpc', {
            q: `dataCenterUuid=${hybridImage.dataCenterUuid}`,
            fields: 'uuid'
          }).then((resp) => {
            vpcUuidList = resp.inventories.map(item => item.uuid)
          })
          tasks.push(p)
          Promise.all(tasks)
            .then(() => {
              self.openDialog('HybridAliCloudSingleSelect', {
                conditions: [`ecsVpcUuid?=${vpcUuidList}`],
                ok: self.selectHybridSecurityGroup
              })
            })
        }
      },

      selectHybridSecurityGroup(uuid) {
        let self = this;
        self.hybridSecurityGroupUuid = uuid;
        self.validate('hybridSecurityGroupUuid');
      },

      openInstanceOfferingDlg() {
        let self = this;
        if(!self.hybridvswitchUuid){
          self.validate('hybridvswitchUuid');
          return;
        }
        self.openDialog('HybridAliCloudInstanceOfferingSingleSelect', {
          conditions: [],
          iZoneUuid: self.dbData.hybridVSwitch[self.hybridvswitchUuid].identityZoneUuid,
          ok: (uuid) => {
            self.instanceOfferingUuid = uuid;
            self.validate('instanceOfferingUuid');
          }
        })
      },

      openVsWitchSelect() {
        let self = this;
        if(!self.hybridSecurityGroupUuid) {
          self.validate('hybridSecurityGroupUuid');
          return;
        }
        let hybridSecurityGroup = _.cloneDeep(self.dbData.hybridSecurityGroup[self.hybridSecurityGroupUuid])
        self.openDialog('HybridAliCloudSwitchSingleSelect', {
          conditions: [`ecsVpcUuid=${hybridSecurityGroup.ecsVpcUuid}`],
          ok: (uuid) => {
             self.hybridvswitchUuid = uuid;
             self.initPrivateIpAddress()
             self.validate('hybridvswitchUuid')
          }
        })
      },

      initPrivateIpAddress() {
        let self = this;
        let cidr = self.dbData.hybridVSwitch[self.hybridvswitchUuid].cidrBlock
        let availableIpAddressCount = self.dbData.hybridVSwitch[self.hybridvswitchUuid].availableIpAddressCount;
        self.cidr = cidr;
        self.availableIpAddressCount = availableIpAddressCount;
      },

      validateAll() {
        let invalidInput = false, self = this;
        let props = ['name', 'hybridImageUuid', 'instanceOfferingUuid', 'hybridSecurityGroupUuid', 'hybridvswitchUuid', 'ecsRootPassword', 'ecsConsolePassword']
        if (self.privateIpAddress !== '') props.push('privateIpAddress')
        if (self.allocatePublicIp) props.push('ecsBandWidth')
        props.forEach(item => self.validate(item))
        let isInvalid = props.some(item => self[`empty${item}`] || self[`invalid${item}`])
        if (isInvalid) invalidInput = true
        return invalidInput;
      },

      confirm() {
        let self = this, invalid = self.validateAll();
        if (invalid) return;
        self.canCreate = false;
        self.create(self.createParam(), self.number)
          .then(() => {
            self.$router.push({name: 'hybridalicloudecs'});
          }).catch(() => {
          self.canCreate = true;
        })
      },

      createParam() {
        let self = this;
        return {
          name: self.name,
          description: self.description === '' ? undefined : self.description,
          ecsImageUuid: self.hybridImageUuid,
          instanceType: self.dbData.ecsInstanceType[self.instanceOfferingUuid].typeId,
          allocatePublicIp: self.allocatePublicIp,
          privateIpAddress: self.privateIpAddress === '' ? undefined : self.privateIpAddress,
          ecsSecurityGroupUuid: self.hybridSecurityGroupUuid,
          ecsVSwitchUuid: self.hybridvswitchUuid,
          ecsRootPassword: self.ecsRootPassword,
          ecsBandWidth: self.ecsBandWidth,
          ecsConsolePassword: self.ecsConsolePassword
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .text-hint {
    font-size: 12px;
    text-align: right;
    line-height: 20px;
  }

  .unit {
    display: inline-block;
    height: 40px;
    border: 1px solid #dae0e6;
    width: 20%;
    line-height: 40px;
    text-align: center;
    border-left: none;
    margin-left: -2px;
  }
</style>
