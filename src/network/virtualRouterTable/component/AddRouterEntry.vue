<style scoped>
  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #dae0e6;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 40px;
    box-sizing: border-box;
    width: 303px
  }

  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    height: 23px;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .rule-body {
    width: 100%;
    border: 1px solid #dae0e6;
    border-radius: 2px;
    padding-bottom: 20px;
  }

  .rule-content {
    height: 30px;
    font-size: 14px;
    color: #333;
    width: 100%;
    padding: 10px;
    border-radius: 2px;
    position: relative;
    box-sizing: border-box;
  }

  .operation-block-header {
    border-bottom: 1px solid #dae0e6;
    padding-bottom: 8px;
    margin-bottom: 15px;
    color: #1a2736;
    font-size: 16px;
    cursor: pointer;
    max-width: 400px;
  }

  .el-radio-group {
    line-height: 40px;
    padding-top: 5px
  }
</style>

<template>
  <create-template-no-route>
    <div slot="header">
        <span>
          {{$t('vRouterRouteEntry.add')}}
        </span>
      <span class="create-back" @click="$emit('close')"><i class="el-icon-back"></i>返回</span>
    </div>
    <div slot="body">
      <el-form :model="windowData" :rules="rules" ref="form">
        <el-form-item :label="$t('vrouterroutetable.Table')" label-width="100px">
          {{ dbData.vRouterRouteTable[windowData.routeTableUuid] &&
          dbData.vRouterRouteTable[windowData.routeTableUuid].name }}
        </el-form-item>

        <el-form-item :label="$t('vRouterRouteEntry.destination')" label-width="100px" prop="destination">
          <el-input style="width:300px;" v-model="windowData.destination" placeholder="192.168.0.1/24"/>
        </el-form-item>

        <el-form-item :label="$t('common.type')" label-width="100px">
          <el-select v-model="windowData.type" placeholder="请选择" style="width: 100%;">
            <el-option :label="$t(`vrouterroutetable.${type}`)" :value="type"
                       v-for="(type, index) in windowData.typeList" :key="index"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('vRouterRouteEntry.target')" label-width="100px" prop="target"
                      v-if="windowData.type === 'UserStatic'">
          <el-input style="width:300px;" v-model="windowData.target"/>
        </el-form-item>

        <el-form-item :label="$t('vRouterRouteEntry.distance')" label-width="100px" prop="distance">
          <el-input style="width:300px;" v-model="windowData.distance"/>
        </el-form-item>
      </el-form>

    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import rpc from 'src/utils/rpc';

  export default {
    name: "AddRouterEntryDlg",
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    mixins: [WindowBase],
    components: {CreateTemplateNoRoute},
    data() {
      let self = this;
      let validate = (rules, value, callback) => {
        if(rules.field === 'destination'){
          if(!this.isCidr(value)){
            callback(self.$t('error.invalid') + self.$t('vRouterRouteEntry.destination'));
          }else {
            callback();
          }
        }
        if(rules.field === 'target'){
          if (!this.isIP(value)) {
            callback(self.$t('error.invalid') + self.$t('vRouterRouteEntry.target'))
          }else {
            callback();
          }
        }
        if(rules.field === 'distance'){
          if (!this.isUint(value)) {
            callback(self.$t('error.invalid') + self.$t('vRouterRouteEntry.distance'))
          } else if (Number(value) > 254 || Number(value) < 1) {
            callback(self.$t('error.invalid') + self.$t('vRouterRouteEntry.distance'))
          }else {
            callback();
          }
        }
      }
      return {
        cloneFormConfig: {
          name: '',
          number: 1,
        },
        rules: {
          destination: [
            {required: true, message: self.$t('error.emptyInput') + self.$t('vRouterRouteEntry.destination'), trigger: 'blur'},
            {validator: validate, trigger: 'blur'}
          ],
          target: [
            {required: true, message: self.$t('error.emptyInput') + self.$t('vRouterRouteEntry.target'), trigger: 'blur'},
            {validator: validate, trigger: 'blur'}
          ],
          distance: [
            {required: true, message: self.$t('error.emptyInput') + self.$t('vRouterRouteEntry.distance'), trigger: 'blur'},
            {validator: validate, trigger: 'blur'}
          ]
        }
      }
    },
    computed: {},
    created() {

      this.updateWindow({
        routeTableUuid: this.param.conditions ? this.param.conditions[0] : '',
        name: '',
        showMoreDropdowntype: false,
        // description: '',
        destination: '',
        target: '',
        distance: '128',
        type: 'UserStatic',
        typeList: ['UserStatic', 'UserBlackHole']
      })
    },
    methods: {
      ...Validator,
      createParam: function () {
        let param = {
          // description: this.windowData.description,
          destination: this.windowData.destination,
          type: this.windowData.type,
          target: this.windowData.type === 'UserStatic' ? this.windowData.target : undefined
        }
        if (this.windowData.distance !== '') {
          param.distance = this.windowData.distance
        }
        return param
      },
      ok: function () {
        let self = this;
        self.$refs.form.validate((valid) => {
          if(valid){
            self.param.ok(self.createParam())
            self.$emit('close');
          }
        })
      }

    }
  }
</script>
