<template>
  <create-template>
    <div slot="header" class="create-header">
     <span>创建权限组</span>
     <span class="create-back el-icon-back" @click="$router.push({name: 'hybridalicloudaccessgroup'})">
        <span class="text" style="font-size: 12px;">回到阿里云权限组列表</span>
      </span>
   </div>

   <div slot="body">
     <mh-input type="select"
               required="true"
               label="common.hybridDatacenter"
               :selectGroup="dataCenterGroup"
               :showError="emptydataCenterUuid"
               v-model="dataCenterUuid"
               prop="dataCenter"
               :error-message="rules.dataCenterUuid.message"/>

        <mh-input label="" type="slot">
          <el-radio-group v-model="type">
            <el-radio  :label="true">选择已有</el-radio >
            <el-radio  :label="false">创建</el-radio >
          </el-radio-group>
        </mh-input>

       <mh-input type="select" v-if="type"
               :label="'权限组'"
               required="true"
               :selectGroup="remoteAccessGroup"
               :showError="emptyremoteAccess"
               @changeOption="handleRemoteAccessGroupSelect"
               v-model="remoteAccess"
                prop="remoteAccess"
               :error-message="rules.remoteAccess.message"/>

       	<mh-input :label="'common.name'"
			          :required="true"
								:show-error="emptyname || invalidname"
								v-model="name"
								:error-message="rules.name.message"
								@validate="validate"
								prop="name"/>

			<mh-input :label="'common.description'"
			          type="textarea"
			          v-model="description"
								prop="description"/>

       <mh-input type="select" v-if="!type"
               :label="'common.networkType'"
               required="true"
               :selectGroup="networkTypeGroup"
               v-model="networkType"
                prop="networkType"/>
   </div>

   <div slot="footer" class="create-footer">
     <span class="btn-confirm"
           :class="{'disabled': !canCreate}"
           @click="canCreate && create()">{{$t('common.confirm')}}</span>
     <span class="btn-cancel" @click="$router.push({name: 'hybridalicloudaccessgroup'})">{{$t('common.cancel')}}</span>
   </div>
  </create-template>
</template>

<script>
import CreateTemplate from 'src/component/CreateTemplate';
import WindowBase from 'src/windows/Window';
import rpc from 'src/utils/rpc';
import Methods from '../Methods';
import _ from 'lodash'

export default {
  mixins: [WindowBase],
  components: {
    CreateTemplate,
  },

  data() {
    return {
      canCreate: true,
      dataCenterGroup: [],
      remoteAccessGroup:[],
      emptydataCenterUuid: false,
      dataCenterUuid: '',
      emptyremoteAccess: false,
      remoteAccess: '',
      type: true,
      name: '',
      emptyname: false,
      description: '',
      invalidname:  false,
      networkType: 'classic',
      emptynetworkType: false,
      rules: {
        dataCenterUuid: {message: ''},
        name: {message: ''},
        remoteAccess: {message: ''},
        networkType: {message: ''}
      },
      networkTypeGroup: [
        {
          label: 'classic',
          value: 'classic'
        }
      ]
    }
  },

  created() {
   this.queryRegionList()
  },

  methods: {
   ...{
     create: Methods.methods.create
    },
    validate(name) {
      let errorMsg = '', input = '',  self = this;
      input = name === 'name' ? String(self[name]).trim() : self[name];
      switch(name) {
        case 'name':
          errorMsg = self.$t('error.emptyInput') + self.$t('common.name');
          break;
        case 'dataCenterUuid':
           errorMsg = self.$t('error.unselected') + self.$t('common.hybridDatacenter');
          break;
        case 'networkType':
          errorMsg = self.$t('error.unselected') + self.$t('common.networkType');
          break;
      }
       self[`empty${name}`] = false;
        self.rules[name].message = '';
      if(!input) {
        self[`empty${name}`] = true;
        self.rules[name].message = errorMsg;
      }
    },
    //查询地域列表
    async queryRegionList () {
      let param = {
        q: ['dcType=privateAliyun']
      }
      let resp = await rpc.query('hybrid/data-center', param);
      this.dataCenterGroup = resp.inventories.map((item) => {
        return {
          label:  item.regionName,
          value: item.uuid
        }
      })
      if(resp.inventories.length === 1 ) {
        this.dataCenterUuid = this.dataCenterGroup[0].value;
      }
    },
    //查询文件列表
    async queryAccessGroupRemote (dataCenterUuid) {
      let param = {
        dataCenterUuid: dataCenterUuid
      }
      let resp = await rpc.query('nas/aliyun/access/remote', param)
      this.remoteAccessGroup = resp.inventories.map((item) => {
        return {
          label: item.name,
          value: item.name,
          item: item
        }
      })
      if (this.remoteAccessGroup.length === 1) {
        this.remoteAccess = this.remoteAccessGroup[0].value;
      } else {
        this.remoteAccess = ''
      }
    },
    //选择文件系统列表
    handleRemoteAccessGroupSelect(item) {
      this.description = item.item.description
      this.networkType = item.item.networkType.toLowerCase()
    },
    //整体验证
    validateAll() {
      let self = this, props = ['name', 'dataCenterUuid', 'networkType'];
      props.forEach((name) => {
        self.validate(name);
      })
     let invalid =  props.some((name) => {
        return self[`empty${name}`] === true || self[`invalid${name}`] === true;
      })
      return invalid;
    },
    //添加参数
     createParam () {
      return {
        name: this.name,
        description: this.description,
        dataCenterUuid: this.dataCenterUuid,
        networkType: this.networkType,
      }
    },
    create() {
      let self = this;
      if(self.validateAll()) return;
       self.canCreate = false;
      self.create(self.createParam())
      .then(() => {
        self.$router.push({name: 'hybridalicloudaccessgroup'})
      }).catch(() => {
        self.canCreate = true;
      })
    }
  },

  watch: {
     'dataCenterUuid': function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      this.queryAccessGroupRemote(dataCenterUuid)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
