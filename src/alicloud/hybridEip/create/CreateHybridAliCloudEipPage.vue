<template>
 <create-template>
   <div slot="header" class="create-header">
     <span>{{$t('hybrideip.create')}}</span>
     <span class="create-back el-icon-back" @click="$router.push({name: 'hybridalicloudeip'})">
        <span class="text" style="font-size: 12px;">回到阿里云弹性公网列表</span>
      </span>
   </div>

   <div slot="body">
     <div class="operation-row">
       <div class="title required">{{$t('common.hybridDatacenter')}}</div>
       <add-or-delete-input :value="dbData.hybridDataCenter[dataCenterUuid] && dbData.hybridDataCenter[dataCenterUuid].regionName"
                            @open="openDataCenterSelect" :class="{'is-error': emptydataCenterUuid}"
                            @remove="removeUuid('dataCenterUuid')"/>
       <div class="error error-text" v-show="emptydataCenterUuid">
         {{$t('error.unselected') + $t('common.hybridDatacenter')}}
       </div>
     </div>
     <div class="operation-row">
       <div class="title required">{{$t('common.name')}}</div>
       <input type="text" v-model="name"
              :class="{'is-error': emptyname || invalidname}"
              @blur="validate('name')"/>
       <div class="error error-text" v-if="emptyname && !invalidname">
         {{$t('error.emptyInput') + $t('common.name')}}
       </div>
       <div class="error error-text" v-if="!emptyname && invalidname">
         {{$t('error.invalid') + $t('common.name')}}
       </div>
     </div>
     <div class="operation-row">
       <div class="title">{{$t('common.description')}}</div>
       <textarea rows="3" v-model="description"/>
     </div>
     <div class="operation-row">
       <div class="title required">{{$t('common.bandwidth')}}</div>
       <input rows="3" v-model="bandWidth"
              style="width: 62%" :class="{'is-error': emptybandWidth || invalidbandWidth}"
              @blur="validate('bandWidth')"/>
       <span class="unit">M</span>
       <div class="error error-text" v-show="emptybandWidth && !invalidbandWidth">
         {{$t('error.emptyInput') + $t('common.bandwidth')}}
       </div>
       <div class="error error-text" v-show="!emptybandWidth && invalidbandWidth">
         {{$t('error.invalid') + $t('common.bandwidth')}}
       </div>
     </div>
   </div>

   <div slot="footer" class="create-footer">
     <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
     <span class="btn-cancel"  @click="$router.push({name: 'hybridalicloudeip'})">{{$t('common.cancel')}}</span>
   </div>
 </create-template>
</template>

<script>
  import AddOrDeleteInput from "src/component/AddOrDeleteInput";
  import CreateTemplate from "src/component/CreateTemplate";
  import { genUniqueId } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';

  export default {

    name: "CreateHybridAliCloudEipPage",

    mixins: [WindowBase],

    components: {AddOrDeleteInput, CreateTemplate},

    data() {
      return {
        canCreate: true,
        name: '',
        emptyname: false,
        invalidname: false,
        description: '',
        bandWidth: '1',
        emptybandWidth: false,
        invalidbandWidth: false,
        dataCenterUuid: "",
        emptydataCenterUuid: false,
        chargeType: 'PayByTraffic',
        type: 'aliyun',
      }
    },

    created() {
      let self = this;
      self.queryForAssistant();
    },

    methods: {
      ...{
        create: Methods.methods.create
      },
      //单个校验
      validate(name) {
        let self = this, input = '';
        input = String(self[name]).trim();
        self[`empty${name}`] = false;
        self[`invalid${name}`] = false;
        if(/^\s*$/.test(input)) {
          self[`empty${name}`] = true;
          return;
        }
        if(name === 'name') {
          if(!/^[a-zA-Z]/.test(input)) {
             self[`invalid${name}`] = true;
             return;
           }
        }
        if(name === 'bandWidth') {
          if(!/^[0-9][0-9]*$/.test(input)) {
            self[`invalid${name}`] = true;
            return;
          }
        }
      },
      //确定添加
      confirm() {
        let self = this, invalid = self.validateAll();
        if(invalid) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'hybridalicloudeip'})
          })
          .catch(() => {
            self.canCreate = true;
          })
      },
      //整体校验
      validateAll() {
        let self = this, props = ['name', 'dataCenterUuid', 'bandWidth'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return invalid;
      },
      //地域选择弹框
      openDataCenterSelect() {
        let self = this;
        self.validate('dataCenterUuid');
        self.openDialog('HybridAliCloudDataCenterSingleSelect', {
          conditions: [],
          select: (uuid) => {
            self.dataCenterUuid = uuid;
            self.validate('dataCenterUuid');
          }
        })
      },
      //删除dataCenterUuid
      removeUuid(uuid) {
        let self = this;
        self[uuid] = "";
      },
      //帮助提示
      queryForAssistant () {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${genUniqueId()}`
          let content, handler
          handler = () => {
            self.$router.push({name: 'hybridaliclouddatacenter'})
          }
          content = `lackOf${resourceName}`
          self.createAssistant({
            id,
            hide: false,
            title: 'hybridEipTitle',
            ownerId: self.windowData.id,
            content,
            operation,
            handler
          })
        }
        rpc.query(`hybrid/data-center`, {replyWithCount: true}).then(dataCenterResp => {
          if (dataCenterResp.total === 0) {
            newAssistant('HybridDataCenter', 'add')
          }
          if(dataCenterResp.total === 1) {
            self.updateDbRow({
              tableName: 'hybridDataCenter',
              id: dataCenterResp.inventories[0].uuid,
              data: dataCenterResp.inventories
            }).then(() => {
              self.dataCenterUuid = dataCenterResp.inventories[0].uuid;
            })
          }
        })
      },
      //创建弹性公网Ip
      createParam() {
        let self = this;
        return {
          name: self.name,
          description: self.description,
          dataCenterUuid: self.dataCenterUuid,
          chargeType: self.chargeType,
          type: self.type,
          bandWidthMb: Number(self.bandWidth)
        }
      }
    }
  }
</script>

<style scoped>
 .unit{
   display: inline-block;
   height: 40px;
   line-height: 40px;
   text-align: center;
   border: 1px solid #adb0b8;
   width: 30%;
   margin-left: -2px;
 }
</style>
