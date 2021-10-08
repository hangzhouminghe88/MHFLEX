<template>
  <create-template>
    <div slot="header" class="create-header">
      <span> {{ $t("hybridAliyunDisk.create") }}</span>
      <span class="create-back"  @click="$router.push({name:'hybridaliclouddisk'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">
          回到阿里云云盘列表
        </span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required"> {{$t('hybrididentityzone.identityzone')}}</div>
        <add-or-delete-input :value="dbData.hybridIdentityZone[identityZoneUuid] && dbData.hybridIdentityZone[identityZoneUuid].zoneName"
                             @open="openHybridIdentityZoneSelect"
                             @remove="removeUuid('identityZoneUuid')"
                             :class="{'is-error': emptyidentityZoneUuid}"/>
        <div class="error error-text" v-show="emptyidentityZoneUuid">
          {{$t('error.unselected') + $t('hybrididentityzone.identityzone')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <help-trigger name="hybridVolumeName" />
       <input type="text" maxlength="255"
              v-model="name"
              :class="{'is-error': emptyname}"
              @blur="validate('name')"/>
        <div class="error error-text" v-show="emptyname">
          {{$t('error.emptyInput') + $t('common.name')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea v-model="description" rows="3"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('hybridAliyunDisk.sizeWithGB')}}</div>
        <input  min="20" max="32768" type="number"  step="any"
                placeholder="20-32768" v-model="diskSize"
               :class="{'is-error': emptydiskSize || invaliddiskSize}"
               @blur="validate('diskSize')"
               style="width: 62%"/>
        <span class="unit">G</span>
        <div class="error error-text" v-show="emptydiskSize">
          {{$t('error.emptyInput') + $t('hybridAliyunDisk.sizeWithGB')}}
        </div>
        <div class="error error-text" v-if="!emptydiskSize && invaliddiskSize">
          {{$t('error.invalid')+$t('hybridAliyunDisk.sizeWithGB')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{ $t("hybridAliyunDisk.diskCategory") }}</div>
        <el-radio v-model="diskType" label="efficiency">{{ $t("hybridAliyunDisk.cloud_efficiency") }}</el-radio>
        <el-radio v-model="diskType" label="cloud_ssd">{{ $t("hybridAliyunDisk.cloud_ssd") }}</el-radio>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <div class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</div>
      <div class="btn-cancel" @click="$router.push({name:'hybridaliclouddisk'})">{{$t('common.cancel')}}</div>
    </div>
  </create-template>
</template>

<script>
  import AddOrDeleteInput from "src/component/AddOrDeleteInput";
  import CreateTemplate from "src/component/CreateTemplate";
  import { genUniqueId } from  'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';


  export default {
    name: "CreateHybridAliCloudDiskPage",

    components: {AddOrDeleteInput, CreateTemplate},

    mixins: [WindowBase],

    created() {
      let self = this;
      self.queryForAssistant();
    },

    destroyed() {
      let self = this;
      self.deleteAllAssistant();
    },

    data() {
      return {
        name: '',
        emptyname: false,
        description: '',
        diskSize: '',
        emptydiskSize: false,
        invaliddiskSize: false,
        diskType: 'efficiency',
        identityZoneUuid: '',
        emptyidentityZoneUuid: false,
        canCreate: true
      }
    },

    methods: {
      ...{
        create: Methods.methods.create
      },

      validate(name) {
        let self = this;
        self[`empty${name}`] = false
        self[`invalid${name}`] = false
        let input = name === 'name' ? String(self[name]).trim() : self[name]
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        if (name === 'diskSize') {
          if (self[name] > 32768 || self[name] < 20) {
            self[`invalid${name}`] = true
          }
        }
      },

      validateAll() {
        let self = this, props = ['name', 'identityZoneUuid', 'diskSize'];
        props.forEach((name) => self.validate(name));
        let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return invalid;
      },

      openHybridIdentityZoneSelect() {
        let self = this;
        self.openDialog('HybridAliCloudIdentityZoneSingleSelect', {
          conditions: [],
          select: (uuid) => self.selectHybridIdentityZone(uuid)
        })
      },

      selectHybridIdentityZone(uuid) {
        let self = this;
        self.identityZoneUuid = uuid;
        self.validate('identityZoneUuid');
      },

      removeUuid(uuid) {
        let self = this;
        self[uuid] = '';
        self.validate(uuid);
      },

      queryForAssistant () {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${genUniqueId()}`
          self.createAssistant({
            id,
            hide: false,
            title: 'hybridDiskTitle',
            ownerId: self.windowData.id,
            content: `lackOf${resourceName}`,
            operation,
            handler: () => {
              // self.openFullMainWindow(`Add${resourceName}Dlg`,
              //   {
              //     ok: (param) => {
              //       self[`create${resourceName}`](param).then(() => {
              //         self.queryForAssistant()
              //       }, () => {
              //         self.queryForAssistant()
              //       })
              //     },
              //     cancel: () => {
              //       self.queryForAssistant()
              //     }
              //   }
              // )
            }
          })
        }
        rpc.query('hybrid/identity-zone', {count: true}).then(resp => {
          if (resp.total === 0) {
            newAssistant('HybridIdentityZone', 'add')
          }
        })
      },

      createParam() {
        let self = this;
        return {
          name: self.name,
          description: self.description === '' ? undefined : self.description,
          identityUuid: self.identityZoneUuid,
          diskCategory: `cloud_${self.diskType}`,
          sizeWithGB: self.diskSize,
        }
      },

      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'hybridaliclouddisk'})
          }).catch(() => {
          self.canCreate = true;
        });
      }
    }
  }
</script>

<style scoped>
  .unit{
    display: inline-block;
    height: 40px;
    line-height: 40px;
    border: 1px solid #adb0b8;
    width: calc(30% - 1px);
    text-align: center;
    margin-left: -1px;
    border-radius: 2px;
  }
</style>
