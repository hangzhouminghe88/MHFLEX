<template>
  <el-dialog :visible.async="visibled" @close="close()" @ok="ok()" width="800">
    <span slot="title">
     设置规则
    </span>
    <el-form label-position="left" ref="form" :model="form"
             :rules="formRules" style="width: 400px">
      <el-form-item :label="$t('common.type')" label-width="100px" prop="type">
        <el-select v-model="form.type" placeholder="请选择" style="width:100%">
          <el-option
            v-for="item in dataTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.protocol')" label-width="100px" prop="protocol">
        <el-select v-model="form.protocol" placeholder="请选择" style="width:100%">
          <el-option
            v-for="item in dataProtocols"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('securityGroup.portStart')" label-width="100px" prop="portStart" v-if="form.protocol !== 'ICMP' && form.protocol !== 'ALL'">
        <el-input placeholder="" v-model="form.portStart"/>
      </el-form-item>
      <el-form-item :label="$t('securityGroup.portEnd')" label-width="100px" prop="portEnd" v-if="form.protocol !== 'ICMP' && form.protocol !== 'ALL'">
        <el-input placeholder=""  v-model="form.portEnd"/>
      </el-form-item>

      <el-form-item label="CIDR" label-width="100px" >
        <el-input placeholder="" v-model="form.allowedCidr"/>
      </el-form-item>

      <el-form-item :label="$t('securityGroup.remoteSecurityGroup')" label-width="100px">
         <add-or-delete-input v-if="form.remoteSecurityGroupUuids.length > 0"
                             v-for="(uuid, index) in form.remoteSecurityGroupUuids"
                             :key="index"
                             :value="dbData.securitygroup[uuid] && dbData.securitygroup[uuid].name"
                             @remove="removeRemoteSecurityGroup($event, uuid)"/>
        <add-or-delete-input @open="selectRemoteSecurityGroup()"/>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>


  </el-dialog>
</template>

<script>
  import rpc from 'src/utils/rpc';
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import SecurityGroupList from 'src/security/securitygroup/List';
  import _ from 'lodash';

  export default {
    name: "CreateRuleDlg",
    mixins:[WindowBase, Root,SecurityGroupList],
    components: {
      AddOrDeleteInput
    },
    props: {
      model: {
        type: Boolean,
        default: false
      }
    },
    data() {
      let validPort=(rule,value,callback)=>{
        if(value==''||value==undefined){
          callback(new Error('开始端口号不能为空'));
        }else{
          let reg=/^(\d)+$/g;
          if(!reg.test(value)){
            callback(new Error('端口不正确'))
          }else{
            callback()
          }
        }
      };
      let validPortCmp=(rule,value,callback)=>{
        if(this.form.portStart>this.form.portEnd)
          callback(new Error('开始端口号不能大于结束端口号'));
        else
          callback()
      };
      return{
        visibled:false,
        form: {
          type:'Ingress',
          protocol:'ALL',
          remoteSecurityGroupUuids:[]
        },
        formRules: {
          type: [
            {required: true, message: '请选择分类', trigger: 'change'}
          ],
          protocol: [
            {required: true, message: '请选择协议', trigger: 'change'}
          ],
          portStart: [
            {validator:validPort,trigger:'blur'}
          ],
          portEnd: [
            {validator:validPort,trigger:'blur'},
            {validator:validPortCmp,trigger:'blur'},
          ]
        },
        dataTypes:[{
          value: 'Ingress',
          label: this.$t('securityGroup.Ingress')
        }, {
          value: 'Egress',
          label: this.$t('securityGroup.Egress')
        }],
        dataProtocols:[{
          value: 'ALL',
          label: 'ALL'
        }, {
          value: 'TCP',
          label: 'TCP'
        }, {
          value: 'UDP',
          label: 'UDP'
        }, {
          value: 'ICMP',
          label: 'ICMP'
        }],
        remoteGroupList:[]
      }
    },
    methods:{
      ...Utils,
      close(){
        this.$emit('close');
      },
      ok(){
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.$emit('ok',this.form);
          }
        });
      },
      querySecurityGroupList: async function () {
        let resp = await rpc.query('security-groups', {
          count: false,
          replyWithCount: true
        })
        resp.inventories.forEach(item=>{
          this.remoteGroupList.push(item);
        });
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        this.updateWindow({ uuidList, table })
        this.updateDbTable({
          tableName: 'securitygroup',
          list: resp.inventories
        })
      },

       removeRemoteSecurityGroup (uuid) {
        let list = _.cloneDeep(this.windowData.remoteSecurityGroupUuids)
        let self = this
        let uuidList = list.filter((i) => i !== uuid)
        self.form.remoteSecurityGroupUuids = uuidList;
      },

      selectRemoteSecurityGroup () {
        const self = this
        let uuidList = _.cloneDeep(self.windowData.remoteSecurityGroupUuids)
        self.openDialog('SecurityGroupMultiSelect', {
          conditions: [`ipVersion=${self.isIpv6 ? 6 : 4}`, `uuid!?=${uuidList}`],
          select: (securityGroupUuids) => {
            securityGroupUuids = securityGroupUuids.concat(_.cloneDeep(self.windowData.remoteSecurityGroupUuids))
            self.form.remoteSecurityGroupUuids = securityGroupUuids;
          }
        })
      },

    },
    mounted() {
      this.visibled = this.model;
    },
    created(){
      this.querySecurityGroupList();
    },
    watch: {
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visibled = newVal;
        }
      }
    }
  }
</script>

<style scoped>
  .el-form-item {
    margin-bottom: 22px;
  }
</style>

