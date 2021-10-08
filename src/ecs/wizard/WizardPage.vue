<template>
  <create-template>
    <div slot="header" style="width: 100%;overflow: hidden">
      <div class="operation-process">
        <div class="operation-step">
          <img src="~assets/wizard_edit.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step === 0" />
          <img src="~assets/wizard_zone_hover.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step >0" />
          <span class="text" :class="{'text-wait': !(step > 0), 'text-finish': step > 0}">{{$t("common.zone")}}</span>
        </div>
        <div class="operation-course">
          <div :class="{'icon-process': step === 0, 'icon-process-hover': step > 0}"></div>
        </div>
        <div class="operation-step">
          <img src="~assets/wizard_cluster.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step < 1" />
          <img src="~assets/wizard_edit.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step === 1" />
          <img src="~assets/wizard_cluster_hover.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step > 1" />
          <span id="common-cluster" class="text" :class="{'text-wait': !(step > 1), 'text-finish': step > 1}">{{$t("common.cluster")}}</span>
        </div>
        <div class="operation-course">
          <div :class="{'icon-process': step < 2, 'icon-process-hover': step > 1}"></div>
        </div>
        <div class="operation-step">
          <img src="~assets/wizard_host.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step < 2" />
          <img src="~assets/wizard_edit.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step === 2" />
          <img src="~assets/wizard_host_hover.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step > 2" />
          <span id="common-host" class="text" :class="{'text-wait': !(step > 2), 'text-finish':step > 2}">{{$t("common.host")}}</span>
        </div>
        <div class="operation-course">
          <div :class="{'icon-process': step < 3, 'icon-process-hover':step > 2}"></div>
        </div>
        <div class="operation-step">
          <img src="~assets/wizard_bs.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step < 3" />
          <img src="~assets/wizard_edit.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step === 3" />
          <img src="~assets/wizard_bs_hover.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step > 3" />
          <span id="common-backupStorage" class="text" :class="{'text-wait': !(step >3), 'text-finish':step >3}">{{$t("common.backupStorage")}}</span>
        </div>
        <div class="operation-course">
          <div :class="{'icon-process': step < 4, 'icon-process-hover': step > 3}"></div>
        </div>
        <div class="operation-step">
          <img src="~assets/wizard_ps.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step < 4" />
          <img src="~assets/wizard_edit.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step === 4" />
          <img src="~assets/wizard_ps_hover.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step > 4" />
          <span id="common-primaryStorage" class="text" :class="{'text-wait': !(step > 4), 'text-finish': step > 4}">{{$t("common.primaryStorage")}}</span>
        </div>
        <div class="operation-course">
          <div :class="{'icon-process':step < 5, 'icon-process-hover': step > 4}"></div>
        </div>
        <div class="operation-step">
          <img src="~assets/wizard_instance_offering.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step < 5" />
          <img src="~assets/wizard_edit.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step === 5" />
          <img src="~assets/wizard_instance_offering_hover.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step  > 5" />
          <span id="common-instanceOffering" class="text" :class="{'text-wait': !(step > 5), 'text-finish': step > 5}">{{$t("common.instanceOffering")}}</span>
        </div>
        <div class="operation-course">
          <div :class="{'icon-process': step < 6, 'icon-process-hover': step > 5}"></div>
        </div>
        <div class="operation-step">
          <img src="~assets/wizard_image.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step < 6" />
          <img src="~assets/wizard_edit.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step === 6" />
          <img src="~assets/wizard_image_hover.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step > 6" />
          <span id="common-image" class="text" :class="{'text-wait': !(step > 6), 'text-finish': step > 6}">{{$t("common.image")}}</span>
        </div>
        <div class="operation-course">
          <div :class="{'icon-process': step < 7, 'icon-process-hover': step > 6}"></div>
        </div>
        <div class="operation-step">
          <img src="~assets/wizard_l2network.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step < 7" />
          <img src="~assets/wizard_edit.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step === 7" />
          <img src="~assets/wizard_l2network_hover.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step > 7" />
          <span id="common-l2network" class="text" :class="{'text-wait': !(step > 7), 'text-finish':step > 7}">{{$t("common.l2network")}}</span>
        </div>
        <div class="operation-course">
          <div :class="{'icon-process': step < 8, 'icon-process-hover': step > 7}"></div>
        </div>
        <div class="operation-step">
          <img src="~assets/wizard_l3network.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step < 8" />
          <img src="~assets/wizard_edit.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step === 8" />
          <img src="~assets/wizard_l3network_hover.svg" style="display: inline-block; width: 50px; height: 50px;margin-top: 2px;" v-if="step > 8" />
          <span id="common-l3network" class="text" :class="{'text-wait': !(step > 8), 'text-finish':step > 8}">{{$t("common.l3network")}}</span>
        </div>
      </div>
    </div>
    <div slot="body" class="create-body">
      <component :is="'WizardZone'" v-if="step === 0" :param="{update: updateZone, disabled: disabled}"></component>
      <component :is="'WizardCluster'" :parent-window-uuid="windowId" v-if="step === 1" :param="{update: updateCluster,  disabled: disabled}"></component>
      <component :is="'WizardHost'" :parent-window-uuid="windowId" v-if="step === 2" :param="{update: updateHost,  disabled: disabled}"></component>
      <component :is="'WizardStorage'" :parent-window-uuid="windowId" v-if="step === 3" :param="{update: updateStorage,  disabled: disabled}"></component>
      <component :is="'WizardPrimaryStorage'" :parent-window-uuid="windowId" v-if="step === 4" :param="{update: updatePrimaryStorage, disabled: disabled}"></component>
      <component :is="'WizardInstanceOffering'" :parent-window-uuid="windowId" v-if="step === 5" :param="{update: updateInstanceOffering, disabled: disabled}"></component>
      <component :is="'WizardImage'" :parent-window-uuid="windowId" v-if="step === 6" :param="{update: updateImage, disabled: disabled}"></component>
      <component :is="'WizardL2Network'" :parent-window-uuid="windowId" v-if="step === 7" :param="{update: updateL2NetWork, disabled: disabled}"></component>
      <component :is="'WizardL3Network'" :parent-window-uuid="windowId" v-if="step === 8" :param="{update: updateL3NetWork, disabled: disabled}"></component>
    </div>
    <div slot="footer" class="create-footer">
      <div class="btn-confirm wizardNext" :class="{'disabled': disabled}">{{$t('common.nextStep')}}</div>
      <div class="btn-cancel" :class="{'disabled': disabled}" @click="$router.push({name: 'home'})">{{$t('common.cancel')}}</div>
    </div>
  </create-template>
</template>

<script>
    let uploadMap = {}
    import CreateTemplate from "../../component/CreateTemplate";
    import WizardZone from 'src/ecs/wizard/component/WizardZone';
    import WizardCluster from 'src/ecs/wizard/component/WizardCluster';
    import WizardHost from 'src/ecs/wizard/component/WizardHost';
    import WizardStorage from 'src/ecs/wizard/component/WizardStorage';
    import WizardPrimaryStorage from 'src/ecs/wizard/component/WizardPrimaryStorage';
    import WizardInstanceOffering from 'src/ecs/wizard/component/WizardInstanceOffering';
    import WizardImage from 'src/ecs/wizard/component/WizardImage';
    import WizardL2Network from 'src/ecs/wizard/component/WizardL2Network';
    import WizardL3Network from 'src/ecs/wizard/component/WizardL3Network';
    import WindowBase from 'src/windows/Window';
    import rpc from 'src/utils/rpc';
    import Utils from 'src/utils/utils';
    export default {
      name: "WizardPage",
      mixins: [WindowBase],
      components: {
        'create-template': CreateTemplate,
       'WizardZone': WizardZone,
        'WizardCluster': WizardCluster,
        'WizardHost': WizardHost,
        'WizardStorage': WizardStorage,
        'WizardPrimaryStorage': WizardPrimaryStorage,
        'WizardInstanceOffering': WizardInstanceOffering,
        'WizardImage': WizardImage,
        'WizardL2Network': WizardL2Network,
        'WizardL3Network': WizardL3Network
      },
      data(){
        return {
          step: 0,
          disabled: false
        }
      },
      //设置导航条步骤
      created () {
        this.updateWindow({ wizard: {} })
        //检查步骤
        this.checkStep()
      },
      methods: {
        ...Utils,
        //创建区域
        updateZone(param){
          let self = this;
          self.disabled = true;
          let event = self.createEvent('zone.action.create', param.name)
          rpc.create('zones',param, event)
            .then((resp) => {
              this.updateWindow({
                wizard: {
                  zone: resp.inventory,
                }
              })
              this.updateDbTable({
                tableName: 'zone',
                list: [resp.inventory]
              }).then(() => {
                 self.step ++;
              })
              self.disabled = false;
              this.incEventSuccess(event)
            }, () => {
              self.disabled = false;
              this.incEventFail(event)
            })
        },

        //创建集群
        updateCluster(param){
          let self = this;
          self.disabled = true;
          let event = self.createEvent('cluster.action.create', param.name)
          rpc.create('clusters',param, event)
            .then((resp) => {
              let wizard = _.cloneDeep(this.windowData.wizard)
              this.updateWindow({
                wizard: {
                  cluster: resp.inventory,
                  ...wizard
                }
              })
              this.updateDbTable({
                tableName: 'cluster',
                list: [resp.inventory]
              }).then(() => {
                self.step ++;
              })
              self.disabled = false;
              this.incEventSuccess(event)
            }, () => {
              self.disabled = false;
              this.incEventFail(event)
            })
        },

        //创建云主机
        updateHost(param){
          let self = this;
          self.disabled = true;
          let event = this.createEvent('host.action.add', param.name)
          rpc.create('hosts/kvm', param, event)
            .then((resp) => {
              self.disabled = false;
              this.incEventSuccess(event)
              this.updateWindow({
                wizard: {
                  ...this.windowData.wizard,
                  host: resp.inventory
                }
              })
              this.step ++;
              return this.updateDbTable({
                tableName: 'host',
                list: [resp.inventory]
              })
            }, () => {
              self.disabled = false;
              this.incEventFail(event)
            })
        },

        //创建存储服务器
        updateStorage(param){
          let self = this;
          self.disabled = true;
          let event = this.createEvent('backupStorage.action.create', param.name)
          rpc.create(`backup-storage/${param.type}`, param, event)
            .then((resp) => {
              if (param.type === 'image-store' && param.importImages) {
                this.importImages(resp.inventory, this)
              }
              this.updateDbTable({
                tableName: 'backupstorage',
                list: [resp.inventory]
              })
              let wizard = _.cloneDeep(this.windowData.wizard)
              this.updateWindow({
                wizard: {
                  ...wizard,
                  backupstorage: resp.inventory
                }
              })
              rpc.post(`zones/${param.zoneUuid}/backup-storage/${resp.inventory.uuid}`)
                .then((resp) => {
                  self.disabled = false;
                  this.incEventSuccess(event)
                  this.step++;
                })
            }, () => {
              self.disabled = false;
              this.incEventFail(event)
            })
        },

        //导入镜像
        importImages (param, self) {
          let _eventFunction = (obj) => {
            try {
              obj.success = true
              obj.type = 'textMessage'
              return Promise.resolve(obj)
            } catch (e) {
              obj.fail = true
              obj.type = 'textMessage'
              return Promise.reject(obj)
            }
          }
          setTimeout(() => {
            return rpc.query('images', {
              q: `backupStorage.uuid=${param.uuid}`,
              count: true
            }).then((resp) => {
              let total = resp.total
              let event = self.createEvent('backupStorage.action.importImages', total)
              _eventFunction(event).then(() => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            })
          }, 500)
        },

        //创建主存储
        updatePrimaryStorage(param){
          let self = this;
          self.disabled = true;
          let event = this.createEvent('primaryStorage.action.add', param.name)
          let pathType = param.type
          if (param.type === 'SharedBlock') {
            pathType = 'sharedblockgroup'
          } else if (param.type === 'AliyunNAS') {
            pathType = 'aliyun/nas'
          }
          debugger;
          rpc.create(`primary-storage/${pathType}`, param, event)
            .then((resp) => {
              let wizard = _.cloneDeep(this.windowData.wizard)
              this.updateWindow({
                wizard: {
                  ...wizard,
                  primarystorage: resp.inventory
                }
              })
              this.updateDbTable({
                tableName: 'primarystorage',
                list: [resp.inventory]
              })
              this.attachPsToCluster(param)
              this.incEventSuccess(event)
              self.disabled = false;
            }, () => {
              this.incEventFail(event)
              self.disabled = false;
            })
        },

        //给主存储绑定集群
        attachPsToCluster: async function (param) {
          if (param.clusterUuid === undefined) {
            step ++;
          }
          let resp = await rpc.query('primary-storage')
          let PSs = resp.inventories.map(ps => {
            return {
              createDate: (new Date(ps.createDate)).getTime(),
              uuid: ps.uuid
            }
          })
          let ps = _.sortBy(PSs, 'createDate').pop().uuid
          let self = this
          let event = this.createEvent('primaryStorage.action.attach', this.dbData.primarystorage[ps].name)
          let cluster = param.clusterUuid
          rpc.create(`clusters/${cluster}/primary-storage/${ps}`, null, event)
            .then((resp) => {
              self.updateDbRow({
                tableName: 'primarystorage',
                id: ps,
                data: resp.inventory
              })
              this.incEventSuccess(event)
              self.disabled = false;
              self.step ++;
            }, () => {
              this.incEventFail(event)
              self.step ++;
            })
        },

        //创建计算规格
        async updateInstanceOffering(param){
          let self = this;
          if (param.memorySize === '') return
          self.disabled = true;
          let event = this.createEvent('instanceOffering.action.create', param.name)
          let msg = {
            name: param.name,
            description: param.description,
            cpuNum: param.cpuNum,
            memorySize: param.memorySize,
            allocatorStrategy: param.allocatorStrategy
          }
          msg.systemTags = []//添加系统标签
          if (param.bandWidths.volumeTotalBandwidth !== '') msg.systemTags.push(`volumeTotalBandwidth::${param.bandWidths.volumeTotalBandwidth}`)
          if (param.networkInboundBandwidth !== '') msg.systemTags.push(`networkInboundBandwidth::${param.networkInboundBandwidth}`)
          if (param.networkOutboundBandwidth !== '') msg.systemTags.push(`networkOutboundBandwidth::${param.networkOutboundBandwidth}`)
          if (param.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy' && param.maxInstancePerHost !== '') msg.systemTags.push(`maxInstancePerHost::${param.maxInstancePerHost}`)
          if (param.allocatorStrategy === 'MinimumCPUUsageHostAllocatorStrategy') msg.systemTags.push(`minimumCPUUsageHostAllocatorStrategyMode::${param.strategyPattern}`)
          if (param.allocatorStrategy === 'MinimumMemoryUsageHostAllocatorStrategy') msg.systemTags.push(`minimumMemoryUsageHostAllocatorStrategyMode::${param.strategyPattern}`)
          let resp
          try {
            resp = await rpc.create('instance-offerings', msg, event)
            let wizard = _.cloneDeep(this.windowData.wizard)
            await this.updateWindow({
              wizard: {
                ...wizard,
                instanceofferings: resp.inventory
              }
            })
            this.incEventSuccess(event)
            await this.updateDbTable({
              tableName: 'instanceOffering',
              list: [resp.inventory]
            })
            self.disabled = false;
            self.step ++;
          } catch (e) {
            self.disabled = false;
            this.incEventFail(event)
          }
        },

        //创建镜像
        async updateImage(param){
          let self = this;
          self.disabled = true;
          let jobUuid = self.genUniqueId()
          param.resourceUuid = jobUuid
          if (!_.isUndefined(param.localFile) && !_.isNull(param.localFile)) {
            //上传镜像
            await self.uploadImage(param, param, jobUuid)
          } else {
            await self.addImage(param, jobUuid)
          }
        },

        //上传镜像
        uploadImage: function (param, msg, jobUuid) {
          const self = this
          let event = self.createEvent('image.action.upload1', param.name)
          self.setJobUuid(jobUuid, 'Downloading', jobUuid)
          return rpc.create('images', msg, event, jobUuid).then(resp => {
            self.incEventSuccess(event)
            let formData = new window.FormData()
            formData.append('upload-image', param.localFile)
            let xhr = new window.XMLHttpRequest()
            let imageUuid = resp.inventory.backupStorageRefs[0].imageUuid
            uploadMap[imageUuid] = xhr
            xhr.onreadystatechange = function () {
              if (xhr.readyState === window.XMLHttpRequest.DONE) {
                let failed = false
                let respObj = null
                if (xhr.status !== 200) {
                  failed = true
                } else {
                  if (!xhr.response) {
                    respObj = { success: true }
                  } else {
                    respObj = JSON.parse(JSON.parse(xhr.response))
                    if (!respObj.success) {
                      failed = true
                    }
                  }
                }
                if (failed) {
                  self.deleteJobUuid(jobUuid, jobUuid)
                  let errorMsg = `http status: ${xhr.status}`
                  if (respObj && respObj.error) {
                    errorMsg = respObj.error
                  }
                  let event = self.createEvent('image.action.upload2', param.name, undefined, errorMsg, 'NotApiCall')
                  self.setEventFail(event)
                }
              }
            }
            //监听上传进度
            xhr.addEventListener('progress', (e) => { }, false)
            //监听加载
            xhr.addEventListener('load', (e) => {
              delete uploadMap[imageUuid]
            }, false)
            //监听上传过程中是否出错
            xhr.addEventListener('error', (e) => {
              delete uploadMap[imageUuid]
            }, false)
            //监听上传途中是否中断
            xhr.addEventListener('abort', (e) => {
              delete uploadMap[imageUuid]
            }, false)
            xhr.open('POST', `${Utils.getServerUrl()}/upload?size=${param.localFile.size}&uuid=${resp.inventory.backupStorageRefs[0].imageUuid}&url=${resp.inventory.backupStorageRefs[0].installPath}`, true)
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
            try {
              xhr.send(formData)
            } catch (e) {
              self.deleteJobUuid(jobUuid, jobUuid)
              let event = self.createEvent('image.action.upload2', param.name, undefined, xhr.responseText, 'NotApiCall')
              self.setEventFail(event)
            }
            self.disabled = false;
            self.step ++;
          }, () => {
            self.deleteJobUuid(jobUuid, jobUuid)
            self.incEventFail(event)
            self.disabled = true;
          })
        },

        //添加镜像
        addImage (param, jobUuid) {
          const self = this
          let event = self.createEvent('image.action.add', param.name, undefined, undefined, undefined, {tableName: 'image', resourceUuid: jobUuid, jobUuid})
          return rpc.create('longjobs', {
            jobName: 'APIAddImageMsg',
            jobData: JSON.stringify(param)
          }, event, jobUuid)
            .then(() => {
              self.disabled = false;
              self.step ++;
              return self.triggerLongJobTask()
            }, () => {
              self.disabled = false;
              self.incEventFail(event)
              return self.longJobHandler(event, self)
            })
        },

        //创建二层网络
        async updateL2NetWork(param){
          this.disabled = true;
          let event = this.createEvent('l2network.action.create', param.name)
          let resp
          try {
            resp = await rpc.create(`l2-networks/${param.type}`, param, event)
            let wizard = _.cloneDeep(this.windowData.wizard)
            this.updateWindow({
              wizard: {
                ...wizard,
                l2networks: resp.inventory
              }
            })
            try {
              debugger
              await rpc.create(`l2-networks/${resp.inventory.uuid}/clusters/${wizard.cluster.uuid}`, null, event)
              this.updateDbTable({
                tableName: 'l2network',
                list: [resp.inventory]
              })
              this.step ++;
              this.incEventSuccess(event)
              this.disabled = false;
            } catch (e) {
              await rpc._delete(`l2-networks/${resp.inventory.uuid}`, null, event)
              this.incEventFail(event)
              this.disabled = false;
            }
          } catch (e) {
            this.incEventFail(event)
            this.disabled = false;
          }
        },

        //创建三层网络
        async updateL3NetWork(param){
          this.disabled = true;
          let networkServiceResp = await rpc.query('network-services/providers', {
            q: 'type?=Flat,SecurityGroup'
          })
          let event = this.createEvent('l3network.action.create', param.name)
          let networkServices = {}
          networkServiceResp.inventories.forEach((item) => {
            networkServices[item.uuid] = item.networkServiceTypes
          })
          let createL3 = {}
          createL3['name'] = param.name
          createL3['type'] = param.type
          createL3['system'] = param.system
          createL3['l2NetworkUuid'] = param.l2NetworkUuid
          createL3['category'] = param.category
          if (param.description !== '') createL3['description'] = param.description
          let resp
          try {
            resp = await rpc.create('l3-networks', createL3, event)
            let wizard = _.cloneDeep(this.windowData.wizard)
            this.updateWindow({
              wizard: {
                ...wizard,
                l3networks: resp.inventory
              }
            })
            this.incEventSuccess(event)
          } catch (e) {
            this.incEventFail(event)
            this.disabled = false;
            return
          }
          this.updateDbTable({
            tableName: 'l3network',
            list: [resp.inventory]
          })
          if (param.networkServices !== null) {
            let AttachNetworkServiceToL3Network = {}
            AttachNetworkServiceToL3Network['networkServices'] = networkServices
            try {
              await rpc.create('l3-networks/' + resp.inventory.uuid + '/network-services', AttachNetworkServiceToL3Network)
            } catch (e) {
              this.incEventFail(event)
              this.disabled = false;
              return
            }
          }
          // Add IpRange
          let IpRangeevent = this.createEvent('l3network.action.addIpRange', param.name)
          if (param.cidr) {
            try {
              await rpc.create('l3-networks/' + resp.inventory.uuid + '/ip-ranges/by-cidr', {
                name: param.name,
                networkCidr: param.cidr
              }, IpRangeevent)
              this.incEventSuccess(IpRangeevent)
            } catch (e) {
              await rpc._delete(`l3-networks/${resp.inventory.uuid}`)
              this.incEventFail(IpRangeevent)
              this.disabled = false;
              return
            }
          } else {
            let addIpRange = {}
            addIpRange['name'] = param.name
            addIpRange['startIp'] = param.startIp
            addIpRange['endIp'] = param.endIp
            addIpRange['netmask'] = param.netmask
            addIpRange['gateway'] = param.gateway
            try {
              await rpc.create('l3-networks/' + resp.inventory.uuid + '/ip-ranges', addIpRange, IpRangeevent)
              this.incEventSuccess(IpRangeevent)
            } catch (e) {
              await rpc._delete(`l3-networks/${resp.inventory.uuid}`)
              this.incEventFail(IpRangeevent)
              this.disabled = false;
              return
            }
          }
          // Add DNS
          let dnsevent = this.createEvent('l3network.action.addDns', param.name)
          let addDnsToL3Network = {}
          addDnsToL3Network['dns'] = (param.dns === '' || param.dns === undefined) ? '223.5.5.5' : param.dns
          try {
            await rpc.create('l3-networks/' + resp.inventory.uuid + '/dns', addDnsToL3Network, dnsevent)
            this.incEventSuccess(dnsevent)
            this.disabled = false;
            this.$router.push({name: 'home'})
            return
          } catch (e) {
            this.incEventFail(dnsevent)
            this.disabled = false;
            return
          }
        },

        checkStep: async function () {
          let zoneResp = await rpc.query('zones')
          if (zoneResp.inventories.length === 0) this.step = 0;
          else this.$router.push({name: 'home'})
        }
      }
    }
</script>

<style scoped>
 .operation-step{
   display: inline-block;
   text-align: center;
   width: 60px;
   height: 76px;
 }
  .text{
    width: 100%;
    margin: 0 auto;
    display: inline-block;
  }
 .operation-course {
   padding-top: 30px;
   height: 76px;
   display: inline-block;
   flex: 1;
   position: relative;
 }
 .icon-process {
   position: absolute;
   display: inline-block;
   height: 2px;
   width: 37px;
   background-image: url('~assets/wizard_process.svg');
   color: #EFF9FF;
   position: absolute;
   left: 50%;
   margin-left: -19px;
 }

 .icon-process-hover {
   position: absolute;
   display: inline-block;
   height: 2px;
   width: 37px;
   background-image: url('~assets/wizard_process_hover.svg');
   color: #EFF9FF;
   position: absolute;
   left: 50%;
   margin-left: -19px;
 }
 .icon-process-hover, .icon-process {
   display: inline-block;
   height: 2px;
   width: 37px;
   color: #eff9ff;
   position: absolute;
   left: 50%;
   margin-left: -19px;
 }
 .operation-process {
   height: 110px;
   width: 96%;
   background-color: #fff;
   padding: 19px 34px 0px;
   color: #1a2736;
   display: -ms-inline-flexbox;
   display: inline-flex;
   -ms-flex-pack: center;
   justify-content: center;
   /* padding: 0px 3px; */
 }
</style>
