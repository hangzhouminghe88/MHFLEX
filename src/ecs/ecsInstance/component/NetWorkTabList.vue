<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
            {{`${$t('common.nic')}${$t('common.colon')}`}}
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <div class="dropdown-row">
                  <div class="title">{{ $t("common.nic") }}</div>
                  <div class="left" style="border-right: none;position: relative;">
                    <a
                      id="common-attach"
                      v-permission="'VM_L3.ATTACH'"
                      @click="canAttach && attachNic()"
                      :class="{'disabled-text': !canAttach()}"
                    >{{$t("vm.attachNic")}}</a>
                    <a
                      v-permission="'VM_L3.DETACH'"
                      @click="isSelected && isOnlySelectedVMNic() && inStates(['Stopped', 'Running']) && detachNic()"
                      :class="{'disabled-text': !(isSelected && isOnlySelectedVMNic() && inStates(['Stopped', 'Running']))}"
                    >{{$t("vm.detachNic")}}</a>
                    <a
                      v-permission="'LICENSE_BASIC_PAID'"
                      @click="canSetVmNicMAC() && setVmNicMAC()"
                      :class="{'disabled-text': !canSetVmNicMAC()}"
                    >{{$t("vm.setMAC")}}</a>
                    <a
                      v-permission="['VM.SET_NIC_QOS', 'LICENSE_BASIC_PAID']"
                      @click="isSingleSelectedVMNic() && setNicQos()"
                      :class="{ 'disabled-text': !isSingleSelectedVMNic()}"
                    >{{$t("common.setNicQos")}}</a>
                    <a
                      v-permission="['VM.DELETE_NIC_QOS', 'LICENSE_BASIC_PAID']"
                      @click="canDeleteNicQoS() && cancelVmQos()"
                      :class="{'disabled-text':!canDeleteNicQoS()}"
                    >{{$t("common.deleteNicQos")}}</a>
                  </div>
                </div>
                <div class="dropdown-row">
                  <div class="title">{{ $t("common.ip") }}</div>
                  <div class="left" style="border-right: none; position: relative;">
                    <a
                      @click="isSingleSelectedIP() && canSetStaticIP() && inStates(['Stopped']) && editvmIp()"
                      :class="{'disabled-text': !(isSingleSelectedIP() && canSetStaticIP() && inStates(['Stopped']))}"
                    >{{$t("vm.setIp")}}</a>
                    <a
                      @click="isSelectedIP() && isStaticIp() && deleteStaticIp()"
                      :class="{ 'disabled-text': !(isSelectedIP() && isStaticIp())}"
                    >{{$t("vm.deleteVmStaticIp")}}</a>
                  </div>
                </div>
              </div>
            </span>
          </drop-down>
          <detach-nic-dlg
            v-if="showDetachNicDlg"
            :model="showDetachNicDlg"
            :message="detachNicMessage"
            @close="closeDetachNicDlg"
          />
          <set-nic-qos-dlg
            v-if="showNicQosDlg"
            :model="showNicQosDlg"
            :message="nicQosMessage"
            @close="closeNicQosDlg"
          />
          <edit-static-ip-dlg
            v-if="showEditIPDlg"
            :model="showEditIPDlg"
            :message="editIpMessage"
            @close="closeEditDlg"
          />
        </el-col>
      </el-row>
    </div>
    <div class="list">
      <div class="row-title">
        <span class="expand-container"></span>
        <span class="checkbox-container">
          <el-checkbox
            v-model="isAllSelected"
            @change="handleSelectAll()"
            :disabled="DisableVMNicCheckbox"
          ></el-checkbox>
        </span>
        <span class="row-item" v-text="$t('common.name')"></span>
        <span class="row-item" v-text="$t('common.default')"></span>
        <span class="row-item" v-text="$t('common.networkNumber')"></span>
        <span class="row-item" v-text="'MAC'"></span>
        <span class="row-item" v-text="$t('common.ipVersion')"></span>
        <span class="row-item" v-text="'IP'"></span>
        <span class="row-item" v-text="$t('common.networkInboundBandwidth')"></span>
        <span class="row-item" v-text="$t('common.networkOutboundBandwidth')"></span>
      </div>
      <div class="row" v-for="(uuid, index) in windowData.uuidList" :key="index" >
        <span class="expand-container">
          <span v-if="dbData.vmNicRefs[uuid]">
            <i
              @click="expandData(uuid, $event)"
              :class="{'icon-no-expand': !windowData.table[uuid].expanded, 'icon-expand': windowData.table[uuid].expanded}"
              class="el-icon el-icon-arrow-right"
            ></i>
          </span>
          <span v-else></span>
        </span>
        <span class="checkbox-container">
          <span v-if="dbData.vmNicRefs[uuid]">
            <el-checkbox v-model="windowData.table[uuid].selected" :disabled="DisableVMNicCheckbox"></el-checkbox>
          </span>
        </span>
        <span class="row-item">
          <span
            v-if="dbData.vmNicRefs[uuid]"
            :title="dbData.vmNicRefs[uuid].internalName"
            v-text="dbData.vmNicRefs[uuid].internalName"
          ></span>
          <span v-else>
            <span class="checkbox-container">
              <el-checkbox v-model="windowData.table[uuid].selected" :disabled="DisableIPCheckbox"></el-checkbox>
            </span>
            <span v-text="dbData.ip[uuid] && getL3NetworkName(dbData.ip[uuid].l3NetworkUuid)"
             class="link"
             @click="goToDetail(dbData.ip[uuid].l3NetworkUuid)"></span>
          </span>
        </span>
        <span class="row-item">
          <span v-if="dbData.vmNicRefs[uuid]" class="checkbox">
            <img
              v-if="dbData.vm[windowData.dataUuid] && dbData.vmNicRefs[uuid].l3NetworkUuid === dbData.vm[windowData.dataUuid].defaultL3NetworkUuid"
              src="~assets/radio_selected.svg"
            />
            <img
              @click="setDefaultNetwork($event, uuid)"
              v-if="dbData.vm[windowData.dataUuid] && !(dbData.vmNicRefs[uuid].l3NetworkUuid === dbData.vm[windowData.dataUuid].defaultL3NetworkUuid)"
              src="~assets/radio_normal.svg"
            />
          </span>
          <span v-else>-</span>
        </span>
        <span class="row-item">
          <span v-if="dbData.vmNicRefs[uuid]" v-text="dbData.vmNicRefs[uuid].usedIps.length"></span>
          <span v-else>-</span>
        </span>
        <span class="row-item">
          <span v-if="dbData.vmNicRefs[uuid]" v-text="dbData.vmNicRefs[uuid].mac"></span>
          <span v-else>-</span>
        </span>
        <span class="row-item">
          <span v-if="dbData.vmNicRefs[uuid]" v-text="'-'"></span>
          <span v-else v-text="dbData.ip[uuid].ipVersion === 4 ? 'IPv4' : 'IPv6'"></span>
        </span>
        <span class="row-item">
          <span v-if="dbData.vmNicRefs[uuid]" v-text="'-'"></span>
          <span
            v-else-if="dbData.ip[uuid] && dbData.ip[uuid].isStatic === true"
            :title="dbData.ip[uuid].ip ? `${dbData.ip[uuid].ip}(${$t('common.static')})` : $t('common.empty')"
            v-text="dbData.ip[uuid].ip ? `${dbData.ip[uuid].ip}(${$t('common.static')})` : $t('common.empty')"
          ></span>
          <span
            v-else-if="dbData.ip[uuid] && (dbData.ip[uuid].isStatic === false || dbData.ip[uuid].isStatic === undefined)"
            :title="dbData.ip[uuid].ip ? `${dbData.ip[uuid].ip}(${$t('common.dynamic')})` : $t('common.empty')"
            v-text="dbData.ip[uuid].ip ? `${dbData.ip[uuid].ip}(${$t('common.dynamic')})` : $t('common.empty')"
          ></span>
        </span>
        <span class="row-item">
          <span
            v-if="dbData.vmNicRefs[uuid]"
            :title="dbData.vmNicRefs[uuid].inboundBandwidth && dbData.vmNicRefs[uuid].inboundBandwidth > -1 ? (parseInt(dbData.vmNicRefs[uuid].inboundBandwidth) | bytesToSize('bps')) : $t('common.unlimited')"
          >
            <span
              v-if="dbData.vmNicRefs[uuid].inboundBandwidth && dbData.vmNicRefs[uuid].inboundBandwidth > -1"
            >{{parseInt(dbData.vmNicRefs[uuid].inboundBandwidth) | bytesToSize('bps')}}</span>
            <span v-else>{{ $t('common.unlimited')}}</span>
          </span>
          <span v-else v-text="'-'"></span>
        </span>
        <span class="row-item">
          <span
            v-if="dbData.vmNicRefs[uuid]"
            :title="dbData.vmNicRefs[uuid].outboundBandwidth && dbData.vmNicRefs[uuid].outboundBandwidth > -1 ? (parseInt(dbData.vmNicRefs[uuid].outboundBandwidth)| bytesToSize('bps')) : $t('common.unlimited')"
          >
          <span
              v-if="dbData.vmNicRefs[uuid].outboundBandwidth && dbData.vmNicRefs[uuid].outboundBandwidth > -1"
            >{{parseInt(dbData.vmNicRefs[uuid].outboundBandwidth) | bytesToSize('bps')}}</span>
            <span v-else>{{ $t('common.unlimited')}}</span>
          </span>
          <span v-else v-text="'-'"></span>
        </span>
      </div>
      <div class="row-empty el-table__empty-text" v-if="windowData.uuidList.length <=0">
        <span slot="empty" class="table-nodata">
          <p class="empty-text" v-text="$t('common.noData')"></p>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Root from "src/windows/Root";
import rpc from "src/utils/rpc";
import Utils from "src/utils/utils";
import WindowBase from "src/windows/Window";
import VmInstanceMethods from "src/ecs/ecsInstance/List";
import DetachNicDlg from "../../../dialog/DetachNicDlg";
import SetNicQosDlg from "../../../dialog/SetNicQosDlg";
import EditStaticIpDlg from "../../../dialog/EditStaticIpDlg";
import Controller from "src/ecs/ecsInstance/Controller";

export default {
  name: "NetWorkTabList",
  mixins: [Root, WindowBase, VmInstanceMethods],
  components: {
    EditStaticIpDlg,
    SetNicQosDlg,
    DetachNicDlg
  },
  props: {
    param: {
      type: Object,
      default: {}
    }
  },
  created() {
    //uuid赋值以及查询数据
    let self = this,
      dataUuid;
    self.param.uuid ? (dataUuid = self.param.uuid) : "";
    self
      .updateWindow({
        sortBy: "createDate",
        sortDirection: "-",
        uuidList: [],
        dataUuid,
        methods: {
          queryList: self.init
        }
      })
      .then(() => {
        self.init();
      });
  },
  mounted() {},
  computed: {
    itemNicRefList() {
      if (!_.isArray(this.windowData.uuidList)) return [];
      // sometimes, uuid will not exist. so should be excluded firstly.
      let uuidList = [];
      uuidList = this.windowData.uuidList.filter(
        uuid => this.dbData.vmNicRefs[uuid]
      );
      return uuidList.map(uuid => {
        return this.dbData.vmNicRefs[uuid];
      });
    },
    //判断是否不能
    isAllSelected: {
      get() {
        if (!this.windowData.uuidList || this.windowData.uuidList.length === 0)
          return false;
        let uuidList = _.filter(
          this.windowData.uuidList,
          uuid => this.dbData.vmNicRefs[uuid]
        );
        for (let i in uuidList) {
          if (!this.windowData.table[uuidList[i]].selected) {
            return false;
          }
        }
        return true;
      },
      set(val) {
        return val;
      }
    },
    getAllSelect: {
      get() {
        if (!this.windowData.uuidList || this.windowData.uuidList.length === 0)
          return false;
        let uuidList = _.filter(
          this.windowData.uuidList,
          uuid => this.dbData.vmNicRefs[uuid]
        );
        for (let i in uuidList) {
          if (!this.windowData.table[uuidList[i]].selected) {
            return false;
          }
        }
        return true;
      },
      set(value) {
        this.allSelect = value;
      }
    },
    DisableIPCheckbox: function() {
      let selectedList = this.windowData.uuidList.filter(
        uuid => this.windowData.table[uuid].selected
      );
      if (selectedList.length === 0) return false;
      selectedList = selectedList.filter(uuid => {
        return (
          this.windowData.table[uuid].selected && this.dbData.vmNicRefs[uuid]
        );
      });
      return selectedList.length > 0;
    },
    hasDefaultL3Network() {
      let defaultL3NetworkUuid = this.dbData.vm[this.windowData.dataUuid]
        .defaultL3NetworkUuid;
      if (!defaultL3NetworkUuid) return false;
      return this.windowData.uuidList.find(
        uuid =>
          this.dbData.vmNicRefs[uuid] &&
          this.dbData.vmNicRefs[uuid].l3NetworkUuid === defaultL3NetworkUuid
      );
    },
    DisableVMNicCheckbox() {
      let selectedList = this.windowData.uuidList.filter(
        uuid => this.windowData.table[uuid].selected
      );
      if (selectedList.length === 0) return false;
      selectedList = selectedList.filter(
        uuid => this.windowData.table[uuid].selected && this.dbData.ip[uuid]
      );
      return selectedList.length > 0;
    },
    isSelected: function() {
      let uuidList = _.get(this, ["windowData", "uuidList"]);
      if (!uuidList || uuidList.length === 0) return false;
      let selectedList = this.windowData.uuidList.filter(uuid =>
        _.get(this.windowData, ["table", `${uuid}`, "selected"])
      );
      return selectedList.length >= 1;
    },
    selectedList() {
      let selectedList = this.windowData.uuidList.filter(uuid =>
        _.get(this.windowData, ["table", `${uuid}`, "selected"])
      );
      return selectedList;
    },
  },
  data() {
    return {
      uuid: "",
      vmNicUuidList: [], //网卡uuid
      expandKey: [],
      getRowKeys(row) {
        return row.uuid;
      },
      allSelect: false,
      showDetachNicDlg: false,
      detachNicMessage: {},
      showNicQosDlg: false,
      nicQosMessage: {},
      showEditIPDlg: false,
      editIpMessage: {}
    };
  },
  methods: {
    ...Utils,
    //实现多选框的正反选
    handleSelectAll() {
      let self = this,
        newState = false;
      newState = !self.isAllSelected;
      let table = _.cloneDeep(this.windowData.table);
      self.windowData.uuidList.forEach(uuid => {
        if (this.dbData.vmNicRefs[uuid]) table[uuid].selected = newState;
        else table[uuid].selected = false;
      });
      self.updateWindow({ table });
    },
    attachNic() {
      let self = this;
      let privateNetworkUuidList = [];
      let taskList = [];
      let p = rpc
        .query(
          `vm-instances/${this.windowData.dataUuid}/l3-networks-candidates`,
          {}
        )
        .then(resp => {
          privateNetworkUuidList = privateNetworkUuidList.concat(
            resp.inventories.map(it => it.uuid)
          );
        });
      taskList.push(p);
      Promise.all(taskList).then(() => {
        self.param.show({
          vmInstanceUuid: self.windowData.dataUuid,
          avaliableL3networkUuidList: privateNetworkUuidList
        });
      });
    },
    detachNic() {
      let self = this;
      if (!this.isSelected) return;
      let uuidList = [];
      this.windowData.uuidList.forEach(uuid => {
        if (this.windowData.table[uuid].selected && this.dbData.vmNicRefs[uuid])
          uuidList.push(uuid);
      });
      self.detachNicMessage = {
        uuidList,
        type: "detach"
      };
      self.showDetachNicDlg = true;
    },
    //删除静态IP
    deleteStaticIp() {
      let self = this;
      if (this.selectedList.length <= 0) return false;
      let ipUuid = [];
      self.selectedList.forEach(uuid => {
        if (self.dbData.ip[uuid].isStatic === true) ipUuid.push(uuid);
      });
      self.detachNicMessage = {
        uuidList: ipUuid,
        type: "deleteStaticIp"
      };
      self.showDetachNicDlg = true;
    },
    //设置静态ip
    editvmIp() {
      let self = this;
      if (!this.isSelected) return;
      let ip = _.cloneDeep(this.dbData.ip[this.selectedList[0]]);
      self.editIpMessage = {
        ip: ip.ip,
        ipVersion: ip.ipVersion
      };
      self.showEditIPDlg = true;
    },
    init() {
      let self = this,
        vmUuid = self.windowData.dataUuid;
      rpc
        .query(`vm-instances/nics`, {
          q: `vmInstanceUuid=${vmUuid}`
        })
        .then(resp => {
          let table = {};
          let uuidList = resp.inventories.map(item => item.uuid);
          self.vmNicUuidList = uuidList;
          uuidList.forEach(uuid => {
            table[uuid] = {
              selected: false,
              expanded: false
            };
          });
          let ipList = _.flatten(resp.inventories.map(item => item.usedIps));
          return self
            .updateDbTable({
              tableName: "ip",
              list: ipList
            })
            .then(() => {
              return self.updateDbTable({
                tableName: "vmNicRefs",
                list: resp.inventories
              });
            })
            .then(() => {
              return self.updateWindow({ uuidList, table });
            })
            .then(() => {
              return rpc
                .query(`vm-instances`, {
                  q: `uuid=${vmUuid}`
                })
                .then(vmResp => {
                  if (
                    !_.has(vmResp.inventories[0], "defaultL3NetworkUuid") &&
                    resp.inventories.length > 0
                  ) {
                    let length = resp.inventories.length;
                    let index = Math.floor(Math.random() * length);
                    let l3Uuid = resp.inventories[index].l3NetworkUuid;
                    return rpc
                      .update("vm-instances", vmUuid, {
                        updateVmInstance: {
                          defaultL3NetworkUuid: l3Uuid
                        }
                      })
                      .then(() => {
                        return self.updateDbRow({
                          tableName: "vm",
                          id: vmUuid,
                          data: {
                            defaultL3NetworkUuid: l3Uuid
                          }
                        });
                      });
                  } else {
                    return self.updateDbRow({
                      tableName: "vm",
                      id: vmUuid,
                      data: vmResp.inventories[0]
                    });
                  }
                });
            })
            .then(() => {
              if (uuidList.length > 0) self.expandData(uuidList[0]);
              return new Promise((resolve, reject) => {
                resolve();
              });
            })
            .then(() => self.queryQos(uuidList))
            .then(() => self.queryStaticIp(uuidList))
            .then(() => self.queryL3Network(uuidList));
        });
    },
    //查询QOS
    queryQos(uuidList) {
      let tasks = [];
      let p = null;
      if (!this.dbData.common.isOpensource) {
        uuidList.forEach(uuid => {
          p = rpc.query(`vm-instances/${uuid}/nic-qos`).then(resp => {
            delete resp.success;
            let vmNic = _.cloneDeep(this.dbData.vmNicRefs[uuid]);
            return this.updateDbRow({
              tableName: "vmNicRefs",
              id: uuid,
              data: {
                ...vmNic,
                ...resp
              }
            });
          });
          tasks.push(p);
        });
      }
      return Promise.all(tasks);
    },
    //查询三层网络
    queryL3Network: function(uuidList) {
      rpc
        .query(`l3-networks`, {
          q: `vmNic.uuid?=${uuidList}`
        })
        .then(resp => {
          let l3network = _.cloneDeep(this.dbData.l3network);
          let list = [];
          resp.inventories.forEach(item => {
            let _item = item;
            if (l3network[item.uuid]) {
              _item = {
                ...l3network[item.uuid],
                ...item
              };
            }
            list.push(_item);
          });
          this.updateDbTable({
            tableName: "l3network",
            list: list
          });
        });
    },
    //查询静态IP
    queryStaticIp: function(uuidList) {
      rpc
        .query(`system-tags`, {
          q: [
            `resourceUuid=${this.windowData.dataUuid}`,
            "resourceType=VmInstanceVO"
          ]
        })
        .then(resp => {
          resp.inventories.forEach(item => {
            if (item.tag.indexOf("staticIp::") > -1) {
              let l3NetworkUuid = item.tag.split("::")[1];
              for (let i = 0; i < uuidList.length; ++i) {
                let vmNic = _.cloneDeep(this.dbData.vmNicRefs[uuidList[i]]);
                vmNic.usedIps.forEach((ip, index) => {
                  if (ip.l3NetworkUuid === l3NetworkUuid) {
                    let ipInventoy = _.cloneDeep(this.dbData.ip[ip.uuid]);
                    ipInventoy.isStatic = true;
                    this.updateDbRow({
                      tableName: "ip",
                      id: ipInventoy.uuid,
                      data: ipInventoy
                    });
                  }
                });
              }
            }
          });
        });
    },
    //设置展开的列表数据
    expandData(uuid, $event) {
      if ($event) $event.stopPropagation();
      let self = this;
      let flag = _.get(this.windowData, `table.${uuid}.expanded`);
      let table = {};
      let vmNicRefs = this.dbData.vmNicRefs[uuid];
      let children = vmNicRefs.usedIps.map(item => item.uuid);
      let uuidList = _.cloneDeep(this.windowData.uuidList);
      if (flag) {
        _.remove(uuidList, it => _.includes(children, it));
      } else {
        uuidList = _.cloneDeep(this.vmNicUuidList);
        let index = _.findIndex(uuidList, id => id === uuid);
        uuidList.splice(index + 1, 0, children);
        uuidList = _.flatten(uuidList);
      }
      uuidList.forEach(uuid => {
        table[uuid] = {
          selected: false,
          expanded: false
        };
      });
      children.forEach(id => {
        table[id] = {
          selected: false
        };
      });

      table[uuid].expanded = !flag;
      table[uuid].selected = this.windowData.table[uuid].selected;
      self.updateWindow({ uuidList, table }).then(() => {
        self.$forceUpdate();
      });
    },
    selectSetdefaultL3Network() {},
    //获得三层网络名称
    getL3NetworkName(uuid) {
      let value = "";
      try {
        value = this.dbData.l3network[uuid].name;
      } catch (e) {
        this.queryResourceByUuid("l3-networks", [uuid], "l3network", this);
      }
      return value;
    },
    //点击复选框是触发
    clickCheckbox: function(uuid, $event) {
      if (
        (this.dbData.ip[uuid] && this.DisableIPCheckbox) ||
        (this.dbData.vmNicRefs[uuid] && this.DisableVMNicCheckbox)
      )
        return false;
      let newState = {
        table: {
          ...this.windowData.table,
          [uuid]: {
            selected: !this.windowData.table[uuid].selected,
            expanded: this.windowData.table[uuid].expanded
          }
        }
      };
      this.updateWindow(newState);
      $event.stopPropagation();

      let uuidList = [];
      this.windowData.uuidList.forEach(uuid => {
        if (this.windowData.table[uuid].selected) uuidList.push(uuid);
      });
    },
    //设置Qos
    setNicQos() {
      let self = this;
      if (!this.isSelected) return;
      let vmNic = _.cloneDeep(this.dbData.vmNicRefs[this.selectedList[0]]);
      self.nicQosMessage = {
        outboundBandwidth: vmNic.outboundBandwidth,
        inboundBandwidth: vmNic.inboundBandwidth,
        uuidList: [vmNic.uuid]
      };
      self.showNicQosDlg = true;
    },
    //取消qos
    cancelVmQos() {
      let self = this;
      if (!this.isSelected) return;
      let uuidList = [];
      this.windowData.uuidList.forEach(uuid => {
        if (this.windowData.table[uuid].selected && this.dbData.vmNicRefs[uuid])
          uuidList.push(uuid);
      });
      self.detachNicMessage = {
        uuidList,
        type: "detachNicQos"
      };
      self.showDetachNicDlg = true;
    },
    //解绑回调
    closeDetachNicDlg(param) {
      let self = this;
      if (param) {
        switch (param.type) {
          case "detach":
            self
              .detachL3NetworkFromVm(param.uuidList, self.windowData.dataUuid)
              .then(() => {
                self.init();
                self.param.refresh();
              });
          case "detachNicQos":
            param.uuidList.forEach(uuid => {
              let self = this;
              let event = self.createEvent(
                "vm.action.deleteNicQos",
                self.dbData.vm[this.windowData.dataUuid].name
              );
              rpc._delete(
                `vm-instances/${uuid}/nic-qos`,
                { direction: "out" },
                event
              );
              rpc
                ._delete(
                  `vm-instances/${uuid}/nic-qos`,
                  { direction: "in" },
                  event
                )
                .then(
                  () => {
                    self.init();
                    self.incEventSuccess(event);
                  },
                  () => {
                    self.incEventFail(event);
                  }
                );
            });
            break;
          case "deleteStaticIp":
            param.uuidList.forEach(uuid => {
              let ip = _.cloneDeep(this.dbData.ip[uuid]);
              let self = this;
              let event = self.createEvent(
                "vm.action.deleteSaticIP",
                self.dbData.vm[this.windowData.dataUuid].name
              );
              rpc
                ._delete(
                  `vm-instances/${this.windowData.dataUuid}/static-ips`,
                  {
                    l3NetworkUuid: ip.l3NetworkUuid,
                    deleteMode: "Permissive"
                  },
                  event
                )
                .then(
                  () => {
                    self.incEventSuccess(event);
                    ip.isStatic = false;
                    self.init();
                  },
                  () => {
                    self.incEventFail(event);
                  }
                );
            });
            break;
        }
      }
      self.showDetachNicDlg = false;
    },
    //设置静态ip回调
    closeEditDlg(param) {
      let self = this;
      if (param) {
        self.editIp(param);
      }
      self.showEditIPDlg = false;
    },
    editIp(param) {
      let self = this;
      if (!this.isSelected) return;
      let ip = _.cloneDeep(this.dbData.vmNicRefs[this.selectedList[0]]);
      let event = self.createEvent(
        "vm.action.setIP",
        self.dbData.vm[this.windowData.dataUuid].name
      );
      rpc
        .put(
          `vm-instances/${this.windowData.dataUuid}/actions`,
          {
            setVmStaticIp: {
              l3NetworkUuid: ip.l3NetworkUuid,
              ip: param.newValue
            }
          },
          event
        )
        .then(
          resp => {
            self.incEventSuccess(event);
            ip.ip = param.newValue;
            ip.isStatic = true;
            self.init();
            self.param.refresh();
          },
          () => {
            self.incEventFail(event);
          }
        );
    },
    //设置qos回调
    closeNicQosDlg(param) {
      let self = this;
      if (param) {
        self.nicQos(param.msg, param.uuidList[0]);
      }
      self.showNicQosDlg = false;
    },
    nicQos(vmNic, uuid) {
      let self = this;
      let event = self.createEvent(
        "vm.action.setNicQos",
        self.dbData.vm[this.windowData.dataUuid].name
      );
      rpc
        .put(
          `vm-instances/${uuid}/actions`,
          {
            setNicQos: vmNic
          },
          event
        )
        .then(
          resp => {
            self.incEventSuccess(event);
            vmNic.uuid = uuid;
            this.updateDbRow({
              tableName: "vmNicRefs",
              id: uuid,
              data: vmNic
            });
          },
          () => {
            self.incEventFail(event);
          }
        );
    },
    inStates(states) {
      return Controller.inStates(states, this);
    },
    canAttach() {
      return this.inStates(["Stopped", "Running"]) && !this.isSelected;
    },
    canSetStaticIP: function() {
      if (this.isSingleSelectedIP()) {
        let uuid = this.windowData.uuidList.filter(
          uuid => this.windowData.table[uuid].selected
        )[0];
        if (
          this.dbData.l3network[this.dbData.ip[uuid].l3NetworkUuid]
            .ipVersion === 4
        )
          return true;
        return this.dbData.l3network[
          this.dbData.ip[uuid].l3NetworkUuid
        ].ipRanges.some(item => item.addressMode === "Stateful-DHCP");
      } else return false;
    },
    isSelectedIP: function() {
      if (!this.windowData.uuidList || this.windowData.uuidList.length === 0)
        return false;
      let selectedList = this.windowData.uuidList.filter(
        uuid =>
          this.windowData.table[uuid].selected && !this.dbData.vmNicRefs[uuid]
      );
      return selectedList.length > 0;
    },
    isSingleSelectedIP: function() {
      if (!this.windowData.uuidList || this.windowData.uuidList.length === 0)
        return false;
      let selectedList = this.windowData.uuidList.filter(
        uuid => this.windowData.table[uuid].selected
      );
      return (
        selectedList.length === 1 && !this.dbData.vmNicRefs[selectedList[0]]
      );
    },
    isSingleSelectedVMNic: function() {
      if (!this.windowData.uuidList || this.windowData.uuidList.length === 0)
        return false;
      let selectedList = this.windowData.uuidList.filter(
        uuid => this.windowData.table[uuid].selected
      );
      return selectedList.length === 1 && !this.dbData.ip[selectedList[0]];
    },
    isOnlySelectedVMNic: function() {
      if (!this.windowData.uuidList || this.windowData.uuidList.length === 0)
        return false;
      let selectedList = this.windowData.uuidList.filter(
        uuid => this.windowData.table[uuid].selected && !this.dbData.ip[uuid]
      );
      return selectedList.length > 0;
    },
    canDeleteNicQoS() {
      if (!this.isSingleSelectedVMNic()) return false;
      let selectedList = this.selectedList;
      if (!selectedList.length) return false;
      let vmNicRefs = _.cloneDeep(this.dbData.vmNicRefs);
      let isSet = selectedList.some(
        uuid =>
          vmNicRefs[uuid].inboundBandwidth !== -1 ||
          vmNicRefs[uuid].outboundBandwidth !== -1
      );
      let hasThreshold = selectedList.some(
        uuid =>
          vmNicRefs[uuid].inboundBandwidthUpthreshold !== -1 ||
          vmNicRefs[uuid].outboundBandwidthUpthreshold !== -1
      );
      let canNot = !this.dbData.common.isAdmin && hasThreshold;
      return isSet && !canNot;
    },
    canSetVmNicMAC() {
      return Controller.canSetVmNicMAC(this);
    },
    isStaticIp: function() {
      if (this.selectedList.length <= 0) return false;
      let ip = _.cloneDeep(this.dbData.ip);
      let flag = true;
      for (let i = 0; i < this.selectedList.length; ++i) {
        if (
          ip[this.selectedList[i]] &&
          (ip[this.selectedList[i]].isStatic === undefined ||
            ip[this.selectedList[i]].isStatic === false)
        ) {
          flag = false;
          return flag;
        }
      }
      return flag;
    },
    //设置默认网卡
      setDefaultNetwork ($event, uuid) {
      let self = this;
       let vmNicRefs = _.cloneDeep(self.dbData.vmNicRefs[uuid])
      self.openDialog('ConfirmDlg', {
       title: 'vm.setDefaultNetwork',
       description: 'vm.setDefaultL3Network',
       warning: 'account.accountWarning',
       name: vmNicRefs.internalName,
       ok: () => {
          let event = self.createEvent('vm.action.setDefaultNic', self.dbData.vm[this.windowData.dataUuid].name)
            let uuid = self.windowData.dataUuid
            rpc.update('vm-instances', `${uuid}`, {
              updateVmInstance: {
                'defaultL3NetworkUuid': vmNicRefs.l3NetworkUuid
              }
            }, event)
              .then(resp => {
                self.incEventSuccess(event)
                let data = _.cloneDeep(self.dbData.vm[uuid])
                data.defaultL3NetworkUuid = vmNicRefs.l3NetworkUuid
                self.updateDbRow({
                  tableName: 'vm',
                  id: uuid,
                  data: data
                })
              }, () => {
                self.incEventFail(event)
              })
       }
      })
    },
     //跳转到详情页
      goToDetail(uuid) {
        let self = this, router = 'detailPublicNetwork';
        switch(self.dbData.l3network[uuid].category) {
          case 'Public':
            router = 'detailPublicNetwork';
            break;
          case 'System':
            router = 'detailSystemNetwork';
            break;
          case 'Private':
            router = 'detailPrivateNetwork';
            break;
          default:
            router = 'detailPublicNetwork';
        }
        self.$router.push({name:router, params: {uuid}})
      },
  },
  filters: {
    bytesToSize(value, unit, width) {
      if (typeof value !== "number" || isNaN(value)) bytes = 0;
      if (value < 0) bytes = 0;
      if (typeof width === "undefined") width = 2;
      if (typeof unit === "undefined") unit = "B";
      var num = Math.pow(10, width);
      var sizes = ["K", "M", "G", "T", "P"];
      if (unit) {
        sizes.unshift("");
      } else {
        sizes.unshift("Byte");
      }
      if (value === 0) return "0 " + sizes[0] + unit;
      var i = Math.floor(Math.log(value) / Math.log(1024));
      // for 0.xxxx number
      if (i < 0) i = 0;
      if (sizes[i] === "B") num = 1;
      if (i >= 5) i = 5;
      return (
        Math.round((value / Math.pow(1024, i)) * num) / num +
        " " +
        sizes[i] +
        unit
      );
    }
  },
  watch: {
    "param.uuid": function(newVal, oldVal) {
      let self = this;
      if (newVal !== oldVal) {
        self
          .updateWindow({
            dataUuid: self.param.uuid
          })
          .then(() => {
            self.init();
          });
      }
    },
    "param.addNicMessage": function(newVal, oldVal) {
      let self = this;
      if (newVal !== oldVal) {
        self.createVmNic(newVal, self.windowData.dataUuid).then(() => {
          self.param.refresh();
          self.init();
        });
      }
    }
  }
};
</script>

<style scoped lang="less">
.expand-container {
  display: inline-block;
  width: 50px;
  line-height: 50px;
}
.list {
  width: 100%;
  height: auto;
  .row-title,
  .row {
    border-bottom: 1px solid #ebeef5;
    line-height: 50px;
    height: 59px;
    .row-item {
      display: inline-block;
      width: calc((100% - 140px) / 8);
      height: 35px;
      line-height: 54px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      img {
        vertical-align: middle;
      }
    }
  }
  .checkbox-container {
    width: 50px;
    line-height: 50px;
    display: inline-block;
    label {
      display: inline-block;
      line-height: 50px;
    }
  }
}
.icon-no-expand {
  transform: rotate(0deg);
  transition: 0.5s transform;
}
.icon-expand {
  transform: rotate(90deg);
  transition: 0.5s transform;
}
.checkbox {
  display: inline-block;
  line-height: 43px;
  height: 50px;
  vertical-align: middle;
}
.row-title {
  background-color: #e1e4e5;
}

  .row-empty{
    text-align: center;
    border-bottom: 1px solid #ebeef5;
    width: 100%;
  }
</style>
