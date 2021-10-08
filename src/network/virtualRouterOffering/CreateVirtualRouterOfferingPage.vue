<style scoped>
  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 40px;
    box-sizing: border-box;
    width: 303px
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

  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .rule-body {
    width: 100%;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    padding-bottom: 20px;
  }

  .rule-content {
    height: 30px;
    font-size: 14px;
    color: #333;
    width: 100%;
    padding: 10px;
    border-radius: 2px;
    position: relative;
    box-sizing: border-box;
  }

  .operation-block-header {
    border-bottom: 1px solid #adb0b8;
    padding-bottom: 8px;
    margin-bottom: 15px;
    color: #1a2736;
    font-size: 16px;
    cursor: pointer;
    max-width: 400px;
  }

  .el-radio-group {
    line-height: 40px;
    padding-top: 5px
  }

  .content-size {
    width: 300px;
  }

  .content-size input {
    width: calc(100% - 70px);
    position: relative;
  }

  .content-size .text {
    display: inline-block;
    left: 18px;
    line-height: 40px;
    position: relative;
  }

  .content-size .arrow {
    top: 3px;
    position: relative;
    left: 12px;
  }

  .content-size .size {
    float: right;
    height: 42px;
    line-height: 42px;
    width: 60px;
    position: relative;
    border: 1px solid #adb0b8;
    border-radius: 0 2px 2px 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    left: -2px;
  }

  .content-size .drop-size {
    position: relative;
    font-size: 0;
    top: -41px;
    right: 1px;
    width: 60px;
    z-index: 3000;
    background: #fff;
    border-radius: 0 2px 2px 2px;
    border: 1px solid #adb0b8;
    padding: 9px 0;
  }

  .content-size .drop-size a {
    padding: 5px 20px;
    text-decoration: none;
    display: block;
    font-size: 14px;
    color: #1a2736;
    letter-spacing: 0;
    line-height: 20px;
    text-align: center;
  }
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("common.createVirtualRouterOffering")}}
        </span>
      <span class="create-back" @click="$router.push('virtualrouteroffering')"><i
        class="el-icon-back"></i>回到云路由规格列表</span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title">
          {{$t('common.zone')}}{{$t('common.colon')}}{{dbData.zone[windowData.zoneUuid] &&
          dbData.zone[windowData.zoneUuid].name}}
        </div>
      </div>
      <div id="common-name" class="operation-row">
        <div class="title required">
          {{ $t("common.name") }}
        </div>
        <help-trigger name="virtualRouterOffering"/>
        <input v-model="windowData.name" :class="{'is-error': windowData.emptyname}" @blur="validate('name')"
               @keydown.enter="validate('name')" @input="(e) => { updateWindow({ 'name': e.target.value }) }"/>
        <div class="error error-text" v-if="windowData.emptyname">
          {{$t('error.emptyInput')+$t('common.name')}}
        </div>
      </div>

      <div id="common-introduction" class="operation-row">
        <div class="title">
          {{$t("common.introduction")}}
        </div>
        <textarea rows="3" v-model="windowData.description"
                  @input="(e) => { updateWindow({ 'description': e.target.value }) }"/>
      </div>

      <div class="operation-row">
        <div class="title required">
          CPU
        </div>
        <input v-model="windowData.cpuNum" type="number" step="any"
               :class="{'is-error': windowData.emptycpuNum || windowData.invalidcpuNum}" @blur="validate('cpuNum')"
               @keydown.enter="validate('cpuNum')" @input="(e) => { updateWindow({ 'cpuNum': e.target.value }) }"/>
        <div class="error error-text" v-if="windowData.emptycpuNum">
          {{$t('error.emptyInput')+$t('common.cpuNum')}}
        </div>
        <div class="error error-text" v-if="!windowData.emptycpuNum && windowData.invalidcpuNum">
          {{$t('error.invalid')+$t('common.cpuNum')}}
        </div>
      </div>

      <div id="common-memory" class="operation-row">
        <div class="title required">
          {{$t("common.memory")}}
        </div>
        <div class="content-size">
          <input v-model="windowData.memorySize" type="number" step="any"
                 :class="{'is-error': windowData.emptymemorySize || windowData.invalidmemorySize}"
                 @blur="validate('memorySize')" @keydown.enter="validate('memorySize')"
                 @input="(e) => { updateWindow({ 'memorySize': e.target.value }) }"
                 style="width: calc(100% - 82px)"/>
          <div class="size">
            <div
              @click="($event) => {updateWindow({'showMoreSize': !windowData.showMoreSize}); $event.stopPropagation()}">
              <span class="text">{{ windowData.memoryUnit }}</span>
              <img class="arrow" src="~assets/arrow_down.svg"/>
            </div>
            <div class="drop-size" v-show="windowData.showMoreSize">
              <a @click="selectSize('M', 'memoryUnit', 'showMoreSize')">M</a>
              <a @click="selectSize('G', 'memoryUnit', 'showMoreSize')">G</a>
              <a @click="selectSize('T', 'memoryUnit', 'showMoreSize')">T</a>
            </div>
          </div>
        </div>
        <div class="error error-text" v-if="windowData.emptymemorySize">
          {{$t('error.emptyInput')+$t('common.memory')}}
        </div>
        <div class="error error-text" v-if="!windowData.emptymemorySize && windowData.invalidmemorySize">
          {{$t('error.invalid')+$t('common.memory')}}
        </div>
      </div>

      <div id="common-image" class="operation-row">
        <div class="title required">
          {{ $t("common.image") }}
        </div>
          <add-or-delete-input :value="dbData.image[windowData.imageUuid] && dbData.image[windowData.imageUuid].name"
                               @remove="removeVirtualImage()" :class="{'is-error': windowData.emptyimageUuid}"
                               @open="openVirtualImageListSingleSelectListDlg();"></add-or-delete-input>
        <div class="error error-text" v-if="windowData.emptyimageUuid">
          {{$t('error.unselected')+$t('common.image')}}
        </div>
      </div>

      <div id="common-managementNetwork" class="operation-row" style="margin-top:-5px;">
        <div class="title required">
          {{ $t("common.managementNetwork") }}
        </div>
        <help-trigger name="virtualRouterOffering_managementNetwork"/>
        <div v-if="windowData.managementNetworkUuid.length > 0">
          <add-or-delete-input
            :value="dbData.l3network[windowData.managementNetworkUuid] && dbData.l3network[windowData.managementNetworkUuid].name"
            @remove="removeManagementNetwork()"
            :class="{'is-error': windowData.emptymanagementNetworkUuid}"></add-or-delete-input>
        </div>
        <div class="content" @click="openManagementNetworkDlg();" v-if="windowData.managementNetworkUuid.length===0">
          <div class="add" v-if="windowData.managementNetworkUuid === ''"></div>
        </div>
        <div class="error error-text" v-if="windowData.emptymanagementNetworkUuid">
          {{$t('error.unselected')+$t('common.managementNetwork')}}
        </div>
      </div>

      <div id="common-publicNetwork" class="operation-row">
        <div class="title required">
          {{ $t("common.publicNetwork") }}
        </div>
        <help-trigger name="virtualRouterOffering_publicNetwork"/>
        <div v-if="windowData.publicNetworkUuid.length > 0">
          <add-or-delete-input
            :value="dbData.l3network[windowData.publicNetworkUuid] && dbData.l3network[windowData.publicNetworkUuid].name"
            @remove="removePublicNetwork()"
            :class="{'is-error': windowData.emptypublicNetworkUuid}"></add-or-delete-input>
        </div>
        <div class="content" @click="openPublicNetworkDlg();" v-if="windowData.publicNetworkUuid.length===0">
          <div class="add" v-if="windowData.publicNetworkUuid === ''"></div>
        </div>
        <div class="error" v-if="windowData.emptypublicNetworkUuid">
          {{$t('error.unselected')+$t('common.publicNetwork')}}
        </div>
      </div>

    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('virtualrouteroffering')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import Validator from 'src/utils/validator';
  import CreateTemplate from 'src/component/CreateTemplate';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";

  export default {
    name: "CreateVirtualRouterOfferingPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddOrDeleteInput,
      CreateTemplate
    },
    data() {
      return {
        imageAssistantId: '',
        isSystemImageAvailableConditions: ['state=Enabled', 'type=zstack', 'status=Ready', 'system=true', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'mediaType!=DataVolumeTemplate'],
        isSystemImageExistedConditions: ['type=zstack', 'status!=Deleted', 'system=true', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`, 'mediaType!=DataVolumeTemplate'],
        canCreate: true,
      }
    },
    computed: {},
    created() {
      let curSelectZoneUuid = localStorage.getItem('currZoneUuid')
      this.updateWindow({
        name: '',
        description: '',
        cpuNum: 8,
        memorySize: 8,
        cpuSpeed: 1,
        zoneUuid: curSelectZoneUuid,
        vCenterClusterList: [],
        imageUuid: '',
        managementNetworkUuid: '',
        publicNetworkUuid: '',
        systemTags: ['vrouter'],
        type: 'VirtualRouter',
        showMoreSize: false,
        memoryUnit: 'G',
        emptymanagementNetworkUuid: false,
        emptypublicNetworkUuid: false,
        emptyimageUuid: false
      })
      this.initVirtualRouterImage()
      this.deleteAllAssistant()
      this.queryForAssistant()
    },
    destroyed: function () {
      this.removeTimerTask(this.windowData.timerId)
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Validator,
      removePublicNetwork() {
        this.updateWindow({
          publicNetworkUuid: ''
        })
      },
      removeManagementNetwork() {
        this.updateWindow({
          managementNetworkUuid: ''
        })
      },
      removeVirtualImage() {
        this.updateWindow({
          imageUuid: ''
        })
      },
      queryImageForAssistant() {
        const self = this
        return rpc.query('images', {count: true, q: self.isSystemImageAvailableConditions}).then(resp => {
          if (resp.total !== 0) {
            self.removeTimerTask(self.windowData.timerId)
            self.deleteAssistant(this.imageAssistantId)
          }
        })
      },
      initVirtualRouterImage() {
        return rpc.query('images', {q: this.isSystemImageAvailableConditions}).then(resp => {
          if (resp.inventories.length === 1) {
            return this.updateDbRow({
              tableName: 'image',
              id: resp.inventories[0].uuid,
              data: resp.inventories[0]
            }).then(() => {
              return this.selectImage(resp.inventories[0].uuid)
            })
          }
        })
      },
      queryForAssistant: async function () {
        let self = this
        let zoneUuid = `zone.uuid=${localStorage.getItem('currZoneUuid')}`
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${self.genUniqueId()}`
          let content, hide
          if (!this.dbData.common.isAdmin) {
            content = 'lackOfHardWare'
            hide = true
          } else {
            content = `lackOf${resourceName}`
            hide = false
          }
          let handler = () => {
            this.$router.push({name: 'createvirtualrouterimage'})
          }
          if (resourceName === 'AvaliableNetwork') {
            handler = () => this.$router.push({name: 'publicnetwork'})
          }
          if (resourceName === 'AvaliablevCenterNetwork') {
            handler = () => this.$router.push({name: 'vcenternetwork'})
          }
          if (resourceName === 'VirtualRouterImage' && operation === 'check') {
            handler = () => this.$router.push({name: 'virtualrouterimage'})
            this.imageAssistantId = id
          }
          self.createAssistant({
            id,
            hide,
            operation,
            title: 'vrInstanceOffeingTitle',
            ownerId: self.windowData.id,
            content,
            handler
          })
        }
        rpc.query('images', {count: true, q: this.isSystemImageExistedConditions}).then(resp => {
          if (resp.total === 0) {
            newAssistant('VirtualRouterImage', 'add')
            return
          }
          rpc.query('images', {count: true, q: this.isSystemImageAvailableConditions}).then(resp => {
            if (resp.total === 0) {
              newAssistant('VirtualRouterImage', 'check')
              self.addTimerTask({
                id: self.windowData.timerId,
                interval: 2,
                method: () => {
                  self.queryImageForAssistant()
                }
              })
            }
          })
        })
        rpc.query('l3-networks', {count: true, q: [`category?=Public,System`, zoneUuid]}).then(resp => {
          if (resp.total === 0) newAssistant('AvaliableNetwork', 'create')
        })
        if (this.windowData.imageUuid) {
          let l3Conditions = [zoneUuid, 'category?=Public,System']
          if (self.dbData.image[self.windowData.imageUuid].format === 'vmtx') {
            let l3network = await this.selectVcenterNetwork()
            let vCenterClusterList = await this.getvCenterClusterList()
            l3Conditions.push(`uuid?=${l3network}`)
            l3Conditions.push(`l2Network.cluster.uuid?=${vCenterClusterList}`)
          } else {
            l3Conditions.push('l2Network.cluster.type=zstack')
          }
          rpc.query('l3-networks', {count: true, q: l3Conditions})
            .then(resp => {
              if (resp.total === 0 && self.dbData.image[self.windowData.imageUuid] && self.dbData.image[self.windowData.imageUuid].format === 'vmtx') newAssistant('AvaliablevCenterNetwork', 'check')
              else if (resp.total === 0 && !(self.dbData.image[self.windowData.imageUuid] && self.dbData.image[self.windowData.imageUuid].format === 'vmtx')) newAssistant('AvaliableNetwork', 'check')
            })
        }
      },
      createParam: function () {
        return {
          name: this.windowData.name,
          description: this.windowData.description,
          cpuNum: parseInt(this.windowData.cpuNum),
          memorySize: this.parseSize(this.windowData.memorySize + this.windowData.memoryUnit),
          zoneUuid: this.windowData.zoneUuid,
          imageUuid: this.windowData.imageUuid,
          managementNetworkUuid: this.windowData.managementNetworkUuid,
          publicNetworkUuid: this.windowData.publicNetworkUuid,
          systemTags: ['vrouter'],
          type: 'VirtualRouter'
        }
      },
      openVirtualImageListSingleSelectListDlg: function () {
        this.openDialog('VirtualRouterImageListSingleSelectDlg', {
          conditions: ['system=true', 'state=Enabled', 'status=Ready', 'type=zstack'],
          select: (uuid) => {
            this.selectImage(uuid)
          }
        })
      },
      selectImage: function (uuid) {
        const self = this
        self.updateWindow({imageUuid: uuid}).then(() => {
          self.validate('imageUuid')
        }).then(() => {
          self.initManagementNetwork()
          self.initPublicNetwork()
          self.queryForAssistant()
        })
        self.updateWindow({'showImageDlg': true})
      },
      initManagementNetwork: function () {
        const self = this
        let conditions = [`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
        if (self.dbData.image[self.windowData.imageUuid].format === 'vmtx') {
          conditions.push('l2Network.cluster.type=vmware')
          conditions.push('category?=Public,System')
        } else {
          conditions.push('l2Network.cluster.type=zstack')
          conditions.push('category?=Public,System')
        }
        let l3networkInventories
        rpc.query('l3-networks', {
          q: conditions
        }).then((resp) => {
          l3networkInventories = resp.inventories
          return self.updateDbTable({
            tableName: 'l3network',
            list: resp.inventories
          })
        }).then(() => {
          if (l3networkInventories.length === 1) {
            self.updateWindow({managementNetworkUuid: l3networkInventories[0].uuid})
          }
        })
      },
      initPublicNetwork: function () {
        const self = this
        let conditions = [`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
        if (self.dbData.image[self.windowData.imageUuid].format === 'vmtx') {
          conditions.push('l2Network.cluster.type=vmware')
          conditions.push('category=Public')
        } else {
          conditions.push('l2Network.cluster.type=zstack')
          conditions.push('category=Public')
        }
        let l3networkInventories
        rpc.query('l3-networks', {
          q: conditions
        }).then((resp) => {
          l3networkInventories = resp.inventories
          return self.updateDbTable({
            tableName: 'l3network',
            list: resp.inventories
          })
        }).then(() => {
          if (l3networkInventories.length === 1) {
            self.updateWindow({publicNetworkUuid: l3networkInventories[0].uuid})
          }
        })
      },
      selectSize: function (size, unitName, dropName, $event) {
        let obj = {}
        obj[unitName] = size
        obj[dropName] = !this.windowData[dropName]
        this.updateWindow(obj).then(() => {
          if (unitName === 'memoryUnit') {
            this.validate('memorySize')
          }
        })
      },

      getvCenterClusterList: async function () {
        const self = this
        let vCenterUuidList = []
        let vCenterClusterList = []
        let vCenterResp = await rpc.query('vcenters/backup-storage', {
          q: `image.uuid=${self.windowData.imageUuid}`,
          fields: 'vCenterUuid'
        })
        vCenterUuidList = vCenterUuidList.concat(vCenterResp.inventories.map(it => it.vCenterUuid))
        let vCenterClusterResp = await rpc.query('vcenters/clusters', {
          q: `vCenterUuid?=${vCenterUuidList}`,
          fields: 'uuid'
        })
        vCenterClusterList = vCenterClusterList.concat(vCenterClusterResp.inventories.map(it => it.uuid))
        return vCenterClusterList
      },
      getBackupStorageList: async function () {
        let backupStorageResp = await rpc.query('backup-storage', {q: `image.uuid=${this.windowData.imageUuid}`})
        return backupStorageResp.inventories
      },
      getCephPrimaryStorageList: async function (backupStorageUuidList) {
        let cephPrimaryStorageResp = await rpc.query('primary-storage', {q: [`cluster.zone.backupStorage.uuid?=${backupStorageUuidList}`, 'type=Ceph']})
        return cephPrimaryStorageResp.inventories
      },
      getClusterList: async function (primaryStorageUuid) {
        let clusterResp = await rpc.query('clusters', {q: `primaryStorage.uuid?=${primaryStorageUuid}`})
        return clusterResp.inventories
      },
      getClusterUuidList: async function () {
        let self = this
        let backupStorageList = await self.getBackupStorageList()
        let backupStorageUuidList = backupStorageList.map(item => item.uuid)
        let cephPrimaryStorageList = await self.getCephPrimaryStorageList(backupStorageUuidList)
        let primaryStorageUuid = ''
        cephPrimaryStorageList.forEach(item => {
          if (item.fsid === backupStorageList[0].fsid) {
            primaryStorageUuid = item.uuid
          }
        })
        let clusterUuidList = []
        if (primaryStorageUuid !== '') {
          let clusterList = await self.getClusterList(primaryStorageUuid)
          clusterUuidList = clusterList.map(item => item.uuid)
        }
        return clusterUuidList
      },
      genManagementNetworkConditions: async function () {
        let self = this
        let conditions = []
        if (self.dbData.image[self.windowData.imageUuid].format === 'vmtx') {
          let l3network = await self.selectVcenterNetwork()
          let vCenterClusterList = await self.getvCenterClusterList()
          conditions.push(`uuid?=${l3network}`)
          conditions.push(`l2Network.cluster.uuid?=${vCenterClusterList}`)
          // conditions.push('system=true')
          conditions.push('category?=Public,System')
        } else {
          let backupStorageList = await self.getBackupStorageList()
          let bsType = backupStorageList[0].type
          if (bsType === 'Ceph') {
            let clusterUuidList = await self.getClusterUuidList()
            conditions.push(`l2Network.cluster.uuid?=${clusterUuidList}`)
          }
          conditions.push(`zoneUuid=${self.browserLocalStorageGetItem('currZoneUuid')}`)
          conditions.push('l2Network.cluster.type=zstack')
          conditions.push('category?=Public,System')
        }
        return conditions
      },
      openManagementNetworkDlg: async function () {
        let self = this
        if (self.windowData.imageUuid === '' || self.windowData.imageUuid === undefined) self.validate('imageUuid')
        else {
          this.openDialog('L3NetworkSingleSelectListDlg', {
            conditions: await this.genManagementNetworkConditions(),
            select: (uuid) => {
              this.selectManagementNetwork(uuid)
            }
          })
        }
      },
      genPublicNetworkConditions: async function () {
        let conditions = []
        let self = this
        if (self.dbData.image[self.windowData.imageUuid].format === 'vmtx') {
          let l3network = await self.selectVcenterNetwork()
          let vCenterClusterList = await self.getvCenterClusterList()
          conditions.push('category=Public')
          conditions.push(`uuid?=${l3network}`)
          conditions.push(`l2Network.cluster.uuid?=${vCenterClusterList}`)
          // conditions.push('system=true')

        } else {
          let backupStorageList = await self.getBackupStorageList()
          let bsType = backupStorageList[0].type
          conditions.push('category=Public')
          if (bsType === 'Ceph') {
            let clusterUuidList = await self.getClusterUuidList()
            conditions.push(`l2Network.cluster.uuid?=${clusterUuidList}`)
          }
          conditions.push(`zoneUuid=${self.browserLocalStorageGetItem('currZoneUuid')}`)
          conditions.push('l2Network.cluster.type=zstack')
        }
        return conditions
      },
      openPublicNetworkDlg: async function () {

        this.openDialog('L3NetworkSingleSelectListDlg', {
          conditions: await this.genPublicNetworkConditions(),
          select: (uuid) => {
            this.selectPublicNetwork(uuid)
          }
        })
      },
      selectVcenterNetwork: async function () {
        const self = this
        let privateNetworkUuidList = []
        let vCenterNetworkUuidList = []
        // let vCenterUuidList = []
        // let vCenterClusterList = []
        let taskList = []
        let p = rpc.query('l3-networks', {
          q: [`zone.uuid=${self.windowData.zoneUuid}`],
          fields: 'uuid'
        }).then(resp => {
          privateNetworkUuidList = privateNetworkUuidList.concat(resp.inventories.map(it => it.uuid))
        })
        taskList.push(p)

        p = rpc.query('l3-networks', {
          q: [`l2Network.cluster.type=zstack`, `zone.uuid=${self.windowData.zoneUuid}`],
          fields: 'uuid'
        }).then((resp) => {
          vCenterNetworkUuidList = vCenterNetworkUuidList.concat(resp.inventories.map(it => it.uuid))
        })
        taskList.push(p)

        return await Promise.all(taskList).then(() => {
          privateNetworkUuidList = _.difference(privateNetworkUuidList, vCenterNetworkUuidList)
          return privateNetworkUuidList
        })
      },
      selectManagementNetwork: function (uuid) {
        this.updateWindow({managementNetworkUuid: uuid}).then(() => {
          this.validate('managementNetworkUuid')
        })
      },
      selectPublicNetwork: function (uuid) {
        this.updateWindow({publicNetworkUuid: uuid}).then(() => {
          this.validate('publicNetworkUuid')
        })
      },
      selectZone: function (uuid) {
        this.updateWindow({zoneUuid: uuid})
      },
      validate(name) {
        let obj = {}
        obj[`empty${name}`] = false
        let input = name === 'name' ? String(this.windowData[name]).trim() : this.windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
          obj[`invalid${name}`] = false
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        if (name === 'cpuNum' || name === 'memorySize') {
          if (!this.isUint(input)) {
            obj[`invalid${name}`] = true
            this.updateWindow(obj)
            return
          }
          if (name === 'memorySize') {
            let size = this.parseSize(input + this.windowData.memoryUnit)
            if (size < 16777216) {
              obj[`invalid${name}`] = true
            }
            this.updateWindow(obj)
            return
          }
        }
        this.updateWindow(obj)
      },
      validateAll() {
        let obj = {}
        obj.invalidInput = false
        let props = ['name', 'cpuNum', 'memorySize', 'imageUuid', 'managementNetworkUuid', 'publicNetworkUuid']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this.windowData[`empty${item}`] || this.windowData[`invalid${item}`])
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreSize) this.updateWindow({showMoreSize: false})
      },
      ok: function () {
        this.validateAll()
        if (this.windowData.invalidInput) return
        this.canCreate = false;
        this.create(this.createParam())
          .then(() => {
            this.$router.push({name: 'virtualrouteroffering'})
          }).catch(() => {
          this.canCreate = true;
        })

      }
    }
  }
</script>
