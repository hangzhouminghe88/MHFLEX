<template>
  <create-template class="create_oss_container">
     <div
      slot="header"
      class="create-header"
    >
      <span class="create-title">添加桶</span>
      <span
        class="create-back el-icon-back"
        @click="close()"
      >
        回到华为云Obs桶列表
      </span>
    </div>
     <div slot="body" class="create-body">
      <mh-input type="slot" :label="'添加方式'">
          <el-radio-group v-model="isCreate" @change="handleChange">
            <el-radio :label="false">已有</el-radio>
            <el-radio :label="true">创建</el-radio>
          </el-radio-group>
       </mh-input>

        <mh-input v-if="!isCreate"
        :label="$t('common.hybridDatacenter')"
        type="slot"
        :required="true"
        :error-message="rules.dataCenterUuid.message"
        :show-error="emptydataCenterUuid"
      >
        <add-or-delete-input
          :value="dbData.hybridHuaweiyunDataCenter[dataCenterUuid] && dbData.hybridHuaweiyunDataCenter[dataCenterUuid].regionName"
          :class="{'is-error': emptydataCenterUuid}"
          @remove="removeUuid('dataCenterUuid')"
          @open="openHybridHuaweiDataCenterSelect"
        />
      </mh-input>

      <mh-input type="select"
                v-if="!isCreate"
                v-model="bucketName"
                :label="'桶名称'"
                :required="true"
                :show-error="emptybucketName"
                :error-message="rules.bucketName.message"
                prop="bucketName"
                @validate="validate"
                :selectGroup="ossBucketGroup"></mh-input>

        <mh-input
          :label="'桶名称'"
          :required="true"
          prop="bucketName"
          v-if="isCreate"
          v-model="bucketName"
          helperName="ecs_huaweiBucketName"
          @validate="validate"
          :show-error="emptybucketName || invalidbucketName"
          :error-message="rules.bucketName.message"
          placeholder="请输入镜像名称"
      />

       <mh-input
        type="textarea"
        v-model="description"
        placeholder="请输入描述"
        :label="$t('common.description')"
       />

       <mh-input type="slot" label="默认">
          <el-checkbox v-model="isDefault">设为默认</el-checkbox>
       </mh-input>
     </div>
     <div slot="footer" class="create-footer">
       <div class="btn-confirm"
            :class="{'disabled': !canCreate}"
            @click="canCreate && confirm()">{{$t('common.confirm')}}</div>
       <div
         class="btn-cancel"
         @click="close()"
       >{{$t('common.cancel')}}</div>
     </div>
  </create-template>
</template>

<script>
import CreateTemplate from 'src/component/CreateTemplate';
import AddOrDeleteInput from "src/component/AddOrDeleteInput";
import WindowBase from 'src/windows/Window';
export default {
   name: 'CreateOssBucket',
   mixins: [WindowBase],
   components: {
     'create-template': CreateTemplate,
     AddOrDeleteInput
   },
   props: {
     param: {
       type: Object,
       default: () => {
         return {}
       }
     }
   },
   data() {
     return {
       isDefault: true,
       dataCenterUuid: '',
       bucketName: '',
       description: '',
       isCreate: false,
       ossBucketGroup: [],
       emptydataCenterUuid: false,
       invalidbucketName: false,
       emptybucketName: false,
       canCreate: true,
       rules: {
         bucketName: {message: ''},
         dataCenterUuid: {message: ''}
       }
     }
   },
   mounted() {
     let _this = this;
     _this.dataCenterUuid = _this.param.dataCenterUuid ? _this.param.dataCenterUuid : '';
   },
   methods: {
     //删除地域
     removeUuid(uuid) {
       let _this = this;
       _this[uuid] = "";
       _this.validate(uuid);
     },
     //逐个校验
     validate(name) {
       let _this = this,
        input = "", errMsg = '';
      input = _this[name];
      _this[`empty${name}`] = false;
      switch(name) {
        case 'name':
          errMsg = _this.$t(`common.${name}`);
          break;
        case 'bucketName':
           errMsg = _this.$t(`common.${name}`);
          break;
          case 'dataCenterUuid':
         errMsg = _this.$t(`common.hybridDatacenter`);
          break;
      }
      //若为空或者中间存在空格则校验不通过
      if (/^\s*$/.test(input) || /\s/g.test(input)) {
        _this[`empty${name}`] = true;
        _this.rules[name].message =
          _this.$t(`error.emptyInput`) + errMsg;
      }
      _this[`invalid${name}`] = false;
      if(name === 'bucketName') {
        if(!/^[\d\w][\d\w\-\.\(\)]{2,62}$/.test(input)){
            _this[`invalid${name}`] = true
        }
      }
     },
     validateAll() {
       let _this = this, props = [];
       if(_this.isCreate) {
         props = ['bucketName']
       }else {
         props = ['bucektName', 'dataCenterUuid']
       }
        props.forEach((name) => {
       _this.validate(name);
       })
       let invalid = props.some((name) => _this[`empty${name}`] === true || _this[`invalid${name}`] === true);
        return invalid;
     },
     close() {
       let _this = this;
       _this.$emit('close');
     },
    initGetBucketName() {
      const _this = this;
      let dataCenterUuid = self.param.dataCenterUuid;
      return rpc
        .query("/hybrid/huawei/obs-bucket", {
          q: [`dataCenterUuid=${dataCenterUuid}`, "current=true"]
        })
        .then(resp => {
          if (resp.inventories.length !== 0) {
            _this.$data.bucketName = resp.inventories[0].bucketName;
            _this.ossBucketGroup = resp.inventories.map(item => {
              return {
                label: item['bucketName'],
                value: item['bucketName']
              }
            })
          } else {
            _this.$data.bucketName = "";
          }
        });
    },
    handleChange() {
      let _this = this;
      _this.bucketName = '';
    },
    createParam() {
      return {
        bucketName: this.bucketName,
        description: this.description,
        dataCenterUuid: this.dataCenterUuid
      }
    },
    openHybridHuaweiDataCenterSelect() {
      let _this = this;
      _this.openDialog('HybridHuaweiDataCenterSingleSelect', {
        conditions: [],
        select: (uuid) => {
          _this.dataCenterUuid = uuid;
        }
      })
    },
    confirm() {
      let _this = this;
      if(_this.validateAll()) return;
      _this.canCreate = false;
      _this.param.ok(_this.createParam())
          .then(() => {
            _this.close();
          })
          .catch(() =>  {
            _this.canCreate = true;
          })
    }
   }
}
</script>

<style lang="less" scoped>
 .create_oss_container{
   position: absolute;
   top: 0;
   bottom: 0;
   left: 0;
   right: 0;
   background: #fff;
   z-index: 999;
 }
</style>
