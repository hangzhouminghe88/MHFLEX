<template>
  <create-template>
    <div class="create-header" slot="header">
      <span class="create-header-title">创建华为云弹性Ip</span>
      <span class="create-back el-icon-back" @click="close()">回到弹性Eip列表</span>
    </div>
    <div class="create-body" slot="body">
       <!--地域-->
      <mh-input  :label="$t('hybriddatacenter.region')"
                 :show-error="emptydataCenterUuid"
                 :error-message="rules.dataCenterUuid.message"
                 :required="true"
                 type="slot">
        <add-or-delete-input :value="dbData.hybridHuaweiyunDataCenter[dataCenterUuid] && dbData.hybridHuaweiyunDataCenter[dataCenterUuid].regionName"
                             @open="openDataCenterSelect"
                             @remove="removeUuid('dataCenterUuid')"
                             :class="{'is-error': emptydataCenterUuid}"/>
      </mh-input>

         <!--名称-->
      <mh-input :label="$t('common.name')"
                :show-error="emptyname || invalidname"
                v-model="name"
                :required="true"
                prop="name"
                @validate="validate"
                placeholder="请输入名称"
                :error-message="rules.name.message"/>

      <!--简介-->
      <mh-input :label="$t('common.description')"
                v-model="description"
                placeholder="请输入简介"
                type="textarea"/>

      <mh-input :label="$t('common.bandwidth')"
                :show-error="emptybandWith || invalidbandWith"
                :error-message="rules.bandWith.message"
                @validate="validate"
                prop="bandWith"
                placeholder="请输入带宽"
                :required="true"
                type="number"
                style="width: 210px; display:inline-block;"
                v-model="bandWith">
      </mh-input>
       <div class="unit">M</div>
    </div>
    <div class="create-footer" slot="footer">
      <span class="btn-confirm"
            :class="{'disabled': !canCreate}"
            @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
import CreateTemplate from 'src/component/CreateTemplate';
import AddOrDeleteInput from 'src/component/AddOrDeleteInput';
import WindowBase from 'src/windows/Window';
import Methods from '../Methods';
export default {
  name: 'CreateHybridHuaweiEipPage',
  mixins: [WindowBase],
  components: {
    AddOrDeleteInput,
    CreateTemplate
  },
  data() {
    return {
      name: '',
      description: '',
      bandWith: '1',
      dataCenterUuid: '',
      emptyname: false,
      emptybandWith: false,
      invalidbandWith: false,
      invalidname: false,
      emptydataCenterUuid: false,
      canCreate: true,
      rules: {
        name: {message: ''},
        dataCenterUuid: {message: ''},
        bandWith: {message: ''}
      }
    }
  },
  methods: {
    ...{
      create: Methods.methods.create
    },
    close() {
      let _this = this;
      _this.$router.push({name: 'hybridhuaweieip'})
    },
    validate(name) {
      let _this = this, input = "", errorMsg = '';
      input = _this[name];
       switch(name) {
        case 'dataCenterUuid':
          errorMsg = _this.$t('hybriddatacenter.region')
          break;
        case 'name':
          errorMsg = _this.$t('common.name');
          break;
        case 'bandWith':
          errorMsg = _this.$t('common.bandwidth');
          break;
      }
      _this[`empty${name}`] = false;
      if(/^\s*$/.test(input) || /\s/.test(input)) {
         _this[`empty${name}`] = true;
         _this.rules[name].message = _this.$t('error.emptyInput') + errorMsg;
         return;
      }
      debugger
       _this[`invalid${name}`] = false;
      if(name ===  'bandWith' && (!/^\b200\b|\b[1]?\d\d\b|\b[1-9]\b/.test(input) || Number(input) <=0)) {
         _this[`invalid${name}`] = true;
          _this.rules[name].message = _this.$t('error.invalid') + errorMsg;
      }
    },
     removeUuid(uuid) {
      let _this = this;
      _this[uuid] = "";
      _this.validate(uuid);
    },
    validateAll(name) {
      let _this = this, props=['name', 'dataCenterUuid', 'bandWith'];
      props.forEach(name => _this.validate(name));
      let invalidInput = props.some(name => _this[`empty${name}`] === true || _this[ `invalid${name}`] === true);
      return invalidInput;
    },
    openDataCenterSelect() {
      let _this  = this;
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
      _this.create(_this.createParam())
           .then(() => {
             _this.close();
           })
           .catch(() => {
             _this.canCreate = true;
           })
    }
  }
}
</script>

<style lang="less" scoped>
  .unit{
    display: inline-block;
    width: 90px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    border: 1px solid #adb0b8;
  }
</style>
