<template>
  <create-template-no-route :param="{style:{width: '97%'}}"  style="width: 100%;">
    <div slot="header">
      <span>绑定云主机</span>
      <span class="create-back el-icon-back" @click="$emit('close')">返回</span>
    </div>
    <div slot="body" style="width: 100%">
      <vm-single-select :getVMCondition= "getVMCondition"
                        :selectVm= "selectVm"
                        :getSelectedVm= "getSelectedVm"
                        :closePage= "close"
                        v-if="step === 0"></vm-single-select>
      <eip-vm-nic-select  :getNicList= "getNicList"
                          :closePage= "close"
                          :selectNicIP="selectNicIP"
                          v-if="step === 1" ref="nic"></eip-vm-nic-select>
    </div>
    <div slot="footer" style="width: calc(100% - 370px)">
      <div class="btn-confirm" @click="next()" v-if="step === 0">{{$t('common.nextStep')}}</div>
      <div class="btn-confirm" v-if="step === 1" @click="preStep()">{{$t('common.prevStep')}}</div>
      <div class="btn-confirm" @click="ok" v-if="step === 1">{{$t('common.confirm')}}</div>
      <div class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</div>
    </div>
  </create-template-no-route>
</template>

<script>
    import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
    import VmSingleSelect from "./VmSingleSelect";
    import WindowBase from 'src/windows/Window';
    import Utils from 'src/utils/utils';
    import rpc from 'src/utils/rpc';
    import EipVmNicSelect from "./EipVmNicSelect";
    export default {
      name: "EipAttachableVmNicsSingleSelectList",
      props: ['param'],
      mixins: [WindowBase],
      components: {
        EipVmNicSelect,
        VmSingleSelect,
        CreateTemplateNoRoute
      },
      created: function () {
        let self = this
        if (this.param && this.param.eipUuid) {
          let dataUuid = this.param.eipUuid
          this.updateWindow({dataUuid})
          this.getIpVersion(dataUuid)
          rpc.query(`eips/${dataUuid}/vm-instances/candidate-nics`)
            .then((resp) => {
              self.nicList = resp.inventories
              self.vmUuidList = _.union(resp.inventories.map((item) => item.vmInstanceUuid))
              self.step = 0
            })
        }
        window.addEventListener('resize', this.resizeHeader)
      },
      destroyed: function () {
        window.removeEventListener('resize', this.resizeHeader)
      },
      updated: function () {
      },
      data() {
        return {
          vmUuidList: [],
          vmUuid: '',
          step: ''
        }
      },
      methods: {
        next(){
          let self = this;
          if(!self.vmUuid) return;
          this.step = 1;
        },
        getIpVersion(uuid) {
          let queryStr = `query usedIp where l3NetworkUuid = (query vip.l3NetworkUuid where uuid = (query eip.vipUuid where uuid = '${uuid}')) and ip = (query vip.ip where uuid = (query eip.vipUuid where uuid = '${uuid}'))`
          rpc.query('zql', {
            zql: encodeURIComponent(queryStr)
          })
            .then((resp) => {
              this.ipVersion = resp.results[0].inventories[0].ipVersion
            })
        },
        getVMCondition: function () {
          let conditionList = []
          conditionList.push(`uuid?=${this.vmUuidList.join()}`)
          return conditionList
        },
        getCondition: function () {
          let conditionList = []
          conditionList.push(`uuid?=${this.nicList.map(it => it.uuid).join()}`)
          conditionList.push('vmInstance.type=UserVm')
          if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
            conditionList = conditionList.concat(this.windowData.searchConditionList)
          }
          return conditionList
        },
        getNicList: function () {
          return this.enabledNicList
        },
        selectNicIP: function (ipUuid, vmNicUuid) {
          this.param.ok(ipUuid, vmNicUuid)
        },
        queryList: function () {
          let vmNicInventories
          let uuidList
          let table = {}
          let vmUuidList
          rpc.query('vm-instances/nics', {
            start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
            limit: this.windowData.pageSize,
            replyWithCount: true,
            sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
            q: this.getCondition()
          })
            .then((resp) => {
              this.updateWindow({
                pageCount: resp.total === 0 ? 1 : resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
                availableCount: resp.total
              })
              vmNicInventories = resp.inventories
              uuidList = vmNicInventories.map((item) => item.uuid)
              uuidList.forEach((uuid) => {
                table[uuid] = {
                  selected: false
                }
              })
              vmUuidList = _.uniq(vmNicInventories.map((item) => item.vmInstanceUuid))
              return rpc.queryResourceNames(this, 'vm', vmUuidList)
            })
            .then(() => {
              this.updateWindow({uuidList, table})
              this.updateDbTable({
                tableName: 'vmNicRefs',
                list: vmNicInventories
              })
            }).then(() => {
            return rpc.query('vm-instances', {
              q: `uuid?=${vmUuidList}`
            })
          }).then((resp) => {
            this.updateDbTable({
              tableName: 'vm',
              list: resp.inventories
            }).then(() => {
              this.itemList = this.getItemList();
            })
          })
        },

        getItemList(){
          let self = this;
          return self.windowData.vmUuidList.map((uuid) => {
            return self.dbData.vm[uuid];
          })
        },

        close(){
          let self = this;
          self.$emit('close')
        },

        ok: function () {
          this.$refs.nic.ok();
        },
        preStep: function () {
          this.step = 0
        },
        selectVm: function (uuid) {
          this.vmUuid = uuid
          let nicList = _.cloneDeep(this.nicList)
          nicList = _.filter(nicList, (item) => item.vmInstanceUuid === uuid)
          let ipVersion = this.ipVersion
          nicList.forEach((item) => {
            item.usedIps = _.filter(item.usedIps, (ip) => ip.ipVersion === ipVersion)
          })
          this.enabledNicList = nicList
        },
        getSelectedVm: function () {
          return this.vmUuid
        },
        select: function (uuid) {
          this.singleSelect(uuid)
          this.$data.selectedUuid = uuid
        },
        ...Utils
      }
    }
</script>

<style scoped>

</style>
