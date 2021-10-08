<template>
  <page-template>
    <div slot="page-header">
      <el-row :getter="10">
        <el-col :span="2" class="page-header-title">{{$t('common.globalsettings')}}</el-col>
        <el-col :span="2.2">
          <el-tabs v-model="windowData.currTab" @tab-click="handleChangeTab">
            <el-tab-pane label="基本设置" name="basic"></el-tab-pane>
            <el-tab-pane label="高级设置" name="advanced"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading">
        <template slot="tableSlot" slot-scope="scope">
          <el-button icon="el-icon-edit" type="success" size="mini" @click="handleEdit(scope.data)">编辑</el-button>
        </template>
      </mh-table>
    </div>
  </page-template>
</template>

<script>
import MultiSelectList from "src/windows/Base/MultiSelectList";
import GlobalSettingsList from "src/om/globalSettings/List";
import PageTemplate from "src/component/PageTemplate";
import WindowBase from "src/windows/Window";

export default {
  name: "GlobalSettingsPage",
  mixins: [MultiSelectList, WindowBase, GlobalSettingsList],
  components: {
    PageTemplate
  },

  data() {
    let self = this;
       return {
        ldapSeparator: '',
        currMessage: null,
        configList: [],
        showList: [],
        dataSource: {
          getItemList: () => self.showList,
          handleSort: self.handleSort,
          fields: [
            {
              getHeaderContent: self.$t('common.name'),
              getContent: item => self.getField('name', item),
              tooltip: true
            },
            {
              getHeaderContent: self.$t('common.type'),
              getContent: item => self.getField('type', item),
              tooltip: true
            },
            {
              getHeaderContent: self.$t('common.description'),
              getContent: item => self.getField('description', item),
              tooltip: true
            },
            {
              getHeaderContent: self.$t('common.value'),
              getContent: item => self.getField('value', item),
              tooltip: true
            },
            {
              getHeaderContent: self.$t('common.action'),
              type: 'slot',
              tooltip: true
            }
          ]
        },
        hiddenConfigs: {
          imageReplication: ['enable', 'scanInterval'],
          pciDevice: ['iommuEnabled', 'gpuOfferingEnabled'],
          scheduler: ['job.attached.triggers.limit', 'job.resources.limit'],
          billing: ['resource.spending.interval', 'billing.generation.interval', 'billing.generation.resource.sliceSize'],
          volumeBackup: ['incrementalBackup.maxNum', 'rebackup.stoppedVm'],
          elaborate: ['elimilate.time'],
          imagestore: ['cleanOnExpunge'],
          ministorage: ['thin.provisioning.chunk.size', 'deletion.snapshot.gcInterval', 'deletion.gcInterval'],
          ldap: ['queryLdapEntryReturnAttributeSeparator'],
          longJob: {all: true},
          fusionstor: {all: true},
          aliyun: {all: true},
          daho: {all: true},
          query: {all: true},
          hybrid: {all: true},
          aliyunEbs: {all: true},
          aliyunNas: {all: true},
          aliyunNasPrimaryStorage: {all: true},
          tag2: ['tag.resource.attached'],
          vm: ['additionalQmp', 'vmDefaultCdRomNum', 'pciePortNums'],
          quota: ['listener.num', 'pci.num', 'sns.endpoint.num', 'zwatch.event.num', 'zwatch.alarm.num'],
          baremetalInstance: ['expungeInterval', 'expungePeriod'],
          host: ['ping.sleepPeriodAfterFailure', 'ping.timeout', 'add.batchLimit'],
          sharedblock: ['fencer.check.io', 'disable.host.when.storage.failure', 'snapshot.shrink', 'snapshot.compare', 'enable.lvmetad'],
          storageDevice: ['enable.fc.device.scan', 'enable.multipath'],
          captcha: ['captcha.cleanup.interval', 'captcha.valid.period'],
          zwatch: ['resolution.defaultAlgorithm.maxSamples', 'vcenter.event.read.interval'],
          vcenter: ['vcenter.metrics.read.interval', 'vcenter.metrics.read.maxSample', 'esx.host.check.interval'],
          kvm: ['testSshPortOpenTimeout', 'testSshPortOnConnectTimeout'],
          baremetalChassis: ['batch.maxnumber'],
          mevoco: ['qcow2.cluster.size', 'qcow2.allocation', 'xfsFragScrape.interval', 'xfsVolumeDetect.size'],
          v2v: ['v2v.virtv2vDockerImagePath', 'v2v.winVirtioDriverIsoPath', 'v2v.volumeDownloadParallelismDegree', 'v2v.VDDKLibPath'],
          baremetalPxeServer: ['ping.parallelismDegree', 'ping.interval', 'reservedCapacity'],
          vpc: ['configure.firewall.with.iptables'],
          vyos: ['configure.firewall.with.iptables'],
          vxlan: ['cluster.lazyAttach'],
          volumeSnapshot: ['snapshot.correct.after.restart.management'],
          virtualRouter: ['ssh.username'],
          premiumCluster: ['hugepage.size', 'hugepage_enable'],
          cloudBus: ['managementNodeNotFoundHandler.maxNum', 'managementNodeNotFoundHandler.timeoutInSecs'],
          huawei: {all: true},
          tencent: {all: true},
          huaweihybrid: {all: true}
        },
        exposedConfigs: {
          apiTimeout: [
            'org.zstack.header.image.APIAddImageMsg',
            'org.zstack.header.image.APICreateRootVolumeTemplateFromRootVolumeMsg',
            'org.zstack.header.image.APICreateDataVolumeTemplateFromVolumeMsg',
            'org.zstack.header.volume.APICreateDataVolumeFromVolumeTemplateMsg',
            'org.zstack.header.image.APICreateRootVolumeTemplateFromVolumeSnapshotMsg',
            'org.zstack.header.volume.APICreateDataVolumeFromVolumeSnapshotMsg',
            'org.zstack.header.volume.APICreateVolumeSnapshotMsg',
            'org.zstack.header.vm.APICreateVmInstanceMsg',
            'org.zstack.header.storage.volume.backup.APICreateVmFromVmBackupMsg',
            'org.zstack.storage.primary.local.APILocalStorageMigrateVolumeMsg'
          ],
          configurableTimeout: [
          ]
        },
        basicNameList: [
          'ui.operation.max.history',
          'ha.enable',
          'host.cpu.overProvisioning.ratio',
          'identity.session.timeout',
          'kvm.reservedMemory',
          'kvm.vm.cacheMode',
          'kvm.vm.cpuMode',
          'localStoragePrimaryStorage.liveMigrationWithStorage.allow',
          'mevoco.overProvisioning.memory',
          'mevoco.overProvisioning.primaryStorage',
          'mevoco.threshold.primaryStorage.physicalCapacity',
          'mevoco.vm.consoleMode',
          'virtualRouter.vrouter.password',
          'vm.cleanTraffic',
          'vm.deletionPolicy',
          'vm.expungePeriod',
          'vm.numa',
          'vm.videoType',
          'backupStorage.reservedCapacity',
          'primaryStorage.reservedCapacity'
        ],
        translateSizeUnit: {
          quota: ['image.size', 'volume.capacity', 'vm.memorySize'],
          kvm: ['ivshmem.size'],
          sharedblock: ['qcow2.cluster.size', 'thin.provisioning.volume.increment', 'thin.provisioning.volume.freespace', 'thin.provisioning.initialize.size'],
          mevoco: ['qcow2.cluster.size', 'qcow2.allocation']
        }
      }
  },

  created() {
    let self = this;
    self
      .updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: "createDate",
        sortDirection: "-",
        selectedUuidList: [],
        currTab: "basic",
        loading: false,
        methods: {
          queryList: self.queryList
        }
      })
      .then(() => {
        self.queryList();
      });
  },

  methods: {
    handleEdit(item) {
     this.openDialog('EditGlobalConfigDlg', {
        ldapSeparator: this.$data.ldapSeparator,
        item: _.cloneDeep(item),
        ok: (newValue) => {
          this.edit_ok(newValue, item)
        }
      })
    },
    handleChangeTab(e) {
       this.updateWindow({
          currTab: e.name
        }).then(() => { this.showList = this.getShowList() })
    },
    getField(field, item) {
      if(field === 'name') return this.translateName(item);
      if(field === 'type') return this.translateCategory(item);
      if(field === 'description') return this.translateDescription(item);
      if(field === 'value') return item.value;
    }
  }
};
</script>
