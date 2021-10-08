<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('host.add')}}</span>
      <span @click="$router.push({name: 'host'})" class="create-back"><i class="el-icon-back"></i> 回到物理机列表 </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('host.addMethod')}}</div>
        <el-radio v-model="addType" label="manualAdd">{{$t('host.manualAdd')}}</el-radio>
        <el-radio v-model="addType" label="useFile">{{$t('host.useFile')}}<span v-if="addType=='useFile'" class="link" @click="downLoadTemplate">({{$t('host.installTemplate')}})</span></el-radio>
      </div>
      <div v-if="addType=='manualAdd'">
        <div class="operation-row">
          <div class="title required">{{$t('common.name')}}</div>
          <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')" ref="inputName"></input>
          <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title">{{$t('common.description')}}</div>
          <textarea type="text" rows="3" v-model="description"></textarea>
        </div>
        <div class="operation-row" v-if="$route.params.clusterUuid">
          <div class="title required">{{$t('common.cluster')}}{{$t('common.colon')}}{{dbData.cluster && dbData.cluster[$route.params.clusterUuid] && dbData.cluster[$route.params.clusterUuid].name}}</div>
        </div>
        <div class="operation-row" v-else>
          <div class="title required">{{$t('common.cluster')}}</div>
          <add-or-delete-input @open="openClusterDlg()" @remove="removeUuid('clusterUuid');" :value="dbData.cluster && dbData.cluster[clusterUuid] && dbData.cluster[clusterUuid].name"
                               :class="{'is-error': emptyclusterUuid}"></add-or-delete-input>
          <div class="error error-text" v-if="emptyclusterUuid">{{$t('common.cluster')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('host.addIPMethods')}}</div>
          <el-radio v-model="addIPMethods" label="useIp">IP</el-radio>
          <el-radio v-model="addIPMethods" label="useIpRange">{{$t('common.ipRange')}}</el-radio>
        </div>
        <div class="operation-row" v-if="addIPMethods === 'useIp'">
          <div class="title required">{{$t('common.managementIp')}}</div>
          <input type="text" placeholder="192.168.0.1" v-model="managementIp" @blur="validate('managementIp')" :class="{'is-error': emptymanagementIp || invalidmanagementIp}"></input>
          <div class="error-text error" v-if="emptymanagementIp && !invalidmanagementIp">{{$t('common.managementIp')}}{{$t('error.noEmpty')}}</div>
          <div class="error-text error" v-if="!emptymanagementIp && invalidmanagementIp">{{$t('common.managementIp')}}{{$t('error.invalid')}}</div>
        </div>
        <div class="operation-row" v-if="addIPMethods === 'useIpRange'">
          <div class="title required">{{$t('common.startIp')}}</div>
          <input type="text" placeholder="192.168.0.100" v-model="startIp" :class="{'is-error': emptystartIp || invalidstartIp}" @blur="validate('startIp')"/>
          <div class="error error-text" v-if="emptystartIp && !invalidstartIp">{{$t('common.startIp')}}{{$t('error.noEmpty')}}</div>
          <div class="error error-text" v-if="!emptystartIp && invalidstartIp">{{$t('common.startIp')}}{{$t('error.invalid')}}</div>
        </div>
        <div class="operation-row" v-if="addIPMethods === 'useIpRange'">
          <div class="title required">{{$t('common.endIp')}}</div>
          <input type="text"  placeholder="192.168.0.255" v-model="endIp" :class="{'is-error': emptyendIp || invalidendIp}" @blur="validate('endIp')"/>
          <div class="error error-text" v-if="emptyendIp && !invalidendIp">{{$t('common.endIp')}}{{$t('error.noEmpty')}}</div>
          <div class="error error-text" v-if="!emptyendIp && invalidendIp">{{$t('common.endIp')}}{{$t('error.invalid')}}</div>
        </div>
        <div class="operation-row">
          <el-checkbox v-model="iommu">{{$t('host.iommu')}}</el-checkbox>
        </div>
        <div class="operation-row">
          <el-checkbox v-model="closeEPT">{{$t('host.closeEPT')}}</el-checkbox>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.sshPort')}}</div>
          <input type="number" v-model="sshPort" :class="{'is-error': emtpysshPort || invalidsshPort}" @blur="validate('sshPort')"/>
          <div class="error error-text" v-if="emptysshPort && !invalidsshPort">{{$t('common.ssh')}}{{$t('error.noEmpty')}}</div>
          <div class="error errro-text" v-if="!emptysshPort && invalidsshPort">{{$t('common.ssh')}}{{$t('error.invalid')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.username')}}</div>
          <input type="text" v-model="username" :class="{'is-error': emptyusername}" @blur="validate('username')"></input>
          <div class="error error-text" v-if="emptyusername">{{$t('common.username')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('common.password')}}</div>
          <input type="password" v-model="password" :class="{'is-error': emptypassword}" @blur="validate('password')"></input>
          <div class="error error-text" v-if="emptypassword">{{$t('common.password')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row" v-if="addIPMethods === 'useIp'">
          <div class="title">{{$t('host.addMoreHost')}}</div>
          <add-or-delete-input @open="addMoreHost"></add-or-delete-input>
        </div>
        <div class="operation-row">
          <div class="title" v-if="windowData.hostList.length > 0">
            {{$t("host.configedHost")}}
          </div>
          <div style="margin-bottom:10px;" v-show="windowData.hostList.length > 0" v-for="(item, index) in windowData.hostList">
            <div class="ipmi-body">
              <div id="common-name" class="ipmi-content">
                {{$t("common.name")}}{{$t("common.colon")}} {{item.name}}
                <div class="delete" @click="deleteHost(index)" style="position:relative; float:right; margin-top:10px;"></div>
              </div>
              <div id="common-introduction" class="ipmi-content" style="height:auto; max-height:80px; padding-bottom:0px;">
                {{$t("common.introduction")}}{{$t("common.colon")}} {{item.description}}
              </div>
              <div id="common-cluster" class="ipmi-content">
                {{$t("common.cluster")}}{{$t("common.colon")}} {{dbData.cluster[item.clusterUuid] && dbData.cluster[item.clusterUuid].name}}
              </div>
              <div id="common-hostIp" class="ipmi-content">
                {{$t("common.hostIp")}}{{$t("common.colon")}} {{item.managementIp}}
              </div>
              <div id="common-disable" class="ipmi-content">
                {{$t("host.iommu")}}{{$t("common.colon")}} {{item.systemTags ? $t("common.enable") : $t("common.disable")}}
              </div>
              <div id="common-sshPort" class="ipmi-content">
                {{$t("common.sshPort")}}{{$t("common.colon")}} {{item.sshPort}}
              </div>
              <div id="common-username" class="ipmi-content">
                {{$t("common.username")}}{{$t("common.colon")}} {{item.username}}
              </div>
              <div id="common-password" class="ipmi-content">
                {{$t("common.password")}}{{$t("common.colon")}} {{ item.password.replace(/./g, '*') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="addType=='useFile'" class="operation-row">
        <div class="drop-file-body" :class="{'is-error': emptyfile || invalidfile}">
          <input type="file" @change="filesChange($event)"/>
          <i class="el-icon-upload icon" v-if="uploadFileName === '' || invalidfile"></i>
          <i class="el-icon-circle-check-outline icon-success icon" v-if="uploadFileName !== '' && !invalidfile" style="color: #0077d1"></i>
          <span class="text" style="display: block;">选择或拖放文件到这里</span>
          <div v-if="uploadFileName !== '' && !invalidfile" class="click-button" @click="checkFile($event)">
            {{ $t("host.checkFile") }}
          </div>
        </div>
        <div class="error error-text" v-if="addType=='useFile' && emptyfile">
          {{$t('error.emptyDropFile')}}
        </div>
        <div class="error error-text" v-if="addType=='useFile' && invalidfile">
          {{$t('error.invalidDropFile')}}
        </div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'host'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import WindowBase from 'src/windows/Window';
  import validator from 'src/utils/validator';
  import Utils from 'src/utils/utils';
  import HostMethods from 'src/om/host/Methods';

  export default {
    name: "CreateHostPage",
    mixins: [WindowBase, HostMethods],
    components: {AddOrDeleteInput, CreateTemplate},
    data() {
      return {
        addType: 'manualAdd',
        name: '',
        description: '',
        emptyname: false,
        addIPMethods: 'useIp',
        managementIp: '',
        emptymanagementIp: false,
        invalidmanagementIp: false,
        startIp: '',
        emptystartIp: false,
        invalidstartIp: false,
        endIp: '',
        emptyendIp: false,
        invalidendIp: false,
        iommu: false,
        closeEPT: false,
        sshPort: '22',
        emptysshPort: false,
        emtpysshPort: false,
        invalidsshPort: false,
        username: 'root',
        emptyusername: false,
        password: '',
        emptypassword: false,
        emptyclusterUuid: false,
        clusterUuid:"",
        lastName:"",
        lastSshPort:"",
         lastUsername:"",
        lastPassword:"",
        emptyfile: false,
        invalidfile: false,
        localFile: {},
        uploadFileName: ''
      }
    },
    created(){
      let self = this;
      if(self.$route.params && self.$route.params.clusterUuid){
        self.clusterUuid = self.$route.params.clusterUuid;
      }
      self.updateWindow({
        hostList: [],
        listkey: ['name', 'description', 'clusterUuid', 'managementIp', 'iommu', 'sshPort', 'username', 'password'],
        checkListKey: ['name', 'clusterUuid', 'sshPort', 'username', 'password']
      })
    },
    methods: {
      ...validator,
      ...Utils,
      checkFile: function ($event) {
        $event.stopPropagation()
        if (!this.localFile.text) return
        else {
          this.openDialog('CheckAddHostFileConfirmDlg', {
            fileInfo: this.localFile.text
          })
        }
      },
      validate(name){
        let obj = {}, self = this;
        self[`empty${name}`] = false
        let propToBeTrimed = ['managementIp', 'name']
        if (name === 'file') {
          if (self.addType=='useFile' && _.isNull(this.localFile)) {
            self[`empty${name}`] = true
          } else if (self.addType=='useFile' || !_.isNull(this.localFile)) {
            let list = this.localFile.name.split('.')
            if (['csv', 'xlsx'].indexOf(list[list.length - 1].toLowerCase()) === -1) {
              self[`invalid${name}`] = true
            } else {
              self[`invalid${name}`] = false
            }
          }
          return
        }
        let input = propToBeTrimed.indexOf(name) > -1 ? String(self[name]).trim() : self[name]
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        self[`invalid${name}`] = false
        if (name.indexOf('managementIp') > -1 && !this.isIP(input)) {
          self[`invalid${name}`] = true
        }
        if (name.indexOf('sshPort') > -1 && !this.isUint(input)) {
          self[`invalid${name}`] = true
        }
        let IPs = ['startIp', 'endIp']
        if (IPs.indexOf(name) > -1) {
          if (!this.isIP(input)) {
            self[`invalid${name}`] = true
            return
          }
          let parts = input.split('.')
          let isInvalid = false
          if (name === 'startIp' && self.endIp) {
            self.invalidipRange = false
            let endIpParts = self.endIp.split('.')
            for (let i = 0; i < endIpParts.length; i++) {
              if (Number(endIpParts[i]) > Number(parts[i])) {
                break
              }
              if (Number(endIpParts[i]) < Number(parts[i])) {
                self.invalidipRange = true
                break
              }
            }
          }
          if (name === 'endIp' && self.startIp) {
            self.invalidipRange = false
            let startIpParts = self.startIp.split('.')
            for (let i = 0; i < startIpParts.length; i++) {
              if (Number(startIpParts[i]) < Number(parts[i])) {
                break
              }
              if (Number(startIpParts[i]) > Number(parts[i])) {
                self.invalidipRange = true
                break
              }
            }
            if (this.ip2Int(self.endIp) - this.ip2Int(self.startIp) > 500) {
              self.invalidMoreHost = true
            }
          }
          obj[`invalid${name}`] = isInvalid
        }
      },
      ip2Int (ip) {
        let num = 0
        ip = ip.split('.')
        num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3])
        num = num >>> 0
        return num
      },
      int2Ip (num) {
        let str
        let tt = []
        tt[0] = (num >>> 24) >>> 0
        tt[1] = ((num << 8) >>> 24) >>> 0
        tt[2] = (num << 16) >>> 24
        tt[3] = (num << 24) >>> 24
        str = `${String(tt[0])}.${String(tt[1])}.${String(tt[2])}.${String(tt[3])}`
        return str
      },
      getIPList (startIP, endIP) {
        let startIPInt = this.ip2Int(startIP)
        let endIPInt = this.ip2Int(endIP)
        let ipList = []
        for (let i = startIPInt; i <= endIPInt; i++) {
          ipList.push(this.int2Ip(i))
        }
        return ipList
      },
      openClusterDlg(){
        let self = this
        self.validate('clusterUuid');
        self.openDialog('ClusterSelectListDlg', {
          conditions: ['hypervisorType=KVM'],
          type: 'radio',
          select: (uuid) => self.selectCluster(uuid)
        })
      },
      selectCluster(uuid){
        let self = this;
        self.clusterUuid = uuid;
        self.validate('clusterUuid');
      },
      removeUuid(value){
        let self = this;
        self[value] = '';
      },
      addMoreHost: function () {
        if (this.havInvalid()) { return }
        let newHost = { systemTags: [] }
        if (this.closeEPT) newHost.systemTags.push('pageTableExtensionDisabled')
        let listkey = this.windowData.listkey
        listkey.forEach(item => {
          if (item === 'iommu') {
            if (this.iommu) newHost.systemTags.push('iommuState::Enabled')
          } else if (item === 'name' && this.windowData.hostList.length === 0) {
            newHost['name'] = this.name + '-1'
          } else {
            newHost[`${item}`] = this[`${item}`]
          }
        })
        let flag = !this.windowData.hostList.some(host => host.managementIp === newHost.managementIp)
        if (flag) this.windowData.hostList.push(newHost)
          this.name =  this.windowData.hostList[0].name.slice(0, -2) + '-' + (this.windowData.hostList.length + 1),
          this.lastName= this.windowData.hostList[0].name.slice(0, -2) + '-' + (this.windowData.hostList.length + 1),
          this.description = '',
          // clusterUuid: this.windowData.clusterUuid,
          this.managementIp = '',
          // iommu: this.windowData.iommu,
          this.lastSshPort = this.sshPort,
          this.lastUsername = this.username,
          this.lastPassword = this.password
        this.$nextTick(() => {
          this.$refs.inputName.focus()
        })
      },
      havInvalid () {
        let checkListKey = this.windowData.checkListKey
        if (this.addIPMethods === 'useIpRange') checkListKey.concat(['startIp', 'endIp'])
        else checkListKey.push('managementIp')
        if (this.addType === 'useFile') checkListKey = ['file']
        checkListKey.forEach(item => this.validate(item))
        return checkListKey.some(item => {
          if (item === 'managementIp' || item === 'sshPort') {
            return this[`empty${item}`] || this[`invalid${item}`]
          }
          return this[`empty${item}`]
        })
      },
      deleteHost: function (i) {
        let hostList = _.cloneDeep(this.windowData.hostList)
        hostList.splice(i, 1)
        this.updateWindow({ hostList })
      },
      createParam(){
        let self = this;
        if (!this.havInvalid()) {
          if (self.addType === 'useFile') {
            let param = {
              useFile: true,
              hostInfo: this.localFile.text
            }
            return param
          } else {
            if (self.addIPMethods !== 'useIpRange') {
              let firstHost = { systemTags: [] }
              if (this.closeEPT) firstHost.systemTags.push('pageTableExtensionDisabled')
              let listkey = this.windowData.listkey
              listkey.forEach(item => {
                if (item === 'iommu') {
                  if (this.iommu) firstHost.systemTags.push('iommuState::Enabled')
                } else {
                  firstHost[`${item}`] = this[`${item}`]
                }
              })
              let flag = !this.windowData.hostList.some(host => host.managementIp === firstHost.managementIp)
              if (flag) this.windowData.hostList.push(firstHost)
              return this.windowData.hostList
            } else {
              let firstHost = { systemTags: [] }
              if (this.closeEPT) firstHost.systemTags.push('pageTableExtensionDisabled')
              let listkey = this.windowData.listkey
              listkey.forEach(item => {
                if (item === 'managementIp') return
                if (item === 'iommu') {
                  if (this.iommu) firstHost.systemTags.push('iommuState::Enabled')
                } else {
                  firstHost[`${item}`] = this[`${item}`]
                }
              })
              let ipList = this.getIPList(this.startIp, this.endIp)
              let hostList = []
              ipList.forEach((ip, index) => {
                hostList.push({
                  ...firstHost,
                  name: `${firstHost.name}-${ip}`,
                  managementIp: ip
                })
              })
              return hostList
            }
          }
        } else if (self.addIPMethods !== 'useIpRange' && self.addType !== 'useFile') return this.windowData.hostList

      },
      confirm(){
        let self = this;
        if (self.havInvalid() && self.windowData.hostList.length === 0) {
          return
        } else if (self.havInvalid() && self.managementIp && self.addIPMethods !== 'useIpRange') { return }
        self.create(self.createParam())
        self.$router.push({name: 'host'});
      },
      downLoadTemplate(){
        let str = `${this.$t('host.template.name')},${this.$t('host.template.description')},${this.$t('host.template.clusterUuid')},${this.$t('host.template.managementIps')},${this.$t('host.template.IOMMU')},${this.$t('host.template.closeEPT')},${this.$t('host.template.sshPort')},${this.$t('host.template.username')},${this.$t('host.template.password')}\r\nHost-1,,d09347e964084c12a945a45cac384b87,192.168.0.1,No,No,22,root,password`
        this.downloadFile(`${this.$t('host.addHostFileName')}.csv`, str)
      },
      filesChange: function ($event) {
        let self = this
        let reader = new window.FileReader()
        let file = $event.target.files[0] ? $event.target.files[0] : $event.dataTransfer.files[0]
        self.uploadFileName = file.name
        self.uploadFileSize = file.size
        let localFile = _.cloneDeep(self.localFile)
        reader.onload = function (e) {
          localFile = {
            text: e.target.result,
            name: self.uploadFileName
          }
          $event.srcElement.value = ''
          self.localFile = localFile
          self.validate('file')
        }
        reader.readAsArrayBuffer(file)
      },
    }
  }
</script>

<style scoped lang="less">
.ipmi-body{
  border: 1px solid #eef3f7;
}
  .ipmi-content{
    padding: 5px;
  }
  .drop-file-body{
    width: 360px;
    height: 100px;
    background: #fafdff;
    border: 1px dashed #c6d3dc;
    border-radius: 2px;
    position: relative;
    text-align: center;
    .icon{
      font-size: 30px;
      display: inline-block;
      margin-top: 20px;
    }
    input[type='file']{
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      opacity: 0;
      cursor: pointer;
    }
    .text{
      font-size: 12px;
      display: block;
    }
    .click-button{
      position: absolute;
      border: 1px solid #dae0e6;
      color: #409EFF;
      top: 5px;
      right: 5px;
      height: 25px;
      line-height: 25px;
      font-size: 12px;
      width: 74px;
    }
  }
</style>
