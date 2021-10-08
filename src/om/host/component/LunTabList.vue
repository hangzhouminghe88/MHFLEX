<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
            {{$t("common.blockDevice")}}{{$t("common.colon")}}
            <help-trigger name="cdrom" :style="{ position: 'absolute', top: 0, right: '-2px' }"/>
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a v-permission="'PCI.ATTACH_PCI_TO_VM'" style="padding-top:12px;" @click="isSingleSelected && inStates('Running', 'Stopped') && pageAttach()" :class="{ 'disabled-text': !isSingleSelected }">{{ $t("common.attach") }}{{$t('common.vm')}}</a>
                <a v-permission="'PCI.DETACH_PCI_FROM_VM'" style="padding-bottom:12px;" @click="canDetach() &&  pageDetach()" :class="{ 'disabled-text': !canDetach() }">{{ $t("common.detach") }}{{$t('common.vm')}}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
      </el-row>
    </div>
    <el-table
      :data="itemList"
      @selection-change="handleSelection">
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column type="selection"></el-table-column>
      <el-table-column :label="$t('common.name')">
        <template slot-scope="scope">
          <span class="link">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.vendor')" prop="vendor"></el-table-column>
      <el-table-column :label="$t('common.model')" prop="model"></el-table-column>
      <el-table-column :label="$t('common.size')">
        <template slot-scope="scope">
          {{bytesToSize(scope.row.size)}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('fc.wwn')" prop="wwn"></el-table-column>
      <el-table-column :label="$t('fc.wwid')" prop="wwid"></el-table-column>
      <el-table-column :label="$t('fc.attachedVmCount')">
        <template slot-scope="scope">
          {{scope.row.scsiLunVmInstanceRefs.length}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.type')" prop="type"></el-table-column>
      <el-table-column :label="$t('common.source')" prop="source"></el-table-column>
    </el-table>
  </div>
</template>

<script>
  import Root from 'src/windows/Root';
  import LunList from 'src/storage/sanstorage/List';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "LunTabList",
    mixins: [Root, LunList, WindowBase],
    props:{
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    computed: {
      isSelected(){
        let self = this;
        return self.windowData.selectedUuidList && self.windowData.selectedUuidList.lenght >=0;
      },
      isSingleSelected(){
        let self = this;
        return self.windowData.selectedUuidList && self.windowData.selectedUuidList.length === 1;
      },
      selectedList(){
        let self = this;
        return self.windowData.selectedUuidList;
      }
    },
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
        currTab: 'fc',
        itemList: []
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        vmUuid: self.param.uuid,
        conditions: this.param && this.param.conditions ? this.param.conditions : [],
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      getCondition () {
        let conditionList = [];
        if (this.param.conditions) conditionList.push(this.param.conditions)
        if (this.selectVal !== ''  && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      handleSelection(rows){
        let self = this, uuidList = [];
        uuidList  = rows.map((item) => {
          return item.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      pageAttach: async function () {
        const self = this;
        let lun = _.find(self.lunList, it => it.uuid === self.selectedList[0])
        let hostUuid = self.param.uuid;
        let vmUuids = await self.getCandidateVmForLun(lun, hostUuid);
        let uuid = self.selectedList[0];
        return self.openDialog('VmInstanceMultiSelectListDlg', {
          conditions: [`uuid?=${vmUuids}`],
          select: vmUuidList => self.attachVm(self.selectedList[0], uuid).then(self.queryList)
        })
      },
      pageDetach () {
        const self = this
        let lunUuid = self.selectedList[0]
        let lun = _.find(self.lunList, it => it.uuid === lunUuid)
        let attachVms = lun.scsiLunVmInstanceRefs.map(v => v.vmInstanceUuid)
        return self.openDialog('VmInstanceMultiSelectListDlg', {
          conditions: [`uuid?=${attachVms}`],
          select: vmUuidList => self.detachVm(lunUuid, vmUuidList).then(self.queryList)
        })
      },
      getCandidateLun: async function () {
        let vmUuid = this.windowData.vmUuid
        let lunResp = await rpc.query(`vm-instances/${vmUuid}/candidate-storage-devices`)
        return lunResp.inventories.map(v => v.uuid)
      },
    }
  }
</script>

<style scoped>

</style>
