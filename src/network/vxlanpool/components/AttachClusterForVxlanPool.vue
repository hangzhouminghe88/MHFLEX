<template>
  <create-template-no-route>
    <div slot="header">
      <span>{{$t('common.attach')}}</span>
      <span class="create-back" @click="$emit('close')">
        <i class="el-icon-back"></i>
        <span>返回</span>
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">VTEP CIDR</div>
        <input type="text" v-model="cidrBlock" placeholder="192.168.1.0/24"
               :class="{'is-error': emptycidrBlock || invalidcidrBlock}"
               @blur="validate('cidrBlock')"/>
        <div class="error error-text" v-if="emptycidrBlock && invalidcidrBlock">
          {{$t('error.emptyInput') + 'VTEP CIDR'}}
        </div>
        <div class="error error-text" v-if="!emptycidrBlock && invalidcidrBlock">
          {{$t('error.invalid') + 'VTEP CIDR'}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.cluster')}}</div>
        <add-or-delete-input :value="dbData.cluster[clusterUuid] && dbData.cluster[clusterUuid].name"
                             :class="{'is-error': emptyclusterUuid}"
                             @remove="removeUuid('clusterUuid')"
                             @open="openClusterSelect"/>
        <div class="error error-text" v-if="emptyclusterUuid">
          {{$t('error.unselected') + $t('common.cluster')}}
        </div>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "src/component/CreateTemplateNoRoute";
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import rpc from 'src/utils/rpc';
  import { getLicensePermission } from 'src/utils/utils';

  export default {
    name: "AttachClusterForVxlanPool",

    mixins: [WindowBase],

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    components: {AddOrDeleteInput, CreateTemplateNoRoute},

    data() {
      return {
        cidrBlock: '',
        emptycidrBlock: false,
        invalidcidrBlock: false,
        clusterUuid: '',
        emptyclusterUuid: false
      }
    },

    created () {
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
      self.zoneUuid = curSelectZoneUuid;
      self.hypervisorType = hypervisorType;
    },

    methods: {
      ...Validator,
      validate(name) {
        let self = this, input = '';
        input = String(self[name]).trim();
        self[`empty${name}`] = false;
        self[`invalid${name}`] = false;
        if(/^\s*$/.test(input)) {
          self[`empty${name}`] = true;
          return;
        }
        if(name === 'cidrBlock') {
          if(!self.isCidr(input)) {
            self[`invalid${name}`] = true;
            return;
          }
        }
      },

      openClusterSelect() {
        let conditions = [`zoneUuid=${this.zoneUuid}`, `uuid!?=${this.dbData.l2network[this.windowData.dataUuid].attachedClusterUuids}`]
        let dlg = 'ClusterSelectListDlg'
        if (getLicensePermission('LICENSE_EXTRA_BAREMETAL', this)) {
          dlg = 'BaremetalClusterListSingleSelectList'
          if (this.hypervisorType === 'baremetal') {
            dlg = 'BaremetalClusterListSingleSelectList'
            conditions.push('hypervisorType=baremetal')
          } else if (this.hypervisorType === 'KVM') {
            dlg = 'ClusterSelectListDlg'
            conditions.push('hypervisorType=KVM')
          }
        } else {
          conditions.push('hypervisorType=KVM')
        }
        this.openDialog(dlg, {
          conditions: conditions,
          showTab: false,
          type: 'radio',
          select: (uuid) => this.selectCluster(uuid)
        })
      },

      selectCluster(uuid) {
        let self = this;
        self.clusterUuid = uuid;
        self.validate('clusterUuid');
      },

        removeUuid(uuid) {
          let self = this;
          self[uuid] = '';
          self.validate('clusterUuid');
        },

        initVxlanPoolCidr (uuid) {
        const self = this
        rpc.query(`l2-networks/vxlan-pool/${uuid}`)
          .then((resp) => {
            if (resp.inventories.length > 0) {
              if (resp.inventories[0].attachedClusterUuids.length > 0) {
                let cidr = resp.inventories[0].attachedCidrs[resp.inventories[0].attachedClusterUuids[0]]
                self.cidrBlock = cidr;
              }
            }
          })
      },

      validateAll() {
        let self = this, props=['cidrBlock',  'clusterUuid'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) =>  self[`empty${name}`] === true ||  self[`invalid${name}`] === true);
        return invalid;
      },

      createParam: function () {
        return {
          cidr: this.cidrBlock,
          clusterUuid: this.clusterUuid
        }
      },

      confirm() {
        let self = this;
        if(self.validateAll()) return;
        this.param.ok(this.createParam());
        this.$emit('close');
      }
    }
  }
</script>

<style scoped>

</style>
