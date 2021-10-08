<template>
  <create-template-no-route>
    <div slot="header">
      <span>添加存储池</span>
      <span class="create-back el-icon-back">返回</span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title"></div>
        <el-radio v-model="createMethod" :label="'create'">{{$t('common.create')}}</el-radio>
        <el-radio  v-model="createMethod" :label="'available'">{{$t('common.available')}}</el-radio>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.type')}}</div>
        <el-select v-model="type" style="width: 100%;">
          <el-option value="Root" :label="'Root'">Root</el-option>
          <el-option value="Data" :label="'Data'">Data</el-option>
        </el-select>
      </div>

      <div class="operation-row">
        <div class="title">{{$t('common.poolName')}}</div>
        <input type="text" v-model="poolName" :class="{'is-error': emptypoolName}" @blur="validate('poolName')"/>
        <div class="error error-text" v-if="emptypoolName">{{$t('error.emptyInput') + $t('common.poolName')}}</div>
      </div>

      <div class="operation-row">
        <div class="title">{{$t('primaryStorage.aliasName')}}</div>
        <input type="text" v-model="aliasName"/>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";

  export default {
    name: "CreatePool",
    components: {CreateTemplateNoRoute},
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        createMethod: 'create',
        type: 'Root',
        poolName: '',
        aliasName: '',
        emptypoolName: false
      }
    },

    methods: {
      validate(name){
        let self = this;
        let input = String(self[name]).trim();
        self[`empty${name}`] = false;
        if(!input){
          self[`empty${name}`] = true;
          return;
        }
      },

      createParam: function () {
        return {
          name: this.poolName,
          aliasName: this.aliasName,
          isCreate: this.createMethod ===  'create',
          type: this.type
        }
      },

      confirm(){
        let self = this;
        self.validate('poolName');
        if(self.emptypoolName) return;
        self.param.ok(self.createParam());
        self.$emit('close');
      }
    }
  }
</script>

<style scoped>

</style>
