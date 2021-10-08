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
    width:303px
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
  .delete{
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }
  .rule-body{
    width: 100%;
    border: 1px solid #dae0e6;
    border-radius: 2px;
    padding-bottom: 20px;
  }
  .rule-content{
    height: 30px;
    font-size: 14px;
    color: #333;
    width: 100%;
    padding: 10px;
    border-radius: 2px;
    position: relative;
    box-sizing: border-box;
  }
</style>

<template>
  <create-template-no-route>
    <div slot="header">
        <span>
          {{$t("common.attachCluster")}}
        </span>
      <span class="create-back" @click="$emit('close')"><i class="el-icon-back"></i>返回</span>
    </div>
    <div slot="body" class="create-body">
      <el-form label-position="top" ref="form" :model="windowData" style="width: 300px;"
               :rules="formRules">
        <el-form-item label="VTEP CIDR" prop="cidr">
          <el-input v-model="windowData.cidr" placeholder="192.168.1.0/24"/>
        </el-form-item>

        <el-form-item :label="$t('common.cluster')" prop="clusterUuid">
          <add-or-delete-input @open="openSelectClusterDlg" :value="dbData.cluster[windowData.clusterUuid] && dbData.cluster[windowData.clusterUuid].name" @remove="removeCluster()"></add-or-delete-input>
        </el-form-item>



      </el-form>
    </div>
    <div slot="footer" class="create-footer">
        <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import CreateTemplate from 'src/component/CreateTemplate';
  import ClusterSingleDlg from "../../dialog/ClusterSingleDlg";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import FullPanel from 'src/windows/Base/FullPanel'
  import Validator from 'src/utils/validator';
  import CreateTemplateNoRoute from "../../component/CreateTemplateNoRoute";
  import Utils from 'src/utils/utils';

  export default {
    name: "VxlanNetworkPoolAttachClusterDlg",
    mixins: [WindowBase, Root,FullPanel],
    components: {
      CreateTemplateNoRoute,
      AddOrDeleteInput,
      CreateTemplate,
      ClusterSingleDlg
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
        clusterUuid:'',
        formRules: {
          cidr: [
            {required: true, message: 'cidr不能为空', trigger: 'blur'}
          ],
          clusterUuid: [
            {required: true, message: '请选择集群', trigger: 'blur'}
          ]

        },
        message: {}
      }
    },
    computed: {

    },
    created(){
      let self = this
      let hypervisorType = ''
      if (self.param && this.param.uuid) {
        let dataUuid = self.param.uuid
        self.updateWindow({ dataUuid })
          .then(() => {
            self.initVxlanPoolCidr(self.windowData.dataUuid)
          })
      }
      if (self.param && this.param.hypervisorType) {
        hypervisorType = this.param.hypervisorType
      }
      let curSelectZoneUuid = localStorage.getItem('currZoneUuid')
      this.updateWindow({
        cidr: '',
        clusterUuid: '',
        zoneUuid: curSelectZoneUuid,
        hypervisorType
      })
    },
    destroyed: function () {

    },

    methods: {
      ...Validator,
      ...Utils,
      close(uuid) {
        this.showClusterSelectDlg = false;

        if (!uuid || uuid.length <= 0) return;
          this.windowData.clusterUuid=uuid;

      },
      openSelectClusterDlg(){
        debugger;
        let conditions = [`zoneUuid=${this.windowData.zoneUuid}`, `uuid!?=${this.dbData.l2network[this.param.uuid].attachedClusterUuids}`]
        let dlg = 'ClusterSelectListDlg'
        if (this.getLicensePermission('LICENSE_EXTRA_BAREMETAL', this)) {
          dlg = 'BaremetalClusterListSingleSelectList'
          if (this.windowData.hypervisorType === 'baremetal') {
            dlg = 'BaremetalClusterListSingleSelectList'
            conditions.push('hypervisorType=baremetal')
          } else if (this.windowData.hypervisorType === 'KVM') {
            dlg = 'ClusterSelectListDlg'
            conditions.push('hypervisorType=KVM')
          }
        } else {
          conditions.push('hypervisorType=KVM')
        }
        this.openDialog(dlg, {
          conditions: conditions,
          type: 'radio',
          showTab: true,
          select: (uuid) => this.selectCluster(uuid)
        })
      },
      removeCluster(){
        this.windowData.clusterUuid='';
      },
      createParam: function () {
        return {
          cidr: this.windowData.cidr,
          clusterUuid: this.windowData.clusterUuid
        }
      },
      initVxlanPoolCidr: function (uuid) {
        const self = this
        rpc.query(`l2-networks/vxlan-pool/${uuid}`)
          .then((resp) => {
            if (resp.inventories.length > 0) {
              if (resp.inventories[0].attachedClusterUuids.length > 0) {
                let cidr = resp.inventories[0].attachedCidrs[resp.inventories[0].attachedClusterUuids[0]]
                self.updateWindow({ cidr })
              }
            }
          })
      },
      openSelectCluster: function () {
        let conditions = [`zoneUuid=${this.windowData.zoneUuid}`, `uuid!?=${this.dbData.l2network[this.windowData.dataUuid].attachedClusterUuids}`]
        let dlg = 'ClusterListSingleSelectList'
        if (getLicensePermission('LICENSE_EXTRA_BAREMETAL', this)) {
          dlg = 'KVMClusterAndBaremetalClusterListSingleSelectList'
          if (this.windowData.hypervisorType === 'baremetal') {
            dlg = 'BaremetalClusterListSingleSelectList'
            conditions.push('hypervisorType=baremetal')
          } else if (this.windowData.hypervisorType === 'KVM') {
            dlg = 'ClusterListSingleSelectList'
            conditions.push('hypervisorType=KVM')
          }
        } else {
          conditions.push('hypervisorType=KVM')
        }
        this.openDialog(dlg, {
          conditions: conditions,
          select: (uuid) => this.selectCluster(uuid)
        })
      },
      selectCluster: function (uuid) {
        this.updateWindow({ clusterUuid: uuid }).then(() => {
          this.validate('clusterUuid')
        })
      },
      validate (name) {
        let obj = {}
        obj[`empty${name}`] = false
        let windowData = this.windowData
        let propToBeTrimed = ['name', 'cidr']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        if (name === 'cidr') {
          if (!this.isCidr(input)) {
            obj[`invalid${name}`] = true
            this.updateWindow(obj)
            return
          }
        }
        this.updateWindow(obj)
      },
      clearRow (name) {
        let obj = {}
        obj[name] = ''
        this.updateWindow(obj)
      },
      validateAll () {
        let obj = {}
        obj.invalidInput = false
        let props = ['cidr', 'clusterUuid']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this.windowData[`empty${item}`] || this.windowData[`invalid${item}`])
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },

      ok: function () {
        this.$refs.form.validate((valid) =>{
          if(valid)
          this.param.ok(this.createParam())
        })
      }
    }
  }
</script>
