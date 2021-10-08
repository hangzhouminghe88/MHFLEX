<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>
       {{$t('hybridesecuritygroup.create')}}
      </span>
      <span class="create-back" @click="$router.push({name: 'hybridalicloudsecuritygroup'})">
        <i class="el-icon-back"></i>
        回到阿里云安全组列表
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">
          {{$t('common.name')}}
        </div>
        <input v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('error.emptyInput')+$t('common.name')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea v-model="description" rows="3"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('hybridvirtualprivatecloud.virtualPrivateCloud')}}</div>
        <add-or-delete-input :value="dbData.hybridVirtualPrivateCloud[hybridVpcUuid]
                             && dbData.hybridVirtualPrivateCloud[hybridVpcUuid].name.replace(/-ZStack/g, '')"
                             :class="{'is-error': emptyhybridVpcUuid}"
                             @open="openHybridVirtualPrivateSelect"
                             @remove="removeUuid('hybridVpcUuid')"/>
        <div class="error error-text" v-if="emptyhybridVpcUuid">{{$t('error.unselected') + $t('hybridvirtualprivatecloud.virtualPrivateCloud')}}</div>
      </div>
      <div class="operation-row">
        <div class='title required'>{{$t('hybridesecuritygroup.quicklyCreateRules')}}</div>
        <el-select style="width: 100%;" v-model="rules">
          <el-option v-for="(item, index) in  ruleList"
                     :value="item.value"
                     :key="index"
                     :label="item.label"></el-option>
        </el-select>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <div class="btn-confirm"  :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</div>
      <div class="btn-cancel"  @click="$router.push({name: 'hybridalicloudsecuritygroup'})">{{$t('common.cancel')}}</div>
    </div>
  </create-template>
</template>

<script>
  import rpc from 'src/utils/rpc';
  import WindowBase from 'src/windows/Window';
  import { genUniqueId } from 'src/utils/utils';
  import CreateTemplate from "src/component/CreateTemplate";
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import HybridAliCloudSgList from 'src/alicloud/hybridAliCloudSecurityGroup/Methods';

  export default {
    name: "CreateHybridAliCloudSecurityGroupPage",

    components: {AddOrDeleteInput, CreateTemplate},

    mixins: [WindowBase, HybridAliCloudSgList],

    data() {
      let self = this;
      return {
        name: '',
        emptyname: false,
        rules: 'none',
        hybridVpcUuid: '',
        emptyhybridVpcUuid: false,
        description: '',
        ruleList: [{
          "value": 'none',
          "label": self.$t('hybridesecuritygroup.none')
        },{
          "value":'all',
          "label":self.$t('hybridesecuritygroup.all')
        },
        {
          "value": 'security',
          "label": self.$t('hybridesecuritygroup.security')
        }, {
          "value":'basic',
          "label":self.$t('hybridesecuritygroup.basic')
        }],
        canCreate: true
      }
    },

    created() {
      let self = this;
      self.hybridVpcUuid = self.$route.params.vpcUuid ? self.$route.params.vpcUuid : '';
      self.queryForAssistant();
    },

    methods: {
      queryForAssistant () {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${genUniqueId()}`
          let content, handler
          handler = () => {
            // self.openFullMainWindow(`Create${resourceName}Dlg`,
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
          content = `lackOf${resourceName}`
          self.createAssistant({
            id,
            hide: false,
            title: 'hybridSecurityGroupTitle',
            ownerId: self.windowData.id,
            content,
            operation,
            handler
          })
        }
        rpc.query(`hybrid/aliyun/vpc`, {count: true}).then(resp => {
          if (resp.total === 0) {
            newAssistant('HybridVirtualPrivateCloud', 'create')
          }
        })
      },
      ...{
        create: HybridAliCloudSgList.methods.create
      },
      //单个校验
      validate(name) {
        let self = this, input = '';
        input = String(self[name]).trim();
        self[`empty${name}`] = false;
        if(/^\s*$/.test(input)){
          self[`empty${name}`] = true;
          return;
        }
      },
      //整体校验
      validateAll() {
        let self = this, props = ['name', 'hybridVpcUuid'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return invalid;
      },
      //构造添加参数
      createParam() {
        let self = this, obj = null;
        if(self.rules !== 'none') {
          obj = {
            name: self.name,
            description: self.description,
            vpcUuid: self.hybridVpcUuid,
            strategy: self.rules
          }
        }else {
          obj = {
            name: self.name,
            description: self.description,
            vpcUuid: self.hybridVpcUuid
          }
        }
        return obj;
      },

      confirm() {
        let self  = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'hybridalicloudsecuritygroup'})
          }).catch(() => {
          self.canCreate = true;
        });
      },

      openHybridVirtualPrivateSelect() {
        let self = this;
        self.openDialog('HybridAliCloudVpcSingSelectList', {
          conditions: [],
          select: (uuid) => {
            self.hybridVpcUuid = uuid;
            self.validate('hybridVpcUuid')
          }
        })
      },


      removeUuid(uuid) {
        debugger
        let self = this;
        self[uuid] = '';
        self.validate(uuid);
      }
    },

    destroyed() {
      let self = this;
      self.deleteAllAssistant();
    }
  }
</script>

<style scoped>

</style>
