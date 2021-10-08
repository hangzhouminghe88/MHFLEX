<template>
  <create-template-no-route>
    <div slot="header">
      <span>添加规则</span>
      <span class="create-back el-icon-back" @click="$emit('close')">返回</span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.type')}}</div>
        <el-select v-model="typeText" style="width: 100%;">
          <el-option value="Ingress">{{$t('securityGroup.Ingress')}}</el-option>
          <el-option value="Egress">{{$t('securityGroup.Egress')}}</el-option>
        </el-select>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.protocol')}}</div>
        <el-select v-model="windowData.protocol" style="width: 100%;" @change="changeProtocol">
          <el-option value="ALL">ALL</el-option>
          <el-option value="TCP">TCP</el-option>
          <el-option value="UDP">UDP</el-option>
          <el-option value="ICMP">ICMP</el-option>
        </el-select>
      </div>

      <div class="operation-row" v-if="windowData.protocol !== 'ICMP' && windowData.protocol !== 'ALL'">
        <div class="title required">{{$t('securityGroup.portStart')}}</div>
        <input type="number"  step="any" :value="windowData.startPort" @blur="validate('startPort')" :class="{'is-error': windowData.emptystartPort || windowData.invalidstartPort}" @keydown.enter="validate('startPort')" @input="(e) => { updateWindow({ 'startPort': e.target.value }) }" />
        <div v-show="windowData.emptystartPort && windowData.protocol !== 'ICMP' && windowData.protocol !== 'ALL'" class="error error-text">
          {{$t('error.emptyInput')+$t('securityGroup.portStart')}}
        </div>
        <div v-show="windowData.invalidstartPort &&!windowData.emptystartPort && windowData.protocol !== 'ICMP' && windowData.protocol !== 'ALL'" class="error error-text">
          {{$t('error.invalid')+$t('securityGroup.portStart')}}
        </div>
      </div>

      <div class="operation-row" v-if="windowData.protocol !== 'ICMP' && windowData.protocol !== 'ALL'">
        <div class="title required">{{$t('common.endPort')}}</div>
        <input type="number"  step="any" :class="{'is-error': windowData.emptyendPort || windowData.invalidendPort}" :value="windowData.endPort" @blur="validate('endPort')" @keydown.enter="validate('endPort')" @input="(e) => { updateWindow({ 'endPort': e.target.value }) }" />
        <div v-show="windowData.emptyendPort && windowData.protocol !== 'ICMP' && windowData.protocol !== 'ALL'" class="error error-text">
          {{$t('error.emptyInput')+$t('securityGroup.portEnd')}}
        </div>
        <div v-show="windowData.invalidendPort && windowData.protocol !== 'ICMP' && windowData.protocol !== 'ALL' && !windowData.emptyendPort" class="error error-text">
          {{$t('error.invalid')+$t('securityGroup.portEnd')}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title">CIDR</div>
        <input :value="windowData.allowedCidr" :placeholder="placeholderCidr" @blur="validate('allowedCidr')" :class="{'is-error': windowData.invalidallowedCidr}" @keydown.enter="validate('allowedCidr')" @input="(e) => { updateWindow({ 'allowedCidr': e.target.value }) }" />
        <div v-if="windowData.invalidallowedCidr" class="error error-text">
          {{$t('error.invalid')+$t('common.cidr')}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title">{{$t('securityGroup.remoteSecurityGroup')}}</div>
        <add-or-delete-input v-if="windowData.remoteSecurityGroupUuids.length > 0"
                             v-for="(uuid, index) in windowData.remoteSecurityGroupUuids"
                             :key="index"
                             :value="dbData.securitygroup[uuid] && dbData.securitygroup[uuid].name"
                             @remove="removeRemoteSecurityGroup($event, uuid)"/>
        <add-or-delete-input @open="selectRemoteSecurityGroup()"/>
      </div>

    </div>

    <div slot="footer" class="create-footer">
      <div class="btn-confirm" @click="ok">{{$t('common.confirm')}}</div>
      <div class="btn-cancel"  @click="$emit('close')">{{$t('common.cancel')}}</div>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";

  export default {
    name: "CreateRule",
    components: {AddOrDeleteInput, CreateTemplateNoRoute},
    mixins: [WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    created () {
      this.updateWindow({
        showMoreDropdownType: false,
        showMoreDropdownProtocol: false,
        type: 'Ingress',
        startPort: '',
        endPort: '',
        allowedCidr: '',
        protocol: 'TCP',
        remoteSecurityGroupUuids: []
      })
    },
    computed: {
      isIpv6 () {
        if (_.get(this.param, 'isIpv6')) return this.param.isIpv6
        else return false
      },
      placeholderCidr () {
        return this.isIpv6 ? '234e:0:4567::3d/64' : '192.168.1.0/24'
      },
      typeText:{
        get(){
          let self = this;
          return self.$t(`securityGroup.${self.windowData.type}`)
        },
        set(val){
          let self = this;
          self.updateWindow({type: val})
        }
      }
    },
    methods: {
      ...Validator,
      cancel: function () {
        this.closeDialog(this.windowId)
      },
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      removeRemoteSecurityGroup: function ($event, uuid) {
        let list = _.cloneDeep(this.windowData.remoteSecurityGroupUuids)
        let self = this
        let uuidList = list.filter((i) => i !== uuid)
        self.updateWindow({ remoteSecurityGroupUuids: uuidList })
      },
      selectRemoteSecurityGroup: function () {
        const self = this
        let uuidList = _.cloneDeep(self.windowData.remoteSecurityGroupUuids)
        self.openDialog('SecurityGroupMultiSelect', {
          conditions: [`ipVersion=${self.isIpv6 ? 6 : 4}`, `uuid!?=${uuidList}`],
          select: (securityGroupUuids) => {
            securityGroupUuids = securityGroupUuids.concat(_.cloneDeep(self.windowData.remoteSecurityGroupUuids))
            self.updateWindow({ remoteSecurityGroupUuids: securityGroupUuids })
          }
        })
      },
      validate (name) {
        let windowData = this.windowData
        let propToBeTrimed = ['name', 'allowedCidr']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : windowData[name]
        let obj = {}
        obj[`empty${name}`] = false
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        if (name === 'endPort' || name === 'startPort') {
          let range = {
            maxValue: 65535,
            minValue: 0
          }
          if (Number(input) !== 0 && (!this.isUint(input) || !this.isIn(input, range))) {
            obj[`invalid${name}`] = true
            this.updateWindow(obj)
            return
          }
          if (name === 'endPort' && windowData.startPort && Number(windowData[name]) < Number(windowData.startPort)) {
            obj[`invalid${name}`] = true
          }
          if (name === 'startPort' && windowData.endPort && Number(windowData[name]) > Number(windowData.endPort)) {
            obj[`invalid${name}`] = true
          }
          if (this.isIn(windowData.startPort, range) && this.isIn(windowData.endPort, range) && Number(windowData.endPort) >= Number(windowData.startPort)) {
            obj.invalidstartPort = false
            obj.invalidendPort = false
          }
        }
        if (name === 'allowedCidr') {
          let fuc = this.isIpv6 ? this.isIPV6Cidr : this.isCidr
          if (!fuc(input)) {
            obj[`invalid${name}`] = true
          }
        }
        this.updateWindow(obj)
      },
      validateAll () {
        let obj = {}
        obj.invalidInput = false
        let windowData = this.windowData
        let props = []
        if (this.windowData.allowedCidr) {
          props.push('allowedCidr')
        }
        if (this.windowData.protocol === 'TCP' || this.windowData.protocol === 'UDP') {
          props.push('startPort', 'endPort')
        }
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => windowData[`empty${item}`] || windowData[`invalid${item}`]) || windowData.invalidcidr
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      ok: function () {
        let msg = {
          type: this.windowData.type,
          startPort: this.windowData.startPort,
          endPort: this.windowData.endPort,
          protocol: this.windowData.protocol,
          ipVersion: this.isIpv6 ? 6 : 4,
          allowedCidr: this.windowData.allowedCidr === '' ? undefined : this.windowData.allowedCidr,
          remoteSecurityGroupUuids: this.windowData.remoteSecurityGroupUuids.length > 0 ? this.windowData.remoteSecurityGroupUuids : []
        }
        this.validateAll()
        if (this.windowData.invalidInput) return
        this.param.ok(msg);
        this.$emit('close');
      },

      changeProtocol(e){
        let self = this;
        switch (e) {
          case 'ALL':
            self.updateWindow({ 'protocol': e ,'startPort': null, 'endPort': null });
            break;
          case 'TCP':
            self.updateWindow({ 'protocol': e ,'startPort': '', 'endPort': '' }) ;
            break;
          case 'UDP':
            self.updateWindow({ 'protocol': e ,'startPort': '', 'endPort': '' });
            break;
          case 'ICMP':
            self.updateWindow({ 'protocol': e ,'startPort': '-1', 'endPort': '-1'});
            break;
        }
      }
    }
  }
</script>

<style scoped>

</style>
