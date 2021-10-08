<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{$t('common.vm')}}{{$t('common.colon')}}</span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a
                  style="margin-top: 12px"
                  @click="canAddVmToAffinityGroup() && addVmForAG()"
                  :class="{'disabled-text': !canAddVmToAffinityGroup()}"
                >{{$t('affinityGroup.addVm')}}</a>
                <a
                  style="margin-bottom: 12px"
                  @click="canRemoveVmFromAffinityGroup() && removeVmForAG()"
                  :class="{'disabled-text': !canRemoveVmFromAffinityGroup()}"
                >{{$t('affinityGroup.removeVm')}}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input
              :placeholder="$t('common.searchPlaceholder')"
              v-model="searchStr"
              @blur="search()"
              @change="search()"
            >
              <el-select
                v-model="selectVal"
                slot="prepend"
                :placeholder="$t('common.searchLabelPlaceholder')"
                style="width: 105px"
              >
                <el-option
                  v-for="(item, index ) in conditionNameList"
                  :label="$t(`${item.name}`)"
                  :key="index"
                  :value="item.value"
                ></el-option>
              </el-select>
              <span slot="append">
                <i class="el-icon-search icon"></i>
              </span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <div>
      <el-table :data="itemList" @selection-change="handleSelect">
        <span slot="empty" class="table-nodata">
          <p class="empty-text" v-text="$t('common.noData')"></p>
        </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')">
          <template slot-scope="scope">
            <span class="link" @click="openVmDetailPage(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.hostIp')">
          <template slot-scope="scope">{{getHostIp(scope.row.uuid)}}</template>
        </el-table-column>
        <el-table-column :label="$t('affinityGroup.hostName')">
          <template slot-scope="scope">{{getHostName(scope.row.uuid)}}</template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')">
          <template slot-scope="scope">{{new Date(scope.row.createDate) | formatDatetime}}</template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination
          v-if="windowData.total > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.total"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import VmList from "src/ecs/ecsInstance/List";
import WindowBase from "src/windows/Window";
import rpc from "src/utils/rpc";
import TableBodyItemState from "../../../component/TableBodyItemState";
import AffinityGroupMethods from "src/ecs/affinityGroup/Methods";
export default {
  name: "VmTabList",
  components: { TableBodyItemState },
  mixins: [VmList, WindowBase, AffinityGroupMethods],
  props: {
    param: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  computed: {
    selectedList() {
      let self = this;
      return self.windowData && self.windowData.selectUuidList;
    },
    isSelected() {
      let self = this;
      return self.windowData && self.windowData.selectUuidList.length >= 1;
    }
  },
  data() {
    return {
      searchStr: "",
      selectVal: "name",
      conditionNameList: [
        { name: "common.name", value: "name" },
        { name: "common.uuid", value: "uuid" }
      ],
      itemList: []
    };
  },
  created() {
    let self = this;
    self
      .updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: "createDate",
        sortDirection: "-",
        selectUuidList: [],
        methods: {
          queryList: self.queryList
        }
      })
      .then(() => {
        self.queryList();
      });
  },
  methods: {
    search() {
      let self = this;
      self
        .updateWindow({
          pageIndex: 1
        })
        .then(() => {
          self.queryList();
        });
    },
    //是否可以绑定云主机
    canAddVmToAffinityGroup() {
      let affinityGroup = this.dbData.affinitygroup[this.param.dataUuid];
      if (!affinityGroup || affinityGroup.state !== "Enabled") return false;
      return true;
    },
    //是否可以解绑云主机
    canRemoveVmFromAffinityGroup() {
      if (!this.isSelected) return false;
      let affinityGroup = this.dbData.affinitygroup[this.param.dataUuid];
      if (!affinityGroup) return false;
      let allInvalid = this.selectedList.every(
        vmUuid =>
          ["Running", "Stopped"].indexOf(this.dbData.vm[vmUuid].state) === -1
      );
      return !allInvalid && affinityGroup.usages.length > 0;
    },
    getCondition() {
      let conditionList = [];
      conditionList.push(
        `uuid?=${this.getVmUuidListInAffinityGroup(this.param.dataUuid)}`
      );
      conditionList.push("state!=Destroyed");
      let conditions =
        this.param && this.param.conditions ? this.param.conditions : [];
      conditionList = conditionList.concat(conditions);
      if (this.searchStr !== "" && this.selectVal !== "") {
        conditionList = conditionList.concat(
          `${this.selectVal}~=%25${this.searchStr}%25`
        );
      }
      return conditionList;
    },
    getVmUuidListInAffinityGroup(affinityGroupUuid) {
      let affinityGroup = this.dbData.affinitygroup[affinityGroupUuid];
      if (!affinityGroup) return;
      let vmInAffinity = affinityGroup.usages.map(vm => vm.resourceUuid);
      return vmInAffinity;
    },
    pageSizeChange(val) {
      this.updateWindow({
        pageSize: val
      });
    },
    pageCurrentChange(val) {
      this.updateWindow({
        pageIndex: val
      });
    },
    async addVmForAG() {
      let self = this;
      let affinityGroupUuid = self.param.dataUuid;
      let conditions = [];
      let vmUuidList = await self.getCandidateVmForAttachingAffinityGroup(
        affinityGroupUuid
      );
      conditions.push(`uuid?=${vmUuidList}`);
      self.openDialog("VmSingleSelectListDlg", {
        conditions,
        ok: uuid => {
          self
            .addVmToAffinityGroup(affinityGroupUuid, uuid)
            .then(() => {
              return self.param.refresh();
            })
            .then(() => {
              return self.queryList();
            });
        }
      });
    },
    //处理表格多选
    handleSelect(rows) {
      let self = this,
        uuidList = [];
      uuidList = rows.map(item => {
        return item.uuid;
      });
      self.updateWindow({
        selectUuidList: uuidList
      });
    },
    //解绑云主机
    removeVmForAG() {
      const self = this;
      let affinityGroupUuid = self.param.dataUuid;
      let uuidList = [];
      self.selectedList.forEach(uuid => {
        if (["Running", "Stopped"].indexOf(self.dbData.vm[uuid].state) > -1)
          uuidList.push(uuid);
      });
      if (uuidList.length > 0) {
        self.openDialog("ConfirmDlg", {
          title: "affinityGroup.removeVm",
          description: "affinityGroup.info.removeVmConfirm",
          uuidList: uuidList,
          icon: "vm_plain",
          ok: () => {
            self
              .removeVmFromAffinityGroup(affinityGroupUuid, uuidList)
              .then(() => {
                return self.refresh();
              })
              .then(() => {
                return self.queryList();
              });
          },
          getName(uuid) {
            return self.vm[uuid].name;
          }
        });
      }
    },
    //跳转至云主机详情页面
    openVmDetailPage(uuid) {
      let self = this;
      if (
        self.dbData.vm[uuid].type === "UserVm" &&
        self.dbData.vm[uuid].hypervisorType === "KVM"
      ) {
        self.$router.push({
          name: "detailVm",
          params: {
            uuid
          }
        });
      }
      // if (self.dbData.vm[uuid].type === 'ApplianceVm' && self.dbData.vm[uuid].hypervisorType === 'KVM') self.openSideWindow('VirtualRouterDetailDlg', {uuid: uuid})
      // if ((self.dbData.vm[uuid].type === 'ApplianceVm' || self.dbData.vm[uuid].type === 'UserVm') && self.dbData.vm[uuid].hypervisorType === 'ESX') this.openSideWindow('vCenterVirtualRouterVmInstanceDetailDialog', {uuid: uuid})
    },
    //获得物理机名称
    getHostName: function(uuid) {
      let self = this;
      let value;
      try {
        value = self.dbData.host[uuid].name;
      } catch (e) {
        if (self.checkBounce(`getHostName-${uuid}`)) return "";
        value = "";
        rpc.query(`hosts/${uuid}`).then(resp => {
          if (resp.inventories.length > 0) {
            self
              .updateDbRow({
                tableName: "host",
                id: uuid,
                data: resp.inventories[0]
              })
              .then(() => {
                value = self.dbData.host[uuid].name;
              });
          }
        });
      }
      return value;
    }
  }
};
</script>

<style scoped>
</style>
