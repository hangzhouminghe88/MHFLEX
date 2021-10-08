<template>
  <create-template>
    <div slot="header" class="create-header">
     <span>创建文件系统</span>
     <span class="create-back el-icon-back" @click="$router.push({name: 'hybridalicloudfilesystem'})">
        <span class="text" style="font-size: 12px;">回到阿里云文件系统列表</span>
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
               :label="'文件系统'"
               required="true"
               :selectGroup="fileSystemGroup"
               :showError="emptyfileSystemId"
               @changeOption="handleFileSystemSelect"
               v-model="fileSystemId"
                prop="fileSystem"
               :error-message="rules.fileSystemId.message"/>

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
               :label="'存储类型'"
               required="true"
               :selectGroup="storageTypeGroup"
               v-model="storageType"
                prop="storageType"/>

        <mh-input type="select" v-if="!type"
               :label="'common.protocolType'"
               required="true"
               :selectGroup="protocolGroup"
               v-model="protocol"
                prop="protocol"/>
   </div>

   <div slot="footer" class="create-footer">
     <span class="btn-confirm" @click="create()">{{$t('common.confirm')}}</span>
     <span class="btn-cancel" @click="$router.push({name: 'hybridalicloudfilesystem'})">{{$t('common.cancel')}}</span>
   </div>
  </create-template>
</template>

<script>
import CreateTemplate from 'src/component/CreateTemplate';
import rpc from 'src/utils/rpc';
import Methods from '../Methods';

export default {
  components: {
    CreateTemplate,
  },

  data() {
    return {
      dataCenterGroup: [],
      fileSystemGroup:[],
      emptydataCenterUuid: false,
      dataCenterUuid: '',
      emptyfileSystemId: false,
      fileSystemId: '',
      type: true,
      name: '',
      emptyname: false,
      description: '',
      protocol: 'NFS',
      invalidname:  false,
      storageType: 'Performance',
      rules: {
        dataCenterUuid: {message: ''},
        name: {message: ''},
        fileSystemId: {message: ''}
      },
      protocolGroup: [
        {
          label: 'NFS',
          value: 'NFS'
        },
        {
          label: 'SMB',
          value: 'SMB'
        }
      ],
      storageTypeGroup: [
        {
          label: 'Performance',
          value: 'Performance'
        },
        {
          label: 'Capacity',
          value: 'Capacity'
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
        case 'storageType':
          errorMsg = self.$t('error.unselected') + self.$t('common.storageType');
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
    async queryFsRemote (dataCenterUuid) {
      let param = {
        dataCenterUuid: dataCenterUuid
      }
      let resp = await rpc.query('nas/aliyun/remote', param)
      this.fileSystemGroup = resp.inventories.map((item) => {
        return {
          label: item.fileSystemId,
          value: item.fileSystemId,
          item: item
        }
      })
      if (this.fileSystemGroup.length === 1) {
        this.fileSystemId = this.fileSystemGroup[0].value;
      } else {
        this.fileSystemId = ''
      }
    },
    //选择文件系统列表
    handleFileSystemSelect(item) {
      this.description = item.item.description
      this.storageType = item.item.storageType
      this.protocol = item.item.protocol
    },
    //整体验证
    validateAll() {
      let self = this, props = ['name', 'dataCenterUuid'];
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
        storageType: this.storageType,
        protocol: this.protocol
      }
    },
    create() {
      let self = this;
      if(self.validateAll()) return;
      self.create(self.createParam())
    }
  },

  watch: {
     'dataCenterUuid': function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      this.queryFsRemote(dataCenterUuid)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
