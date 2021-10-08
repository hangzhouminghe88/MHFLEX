<template>
   <div class="container">
     <div class="page-toolbar-container">
       <el-row>
         <el-col :span="14">
          <span class="detail-list-title">
            {{$t("vm.config.iso")}}{{$t("common.colon")}}
            <help-trigger name="cdrom" :style="{ position: 'absolute', top: 0, right: '2px' }"/>
          </span>
           <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
             <span slot="content">
              <div class="dropdown-content">
                <a v-permission="'VM_ISO.ATTACH'" @click="canCreateCDRom() && createIso()" :class="{'disabled-text': !canCreateCDRom()}">{{$t("vm.cdRom.create")}}</a>
                <a v-permission="'VM_ISO.ATTACH'" @click="canAttachIso() && attachIso()" :class="{'disabled-text': !canAttachIso()}">{{$t("vm.cdRom.addISO")}}</a>
                <a v-permission="'VM_ISO.DETACH'" @click="canDetachIso() && detachIso()" :class="{'disabled-text': !canDetachIso()}">{{$t("vm.cdRom.popISO")}}</a>
                <a v-permission="'VM_ISO.ATTACH'" @click="canDeleteCDRom() && deleteIso()" :class="{'disabled-text': !canDeleteCDRom()}">{{$t("vm.cdRom.delete")}}</a>
              </div>
            </span>
           </drop-down>
         </el-col>
       </el-row>
     </div>
     <iso-image-single-dlg v-if="showIsoImageSingleDlg" :model="showIsoImageSingleDlg" :message="isoImageMessage" @close="closeIsoImageSingleDlg"/>
     <detach-iso-image-dlg v-if="showDetachIsoImageDlg" :model="showDetachIsoImageDlg" :message="detachIsoImageMessage" @close="closeIsoImageDlg"/>
     <el-table
     :data="itemList"
     @selection-change="handleChangeSelect">
       <span slot="empty" class="table-nodata">
         <p class="empty-text" v-text="$t('common.noData')"></p>
       </span>
       <el-table-column type="selection"></el-table-column>
       <el-table-column :label="$t('vm.cdRom.deviceId')"
       prop="name"></el-table-column>
       <el-table-column :label="$t('vm.cdRom.deviceUuid')">
         <template slot-scope="scope" :title="scope.row.uuid">
           <span :title="scope.row.uuid">
             {{scope.row.uuid + '...'}}
           </span>
         </template>
       </el-table-column>
       <el-table-column :label="$t('common.default')">
         <template slot-scope="scope">
           <img class="checkbox" v-if="isDefault(scope.row.uuid)" src="~assets/radio_selected.svg" />
           <img class="checkbox" v-else @click="setDefaultCDRom(scope.row.uuid, $event)" src="~assets/radio_normal.svg" />
         </template>
       </el-table-column>
       <el-table-column label="ISO">
         <template slot-scope="scope">
           {{dbData.image[scope.row.isoUuid] && dbData.image[scope.row.isoUuid].name}}
         </template>
       </el-table-column>
       <el-table-column :label="$t('common.createDate')">
         <template slot-scope="scope">
           {{new Date(scope.row.createDate) | formatDatetime}}
         </template>
       </el-table-column>
     </el-table>
   </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import rpc from 'src/utils/rpc'
  import {mapGetters} from 'vuex';
  import IsoImageSingleDlg from "../../../dialog/IsoImageSingleDlg";
  import DetachIsoImageDlg from '../../../dialog/DetachIsoImageDlg';
  export default {
    name: "IsoTabList",
    components: {IsoImageSingleDlg, DetachIsoImageDlg},
    mixins: [WindowBase, Root],
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    data(){
      return {
        showIsoImageSingleDlg: false,
        isoImageMessage: {},
        showDetachIsoImageDlg: false,
        detachIsoImageMessage: {},
        itemList: []
      }
    },
    created() {
      let self = this;
      self.updateWindow({
        uuidList: [],
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      }).then(() => {
        self.queryList()
      })
    },
    computed: {
      vm () {
        if(!!this.param)
        return this.getVm(this.param.conditions.vmUuid)
      },
      cdRom () {
        return this.$store.state.cdRom
      },
      ...mapGetters({
        getVm: 'vm/get',
        getList: 'cdRom/get'
      }),
    },
    methods: {
      //查询具有rom的云主机
      queryList () {
        if(!!this.vm){
          return this.dispatchAction('cdRom/query', {
            q: `vmInstance.uuid=${this.vm.uuid}`
          }).then(resp => {
            let uuidList = resp.uuidList
            let table = {}
            uuidList.forEach(uuid => { table[uuid] = { selected: false } })
            return this.updateWindow({ table, uuidList })
          })
            .then(this.$nextTick)
            .then(() => this.itemList = this.getList(this.windowData.uuidList))
            .then(() => this.queryISO())
        }
      },
      //查询ISO镜像
      queryISO () {
        debugger
        let uuids = this.itemList.filter((v) => {
          return v.isoUuid
        }).map((v)  => {
          return v.isoUuid
        })
        return rpc.query('images', {q: `uuid?=${uuids}`}).then(resp => {
          return this.updateDbTable({
            tableName: 'image',
            list: resp.inventories
          }).then(() => this.itemList = this.getList(this.windowData.uuidList))
        })
      },
      //判断是否是默认iso
      isDefault (uuid) {
        if (!this.itemList || this.itemList.length === 0) return false
        let defaultCDRom = _.sortBy(this.itemList, 'deviceId')[0]
        return defaultCDRom.uuid === uuid
      },
      //设置默认cdm
      setDefaultCDRom (uuid, $event) {
        $event.stopPropagation()
        let self = this;
        let { name } = _.find(self.itemList, item => item.uuid === uuid)
        let isStopped = self.vm.state === 'Stopped'
        self.openDialog('SetDefaultCDRomDlg', {
          data: name,
          showWarning: !isStopped,
          ok: () => self.dispatchActionWithEvent('cdRom/setDefault', {
            vmInstanceUuid: self.vm.uuid,
            uuid: uuid
          }).then(this.queryList)
        })
      },
      //创建iso
      createIso(){
        let self = this;
        if(self.param.show){
          self.param.show({vmInstanceUuid: this.vm.uuid});
        }
      },
      //加载iso
      attachIso(){
        let self = this
        let vmUuid = self.param.conditions.vmUuid
        self.isoImageMessage = {
          vmInstanceUuid: vmUuid,
          uuidList: self.windowData.uuidList
        }
        self.showIsoImageSingleDlg = true;
      },
      //卸载iso
      detachIso(){
        let self = this
        let uuidList = self.getList(this.windowData.selectedUuidList)
          .filter(v => v.isoUuid)
          .map(v => v.isoUuid)
        let vmUuid = self.vm.uuid
        let paramList = uuidList.map(uuid => ({ uuid, vmUuid }))
        return self.openDialog('ConfirmDlg', {
          title: 'common.detachISO',
          description: 'vm.detachISO',
          uuidList: uuidList,
          icon: 'image_n',
          warning: 'vm.detachISOWarning',
          getName: uuid => self.dbData.image[uuid].name,
          ok: () => self.dispatchActionWithEvent('vm/detachIso', paramList)
            .then(self.queryList)
            .then(self.refresh)
        })
      },
      //删除光驱
      deleteIso () {
        let uuidList = this.windowData.selectedUuidList
        return this.openDialog('ConfirmDlg', {
          title: 'vm.cdRom.delete',
          description: 'vm.cdRom.confirmToDelete',
          warning: 'vm.cdRom.detachISOWarning',
          uuidList,
          icon: 'tag_n',
          getName: uuid => _.find(this.itemList, item => item.uuid === uuid).name,
          ok: () => this.dispatchActionWithEvent('cdRom/delete', uuidList)
            .then(this.queryList)
            .then(this.param.refresh)
        })
      },
      //是否可以创建CDRom
      canCreateCDRom () {
        const { cdromLimit, state } = this.vm;
        let legalNum;
        if(this.windowData.uuidList)
          legalNum = this.windowData.uuidList.length < cdromLimit
        return this.windowData.selectedUuidList.length<=0 && state === 'Stopped' && legalNum
      },
      //是否可以加载Iso
      canAttachIso () {
        if (this.windowData.selectedUuidList.length !== 1) return false
        let cdRom = this.cdRom[this.windowData.selectedUuidList[0]]
        return !_.has(cdRom, 'isoUuid')
      },
      //是否可以删除Iso
      canDeleteCDRom () {
        if (this.vm.state !== 'Stopped') return false
        return this.windowData.selectedUuidList.length > 0
      },
      //是否可卸载Iso
      canDetachIso () {
        if (this.windowData.selectedUuidList.length <= 0 ) return false
        let uuidList = this.windowData.selectedUuidList;
        return uuidList.some((uuid) => {
          return _.has(this.cdRom[uuid], 'isoUuid')
        })
      },
      handleChangeSelect(row){
        let self = this;
        let uuidList = row.map((item) => {
          return item.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      closeIsoImageSingleDlg(param){
        let self = this;
        let vmUuid = self.param.conditions.vmUuid;
        if(param){
          let cdromUuid = param.uuidList[0]
          self.dispatchActionWithEvent('vm/attachIso', { uuid:param.uuid, vmUuid, cdromUuid })
           .then(self.queryList)
        }
        self.showIsoImageSingleDlg = false;
      },
      closeIsoImageDlg(){
        let self = this;
        self.showDetachIsoImageDlg = false;
      },
    },
    watch: {
      'param.isoMessage': function(newVal, oldVal){
        if(newVal !== oldVal){
          this.dispatchActionWithEvent('cdRom/create', newVal)
            .then(this.queryList)
        }
      }
    }
  }
</script>

<style scoped>

</style>
