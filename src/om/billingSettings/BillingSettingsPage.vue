<template>
 <page-template>
   <div slot="page-header">
     <el-row :gutter="10">
       <el-col :span="2">
         <span class="page-header-title">{{$t('common.billingsettings')}}</span>
       </el-col>
       <el-col :span="2.2">
         <el-tabs v-model="currTab" @tab-click="changeTab">
           <el-tab-pane
             :label="`${$t('common.cpu')}`"
             name="cpu"></el-tab-pane>
           <el-tab-pane
           :label="$t('common.memory')"
           name="memory"></el-tab-pane>
           <el-tab-pane
             :label="$t('common.rootVolume')"
             name="rootVolume"></el-tab-pane>
           <el-tab-pane
             :label="$t('common.dataVolume')"
             name="dataVolume"></el-tab-pane>
           <el-tab-pane
             :label="$t('gpuDevice.gpuDevice')"
             name="gpu"></el-tab-pane>
           <el-tab-pane
             :label="$t('billing.publicNetworkIP')"
             name="publicNetworkIP"></el-tab-pane>
         </el-tabs>
       </el-col>
     </el-row>
   </div>
   <div slot="page-toolbar" class="page-toolbar-container">
     <el-row>
       <div class="page-toolbar-left">
         <span class="btn-success" @click="goToCreate(`${currTab}`)">
            <i class="el-icon-plus icon"></i>{{ $t("billing.setting") }}{{$t(`common.${currTab}`)}}{{ $t("billing.Price")}}
         </span>
         <span class="btn-primary" @click="isSelected && pageDelete()" :class="{'disabled': !isSelected}">
           <i class="el-icon-remove-outline icon"></i> {{$t('common.destroy')}}
         </span>
         <help-trigger v-if="currTab == 'cpu'" name="CPUbilling" triangle="top" :style="{ position: 'relative', display: 'inline-block', top: '5px', left: '20px' }" />
         <help-trigger v-if="currTab == 'memory'" name="Memorybilling" triangle="top" :style="{ position: 'relative', display: 'inline-block', top: '5px', left: '20px' }" />
         <help-trigger v-if="currTab == 'rootVolume'" name="RootVolumebilling" triangle="top" :style="{ position: 'relative', display: 'inline-block', top: '5px', left: '20px' }" />
         <help-trigger v-if="currTab == 'dataVolume'" name="Datebilling" triangle="top" :style="{ position: 'relative', display: 'inline-block', top: '5px', left: '20px' }" />
         <help-trigger v-if="currTab == 'gpu'" name="GPUbilling" triangle="top" :style="{ position: 'relative', display: 'inline-block', top: '5px', left: '20px' }" />
         <help-trigger v-if="currTab == 'publicNetworkIP'" name="PublicIPbilling" triangle="top" :style="{ position: 'relative', display: 'inline-block', top: '5px', left: '20px' }" />
       </div>
       <div class="page-toolbar-center"></div>
       <div class="page-toolbar-right"></div>
     </el-row>
   </div>
   <div slot="page-table-content">
     <el-table
     :data="itemList"
     @selection-change="handleSelect"
     v-loading="windowData.loading"
     >
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
       <el-table-column type="selection"></el-table-column>
       <el-table-column :label="$t('billingConfig.price')"  v-if="!['cpu', 'gpu'].includes(currTab)">
         <template slot-scope="scope">
           {{`${$t('common.currency')} ${dbData.billingsettings[scope.row.uuid].price} / ${isPubBandwidth(dbData.billingsettings[scope.row.uuid]) ? $t('common.' + formatBandwidthUnit(dbData.billingsettings[scope.row.uuid].resourceUnit)) : $t('common.' + formatNumUnit(dbData.billingsettings[scope.row.uuid].resourceUnit))} / ${$t('common.' + formatTimeUnit(dbData.billingsettings[scope.row.uuid].timeUnit))}`}}
         </template>
       </el-table-column>
       <el-table-column :label="$t('billingConfig.price')"  v-if="['cpu', 'gpu'].includes(currTab)">
         <template slot-scope="scope">
           <span v-if="dbData.billingsettings[scope.row.uuid].timeUnit === 'MONTHS'">
              {{dbData.billingsettings[scope.row.uuid].timeUnit === 'MONTHS' ? `${$t('common.currency')} ${dbData.billingsettings[scope.row.uuid].price} / ${$t('common.' + formatTimeUnit(dbData.billingsettings[scope.row.uuid].timeUnit))}` + '(30' + $t('common.day') + ')' : ''}}
           </span>
           <span v-else>
             {{`${$t('common.currency')} ${dbData.billingsettings[scope.row.uuid].price} / ${$t('common.' + formatTimeUnit(dbData.billingsettings[scope.row.uuid].timeUnit))}`}}
           </span>
         </template>
       </el-table-column>
       <el-table-column :label="$t('common.type')"  v-if="currTab === 'gpu'">
          <template slot-scope="scope">
            {{getGpuType(scope.row.uuid)}}
          </template>
       </el-table-column>
       <el-table-column :label="$t('common.type')"  v-if="currTab === 'publicNetworkIP'">
         <template slot-scope="scope">
           {{getBandwidthType(scope.row.uuid)}}
         </template>
       </el-table-column>
       <el-table-column :label="$t('gpuDevice.model')"  v-if="currTab === 'gpu'">
         <template slot-scope="scope">
           {{getGpuModel(scope.row.uuid)}}
         </template>
       </el-table-column>
       <el-table-column :label="$t('billingConfig.startDate')">
         <template slot-scope="scope">
           {{formatStartTime(dbData.billingsettings[scope.row.uuid].dateInLong)}}
         </template>
       </el-table-column>
       <el-table-column :label="$t('common.description')">
         <template slot-scope="scope">
           <span v-if="windowData.infoList[scope.row.uuid] && windowData.infoList[scope.row.uuid][0] && windowData.infoList[scope.row.uuid].length > 1">
             <span v-if="windowData.infoList[scope.row.uuid] && ['cpu', 'gpu'].includes(currTab)">
               {{`${$t('billing.introduction.text1')} ${formatStartTime(windowData.infoList[scope.row.uuid][0])} ${$t('billing.introduction.text2')} ${formatStartTime(windowData.infoList[scope.row.uuid][1])} ${$t('billing.introduction.text3')} ${$t('common.currency')} ${dbData.billingsettings[scope.row.uuid].price} / ${$t('common.' + formatTimeUnit(dbData.billingsettings[scope.row.uuid].timeUnit))}`}}
             </span>
             <span v-else>
               {{`${$t('billing.introduction.text1')} ${formatStartTime(windowData.infoList[scope.row.uuid][0])} ${$t('billing.introduction.text2')} ${formatStartTime(windowData.infoList[scope.row.uuid][1])} ${$t('billing.introduction.text3')} ${$t('common.currency')} ${dbData.billingsettings[scope.row.uuid].price} / ${isPubBandwidth(dbData.billingsettings[scope.row.uuid]) ? $t('common.' + formatBandwidthUnit(dbData.billingsettings[scope.row.uuid].resourceUnit)) : $t('common.' + formatNumUnit(dbData.billingsettings[scope.row.uuid].resourceUnit))} / ${$t('common.' + formatTimeUnit(dbData.billingsettings[scope.row.uuid].timeUnit))}`}}
             </span>
           </span>
           <span v-else>
             <span v-if="windowData.infoList[scope.row.uuid] && ['cpu', 'gpu'].includes(currTab)">
               {{`${$t('billing.introduction.text1')} ${formatStartTime(windowData.infoList[scope.row.uuid][0])} ${$t('billing.introduction.text4')} ${$t('common.currency')} ${dbData.billingsettings[scope.row.uuid].price} / ${$t('common.' + formatTimeUnit(dbData.billingsettings[scope.row.uuid].timeUnit))}`}}
             </span>
             <span  v-else-if="windowData.infoList[scope.row.uuid]">
               {{`${$t('billing.introduction.text1')} ${formatStartTime(windowData.infoList[scope.row.uuid][0])} ${$t('billing.introduction.text4')} ${$t('common.currency')} ${dbData.billingsettings[scope.row.uuid].price} / ${isPubBandwidth(dbData.billingsettings[scope.row.uuid]) ? $t('common.' + formatBandwidthUnit(dbData.billingsettings[scope.row.uuid].resourceUnit)) : $t('common.' + formatNumUnit(dbData.billingsettings[scope.row.uuid].resourceUnit))} / ${$t('common.' + formatTimeUnit(dbData.billingsettings[scope.row.uuid].timeUnit))}`}}
             </span>
           </span>
         </template>
       </el-table-column>
     </el-table>
     <div class="page-table-pagination">
       <el-pagination v-if="windowData.total > 0"
         :page-sizes="[10, 20, 50, 100]"
         :page-size="windowData.pageSize"
         layout="total, sizes, prev, pager, next, jumper"
         :total="windowData.total"
         class="page-table-pagination"
         @current-change="pageCurrentChange"
         @size-change="pageSizeChange"
         :current-page="windowData.pageIndex">
       </el-pagination>
     </div>
   </div>
   <div slot="page-footer"></div>
 </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  export default {
    name: "BillingSettingsPage",
    components: {PageTemplate},
    mixins: [WindowBase],
    data(){
      return {
        currTab: 'cpu',
        condition: {
          'cpu': ['resourceName=cpu'],
          'memory': ['resourceName=memory'],
          'rootVolume': ['resourceName=rootVolume'],
          'dataVolume': ['resourceName=dataVolume'],
          'gpu': ['resourceName=gpu'],
          'publicNetworkIP': ['resourceName?=pubIpVmNicBandwidthOut,pubIpVmNicBandwidthIn,pubIpVipBandwidthOut,pubIpVipBandwidthIn']
        },
        itemList: [],
        gpuModels: [],
      }
    },
    computed: {
      isSelected(){
        let self = this;
        return self.windowData.selectedUuidList.length >= 1;
      }
    },
    created(){
      let self = this;
      this.self = this
      if(self.$route.params.resourceName) self.currTab = self.$route.params.resourceName;
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        selectedUuidList: [],
        showMoreDropdown: false,
        loading: false,
      }).then(() => {
        this.queryList()
      })
    },
    methods: {
      queryList () {
        let self = this;
        self.windowData.loading = true;
        rpc.query('billings/prices', {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: '-dateInLong'
        }).then(resp => {
          this.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
            total: resp.total
          })
          let infoList = {}
          let bandwidth = {}
          resp.inventories.forEach((item, index, arr) => {
            if (index === 0) {
              infoList[item.uuid] = [item.dateInLong]
              if (_.includes(['pubIpVmNicBandwidthOut', 'pubIpVmNicBandwidthIn', 'pubIpVipBandwidthOut', 'pubIpVipBandwidthIn'], item.resourceName)) {
                bandwidth[item.resourceName] = true
              }
            } else {
              let previousDateInLong = arr[index - 1].dateInLong
              if (item.resourceName === 'gpu') {
                let gpuOfferingUuid = item.pciDeviceOfferings[0].pciDeviceOfferingUuid
                let previousItems = arr.slice(0, index)
                let previousItemInSameModelIndex = -1
                previousItems.forEach((it, itIndex) => {
                  if (it.pciDeviceOfferings[0].pciDeviceOfferingUuid === gpuOfferingUuid) {
                    previousItemInSameModelIndex = itIndex
                  }
                })
                if (previousItemInSameModelIndex !== -1) {
                  previousDateInLong = arr[previousItemInSameModelIndex].dateInLong
                  infoList[item.uuid] = [item.dateInLong, previousDateInLong]
                } else {
                  infoList[item.uuid] = [item.dateInLong]
                }
              } else if (_.includes(['pubIpVmNicBandwidthOut', 'pubIpVmNicBandwidthIn', 'pubIpVipBandwidthOut', 'pubIpVipBandwidthIn'], item.resourceName)) {
                if (!bandwidth[item.resourceName]) {
                  infoList[item.uuid] = [item.dateInLong]
                  bandwidth[item.resourceName] = true
                } else {
                  infoList[item.uuid] = [item.dateInLong, previousDateInLong]
                }
              } else {
                infoList[item.uuid] = [item.dateInLong, previousDateInLong]
              }
            }
          })
          let uuidList = resp.inventories.map((item) => item.uuid)
          let table = {}
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          self.updateDbTable({
            tableName: 'billingsettings',
            list: resp.inventories
          })
          this.updateWindow({ infoList, uuidList, table })
            .then(() => {
              self.itemList = self.getData();
              self.windowData.loading = false;
            })
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      getData(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.billingsettings[uuid];
        })
      },
      changeTab(){
        let self = this;
        self.updateWindow({
          pageIndex: 1,
          pageCount: 1,
          pageSize: 20,
          showMoreDropdown: false
        }).then(() => {
          if(self.currTab === 'gpu'){
            this.getGpuModels();
          }
        })
        self.queryList()
      },
      getCondition () {
        let conditionList = [], self = this;
        let condition = self.condition[self.currTab] || self.condition['cpu']
        conditionList = conditionList.concat(condition)
        return conditionList
      },
      isPubBandwidth (item) {
        return _.includes(['pubIpVmNicBandwidthOut', 'pubIpVmNicBandwidthIn', 'pubIpVipBandwidthOut', 'pubIpVipBandwidthIn'], item.resourceName)
      },
      getGpuType (billingSettingUuid) {
        let type = ''
        let pciDeviceOfferings = this.dbData.billingsettings[billingSettingUuid].pciDeviceOfferings
        if (pciDeviceOfferings.length > 0) {
          let gpuOfferingUuid = pciDeviceOfferings[0].pciDeviceOfferingUuid
          this.gpuModels.forEach(gpuModel => {
            if (gpuModel.gpuOfferingUuid === gpuOfferingUuid) {
              type = gpuModel.type
            }
          })
        }
        if (!type) return ''
        if (type === 'GPU_Video_Controller') {
          return this.$t('gpuDevice.desktopGpu')
        }
        return this.$t('gpuDevice.computeGpu')
      },
      formatStartTime: function (startTime) {
        let time = new Date(startTime)
        let hour = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
        let minute = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
        let second = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds()
        return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${hour}:${minute}:${second}`
      },
      formatTimeUnit(u) {
        let unit = ''
        switch (u) {
          case 'SECONDS':
            unit = 'second'
            break
          case 'MINUTES':
            unit = 'minute'
            break
          case 'HOURS':
            unit = 'hour'
            break
          case 'DAYS':
            unit = 'day'
            break
          case 'WEEKS':
            unit = 'week'
            break
          case 'MONTHS':
            unit = 'month'
            break
        }
        return unit
      },
      formatNumUnit(u) {
        let unit = ''
        switch (u) {
          case 'MEGABYTE':
            unit = 'mb'
            break
          case 'GIGABYTE':
            unit = 'gb'
            break
          case 'TERABYTE':
            unit = 'tb'
            break
          case 'KILOBYTE':
            unit = 'kb'
            break
        }
        return unit
      },
      formatBandwidthUnit(u) {
        let unit = ''
        switch (u) {
          case 'MEGABYTE':
            unit = 'Mb'
            break
          case 'GIGABYTE':
            unit = 'Gb'
            break
          case 'TERABYTE':
            unit = 'Tb'
            break
          case 'KILOBYTE':
            unit = 'Kb'
            break
        }
        return unit
      },
      getBandwidthType (billingSettingUuid) {
        const self = this
        let bandwidthType = _.get(self.dbData.billingsettings, `${billingSettingUuid}.resourceName`) || 'unknown'
        const typeActions = new Map([
          ['pubIpVmNicBandwidthOut', self.$t('billing.pubIpVmNicBandwidthOut')],
          ['pubIpVipBandwidthOut', self.$t('billing.pubIpVipBandwidthOut')],
          ['pubIpVmNicBandwidthIn', self.$t('billing.pubIpVmNicBandwidthIn')],
          ['pubIpVipBandwidthIn', self.$t('billing.pubIpVipBandwidthIn')],
          ['unknown', '']
        ])
        return typeActions.get(bandwidthType)
      },
      getGpuModel (billingSettingUuid) {
        let description = ''
        let pciDeviceOfferings = this.dbData.billingsettings[billingSettingUuid].pciDeviceOfferings
        if (pciDeviceOfferings.length > 0) {
          let gpuOfferingUuid = pciDeviceOfferings[0].pciDeviceOfferingUuid
          this.gpuModels.forEach(gpuModel => {
            if (gpuModel.gpuOfferingUuid === gpuOfferingUuid) {
              description = gpuModel.description
            }
          })
        }
        if (!description) return ''
        return description
      },
      goToCreate(type){
        let self = this, param = {};
        param.type = type;
        (self.currTab === 'gpu' &&  self.gpuModels.length> 0) ? param.gpuModels = self.gpuModels : param.gpuModels = 'create';
        self.$router.push({name: 'createBillingSettings', params: param})
      },
       getGpuModels () {
        return rpc.query('pci-device/pci-devices', {
          q: 'type?=GPU_Video_Controller,GPU_Audio_Controller,GPU_3D_Controller'
        }).then(resp => {
          let gpuModels = []
          let gpus = resp.inventories.filter(gpu => gpu.type !== 'GPU_Audio_Controller')
          gpus.forEach(gpu => {
            let obj = {}
            obj.description = gpu.description
            obj.subdeviceId = gpu.subdeviceId
            obj.vendorId = gpu.vendorId
            obj.deviceId = gpu.deviceId
            obj.subvendorId = gpu.subvendorId
            obj.type = gpu.type
            obj.uuid = gpu.uuid
            gpuModels.push(obj)
          })
          gpuModels = _.uniqBy(gpuModels, 'description')
          return rpc.query('pci-device/pci-device-offerings').then(resp => {
            let gpuOfferings = resp.inventories
            gpuModels.forEach(gpuModel => {
              gpuOfferings.forEach(gpuOffering => {
                let euqalVendor = gpuOffering.vendorId === gpuModel.vendorId
                let euqalSubdeviceId = gpuOffering.subdeviceId === gpuModel.subdeviceId
                let equalDeviceId = gpuOffering.deviceId === gpuModel.deviceId
                let equalSubvendorId = gpuOffering.subvendorId === gpuModel.subvendorId
                let isAllEqual = euqalVendor && euqalSubdeviceId && equalDeviceId && equalSubvendorId
                if (isAllEqual) {
                  gpuModel.gpuOfferingUuid = gpuOffering.uuid
                }
              })
            })
          }).then(() => {
            let tasks = []
            let p = null
            gpuModels.forEach(gpuModel => {
              if (!gpuModel.gpuOfferingUuid) {
                let msg = _.cloneDeep(gpuModel)
                msg.name = msg.description
                delete msg.description
                p = rpc.create('pci-device/pci-device-offerings', msg, null).then(resp => {
                  gpuModel.gpuOfferingUuid = resp.inventory.uuid
                })
                tasks.push(p)
              }
            })
            return Promise.all(tasks).then(() => {
              this.gpuModels = gpuModels
            })
          })
        })
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList= rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      pageDelete(){
        let self = this, uuidList = self.windowData.selectedUuidList;
        if(uuidList.length <=0) return;
        let _delete = () => {
          let tasks = []
          let p = null
          let event = self.createEvent('billing.action.delete', uuidList.length === 1 ? self.dbData.billingsettings[uuidList[0]].resourceName : '', uuidList.length)
          uuidList.forEach((uuid) => {
            p = rpc._delete(`billings/prices/${uuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })
          return Promise.all(tasks)
        }
        self.openDialog('DeleteBillingSettingsConfirmDlg', {
          ok(){
            _delete()
            .then(() => {
              self.queryList()
            });
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
