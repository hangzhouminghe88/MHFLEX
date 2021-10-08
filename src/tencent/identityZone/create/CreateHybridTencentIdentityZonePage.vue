<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('hybrididentityzone.addidentityzone')}}</span>
      <span class="create-back" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">
          回到腾讯云可用区详情列表
        </span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <mh-input :label="'common.hybridDatacenter'"
                type= 'add'
                :required="true"
                :show-error="emptydataCenterUuid"
                :error-message="rules.dataCenterUuid.message"
                @validate="validate"
                prop="dataCenterUuid">
        <add-or-delete-input @open="openDataCenterSelect"
                             :value="dbData.hybridTencentDataCenter[dataCenterUuid] &&
                             dbData.hybridTencentDataCenter[dataCenterUuid].regionName"
                             :class="{'is-error': emptydataCenterUuid}"
                             @remove="removeUuid('dataCenterUuid')"/>
      </mh-input>

      <mh-input type="select"
                :label="'common.hybrididentityzone'"
                :required="true"
                v-model="localName"
                :show-error="emptylocalName"
                :select-group="identityZoneGroup"
                :error-message="rules.localName.message"
                @validate="validate"
                prop="localName"
                @changeOption="handleChangeOption"/>

      <mh-input type="textarea"
                :label="'common.description'"
                :required="true"
                v-model="description"
                :error-message="rules.description.message"
                @validate="validate"
                :show-error="emptydescription"
                prop="description"/>
    </div>

    <div slot="footer" class="create-footer">
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
  import { checkHybridTencentDataCenterAssistant } from 'src/tencent/dataCenter/assistant/tencentDataCenterAssistant';
  import AddOrDeleteInput from "src/component/AddOrDeleteInput";
  import CreateTemplate from "src/component/CreateTemplate";
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';
  import rpc from 'src/utils/rpc';

  export default {
    name: "CreateHybridTencentIdentityZonePage",

    mixins: [WindowBase],

    components: {AddOrDeleteInput, CreateTemplate},

    data() {
      return {
        localName: '(' + this.$t('hybrididentityzone.noInstanceType') + ')',
        emptylocalName: false,
        emptydescription: false,
        emptydataCenterUuid: false,
        identityZoneGroup: [],
        dataCenterUuid: '',
        description: '',
        canCreate: true,
        rules: {
          localName: {message: ''},
          dataCenterUuid: {message: ''},
          description: {message: ''}
        },
        zoneId: '',
        isAvailableInstanceTypes: true
      }
    },

    created() {
      checkHybridTencentDataCenterAssistant(this);
      this.dataCenterUuid = this.$route.params.dataCenterUuid ? this.$route.params.dataCenterUuid : '';
      this.getIdentityZoneFromRemote(this.dataCenterUuid)
      if(!!this.dataCenterUuid)
        this.getIdentityZoneFromRemote(this.dataCenterUuid)
      else
        this.init();
    },

    methods: {
      ...{
        create: Methods.methods.create
      },
      //回到可用区
      close() {
        let self = this;
        self.$router.push({name: 'hybridtencentidentityzone'})
      },
      //单个校验可用区
      validate(name) {
        let self = this, input = '';
        input = self[`${name}`];
        self.rules[`${name}`].message = '';
        self[`empty${name}`] = false;
        if(!input) {
          self[`empty${name}`] = true;
          self.rules[`${name}`].message = ['dataCenterUuid', 'localName'].includes(name) ?
            self.$t('error.unselected') + self.$t(`common.hybridDatacenter`) : self.$t('error.emptyInput') + self.$t(`common.${name}`);
          return;
        }
      },
      //初始化地域、可用区
      init() {
        let self = this;
        rpc.query('hybrid/tencent/key', {
          q: ['current=true']
        }).then((resp) => {
          if (resp.inventories.length === 1) {
            rpc.query('system-tags', {
              q: ['resourceType=TencentDataCenterVO', `tag=accesskey::${resp.inventories[0].secretId}`]
            }).then((dataCenterInventory) => {
              if (dataCenterInventory.inventories.length === 1) {
                let dataCenterUuid = dataCenterInventory.inventories[0].resourceUuid
                rpc.query(`hybrid/tencent/data-center/${dataCenterUuid}`)
                  .then((respDataCenter) => {
                    self.updateDbTable({
                      tableName: 'hybridTencentDataCenter',
                      list: respDataCenter.inventories
                    })
                    self.dataCenterUuid = dataCenterUuid;
                    self.getIdentityZoneFromRemote(dataCenterUuid)
                  })
              }
            })
          }
        })
      },
      //或得可用区列表
      getIdentityZoneFromRemote (uuid) {
        let identityZoneList = [], _this = this;
        rpc.query('hybrid/tencent/identity-zone/remote', {
          dataCenterUuid: uuid,
          type: 'tencent'
        }).then((resp) => {
          identityZoneList = resp.inventories
          _this.identityZoneGroup = [];
          for(let i in identityZoneList) {
            if(identityZoneList[i].zoneId.match('shanghai')) {
              if(identityZoneList[i].localName === '上海二区' || identityZoneList[i].localName === '上海三区' || identityZoneList[i].localName === '上海四区') {
                _this.identityZoneGroup.push({
                  label: identityZoneList[i].localName,
                  value: identityZoneList[i].localName,
                  zoneId: identityZoneList[i].zoneId,
                  availableInstanceTypes: identityZoneList[i].availableInstanceTypes
                })
              }
            }
            if(identityZoneList[i].zoneId.match('beijing')){
              if(identityZoneList[i].localName === '北京一区' || identityZoneList[i].localName === '北京二区' || identityZoneList[i].localName === '北京三区' || identityZoneList[i].localName === '北京四区' || identityZoneList[i].localName === '北京五区') {
                 _this.identityZoneGroup.push({
                  label: identityZoneList[i].localName,
                  value: identityZoneList[i].localName,
                  zoneId: identityZoneList[i].zoneId,
                  availableInstanceTypes: identityZoneList[i].availableInstanceTypes
                })
              }
            }
            if(identityZoneList[i].zoneId.match('guangzhou')) {
               if(identityZoneList[i].localName === '广州三区' || identityZoneList[i].localName === '广州四区') {
                _this.identityZoneGroup.push({
                 label: identityZoneList[i].localName,
                 value: identityZoneList[i].localName,
                 zoneId: identityZoneList[i].zoneId,
                 availableInstanceTypes: identityZoneList[i].availableInstanceTypes
                })
              }
            }
            if(identityZoneList[i].zoneId.match('singapore')) {
               if(identityZoneList[i].localName === '新加坡一区') {
                _this.identityZoneGroup.push({
                 label: identityZoneList[i].localName,
                 value: identityZoneList[i].localName,
                 zoneId: identityZoneList[i].zoneId,
                 availableInstanceTypes: identityZoneList[i].availableInstanceTypes
                })
              }
            }
            if(identityZoneList[i].zoneId.match('hongkong')) {
               if(identityZoneList[i].localName === '香港一区' || identityZoneList[i].localName === '香港二区') {
                _this.identityZoneGroup.push({
                 label: identityZoneList[i].localName,
                 value: identityZoneList[i].localName,
                 zoneId: identityZoneList[i].zoneId,
                 availableInstanceTypes: identityZoneList[i].availableInstanceTypes
                })
              }
            }
            if(identityZoneList[i].zoneId.match('guangzhou-open')) {
               if(identityZoneList[i].localName === '广州OPEN专区') {
                _this.identityZoneGroup.push({
                 label: identityZoneList[i].localName,
                 value: identityZoneList[i].localName,
                 zoneId: identityZoneList[i].zoneId,
                 availableInstanceTypes: identityZoneList[i].availableInstanceTypes
                })
              }
            }
            if(identityZoneList[i].zoneId.match('chongqing')) {
               if(identityZoneList[i].localName === '重庆一区') {
                _this.identityZoneGroup.push({
                 label: identityZoneList[i].localName,
                 value: identityZoneList[i].localName,
                 zoneId: identityZoneList[i].zoneId,
                 availableInstanceTypes: identityZoneList[i].availableInstanceTypes
                })
              }
            }

             if(identityZoneList[i].zoneId.match('chengdu')) {
               if(identityZoneList[i].localName === '成都一区' || identityZoneList[i].localName === '成都二区') {
                _this.identityZoneGroup.push({
                 label: identityZoneList[i].localName,
                 value: identityZoneList[i].localName,
                 zoneId: identityZoneList[i].zoneId,
                 availableInstanceTypes: identityZoneList[i].availableInstanceTypes
                })
              }
            }
          }
          if( _this.identityZoneGroup &&  _this.identityZoneGroup.length >0) {
            _this.zoneId = _this.identityZoneGroup[0].zoneId
            _this.localName = _this.identityZoneGroup[0].label
            _this.isAvailableInstanceTypes = _this.identityZoneGroup[0].availableInstanceTypes.length > 0;
          }
          rpc.query(`/hybrid/tencent/key`, {
            q: 'current=true'
          })
            .then((resp) => {
              _this.description = `SK:${resp.inventories[0].name},${_this.localName}`
            })
        })
      },

      removeUuid(uuid) {
        this[uuid] = '';
        this.validate(uuid);
        this.description = '';
        this.localName = '';
        this.identityZoneGroup = [];
      },
      //选择地域，生成可用区
      openDataCenterSelect() {
        let self = this;
        self.openDialog('HybridTencentDataCenterSingleSelect', {
          select: (uuid) => {
            self.dataCenterUuid = uuid;
            self.validate('dataCenterUuid');
            self.getIdentityZoneFromRemote(uuid);
          }
        })
      },
      //整体校验
      validateAll () {
        let self = this, props = ['localName', 'dataCenterUuid', 'description'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) =>  self[`empty${name}`] === true);
        return invalid;
      },
      createParam() {
        return {
          type: 'tencent',
          description: this.description,
          zoneId: this.zoneId,
          dataCenterUuid: this.dataCenterUuid,
          localName: this.localName
        }
      },
      //添加可用区
      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then( () => {
            self.close();
          }).catch(() => {
            self.canCreate = true;
        })
      },

      handleChangeOption(item) {
      let self = this;
      self.description = `SK:SecretKey,${item.label}`;
      self.zoneId = item.zoneId;
    },
    },

    destroyed() {
      this.deleteAllAssistant();
    }
  }
</script>

<style scoped>

</style>
