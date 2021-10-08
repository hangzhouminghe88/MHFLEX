<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('hybrididentityzone.addidentityzone')}}</span>
      <span class="create-back" @click="$router.push({name:'hybridalicloudidentityzone'})">
			  <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到阿里云可用区列表</span>
			</span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">
          {{$t('common.hybriddatacenter')}}
        </div>
        <add-or-delete-input
          :value="dbData.hybridDataCenter[hybridDataCenterUuid] && dbData.hybridDataCenter[hybridDataCenterUuid].regionName"
          :class="{'is-error': emptyhybridDataCenterUuid}"
          @open="openHybridDataCenterSelect"
          @remove="removeUuid('hybridDataCenterUuid')"
        />
        <div class="error error-text" v-if="emptyhybridDataCenterUuid">{{$t('error.emptyInput') +
          $t('common.hybriddatacenter')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{$t('hybrididentityzone.identityzone') }}
        </div>
        <el-select v-model="getIdentityzone" style="width: 100%;">
          <el-option
            v-for="(item, index) in windowData.identityZoneList"
            :key="index"
            :value="item.zoneId"
            :label="item.label"
            @click.native="changeIdentityzone(item)"
          ></el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.description')}}</div>
        <textarea v-model="description"
                  :class="{'is-error': emptydescription}"
                  maxlength="255"
                  rows="3"
                  @blur="validate('description')"
        />
        <div class="error error-text" v-if="emptydescription">{{$t('error.emptyInput') + $t('common.description')}}
        </div>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$router.push({name:'hybridalicloudidentityzone'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import {checkHybridDataCenterAssistant} from 'src/alicloud/dataCenter/Assistant/HybridDataCenterAssistant';
  import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
  import CreateTemplate from 'src/component/CreateTemplate';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Methods from './Methods'

  export default {
    name: 'HybridAliCloudIdentityZoneCreatePage',

    mixins: [WindowBase],

    components: {
      CreateTemplate,
      AddOrDeleteInput
    },

    data() {
      return {
        hybridDataCenterUuid: '',
        emptyhybridDataCenterUuid: false,
        description: '',
        emptydescription: false,
        canCreate: true
      }
    },

    created() {
      let self = this;
      checkHybridDataCenterAssistant('aliyun', self);
      self.$route.params.dataCenterUuid ? self.hybridDataCenterUuid = self.$route.params.dataCenterUuid : self.hybridDataCenterUuid = '';
        self.updateWindow({
        localName: '',
        zoneId: '',
        type: 'aliyun',
        identityZoneList: [],
      }).then(() => {
        self.initDataCenter();
      })
    },

    methods: {
      ...{
        create: Methods.methods.create
      },

      validate(name) {
        let self = this, input = '';
        input = String(self[name]).trim();
        self[`empty${name}`] = false;
        if (!input) {
          self[`empty${name}`] = true;
          return;
        }
      },

      openHybridDataCenterSelect() {
        let self = this;
        self.validate('hybridDataCenterUuid');
        self.openDialog('HybridAliCloudDataCenterSingleSelect', {
          conditions: [],
          select: (uuid) => {
            self.hybridDataCenterUuid = uuid;
            self.validate('hybridDataCenterUuid');
            self.getIdentityZoneFromRemote(uuid);
          }
        })
      },

      initDataCenter() {
        let self = this;
        rpc.query('hybrid/hybrid/key', {
          q: ['current=true', 'type=aliyun']
        }).then((resp) => {
          if (resp.inventories.length === 1) {
            rpc.query('system-tags', {
              q: ['resourceType=DataCenterVO', `tag=accesskey::${resp.inventories[0].akey}`]
            }).then((dataCenterInventory) => {
              if (dataCenterInventory.inventories.length === 1) {
                let dataCenterUuid = dataCenterInventory.inventories[0].resourceUuid
                rpc.query(`hybrid/data-center/${dataCenterUuid}`)
                  .then((respDataCenter) => {
                    self.updateDbTable({
                      tableName: 'hybridDataCenter',
                      list: respDataCenter.inventories
                    })
                    self.hybridDataCenterUuid = dataCenterUuid;
                    self.getIdentityZoneFromRemote(dataCenterUuid)
                  })
              }
            })
          }
        })
      },
      //查询可用区
      getIdentityZoneFromRemote(uuid) {
        let identityZoneList = []
        let zoneId = ''
        let localName = ''
        let isAvailableInstanceTypes = true
        rpc.query('hybrid/identity-zone/remote', {
          dataCenterUuid: uuid,
          type: 'aliyun'
        }).then((resp) => {
          identityZoneList = resp.inventories.map((it) => {
            return {
              label: it.localName,
              zoneId: it.zoneId,
              localName: it.localName,
              availableInstanceTypes: it.availableInstanceTypes
            }
          })
          zoneId = identityZoneList[0].zoneId
          localName = identityZoneList[0].localName;
          isAvailableInstanceTypes = identityZoneList[0].availableInstanceTypes.length > 0
          this.updateWindow({identityZoneList, zoneId, localName, isAvailableInstanceTypes})
          rpc.query(`hybrid/hybrid/key`, {
            q: ['current=true', 'type=aliyun']
          })
            .then((resp) => {
              this.description = `AK:${resp.inventories[0].name},${this.windowData.localName}`
            })
        })
      },

      changeIdentityzone(item) {
        let self = this;
        self.updateWindow({
          'localName': item.localName,
          'zoneId': item.zoneId,
          'isAvailableInstanceTypes': item.availableInstanceTypes.length > 0
        });
        self.updateDescription();
      },

      updateDescription() {
        rpc.query(`hybrid/hybrid/key`, {
          q: ['current=true', 'type=aliyun']
        })
          .then((resp) => {
            this.description = `AK:${resp.inventories[0].name},${this.windowData.localName}`
            this.validate('description')
          })
      },

      removeUuid(uuid) {
        let self = this;
        self[uuid] = '';
      },

      validateAll() {
        let self = this, invalid = false, props = ['hybridDataCenterUuid', 'description'];
        props.forEach(name => {
          self.validate(name);
        })
        invalid = props.some((name) => self[`empty${name}`] === true);
        return invalid;
      },

      confirm() {
        let self = this, invalid = self.validateAll();
        if (invalid || !self.windowData.zoneId || !self.windowData.localName) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'hybridalicloudidentityzone'});
          }).catch(() => {
            self.canCreate = true;
          });
      },

      createParam() {
        let self = this;
        return {
          type: this.windowData.type,
          description: this.description,
          zoneId: this.windowData.zoneId,
          dataCenterUuid: this.hybridDataCenterUuid,
          localName: this.windowData.localName
        }
      }
    },

    destroyed() {
      let self = this;
      self.deleteAllAssistant();
      self.closeAllDialog();
    },

    computed: {
      getIdentityzone: {
        get() {
          let self = this;
          return `${self.windowData.localName}${self.windowData.isAvailableInstanceTypes ? '' : '(' + self.$t("hybrididentityzone.noInstanceType") + ')'}`;
        },
        set() {
          
        }
      }
    }
  }
</script>

<style scoped>

</style>
