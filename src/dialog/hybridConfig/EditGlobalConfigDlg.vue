<template>
	<dialog-template>
		 <div slot="title" class="modal-plain-header">
			 <span class="modal-title">{{$t('common.editValue')}}{{$t("common.colon")}} {{translateCategory()}}-{{ translateName() }}</span>
			 <span class="dialog-close el-icon-close" @click="close()"></span>
		 </div>

		 <div slot="body">
       <div style="padding: 50px 230px;">
				<div class="operation-row"  v-if="isQuotaEditWithSize()">
					<el-input style="width: 75%;" v-model="windowData.newValue"/>
				  <el-select style="width: 25%;margin-left: -5px;" v-model="unit">
					 <el-option v-for="(unit, index) in sizeUnit"
					            :key="index"
											:value="unit"
											:label="unit"
					 ></el-option>
				  </el-select>
				</div>
				<div class="ip-wrapper" v-else>
          <div class="input" v-if="checkSelectRule()">
            <span id="common-value" class="text">{{$t('common.value')}}{{$t("common.colon")}}</span>
						<el-select  v-model="setNewValue">
							<el-option v-for="(option, index) in generateOptions()"
							           :key="index"
												 :value="option"
							>{{getI18n(option)}}</el-option>
						</el-select>
						<div class="ruleHint" v-if="this.dialogData.param.item.name === 'numa'">
              <span class="warning">{{windowData.ruleHint}}</span>
            </div>
            <div class="ruleHint" v-if="this.dialogData.param.item.name === 'private.l3.firewall.default.action'">
              <span class="warning">{{windowData.ruleHint}}</span>
            </div>
          </div>
          <div class="input-config" v-else>
            <span id="common-value">{{ $t('common.value') }}{{$t("common.colon")}}</span>
            <input v-model="newValue" @blur="imChecking()" @input="edit($event)" @keydown.enter="ok" @focus="selectText($event)" @keydown.esc="cancel" :class="{ 'is-error': windowData.error }" />
             <div class="ruleWarning">
              <span id="common-illegalInput" v-if="windowData.error"
							  class="error error-text"
							  style="left: 233px;">{{$t("common.illegalInput")}}</span>
             </div>
            <div class="ruleHint">
             <span class="warning">{{windowData.ruleHint}}</span>
            </div>
          </div>
        </div>
			 </div>
		 </div>

		 <div slot="footer" class="dialog-footer">
			 <span class="btn-confirm" @click="ok">{{$t('common.confirm')}}</span>
			 <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
		 </div>
	</dialog-template>
</template>

<script>
import WindowBase from 'src/windows/Window';
import { parseSize } from 'src/utils/utils';
import _ from 'lodash';

export default {
	name: 'EditGlobalConfigDlg',

  mixins: [WindowBase],

	data () {
		return {
			sizeUnit: ['M', 'G', 'T'],
			unit: 'G',
			newVal: '',
		}
	},

	 computed: {
		 setNewValue: {
       get () {
          return this.getI18n(this.newVal);
			 },
			 set (val) {
				 let self = this;
				 self.newVal = val;
			 }
		 }
	 },

	 created () {
    this.updateWindow({
      newValue: this.dialogData.param.item.value,
      ldapSeparator: this.dialogData.param.ldapSeparator,
      error: false,
      ruleObj: {
        'ha.enable': /^(true|false)$/,
        'host.cpu.overProvisioning.ratio': /^([1-9]\d{0,2}|1000)$/,
        'identity.session.timeout': 'identity.session.timeout',
        'kvm.reservedMemory': /^([1-9]\d{0,2}|10[0-1]\d|102[1-3])[GgMmKkBb]$|(^1[Tt]$)|^0$/,
        'kvm.vm.cacheMode': /^(writethrough|none|writeback)$/,
        'kvm.vm.cpuMode': /^(none|host-model|host-passthrough)$/,
        'localStoragePrimaryStorage.liveMigrationWithStorage.allow': /^(true|false)$/,
        'mevoco.overProvisioning.memory': /^([1-9]\d{0,2}|[1-9]\d{0,2}(\.\d{1,2}?)|1000|1000.0|1000.00)$/,
        'mevoco.overProvisioning.primaryStorage': /^([1-9]\d{0,2}|[1-9]\d{0,2}(\.\d{1,2}?)|1000|1000.0|1000.00)$/,
        'mevoco.threshold.primaryStorage.physicalCapacity': /^(0\.\d{1,4})$|^(1\.0{0,4})$|^1$/,
        'mevoco.vm.consoleMode': /^(vnc|spice)$/,
        'virtualRouter.vrouter.password': /^[a-zA-Z0-9]{1}([a-zA-Z0-9]|[-_#]){5,19}$/,
        'vm.cleanTraffic': /^(true|false)$/,
        'vm.deletionPolicy': /^(Direct|Delay|Never)$/,
        'vm.expungePeriod': 'vm.expungePeriod',
        'vm.numa': /^(true|false)$/,
        'vm.videoType': /^(cirrus|vga|qxl)$/,
        'vyos.private.l3.firewall.default.action': 'vyos.private.l3.firewall.default.action',
        'backupStorage.reservedCapacity': /^([1-9]\d{0,2}|10[0-1]\d|102[1-3])[GgMmKkBb]$|(^1[Tt]$)|^0$/,
        'primaryStorage.reservedCapacity': /^([1-9]\d{0,2}|10[0-1]\d|102[1-3])[GgMmKkBb]$|(^1[Tt]$)|^0$/,
        'kvm.dataVolume.maxNum': 'kvm.dataVolume.maxNum'
      },
      showMoreSize: false,
      ruleRegExp: '',
      selectListObj: {
        'databaseBackup.coverDatabase.allow': ['true', 'false'],
        'loginControl.login.control': ['true', 'false'],
        'vm.emulateHyperV': ['true', 'false'],
        'baremetalInstance.deletionPolicy': ['Delay', 'Direct', 'Never'],
        'vm.vmPortOff': ['true', 'false'],
        'applianceVm.agent.deployOnStart': ['true', 'false'],
        'ceph.backupStorage.mon.autoReconnect': ['true', 'false'],
        'ceph.primaryStorage.deletePool': ['true', 'false'],
        'ceph.primaryStorage.mon.autoReconnect': ['true', 'false'],
        'fusionstor.backupStorage.mon.autoReconnect': ['true', 'false'],
        'fusionstor.primaryStorage.deletePool': ['true', 'false'],
        'fusionstor.primaryStorage.mon.autoReconnect': ['true', 'false'],
        'ha.enable': ['true', 'false'],
        'host.connection.autoReconnectOnError': ['true', 'false'],
        'host.load.all': ['true', 'false'],
        'host.maintenanceMode.ignoreError': ['true', 'false'],
        'host.reconnectAllOnBoot': ['true', 'false'],
        'hostAllocator.hostAllocator.concurrent': ['true', 'false'],
        'hybrid.management.time.zone': ['CHINA', 'USA-EAST', 'USA-WEST', 'JAPAN', 'EURA', 'HK', 'ANZAC', 'SEA', 'EMEA'],
        'image.deletionPolicy': ['Direct', 'Delay', 'Never'],
        'image.enableResetPassword': ['true', 'false'],
        'kvm.vm.cacheMode': ['none', 'writethrough', 'writeback'],
        'kvm.vm.cpuMode': ['none', 'host-model', 'host-passthrough'],
        'kvm.vmSyncOnHostPing': ['true', 'false'],
        'kvm.checkHostCpuModelName': ['true', 'false'],
        'loadBalancer.balancerAlgorithm': ['roundrobin', 'leastconn', 'source'],
        'localStoragePrimaryStorage.liveMigrationWithStorage.allow': ['true', 'false'],
        'mevoco.distributeImage': ['true', 'false'],
        'mevoco.vm.consoleMode': ['vnc', 'spice'],
        'progress.progress.on': ['true', 'false'],
        'pciDevice.iommuEnabled': ['true', 'false'],
        'primaryStorage.primarystorage.delete.bits.garbage.on': ['true', 'false'],
        'securityGroup.egress.defaultPolicy': ['accept', 'deny'],
        'securityGroup.ingress.defaultPolicy': ['drop', 'accept', 'deny'],
        'virtualRouter.agent.deployOnStart': ['true', 'false'],
        'vm.bootMenu': ['true', 'false'],
        'vm.cleanTraffic': ['true', 'false'],
        'vm.deletionPolicy': ['Direct', 'Delay', 'Never'],
        'vm.instanceOffering.setNullWhenDeleting': ['true', 'false'],
        'vm.kvmHiddenState': ['true', 'false'],
        'vm.numa': ['true', 'false'],
        'vm.videoType': ['cirrus', 'vga', 'qxl'],
        'vm.spiceStreamingMode': ['off', 'filter', 'all'],
        'volume.deletionPolicy': ['Direct', 'Delay', 'Never'],
        'volume.diskOffering.setNullWhenDeleting': ['true', 'false'],
        'vyos.private.l3.firewall.default.action': ['reject', 'accept'],
        'mevoco.aio.native': ['true', 'false'],
        'sharedblock.qcow2.allocation': ['full', 'metadata', 'falloc', 'none'],
        'mevoco.qcow2.allocation': ['full', 'metadata', 'falloc', 'none'],
        'twofa.twofa.enable': ['true', 'false'],
        'v2v.v2v.hostAllocatorStrategy': ['LeastVmPreferredHostAllocatorStrategy', 'MinimumCPUUsageHostAllocatorStrategy', 'MinimumMemoryUsageHostAllocatorStrategy', 'MaxInstancePerHostHostAllocatorStrategy']
      },
      quotaEditWithSize: ['quota.image.size', 'quota.vm.memorySize', 'quota.volume.capacity', 'sharedblock.qcow2.cluster.size', 'mevoco.qcow2.cluster.size'],
      ruleId: `${this.dialogData.param.item.category}.${this.dialogData.param.item.name}`
    }).then(() => {
      return this.updateWindow({
        ruleHint: this.initRuleHint()
      })
    })
    if (this.dialogData.param && this.dialogData.param.item.value) this.newValue = this.dialogData.param.item.value
    window.addEventListener('click', this.onWindowClick)
	},

	methods: {
		 translateName () {
		  let item = this.dialogData.param.item;
      let initialId = `${item.category}.${item.name}`
      let id = 'globalConfig.' + initialId.replace(/\./g, '_')
      let result = this.$t(id)
      return result
		},

    translateCategory () {
      let id = `globalConfig.${this.dialogData.param.item.category}_name`
      let categoryTitle = this.$t(id)
      return categoryTitle
		},

		close () {
			let self = this;
			self.closeDialog(self.windowId);
		},

		isQuotaEditWithSize () {
      let isIn = _.includes(this.windowData.quotaEditWithSize, this.windowData.ruleId)
      return isIn
		},

		 generateOptions () {
      let optionList = this.windowData.selectListObj[this.windowData.ruleId]
      return optionList
		},

		initRuleHint () {
      let item = this.dialogData.param.item
      let initialId = `${item.category}.${item.name}`
      let id = 'globalConfigErrorTip.' + initialId.replace(/\./g, '_')
      if (item.category === 'ldap' && item.name === 'queryLdapEntryReturnAttributes') {
        return this.$t('globalConfigErrorTip.ldap', { separator: this.windowData.ldapSeparator })
      }
      if (item.category === 'quota') {
        return this.$t('globalConfigErrorTip.quota')
      }
      return this.windowData.ruleObj[initialId] ? this.$t(id) : ''
		},

		 checkSelectRule () {
      let isSelectRule = _.includes(Object.keys(this.windowData.selectListObj), this.windowData.ruleId)
      return isSelectRule
		},

		 getI18n (value) {
      if (this.$t(`globalConfig.${value}`) === `globalConfig.${value}`) return value
      else return this.$t(`globalConfig.${value}`)
		},

    imChecking: function () {
      let item = this.dialogData.param.item
      let id = `${item.category}.${item.name}`
      let regexp = this.windowData.ruleObj[id] ? this.windowData.ruleObj[id] : ''
      if (item.category === 'quota' || ((item.category === 'sharedblock' || item.category === 'mevoco') && item.name === 'qcow2.cluster.size')) {
        this.newValue = parseInt(this.newValue)
        return !isNaN(this.newValue) && this.newValue >= 0
      }
      if (regexp === '') {
        return true
      } else if (regexp === 'identity.session.timeout') {
        return this.newValue <= 2592000 && this.newValue >= 600 && (Math.ceil(this.newValue) === Math.floor(this.newValue))
      } else if (regexp === 'vm.expungePeriod') {
        return this.newValue <= 2592000 && this.newValue >= 3600 && (Math.ceil(this.newValue) === Math.floor(this.newValue))
      } else if (regexp === 'kvm.dataVolume.maxNum') {
        return this.newValue <= 24 && this.newValue >= 1 && (Math.ceil(this.newValue) === Math.floor(this.newValue))
      } else {
        if (regexp.test(this.newValue)) {
          this.windowData.error = false
        } else {
          this.windowData.error = true
        }
        return regexp.test(this.newValue)
      }
		},

		selectText (e) {
      if (e.target.value !== this.dialogData.param.item.value) return
      let ele = e.target
      ele.select()
      e.stopPropagation()
    },

		edit ($event) {
      this.newValue = $event.target.value
		},


		parseSize () {

		},

		ok () {
			if(this.windowData.error) return;
      if (this.isQuotaEditWithSize() && this.imChecking()) {
        this.dialogData.param.ok(String(parseSize(this.windowData.newValue + this.unit)))
        this.closeDialog(this.windowId)
        return
      }
      if (this.dialogData.param.item.category === 'quota') {
        this.dialogData.param.ok(String(this.windowData.newValue))
        this.closeDialog(this.windowId)
        return
      }
      if (this.checkSelectRule()) {
        this.dialogData.param.ok(this.newVal)
        this.closeDialog(this.windowId)
      } else if (this.imChecking()) {
        this.dialogData.param.ok(this.newValue)
        this.closeDialog(this.windowId)
      } else {
        this.windowData.error = true
      }
    },
	}
}
</script>

<style lang="less" scoped>

</style>
