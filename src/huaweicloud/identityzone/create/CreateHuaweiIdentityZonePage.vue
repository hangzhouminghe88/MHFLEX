<template>
  <create-template>
    <div slot="header" class="create-header">
      <span class="create-title">{{$t('hybrididentityzone.addidentityzone')}}</span>
      <span class="create-back el-icon-back" @click="close()">
        回到华为云可用区列表
      </span>
    </div>
    <div slot="body">
      <!--选择地域-->
      <mh-input :label="$t('common.hybridDatacenter')"
                type="slot"
                :show-error="emptydataCenterUuid"
                :required="true"
                :error-message="rules.message.dataCenterUuid"
                @validate="validate('dataCenterUuid')">
        <add-or-delete-input :value="dbData.hybridHuaweiyunDataCenter[dataCenterUuid] && dbData.hybridHuaweiyunDataCenter[dataCenterUuid].regionName"
                             @open="openSelectHuaweiDataCenter()"
                             @remove="removeDataCenterUuid('dataCenterUuid')"/>
      </mh-input>
      <!--可用区-->
      <mh-input :label="$t('common.hybrididentityzone')"
                type="select"
                v-model="idenityzoneUuid"
                :show-error="emptyidentityZoneUuid"
                :selectGroup="identityZoneList"
                @changeOption="handleSelect"
                :required="true"
                :error-message="rules.message.identityzoneUuid"
                @validate="validate('identityzoneUuid')"></mh-input>
      <!--简介-->
      <mh-input :label="$t('common.description')"
                type="textarea"
                :required="true"
                placeholder="请输入简介"
                :show-error="emptydescription"
                :error-message="rules.message.description"
                v-model="description"
                @validate="validate('description')"></mh-input>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm">
        {{$t('common.ok')}}
      </span>
      <span class="btn-cancel" @click="close()">
        {{$t('common.cancel')}}
      </span>
    </div>
  </create-template>
</template>

<script>
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import CreateTemplate from "../../../component/CreateTemplate";
  import WindowBase from '../../../windows/Window';
  import {genUniqueId} from 'src/utils/utils';
  import rpc from '../../../utils/rpc';
  import Methods from '../Methods';

  export default {
    name: "CreateHuaweiIdentityZonePage",
    mixins: [WindowBase],
    components: {AddOrDeleteInput, CreateTemplate},
    data() {
      return {
        rules: {
          message: {
            dataCenterUuid: '',
            identityzoneUuid: ''
          }
        },
        emptydataCenterUuid:  false,
        emptyidentityZoneUuid: false,
        emptydescription: false,
        description: '',
        dataCenterUuid: '',
        idenityzoneUuid: '',
        localName: '',
        isAvailableInstanceTypes: false,
        identityZoneList: [],
        type: 'huawei'
      }
    },
    created() {
      this.init()
      this.queryHuaweiForAssistant();
    },
    methods: {
      ...{
        create: Methods.methods.create
      },
      //初始化地域可用区
      init() {
        const self = this
        rpc.query('brid/huawei/key', {
          q: 'current=true'
        }).then((resp) => {
          if (resp.inventories.length === 1) {
            rpc.query('system-tags', {
              q: ['resourceType=HDataCenterVO', `tag=accessKey::${resp.inventories[0].akey}`]
            }).then((dataCenterInventory) => {
              if (dataCenterInventory.inventories.length === 1) {
                let dataCenterUuid = dataCenterInventory.inventories[0].resourceUuid
                rpc.query(`brid/data-center/${dataCenterUuid}`)
                  .then((respDataCenter) => {
                    self.updateDbTable({
                      tableName: 'hybridHuaweiyunDataCenter',
                      list: respDataCenter.inventories
                    })
                    self.dataCenterUuid = dataCenterUuid
                    self.getIdentityZoneFromRemote(dataCenterUuid)
                  })
              }
            })
          }
        })
      },
      //从远端获取可用区
      getIdentityZoneFromRemote(uuid) {
        let identityZoneList = []
        rpc.query('brid/identity-zone/remote', {
          dataCenterUuid: uuid,
          type: 'huawei'
        }).then((resp) => {
          identityZoneList = resp.inventories;
          this.identityZoneList = identityZoneList.map((it) => {
            return {
              label: it.localName,
              value: it.zoneId,
              isAvailableInstanceTypes: identityZoneList[0] && identityZoneList[0].availableInstanceTypes && identityZoneList[0].availableInstanceTypes.length > 0
            }
          })
          if(identityZoneList.length !== 0 ){
            this.idenityzoneUuid = identityZoneList[0].zoneId
            this.localName = identityZoneList[0].localName
            this.isAvailableInstanceTypes = identityZoneList[0].availableInstanceTypes.length > 0
          }else{
            this.idenityzoneUuid = ''
            this.localName = ''
            this.isAvailableInstanceTypes = true
          }
          rpc.query(`brid/huawei/key`, {
            q: 'current=true'
          })
            .then((resp) => {
              this.description = `Account:${resp.inventories[0].name},${this.localName}`
            })
        })
      },
      //更新描述
      updateDescription () {
        rpc.query(`brid/huawei/key`, {
          q: 'current=true'
        })
          .then((resp) => {
            this.description =  `Account:${resp.inventories[0].name},${this.localName}`
            this.validate('description')
          })
      },
      //确定添加
      confirm()  {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.close()
          }).catch(() => {
            self.canCreate = true;
        })
      },
      //添加可用区参数
      createParam() {
        return {
          type: this.type,
          description: this.description,
          zoneId: this.idenityzoneUuid,
          dataCenterUuid: this.dataCenterUuid,
          localName: this.localName
        }
      },
      //返回
      close() {
        let self = this;
        self.$router.push({name: 'hybridhuaweiidentityzone'})
      },
      //华为云地域选择弹框
      openSelectHuaweiDataCenter() {
        let self = this;
        self.openDialog('HybridHuaweiDataCenterSingleSelect', {
          select: (uuid) => {
            self.dataCenterUuid = uuid;
            self.getIdentityZoneFromRemote(uuid)
          }
        })
      },
      //删除华为云地域
      removeDataCenterUuid(uuid) {
        let self = this;
        self[uuid] = "";
        self.validate(uuid);
      },
      //整体校验
      validateAll() {
        let self = this, props = ['identityZoneUuid', 'dataCenterUuid', 'description'], validateInput = false;
        props.forEach((name) => {
          self.validate(name)
        })
        validateInput = props.some((name) => {
          return self[`empty${name}`] === true;
        })
        return validateInput;
      },
      //单个校验表单
      validate(name) {
        let self = this, input = '', errorMsg = '';
        input = self[name];
        switch (name) {
          case 'identityZoneUuid':
            errorMsg = 'common.hybrididentityzone';
            break;
          case 'dataCenterUuid':
            errorMsg = 'common.hybridDatacenter';
            break;
          case  'description':
            errorMsg = 'common.description';
            break;
        }
        self[`empty${name}`] = false;
        if(!input) {
          self.rules.message[name] = self.$t('error.emptyInput') + this.$t(errorMsg);
          self[`empty${name}`] = true;
          return;
        }
      },
      //切换选择框
      handleSelect(item) {
       let self = this;
       self.localName = item.label;
       self.idenityzoneUuid = item.value;
       self.isAvailableInstanceTypes = item.isAvailableInstanceTypes;
       self.updateDescription();
      },
      //帮助
      queryHuaweiForAssistant () {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${genUniqueId()}`
          let content = `lackOf${resourceName}`
          let hide
          let handler = () => {
            if(operation === 'add' && resourceName === "HybridHuaweiyunKeySecret") {
              this.$router.push({name: 'createHybridHuaweiDataCenter'})
            }
          if (operation === 'check' && resourceName === 'HybridHuaweiyunKeySecret') {
            content = `disabled${resourceName}`
            handler = () => {
              this.$router.push({name: 'hybridhuaweidatacenter'})
              content = `disabled${resourceName}`
            }
          }
          self.createAssistant({
            id,
            hide,
            operation,
            title: 'iZoneTitle',
            ownerId: self.windowData.id,
            content: content,
            handler
          })
        }
        rpc.query('/brid/huawei/key', {count: true}).then(resp => {
          if (resp.total === 0) {
            newAssistant('HybridHuaweiyunKeySecret', 'add')
          } else {
            rpc.query('/brid/huawei/key', {
              q: 'current=true'
            })
              .then((resp) => {
                if (resp.inventories.length === 0) newAssistant('HybridHuaweiyunKeySecret', 'check')
              })
          }
        })
        rpc.query('/brid/huawei/key', {
          q: 'current=true'
        }).then((resp) => {
          if (resp.inventories.length === 1) {
            rpc.query('system-tags', {
              q: ['resourceType=HDataCenterVO', `tag=accessKey::${resp.inventories[0].akey}`]
            }).then((resp) => {
              if (resp.inventories.length === 0) {
                newAssistant('HybridHuaweiDataCenter', 'add')
              }
            })
          }
        })
       }
      },
    }
  }
</script>

<style scoped>

</style>
