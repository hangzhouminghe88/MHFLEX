<template>
  <el-scrollbar style="height:100%;" wrapStyle="overflow-x': hidden" :vertical="true">
    <el-row :span="24" :class="prefixCls">
      <project-admin-page v-if="isProjectAdmin"></project-admin-page>
      <project-user-page v-if="isProjectUser"></project-user-page>
      <el-row
        v-if="!isProjectAdmin && !isProjectUser"
        :class="`${prefixCls}-container`"
        @scroll="onScroll"
      >
        <div class="tab-container">
          <span class="tab-content">
            <el-tabs :class="`${prefixCls}-tab`" @tab-click="changeZone">
              <el-tab-pane :label="$t('home.currentZone')"></el-tab-pane>
              <el-tab-pane :label="$t('home.allZone')"></el-tab-pane>
            </el-tabs>
          </span>
          <span class="tab-toggletime">
            <el-select v-model="selectTime">
              <el-option
                v-for="(time, index) in timeIntervalList"
                @click.native="changeInterval(time)"
                :label="$t(`common.${time.name}`)"
                :key="index"
                :value="$t(`common.${time.name}`)"
              ></el-option>
            </el-select>
          </span>
        </div>
        <el-row v-if="isAdmin" :span="24" :class="`${prefixCls}-admin`">
          <el-row :class="`${prefixCls}-admin-top`">
            <el-col :span="6">
              <line-metric
                class="metirc-data-item"
                :param="{data: cpuAllUsed}"
                style="flex: 7 7 auto; margin-left: 0;"
              ></line-metric>
            </el-col>
            <el-col :span="6">
              <line-metric class="metirc-data-item" :param="{data: memoryUsedBytes}"></line-metric>
            </el-col>
            <el-col :span="6">
              <line-metric class="metirc-data-item" :param="{data: networktBytes}"></line-metric>
            </el-col>
            <el-col :span="6">
              <line-metric class="metirc-data-item" :param="{data: diskValue}"></line-metric>
            </el-col>
          </el-row>
          <el-row :class="`${prefixCls}-admin-bottom`">
            <el-col :span="6" :class="`${prefixCls}-admin-bottom-left`">
              <el-col :class="`${prefixCls}-admin-bottom-left-item`">
                <bar-ratio :param="{data: vm}"></bar-ratio>
              </el-col>
              <el-col :class="`${prefixCls}-admin-bottom-left-item`">
                <bar-ratio :param="{data: host}"></bar-ratio>
              </el-col>
              <el-col :class="`${prefixCls}-admin-bottom-left-item`">
                <bar-ratio-list class="bar-ratio-list-top" :param="{data: compute}"></bar-ratio-list>
              </el-col>
              <el-col :class="`${prefixCls}-admin-bottom-left-item`">
                <bar-ratio-list class="bar-ratio-list-bottom" :param="{data: storage}"></bar-ratio-list>
              </el-col>
            </el-col>
            <el-col :span="12" :class="`${prefixCls}-admin-bottom-center`">
              <el-row class="item">
                <el-col :span="12" class="content">
                  <circle-ratio :param="{data: cpuCapacity}"></circle-ratio>
                </el-col>
                <el-col :span="12" class="content">
                  <circle-ratio :param="{data: memoryCapacity}"></circle-ratio>
                </el-col>
              </el-row>
              <el-row class="item">
                <el-col :span="12" class="content">
                  <circle-ratio-for-net-work class="circle-ratio" :param="{data: publicIpCapacity}"></circle-ratio-for-net-work>
                </el-col>
                <el-col :span="12" class="content">
                  <circle-ratio-for-net-work
                    class="circle-ratio"
                    :param="{data: privateIpCapacity}"
                  ></circle-ratio-for-net-work>
                </el-col>
              </el-row>
              <el-row class="item-last">
                <bar-ratio-list class="bar-ratio-list" :param="{data: networks}"></bar-ratio-list>
              </el-row>
            </el-col>
            <el-col :span="5" :class="`${prefixCls}-admin-bottom-right`">
              <el-row class="item">
                <circle-ratio class="circle-ratio" :param="{data: primaryStorage}"></circle-ratio>
              </el-row>
              <el-row class="item">
                <circle-ratio class="circle-ratio" :param="{data: backupStorage}"></circle-ratio>
              </el-row>
              <el-row class="item-last">
                <bar-ratio-list class="bar-ratio-list" :param="{data: platform}"></bar-ratio-list>
              </el-row>
            </el-col>
          </el-row>
        </el-row>
        <el-row v-if="!isAdmin && !isProjectAdmin && !isProjectUser" :span="24">
          <el-row :class="`${prefixCls}-admin`">
            <el-col :span="6" :class="`${prefixCls}-admin-bottom-left`">
              <el-col :class="`${prefixCls}-admin-bottom-left-item`">
                <system-time class="system-time" :param="{ data: time }"></system-time>
              </el-col>
              <el-col :class="`${prefixCls}-admin-bottom-left-item`">
                <vm-line-list class="bar-ratio" :param="{data: vm}"></vm-line-list>
              </el-col>
              <el-col :class="`${prefixCls}-admin-bottom-left-item`">
                <bar-ratio-list-account class="bar-ratio-list" :param="{data: storage}"></bar-ratio-list-account>
              </el-col>
            </el-col>
            <el-col :span="12" :class="`${prefixCls}-admin-bottom-center`">
              <el-row class="item">
                <el-col :span="12" class="content">
                  <circle-ratio class="circle-ratio" :param="{data: cpuCapacity}"></circle-ratio>
                </el-col>
                <el-col :span="12" class="content">
                  <circle-ratio class="circle-ratio" :param="{data: memoryCapacity}"></circle-ratio>
                </el-col>
              </el-row>
              <el-row class="item">
                <el-col :span="12" class="content">
                  <circle-ratio-for-net-work class="circle-ratio" :param="{data: publicIpCapacity}"></circle-ratio-for-net-work>
                </el-col>
                <el-col :span="12" class="content">
                  <circle-ratio-for-net-work
                    class="circle-ratio"
                    :param="{data: privateIpCapacity}"
                  ></circle-ratio-for-net-work>
                </el-col>
              </el-row>
              <el-row class="item-last">
                <bar-ratio-list-account class="bar-ratio-list" :param="{data: networks}"></bar-ratio-list-account>
              </el-row>
            </el-col>
            <el-col :span="5" :class="`${prefixCls}-admin-bottom-right`">
              <el-row class="item">
                <circle-ratio class="circle-ratio" :param="{data: volumeCapacity}"></circle-ratio>
              </el-row>
              <el-row class="item">
                <circle-ratio class="circle-ratio" :param="{data: imageSize}"></circle-ratio>
              </el-row>
              <el-row class="item-last">
                <bar-ratio-list-account class="bar-ratio-list" :param="{data: platform}"></bar-ratio-list-account>
              </el-row>
            </el-col>
          </el-row>
        </el-row>
      </el-row>
    </el-row>
  </el-scrollbar>
</template>

<script>
import ProjectAdminPage from "./component/ProjectAdminPage";
import LineMetric from "src/component/metric/LineMetric";
import BarRatio from "src/component/metric/BarRatio";
import BarRatioList from "src/component/metric/BarRatioList";
import CircleRatio from "src/component/metric/CircleRatio";
import CircleRatioForNetWork from "src/component/metric/CircleRatioForNetWork";
import SystemTime from "src/component/metric/SystemTime";
import BarRatioListAccount from "src/component/metric/BarRatioListAccount";
import ProjectUserPage from "src/ecs/home/component/ProjectUserPage";
import VmLineList from "src/component/metric/VmLineList";
import ScrollBar from "src/component/scoller/ScrollBar";
import WindowBase from "src/windows/Window";
import rpc from "src/utils/rpc";
import Utils from "src/utils/utils";
import Root from "src/windows/Root";
const prefixCls = "home_wrapper";

let hidden, visibilityChange, canUseHideen;
if (typeof document.hidden !== "undefined") {
  hidden = "hidden";
  visibilityChange = "visibilitychange";
  canUseHideen = true;
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
  canUseHideen = true;
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
  canUseHideen = true;
} else {
  canUseHideen = false;
}
export default {
  name: "Home",
  mixins: [Root, WindowBase, ScrollBar],
  components: {
    ProjectAdminPage,
    LineMetric,
    BarRatio,
    BarRatioList,
    CircleRatio,
    CircleRatioForNetWork,
    SystemTime,
    BarRatioListAccount,
    VmLineList,
    ProjectUserPage
  },
  data() {
    return {
      prefixCls: prefixCls,
      zWatchSystemAlarmUuidList: [],
      isHide: false,
      allZone: false,
      isAdmin: false,
      isProjectAdmin: false,
      isProjectUser: false,
      zoneNumber: null,
      clusterNumber: null,
      volumeNumber: null,
      snapshotNumber: null,
      imageNumber: null,
      psNumber: null,
      hostNumber: null,
      vmNumber: null,
      bsNumber: null,
      sgNumber: null,
      l2Number: null,
      l3Number: null,
      cpu: {},
      memory: {},
      ps: {},
      psPhysical: {},
      bs: {},
      ipAddressPublice: {},
      ipAddressPrivate: {},
      projectBilling: {},
      normal: {},
      identityName: "",
      bigDonutFontSizeBig: 0,
      bigDonutFontSizeSmall: 0,
      smallDonutFontSizeBig: 0,
      smallDonutFontSizeSmall: 0,
      resourceCountFontSize: 0,
      currTime: 0,
      currTimeInterval: null,
      currQueryInterval: null,
      time: "",
      host: {
        title: "host"
      },
      vm: {
        title: "vm"
      },
      compute: {
        title: "compute"
      },
      storage: {
        title: "storage"
      },
      platform: {
        title: "platform"
      },
      networks: {
        title: "network"
      },
      primaryStorage: {
        title: "primaryStorage"
      },
      backupStorage: {
        title: "backupStorage"
      },
      cpuCapacity: {
        title: "cpu"
      },
      memoryCapacity: {
        title: "memory"
      },
      publicIpCapacity: {
        title: "publicIpCapacity"
      },
      privateIpCapacity: {
        title: "privateIpCapacity"
      },
      projectAdmin: {
        title: "projectUpdate",
        role: "project-admin",
        name: "lala",
        member: "55",
        projectCycle: "2014-1-1"
      },
      isOpensource: false,
      chartColor: {
        line: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "#1AA6FF"
            },
            {
              offset: 1,
              color: "#007FDF"
            }
          ],
          globalCoord: false
        },
        start: "rgba(0, 127, 223 , 0.1)",
        end: "rgba(0, 127, 223 , 0)"
      },
      chartColorDouble: {
        line: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "#52C4FF"
            },
            {
              offset: 1,
              color: "#4BE9F9"
            }
          ],
          globalCoord: false
        },
        start: "rgba(75, 233, 249, 0.1)",
        end: "rgba(75, 233, 249, 0)"
      },
      cpuAllUsed: {
        title: "cpuAllUsed"
      },
      memoryUsedBytes: {
        title: "memoryUsedBytes"
      },
      networktBytes: {
        title: "networkAllBytes"
      },
      diskValue: {
        title: "diskAllOps"
      },
      usages: {},
      volumeCapacity: {},
      imageSize: {},
      isUser: false,
      timeIntervalList: [
        {
          name: "5m",
          index: 0,
          value: 60 * 5,
          period: 5
        },
        {
          name: "1h",
          index: 1,
          value: 60 * 60,
          period: 5 * 12
        },
        {
          name: "1d",
          index: 2,
          value: 24 * 60 * 60,
          period: 5 * 12 * 24
        },
        {
          name: "1w",
          index: 3,
          value: 7 * 24 * 60 * 60,
          period: 5 * 12 * 24 * 7
        },
        {
          name: "1moon",
          index: 4,
          value: 30 * 24 * 60 * 60,
          period: 5 * 12 * 24 * 30
        },
        {
          name: "1y",
          index: 5,
          value: 365 * 24 * 60 * 60,
          period: 5 * 12 * 24 * 365
        }
      ],
      intervalIndex: 0,
      selectTime: this.$t("common.5m")
    };
  },
  created() {
    let self = this;
    self.scrollContainerSelector = ".home_wrapper";
    self.scrollElementSelector = ".home_wrapper_container";
  },
  mounted() {
    let self = this;
    self.updateWindow({
      methods: {
        queryList: self.queryList
      }
    });
    self.currentZone = localStorage.getItem("currZoneUuid");
    self.isAdmin = localStorage.getItem("isAdmin");
    let mainPageWindowId;
    Object.keys(self.$store.state.windowManager.windows).map(id => {
      if (id.indexOf("MainPage-") > -1) {
        mainPageWindowId = id;
      }
    });
    if (canUseHideen)
      document.addEventListener(
        "visibilitychange",
        self.handleVisibilityChange
      );
    this._updateWindow({
      id: mainPageWindowId,
      currPageWindowId: this.windowId
    });
    self.getUserPromiss();
    if (!this.currentZone || !this.dbData.zone[this.currentZone]) {
      this.getCurrentZone()
        .then(() => {
          return this.getCurrentTime();
        })
        .then(() => self.queryList());
    } else {
      this.getCurrentTime().then(() => {
        self.queryList();
      });
    }
    if (localStorage.getItem("loginType") === "account") {
      self.identityName = localStorage.getItem("accountName");
    } else if (localStorage.getItem("loginType") === "user") {
      self.identityName = localStorage.getItem("userName");
      self.isUser = true;
    } else if (localStorage.getItem("loginType") === "ldap") {
      self.identityName = localStorage.getItem("uidName");
    }
    if (
      _.isNull(this.currQueryInterval) &&
      localStorage.getItem("isAdmin") === "true" &&
      !self.isProjectAdmin &&
      !self.isProjectUser
    ) {
      this.initcurrQueryInterval();
    }
  },
  destroyed() {
    let self = this;
    if (canUseHideen)
      document.removeEventListener(
        visibilityChange,
        self.handleVisibilityChange
      );
    if (self.currQueryInterval !== null) {
      clearInterval(self.currQueryInterval);
      self.currQueryInterval = null;
    }
    if (self.currentTimeInterval !== null) {
      clearInterval(self.currentTimeInterval);
      self.currentTimeInterval = null;
    }
  },
  methods: {
    handleVisibilityChange() {
      let self = this;
      if (!self.pageIsHideden()) self.queryList();
    },

    pageIsHideden() {
      if (!canUseHideen) return false;
      try {
        return document[hidden];
      } catch (e) {
        return false;
      }
    },

    getUserPromiss() {
      //获得用户使用权限
      let self = this;
      self.isAdmin = localStorage.getItem("isAdmin") === "true";
      self.currentZone = localStorage.getItem("currZoneUuid");
      if (
        (localStorage.getItem("userRole") === "projectAdmin" ||
          localStorage.getItem("userRole") === "projectOperator") &&
        localStorage.getItem("isProjectLogin") === "true"
      )
        self.isProjectAdmin = true;
      else self.isProjectAdmin = false;

      if (
        localStorage.getItem("userRole") === "normal" &&
        localStorage.getItem("isProjectLogin") === "true"
      )
        self.isProjectUser = true;
      else self.isProjectUser = false;
      if (localStorage.getItem("loginType") === "account") {
        self.identityName = localStorage.getItem("accountName");
      } else if (localStorage.getItem("loginType") === "user") {
        self.identityName = localStorage.getItem("userName");
        self.isUser = true;
      } else if (localStorage.getItem("loginType") === "ldap") {
        self.identityName = localStorage.getItem("uidName");
      }
      self.currentZone = localStorage.getItem("currZoneUuid");
    },

    queryList() {
      let self = this;
      if (self.pageIsHideden()) return;
      self.zWatchSystemAlarmUuidList = this.getZWatchSystemAlarmUuidList();
      self.getUserPromiss();
      if (!this.currentZone || !this.dbData.zone[this.currentZone])
        this.getCurrentZone();
      rpc
        .query("licenses")
        .then(licenseResp => {
          return rpc.query("meta-data/opensource").then(opensourceResp => {
            if (
              opensourceResp.opensource ||
              licenseResp.inventory.licenseType === "Community"
            ) {
              self.isOpensource = true;
            }
          });
        })
        .then(() => {
          if (self.dbData.common.isAdmin) self.queryAdmin();
          else self.queryNormal();
        });
    },
    queryAdmin: function() {
      this.queryMetricData();
      let self = this;
      let script = `
        def tmp = query("QueryZone count=true replyWithCount=true fields=uuid")
        def tmpEnable = query("QueryZone replyWithCount=true state=Enabled")
        put("zone", ["total": tmp.total, "enable": tmpEnable.total])`;
      if (this.allZone) {
        script += `
          tmp = query("QueryCluster hypervisorType!=ESX replyWithCount=true fields=uuid")
          tmpEnable = query("QueryCluster hypervisorType!=ESX count=true state=Enabled")
          put("cluster", ["total": tmp.total, "enable": tmpEnable.total])

          def clusterUuidList = tmp.result.collect { it.uuid }

          tmp = query("QueryBackupStorage type!=VCenter fields=uuid")

          def backupStorageUuidList = tmp.result.collect { it.uuid }
          put("backupStorageUuidList", backupStorageUuidList)

          tmp = query("QueryVolume format!=vmtx count=true status!=Deleted type=Data status!=NotInstantiated")
          tmpEnable = query("QueryVolume format!=vmtx count=true state=Enabled status!=Deleted type=Data status!=NotInstantiated")
          put("volume", ["total": tmp.total, "enable": tmpEnable.total])

          tmp = query("QueryImage format!=vmtx count=true status!=Deleted system!=true __systemTag__!=remote")
          tmpEnable = query("QueryImage format!=vmtx count=true state=Enabled status!=Deleted system!=true __systemTag__!=remote")
          put("image", ["total": tmp.total, "enable": tmpEnable.total])

          tmp = query("QueryVolumeSnapshot volumeType=Data volume.status!=Deleted count=true")
          put("volumeSnapshot", ["total": tmp.total])

          tmp = query("QueryVolumeSnapshot volumeType=Root volume.status!=Deleted count=true")
          put("vmSnapshot", ["total": tmp.total])

          tmp = query("QueryL3Network l2Network.cluster.type=vmware replyWithCount=true fields=uuid")
          def vCenterNetworkUuidList = tmp.result.collect { it.uuid }

          if (vCenterNetworkUuidList.size() > 0) {
            tmp = query("QueryL3Network system=true count=true category=System uuid!?=" + vCenterNetworkUuidList.join(","))
          } else {
            tmp = query("QueryL3Network system=true count=true category=System")
          }
          put("l3SystemNetwork", ["total": tmp.total])

          def ipv4PublicNetwork
          def ipv6PublicNetwork
          if (vCenterNetworkUuidList.size() > 0) {
            tmp = query("QueryL3Network system=false category=Public replyWithCount=true uuid!?=" + vCenterNetworkUuidList.join(","))
            ipv4PublicNetwork = query("QueryL3Network system=false ipVersion=4 category=Public replyWithCount=true uuid!?=" + vCenterNetworkUuidList.join(","))
            ipv6PublicNetwork = query("QueryL3Network system=false ipVersion=6 category=Public replyWithCount=true uuid!?=" + vCenterNetworkUuidList.join(","))
          } else {
            tmp = query("QueryL3Network system=false category=Public")
            ipv4PublicNetwork = query("QueryL3Network system=false ipVersion=4 category=Public replyWithCount=true")
            ipv6PublicNetwork = query("QueryL3Network system=false ipVersion=6 category=Public replyWithCount=true")
          }
          put("l3PublicNetwork", ["total": tmp.total])

          def ipv4PublicUuidList = ipv4PublicNetwork.result.collect { it.uuid }
          if (ipv4PublicUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv4PublicUuidList.join('","') + '"]}')
            put("ipv4PublicIpCapacity", tmp)
          } else {
            put("ipv4PublicIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0, "usedIpAddressNumber": 0]])
          }

          def ipv6PublicUuidList = ipv6PublicNetwork.result.collect { it.uuid }
          if (ipv6PublicUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv6PublicUuidList.join('","') + '"]}')
            put("ipv6PublicIpCapacity", tmp)
          } else {
            put("ipv6PublicIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0]])
          }

          def ipv4PrivateNetwork
          def ipv6PrivateNetwork
          if (vCenterNetworkUuidList.size() > 0) {
            tmp = query("QueryL3Network system=false category=Private replyWithCount=true type!=L3VpcNetwork fields=uuid uuid!?=" + vCenterNetworkUuidList.join(","))
            ipv4PrivateNetwork = query("QueryL3Network system=false category=Private replyWithCount=true type!=L3VpcNetwork ipVersion=4 fields=uuid uuid!?=" + vCenterNetworkUuidList.join(","))
            ipv6PrivateNetwork = query("QueryL3Network system=false category=Private replyWithCount=true type!=L3VpcNetwork ipVersion=6 fields=uuid uuid!?=" + vCenterNetworkUuidList.join(","))
          } else {
            tmp = query("QueryL3Network system=false category=Private replyWithCount=true type!=L3VpcNetwork fields=uuid")
            ipv4PrivateNetwork = query("QueryL3Network system=false category=Private replyWithCount=true ipVersion=4 type!=L3VpcNetwork fields=uuid")
            ipv6PrivateNetwork = query("QueryL3Network system=false category=Private replyWithCount=true ipVersion=6 type!=L3VpcNetwork fields=uuid")
          }
          put("l3PrivateNetwork", ["total": tmp.total])

          def ipv4PrivateUuidList = ipv4PrivateNetwork.result.collect { it.uuid }
          if (ipv4PrivateUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv4PrivateUuidList.join('","') + '"]}')
            put("ipv4PrivateIpCapacity", tmp)
          } else {
            put("ipv4PrivateIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0]])
          }

          def ipv6PrivateUuidList = ipv6PrivateNetwork.result.collect { it.uuid }
          if (ipv6PrivateUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv6PrivateUuidList.join('","') + '"]}')
            put("ipv6PrivateIpCapacity", tmp)
          } else {
            put("ipv6PrivateIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0]])
          }

          tmp = query("QueryVirtualRouterVm applianceVmType?=vrouter,VirtualRouter count=true")
          tmpEnable = query("QueryVirtualRouterVm applianceVmType?=vrouter,VirtualRouter count=true status=Connected state=Running")
          put("virtualRouterVm", ["total": tmp.total, "enable": tmpEnable.total])

          tmp = query("QuerySecurityGroup count=true")
          put("securityGroup", ["total": tmp.total])

          tmp = query("QueryVip count=true")
          def tmpSNAT = zql("count vip where useFor like 'SNAT%'")

          put("vip", ["SNAT": tmpSNAT[0], "total": tmp])

          tmp = query("QueryEip count=true")
          put("eip", ["total": tmp.total])

          tmp = query("QueryPortForwardingRule count=true")
          put("portFrowarding", ["total": tmp.total])

          tmp = query("QueryLoadBalancer count=true")
          put("loadBalancer", ["total": tmp.total])

          if (clusterUuidList.size() > 0) {
            tmp = call("org.zstack.header.allocator.APIGetCpuMemoryCapacityMsg", '{"clusterUuids": ["' + clusterUuidList.join('","') + '"]}')
            put("cpuMemoryCapacity", tmp)
            tmp = call("org.zstack.header.storage.primary.APIGetPrimaryStorageCapacityMsg", '{"clusterUuids": ["' + clusterUuidList.join('","') + '"]}')
            put("primaryStorageCapacity", tmp)
          } else {
            put("cpuMemoryCapacity", ["result": ["availableCpu": 0, "availableMemory": 0, "totalCpu": 0, "totalMemory": 0]])
            put("primaryStorageCapacity", ["result": ["availableCapacity": 0, "availablePhysicalCapacity": 0, "totalCapacity": 0, "totalPhysicalCapacity": 0]])
          }

          if (backupStorageUuidList.size() > 0) {
            tmp = call("org.zstack.header.storage.backup.APIGetBackupStorageCapacityMsg", '{"backupStorageUuids": ["' + backupStorageUuidList.join('","') + '"]}')
            put("backupStorageCapacity", tmp)
          } else {
            put("backupStorageCapacity", ["result": ["availableCapacity": 0, "totalCapacity": 0]])
          }

          def vm = [:]
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state!=Destroyed")
          vm.total = tmp.total
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state=Running")
          vm.running = tmp.total
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state=Stopped")
          vm.stopped = tmp.total
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state!=Stopped state!=Running  state!=Destroyed")
          vm.unknown = tmp.total
          put("vm", vm)

          def host = [:]
          tmp = query("QueryHost hypervisorType=KVM count=true")
          host.total = tmp.total
          tmp = query("QueryHost status=Connected hypervisorType=KVM count=true")
          host.connected = tmp.total
          tmp = query("QueryHost status=Disconnected hypervisorType=KVM count=true")
          host.disconnected = tmp.total
          tmp = query("QueryHost status!=Connected status!=Disconnected hypervisorType=KVM count=true")
          host.unknown = tmp.total
          tmp = query("QueryHost status=Connected state=Enabled hypervisorType=KVM count=true")
          host.enablednum = tmp.total
          put("host", host)


          tmp = query("QueryGlobalConfig category=host name=cpu.overProvisioning.ratio")
          put("cpuOverProvision", tmp)

          tmp = query("QueryGlobalConfig name=reservedMemory")
          put("reservedMemory", tmp)

          tmp = query("QueryGlobalConfig category=mevoco name=overProvisioning.memory")
          put("memoryOverProvision", tmp)

          tmp = query("QueryGlobalConfig category=mevoco name=overProvisioning.primaryStorage")
          put("primaryStorageOverProvision", tmp)
        `;
      } else {
        script += `
          tmp = query("QueryCluster hypervisorType!=ESX replyWithCount=true fields=uuid zoneUuid=${this.currentZone}")
          tmpEnable = query("QueryCluster hypervisorType!=ESX count=true zoneUuid=${this.currentZone} state=Enabled")
          put("cluster", ["total": tmp.total, "enable": tmpEnable.total])

          def clusterUuidList = tmp.result.collect { it.uuid }

          tmp = query("QueryBackupStorage type!=VCenter fields=uuid zone.uuid=${this.currentZone}")

          def backupStorageUuidList = tmp.result.collect { it.uuid }
          put("backupStorageUuidList", backupStorageUuidList)

          tmp = query("QueryVolume format!=vmtx count=true status!=Deleted primaryStorage.zoneUuid=${this.currentZone} type=Data status!=NotInstantiated")
          tmpEnable = query("QueryVolume format!=vmtx count=true primaryStorage.zoneUuid=${this.currentZone} state=Enabled status!=Deleted type=Data status!=NotInstantiated")
          put("volume", ["total": tmp.total, "enable": tmpEnable.total])

          tmp = query("QueryImage format!=vmtx status!=Deleted count=true backupStorage.zone.uuid=${this.currentZone} system!=true __systemTag__!=remote")
          tmpEnable = query("QueryImage format!=vmtx count=true backupStorage.zone.uuid=${this.currentZone} state=Enabled status!=Deleted system!=true __systemTag__!=remote")
          put("image", ["total": tmp.total, "enable": tmpEnable.total])

          tmp = query("QueryVolumeSnapshot count=true volumeType=Data volume.status!=Deleted primaryStorage.zoneUuid=${this.currentZone}")
          put("volumeSnapshot", ["total": tmp.total])

          tmp = query("QueryVolumeSnapshot volumeType=Root volume.status!=Deleted count=true primaryStorage.zoneUuid=${this.currentZone}")
          put("vmSnapshot", ["total": tmp.total])

          tmp = query("QueryL3Network l2Network.cluster.type=vmware replyWithCount=true fields=uuid")
          def vCenterNetworkUuidList = tmp.result.collect { it.uuid }

          if (vCenterNetworkUuidList.size() > 0) {
            tmp = query("QueryL3Network system=true count=true zoneUuid=${this.currentZone} uuid!?=" + vCenterNetworkUuidList.join(","))
          } else {
            tmp = query("QueryL3Network system=true count=true zoneUuid=${this.currentZone}")
          }
          put("l3SystemNetwork", ["total": tmp.total])

          def ipv4PublicNetwork
          def ipv6PublicNetwork
          if (vCenterNetworkUuidList.size() > 0) {
            tmp = query("QueryL3Network system=false category=Public replyWithCount=true zoneUuid=${this.currentZone} uuid!?=" + vCenterNetworkUuidList.join(","))
            ipv4PublicNetwork = query("QueryL3Network system=false ipVersion=4 category=Public replyWithCount=true zoneUuid=${this.currentZone} uuid!?=" + vCenterNetworkUuidList.join(","))
            ipv6PublicNetwork = query("QueryL3Network system=false ipVersion=6 category=Public replyWithCount=true zoneUuid=${this.currentZone} uuid!?=" + vCenterNetworkUuidList.join(","))
          } else {
            tmp = query("QueryL3Network system=false category=Public replyWithCount=true zoneUuid=${this.currentZone}")
            ipv4PublicNetwork = query("QueryL3Network system=false ipVersion=4 category=Public replyWithCount=true zoneUuid=${this.currentZone}")
            ipv6PublicNetwork = query("QueryL3Network system=false ipVersion=6 category=Public replyWithCount=true zoneUuid=${this.currentZone}")
          }
          put("l3PublicNetwork", ["total": tmp.total])

          def ipv4PublicUuidList = ipv4PublicNetwork.result.collect { it.uuid }
          if (ipv4PublicUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv4PublicUuidList.join('","') + '"]}')
            put("ipv4PublicIpCapacity", tmp)
          } else {
            put("ipv4PublicIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0, "usedIpAddressNumber": 0]])
          }

          def ipv6PublicUuidList = ipv6PublicNetwork.result.collect { it.uuid }
          if (ipv6PublicUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv6PublicUuidList.join('","') + '"]}')
            put("ipv6PublicIpCapacity", tmp)
          } else {
            put("ipv6PublicIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0]])
          }

          def ipv4PrivateNetwork
          def ipv6PrivateNetwork
          if (vCenterNetworkUuidList.size() > 0) {
            tmp = query("QueryL3Network system=false category=Private replyWithCount=true type!=L3VpcNetwork zoneUuid=${this.currentZone} fields=uuid uuid!?=" + vCenterNetworkUuidList.join(","))
            ipv4PrivateNetwork = query("QueryL3Network ipVersion=4 system=false category=Private replyWithCount=true type!=L3VpcNetwork zoneUuid=${this.currentZone} fields=uuid uuid!?=" + vCenterNetworkUuidList.join(","))
            ipv6PrivateNetwork = query("QueryL3Network ipVersion=6 system=false category=Private replyWithCount=true type!=L3VpcNetwork zoneUuid=${this.currentZone} fields=uuid uuid!?=" + vCenterNetworkUuidList.join(","))
          } else {
            tmp = query("QueryL3Network system=false category=Private replyWithCount=true type!=L3VpcNetwork zoneUuid=${this.currentZone} fields=uuid")
            ipv4PrivateNetwork = query("QueryL3Network system=false ipVersion=4 category=Private replyWithCount=true type!=L3VpcNetwork zoneUuid=${this.currentZone} fields=uuid")
            ipv6PrivateNetwork = query("QueryL3Network system=false ipVersion=6 category=Private replyWithCount=true type!=L3VpcNetwork zoneUuid=${this.currentZone} fields=uuid")
          }
          put("l3PrivateNetwork", ["total": tmp.total])

          def ipv4PrivateUuidList = ipv4PrivateNetwork.result.collect { it.uuid }
          if (ipv4PrivateUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv4PrivateUuidList.join('","') + '"]}')
            put("ipv4PrivateIpCapacity", tmp)
          } else {
            put("ipv4PrivateIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0]])
          }

          def ipv6PrivateUuidList = ipv6PrivateNetwork.result.collect { it.uuid }
          if (ipv6PrivateUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv6PrivateUuidList.join('","') + '"]}')
            put("ipv6PrivateIpCapacity", tmp)
          } else {
            put("ipv6PrivateIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0]])
          }

          tmp = query("QueryVirtualRouterVm applianceVmType?=vrouter,VirtualRouter count=true zoneUuid=${this.currentZone}")
          tmpEnable = query("QueryVirtualRouterVm applianceVmType?=vrouter,VirtualRouter count=true zoneUuid=${this.currentZone} status=Connected state=Running")
          put("virtualRouterVm", ["total": tmp.total, "enable": tmpEnable.total])

          tmp = query("QuerySecurityGroup count=true")
          def tmpOther = query("QuerySecurityGroup count=true l3Network.zoneUuid!=${this.currentZone}")
          put("securityGroup", ["total": tmp.total - tmpOther.total])

          tmp = query("QueryVip count=true l3Network.zoneUuid=${this.currentZone}")
          def tmpSNAT = zql("count vip where useFor like 'SNAT%' and l3Network.zoneUuid='${this.currentZone}'")
          put("vip", ["total": tmp, "SNAT": tmpSNAT[0]])

          tmp = query("QueryEip count=true vip.l3Network.zoneUuid=${this.currentZone}")
          put("eip", ["total": tmp.total])

          tmp = query("QueryPortForwardingRule count=true vip.l3Network.zoneUuid=${this.currentZone}")
          put("portFrowarding", ["total": tmp.total])

          tmp = query("QueryLoadBalancer count=true vip.l3Network.zoneUuid=${this.currentZone}")
          put("loadBalancer", ["total": tmp.total])


          if (clusterUuidList.size() > 0) {
            tmp = call("org.zstack.header.allocator.APIGetCpuMemoryCapacityMsg", '{"zoneUuids": [${this.currentZone}], "clusterUuids": ["' + clusterUuidList.join('","') + '"]}')
            put("cpuMemoryCapacity", tmp)
            tmp = call("org.zstack.header.storage.primary.APIGetPrimaryStorageCapacityMsg", '{"zoneUuids": [${this.currentZone}], "clusterUuids": ["' + clusterUuidList.join('","') + '"]}')
            put("primaryStorageCapacity", tmp)
          } else {
            put("cpuMemoryCapacity", ["result": ["availableCpu": 0, "availableMemory": 0, "totalCpu": 0, "totalMemory": 0]])
            put("primaryStorageCapacity", ["result": ["availableCapacity": 0, "availablePhysicalCapacity": 0, "totalCapacity": 0, "totalPhysicalCapacity": 0]])
          }

          if (backupStorageUuidList.size() > 0) {
            tmp = call("org.zstack.header.storage.backup.APIGetBackupStorageCapacityMsg", '{"zoneUuids": [${this.currentZone}], "backupStorageUuids": ["' + backupStorageUuidList.join('","') + '"]}')
            put("backupStorageCapacity", tmp)
          } else {
            put("backupStorageCapacity", ["result": ["availableCapacity": 0, "totalCapacity": 0]])
          }



          def vm = [:]
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state!=Destroyed zoneUuid=${this.currentZone}")
          vm.total = tmp.total
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state=Running zoneUuid=${this.currentZone}")
          vm.running = tmp.total
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state=Stopped zoneUuid=${this.currentZone}")
          vm.stopped = tmp.total
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state!=Stopped state!=Running  state!=Destroyed zoneUuid=${this.currentZone}")
          vm.unknown = tmp.total
          put("vm", vm)

          def host = [:]
          tmp = query("QueryHost hypervisorType=KVM zoneUuid=${this.currentZone} replyWithCount=true")
          host.total = tmp.total
          def hostUuid = tmp.result.collect { it.uuid }
          def hostUuidStr = hostUuid.join('|')
          put("hostUuidStr", hostUuidStr)
          tmp = query("QueryHost status=Connected hypervisorType=KVM zoneUuid=${this.currentZone} count=true")
          host.connected = tmp.total
          tmp = query("QueryHost status=Disconnected hypervisorType=KVM zoneUuid=${this.currentZone} count=true")
          host.disconnected = tmp.total
          tmp = query("QueryHost status!=Connected status!=Disconnected hypervisorType=KVM zoneUuid=${this.currentZone} count=true")
          host.unknown = tmp.total
          tmp = query("QueryHost status=Connected state=Enabled hypervisorType=KVM count=true zoneUuid=${this.currentZone}")
          host.enablednum = tmp.total
          put("host", host)

          tmp = query("QueryGlobalConfig category=host name=cpu.overProvisioning.ratio")
          put("cpuOverProvision", tmp)

          tmp = query("QueryGlobalConfig name=reservedMemory")
          put("reservedMemory", tmp)

          tmp = query("QueryGlobalConfig category=mevoco name=overProvisioning.memory")
          put("memoryOverProvision", tmp)

          tmp = query("QueryGlobalConfig category=mevoco name=overProvisioning.primaryStorage")
          put("primaryStorageOverProvision", tmp)
        `;
      }

      script += `
        tmp = query("QueryInstanceOffering type=UserVm count=true")
        tmpEnable = query("QueryInstanceOffering type=UserVm count=true state=Enabled")
        put("instanceOffering", ["total": tmp.total, "enable": tmpEnable.total])

        tmp = query("QueryDiskOffering count=true")
        tmpEnable = query("QueryDiskOffering count=true state=Enabled")
        put("diskOffering", ["total": tmp.total, "enable": tmpEnable.total])
      `;

      if (!this.isOpensource) {
        if (this.allZone) {
          script += `
            tmp = query("QueryVirtualRouterVm applianceVmType=vpcvrouter count=true")
            tmpEnable = query("QueryVirtualRouterVm applianceVmType=vpcvrouter count=true state=Running status=Connected")
            put("vpcVRouter", ["total": tmp.total, "enable": tmpEnable.total])

            tmp = query("QueryL3Network l2Network.cluster.type!=vmware type=L3VpcNetwork count=true")
            put("vpcNetwork", ["total": tmp.total])

            tmp = query("QueryIPSecConnection count=true")
            put("ipsec", ["total": tmp.totall])
          `;
        } else {
          script += `
            tmp = query("QueryVirtualRouterVm applianceVmType=vpcvrouter count=true zoneUuid=${this.currentZone}")
            tmpEnable = query("QueryVirtualRouterVm applianceVmType=vpcvrouter count=true zoneUuid=${this.currentZone} state=Running status=Connected")
            put("vpcVRouter", ["total": tmp.total, "enable": tmpEnable.total])

            tmp = query("QueryL3Network l2Network.cluster.type!=vmware type=L3VpcNetwork count=true zoneUuid=${this.currentZone}")
            put("vpcNetwork", ["total": tmp.total])

            tmp = query("QueryIPSecConnection count=true vip.l3Network.zoneUuid=${this.currentZone}")
            put("ipsec", ["total": tmp.total])
          `;
        }
        script += `
          tmp = query("QuerySNSEmailEndpoint count=true")
          def total = tmp.total
          tmp = query("QuerySNSHttpEndpoint count=true name!=created-by-SystemHTTPTopicAndEndpointCreator")
          total = tmp.total + total
          tmp = query("QuerySNSDingTalkEndpoint count=true")
          total = tmp.total + total

          tmpEnable = query("QuerySNSEmailEndpoint count=true state=Enabled")
          def totalEnable = tmpEnable.total
          tmpEnable = query("QuerySNSHttpEndpoint count=true state=Enabled name!=created-by-SystemHTTPTopicAndEndpointCreator")
          totalEnable = tmpEnable.total + totalEnable
          tmpEnable = query("QuerySNSDingTalkEndpoint count=true state=Enabled")
          totalEnable = tmpEnable.total + totalEnable

          put("endPoint", ["total": total, "enable": totalEnable])

          tmp = query("QueryAlarm count=true uuid!?=${self.zWatchSystemAlarmUuidList.join(
            ","
          )}")
          tmpEnable = query("QueryAlarm count=true state=Enabled uuid!?=${self.zWatchSystemAlarmUuidList.join(
            ","
          )}")
          def alarmtmp = query("QueryEventSubscription count=true uuid!?=${self.zWatchSystemAlarmUuidList.join(
            ","
          )}")
          def alarmtmpEabled = query("QueryEventSubscription state=Enabled count=true uuid!?=${self.zWatchSystemAlarmUuidList.join(
            ","
          )}")

          put("alarm", ["total": tmp.total + alarmtmp.total, "enable": tmpEnable.total + alarmtmpEabled.total])

          def iam2project = 0
          tmp = query("QueryIAM2Project count=true")
          iam2project = tmp.total

          tmp = query("QueryAccount count=true")
          put("account", ["total": tmp.total-iam2project])

          tmp = query("QueryUser count=true")
          put("user", ["total": tmp.total])


          tmp = query("QuerySchedulerJob replyWithCount=true").result
          put("schedulerJob", tmp)

          tmp = query("QuerySchedulerTrigger replyWithCount=true schedulerType!=cron")
          put("schedulerTrigger", tmp)
        `;
      }

      rpc
        .query("batch-queries", {
          script: encodeURIComponent(script)
        })
        .then(
          resp => {
            self.host = {
              title: "host",
              ...resp.result.host
            };

            self.vm = {
              title: "vm",
              ...resp.result.vm
            };
            self.compute = {
              dataList: [
                { name: "zone", ...resp.result.zone },
                { name: "cluster", ...resp.result.cluster },
                { name: "instanceOffering", ...resp.result.instanceOffering },
                { name: "diskOffering", ...resp.result.diskOffering }
              ],
              isLeft: true,
              title: "compute"
            };
            self.storage = {
              dataList: [
                { name: "vmSnapshot", ...resp.result.vmSnapshot },
                { name: "volumeSnapshot", ...resp.result.volumeSnapshot },
                { name: "volume", ...resp.result.volume },
                { name: "image", ...resp.result.image }
              ],
              isLeft: !self.isOpensource,
              title: "storage"
            };

            if (self.isOpensource) {
              self.platform = {
                dataList: [],
                isLeft: false,
                title: "platform",
                isOpensource: true
              };
            } else {
              let schedulerTrigger = resp.result.schedulerTrigger.result;
              let enable = 0;
              let triggerUuids = [];
              schedulerTrigger.forEach(item => {
                triggerUuids.push(item.uuid);
                if (
                  !(
                    _.has(item, "stopTime") &&
                    new Date(item.stopTime).getTime() <
                      Date.now() + window.___currServerTimeMillionDvalue
                  )
                )
                  enable++;
              });
              let schedulerJobList = resp.result.schedulerJob.filter(it => {
                let hasInterSection =
                  _.intersection(triggerUuids, it.triggersUuid).length > 0;
                let noTrigger = it.triggersUuid.length === 0;
                return hasInterSection || noTrigger;
              });
              let schedulerJobTotal = schedulerJobList.length;
              let enabledSchedulerJob = schedulerJobList.filter(
                it => it.state === "Enabled"
              ).length;
              self.platform = {
                dataList: [
                  { name: "account", ...resp.result.account },
                  { name: "user", ...resp.result.user },
                  { name: "alarm", ...resp.result.alarm },
                  { name: "endPoint", ...resp.result.endPoint },
                  {
                    name: "schedulerTrigger",
                    total: resp.result.schedulerTrigger.total,
                    enable: enable
                  },
                  {
                    name: "schedulerJob",
                    total: schedulerJobTotal,
                    enable: enabledSchedulerJob
                  }
                ],
                isLeft: false,
                title: "platform"
              };
            }

            if (!self.isOpensource) {
              let vip = {
                total: resp.result.vip.total.total - resp.result.vip.SNAT.total
              };
              self.networks = {
                dataList: [
                  { name: "publickNetwork", ...resp.result.l3PublicNetwork },
                  { name: "privateNetwork", ...resp.result.l3PrivateNetwork },
                  { name: "vip", ...vip },
                  { name: "eip", ...resp.result.eip },
                  { name: "vpcNetwork", ...resp.result.vpcNetwork },
                  { name: "vpcVRouter", ...resp.result.vpcVRouter },
                  { name: "securityGroup", ...resp.result.securityGroup },
                  { name: "portFrowarding", ...resp.result.portFrowarding },
                  { name: "loadBalancer", ...resp.result.loadBalancer },
                  { name: "ipsec", ...resp.result.ipsec },
                  { name: "virtualRouterVm", ...resp.result.virtualRouterVm }
                ],
                isLeft: false,
                title: "network"
              };
            } else {
              let vip = {
                total: resp.result.vip.total.total - resp.result.vip.SNAT.total
              };
              self.networks = {
                dataList: [
                  { name: "publickNetwork", ...resp.result.l3PublicNetwork },
                  { name: "privateNetwork", ...resp.result.l3PrivateNetwork },
                  { name: "securityGroup", ...resp.result.securityGroup },
                  { name: "vip", ...vip },
                  { name: "eip", ...resp.result.eip },
                  { name: "portFrowarding", ...resp.result.portFrowarding },
                  { name: "loadBalancer", ...resp.result.loadBalancer },
                  { name: "virtualRouterVm", ...resp.result.virtualRouterVm }
                ],
                isLeft: false,
                title: "network"
              };
            }

            let primaryStorageOverProvision =
              resp.result.primaryStorageOverProvision.result[0].value;
            let availableCapacity =
              resp.result.primaryStorageCapacity.result.totalCapacity -
              resp.result.primaryStorageCapacity.result.availableCapacity;
            self.primaryStorage = {
              title: "primaryStorage",
              // availableCapacity: this.bytesToSize(resp.result.primaryStorageCapacity.result.totalCapacity - resp.result.primaryStorageCapacity.result.availableCapacity),
              availableCapacity: this.bytesToSize(availableCapacity),
              totalCapacity: this.bytesToSize(
                resp.result.primaryStorageCapacity.result.totalCapacity *
                  primaryStorageOverProvision
              ),
              totalPhysicalCapacity: this.bytesToSize(
                resp.result.primaryStorageCapacity.result.totalCapacity
              ),
              ratio:
                resp.result.primaryStorageCapacity.result.totalCapacity === 0 &&
                availableCapacity !== 0
                  ? 100
                  : 100 -
                    (resp.result.primaryStorageCapacity.result
                      .availableCapacity /
                      resp.result.primaryStorageCapacity.result.totalCapacity) *
                      100,
              isTwoColume: true,
              isOverProvision: true
            };

            self.backupStorage = {
              title: "backupStorage",
              availableCapacity: this.bytesToSize(
                resp.result.backupStorageCapacity.result.totalCapacity -
                  resp.result.backupStorageCapacity.result.availableCapacity
              ),
              totalCapacity: this.bytesToSize(
                resp.result.backupStorageCapacity.result.totalCapacity
              ),
              ratio:
                resp.result.backupStorageCapacity.result.totalCapacity === 0 &&
                resp.result.backupStorageCapacity.result.availableCapacity !== 0
                  ? 100
                  : 100 -
                    (resp.result.backupStorageCapacity.result
                      .availableCapacity /
                      resp.result.backupStorageCapacity.result.totalCapacity) *
                      100,
              isTwoColume: true
            };

            let cpuOverProvision = resp.result.cpuOverProvision.result[0].value;
            self.cpuCapacity = {
              title: "cpu",
              availableCapacity: self.decimalsFormatter(
                resp.result.cpuMemoryCapacity.result.totalCpu -
                  resp.result.cpuMemoryCapacity.result.availableCpu
              ),
              totalCapacity: self.decimalsFormatter(
                resp.result.cpuMemoryCapacity.result.totalCpu
              ),
              totalPhysicalCapacity: self.decimalsFormatter(
                resp.result.cpuMemoryCapacity.result.totalCpu / cpuOverProvision
              ),
              ratio:
                resp.result.cpuMemoryCapacity.result.totalCpu === 0 &&
                resp.result.cpuMemoryCapacity.result.availableCpu !== 0
                  ? 100
                  : 100 -
                    (resp.result.cpuMemoryCapacity.result.availableCpu /
                      resp.result.cpuMemoryCapacity.result.totalCpu) *
                      100,
              isTwoColume: true,
              isOverProvision: true
            };

            let memoryOverProvision =
              resp.result.memoryOverProvision.result[0].value;

            let usedMemory =
              resp.result.cpuMemoryCapacity.result.totalMemory -
              resp.result.cpuMemoryCapacity.result.availableMemory;
            let totalMemory = resp.result.cpuMemoryCapacity.result.totalMemory;
            console.log(usedMemory);
            self.memoryCapacity = {
              title: "memory",
              availableCapacity: this.bytesToSize(usedMemory),
              totalPhysicalCapacity: this.bytesToSize(totalMemory),
              totalCapacity: this.bytesToSize(
                totalMemory * memoryOverProvision
              ),
              ratio:
                totalMemory === 0 && usedMemory !== 0
                  ? 100
                  : (usedMemory / totalMemory) * 100,
              isTwoColume: true,
              isOverProvision: true
            };

            self.publicIpCapacity = [
              {
                title: "publicIpCapacity",
                indexName: "IPv4",
                availableCapacity:
                  resp.result.ipv4PublicIpCapacity.result.usedIpAddressNumber,
                totalCapacity:
                  resp.result.ipv4PublicIpCapacity.result.totalCapacity,
                ratio:
                  resp.result.ipv4PublicIpCapacity.result.totalCapacity === 0 &&
                  resp.result.ipv4PublicIpCapacity.result
                    .usedIpAddressNumber !== 0
                    ? 100
                    : (resp.result.ipv4PublicIpCapacity.result
                        .usedIpAddressNumber /
                        resp.result.ipv4PublicIpCapacity.result.totalCapacity) *
                      100,
                isTwoColume: true
              },
              {
                title: "publicIpCapacity",
                indexName: "IPv6",
                availableCapacity:
                  resp.result.ipv6PublicIpCapacity.result.usedIpAddressNumber,
                totalCapacity:
                  resp.result.ipv6PublicIpCapacity.result.totalCapacity,
                ratio:
                  resp.result.ipv6PublicIpCapacity.result.totalCapacity === 0 &&
                  resp.result.ipv6PublicIpCapacity.result
                    .usedIpAddressNumber !== 0
                    ? 100
                    : (resp.result.ipv6PublicIpCapacity.result
                        .usedIpAddressNumber /
                        resp.result.ipv6PublicIpCapacity.result.totalCapacity) *
                      100,
                isTwoColume: true,
                permission: "LICENSE_BASIC_PAID"
              }
            ];
            self.privateIpCapacity = [
              {
                title: "privateIpCapacity",
                indexName: "IPv4",
                availableCapacity:
                  resp.result.ipv4PrivateIpCapacity.result.usedIpAddressNumber,
                totalCapacity:
                  resp.result.ipv4PrivateIpCapacity.result.totalCapacity,
                ratio:
                  resp.result.ipv4PrivateIpCapacity.result.totalCapacity ===
                    0 &&
                  resp.result.ipv4PrivateIpCapacity.result
                    .usedIpAddressNumber !== 0
                    ? 100
                    : (resp.result.ipv4PrivateIpCapacity.result
                        .usedIpAddressNumber /
                        resp.result.ipv4PrivateIpCapacity.result
                          .totalCapacity) *
                      100,
                isTwoColume: true,
                permission: "LICENSE_BASIC_COMMUNITY"
              },
              {
                title: "privateIpCapacity",
                indexName: "IPv6",
                availableCapacity:
                  resp.result.ipv6PrivateIpCapacity.result.usedIpAddressNumber,
                totalCapacity:
                  resp.result.ipv6PrivateIpCapacity.result.totalCapacity,
                ratio:
                  resp.result.ipv6PrivateIpCapacity.result.totalCapacity ===
                    0 &&
                  resp.result.ipv6PrivateIpCapacity.result
                    .usedIpAddressNumber !== 0
                    ? 100
                    : (resp.result.ipv6PrivateIpCapacity.result
                        .usedIpAddressNumber /
                        resp.result.ipv6PrivateIpCapacity.result
                          .totalCapacity) *
                      100,
                isTwoColume: true,
                permission: "LICENSE_BASIC_PAID"
              }
            ];
          },
          () => {
            self.host = {
              title: "host",
              total: 0,
              connected: 0,
              disconnected: 0
            };

            self.vm = {
              title: "vm",
              total: 0,
              running: 0,
              stopped: 0
            };
            self.compute = {
              dataList: [
                { name: "zone", total: 0, enable: 0 },
                { name: "cluster", total: 0, enable: 0 },
                { name: "instanceOffering", total: 0, enable: 0 },
                { name: "diskOffering", total: 0, enable: 0 }
              ],
              isLeft: true,
              title: "compute"
            };
            self.storage = {
              dataList: [
                { name: "vmSnapshot", total: 0, enable: 0 },
                { name: "volumeSnapshot", total: 0, enable: 0 },
                { name: "volume", total: 0, enable: 0 },
                { name: "image", total: 0, enable: 0 }
              ],
              isLeft: !self.isOpensource,
              title: "storage"
            };

            if (self.isOpensource) {
              self.platform = {
                dataList: [],
                isLeft: false,
                title: "platform",
                isOpensource: true
              };
            } else {
              self.platform = {
                dataList: [
                  { name: "account", total: 0, enable: 0 },
                  { name: "user", total: 0, enable: 0 },
                  { name: "alarm", total: 0, enable: 0 },
                  { name: "endPoint", total: 0, enable: 0 },
                  { name: "schedulerTrigger", total: 0, enable: 0 },
                  { name: "schedulerJob", total: 0, enable: 0 }
                ],
                isLeft: false,
                title: "platform"
              };
            }

            if (!self.isOpensource) {
              self.networks = {
                dataList: [
                  { name: "publickNetwork", total: 0, enable: 0 },
                  { name: "privateNetwork", total: 0, enable: 0 },
                  { name: "vip", total: 0, enable: 0 },
                  { name: "eip", total: 0, enable: 0 },
                  { name: "vpcNetwork", total: 0, enable: 0 },
                  { name: "vpcVRouter", total: 0, enable: 0 },
                  { name: "securityGroup", total: 0, enable: 0 },
                  { name: "portFrowarding", total: 0, enable: 0 },
                  { name: "loadBalancer", total: 0, enable: 0 },
                  { name: "ipsec", total: 0, enable: 0 },
                  { name: "virtualRouterVm", total: 0, enable: 0 }
                ],
                isLeft: false,
                title: "network"
              };
            } else {
              self.networks = {
                dataList: [
                  { name: "publickNetwork", total: 0, enable: 0 },
                  { name: "privateNetwork", total: 0, enable: 0 },
                  { name: "securityGroup", total: 0, enable: 0 },
                  { name: "vip", total: 0, enable: 0 },
                  { name: "eip", total: 0, enable: 0 },
                  { name: "portFrowarding", total: 0, enable: 0 },
                  { name: "loadBalancer", total: 0, enable: 0 },
                  { name: "virtualRouterVm", total: 0, enable: 0 }
                ],
                isLeft: false,
                title: "network"
              };
            }
            self.primaryStorage = {
              title: "primaryStorage",
              // availableCapacity: this.bytesToSize(resp.result.primaryStorageCapacity.result.totalCapacity - resp.result.primaryStorageCapacity.result.availableCapacity),
              availableCapacity: 0,
              totalCapacity: 0,
              totalPhysicalCapacity: 0,
              ratio: 0,
              isTwoColume: false,
              isOverProvision: true
            };

            self.backupStorage = {
              title: "backupStorage",
              availableCapacity: 0,
              totalCapacity: 0,
              ratio: 0,
              isTwoColume: true
            };

            self.cpuCapacity = {
              title: "cpu",
              availableCapacity: 0,
              totalCapacity: 0,
              totalPhysicalCapacity: 0,
              ratio: 0,
              isTwoColume: true,
              isOverProvision: true
            };

            self.memoryCapacity = {
              title: "memory",
              availableCapacity: 0,
              totalPhysicalCapacity: 0,
              totalCapacity: 0,
              ratio: 0,
              isTwoColume: true,
              isOverProvision: true
            };

            self.publicIpCapacity = [
              {
                title: "publicIpCapacity",
                indexName: "IPv4",
                availableCapacity: 0,
                totalCapacity: 0,
                ratio: 0,
                isTwoColume: true
              },
              {
                title: "publicIpCapacity",
                indexName: "IPv6",
                availableCapacity: 0,
                totalCapacity: 0,
                ratio: 0,
                isTwoColume: true,
                permission: "LICENSE_BASIC_PAID"
              }
            ];
            self.privateIpCapacity = [
              {
                title: "privateIpCapacity",
                indexName: "IPv4",
                availableCapacity: 0,
                totalCapacity: 0,
                ratio: 0,
                isTwoColume: true,
                permission: "LICENSE_BASIC_COMMUNITY"
              },
              {
                title: "privateIpCapacity",
                indexName: "IPv6",
                availableCapacity: 0,
                totalCapacity: 0,
                ratio: 0,
                isTwoColume: true,
                permission: "LICENSE_BASIC_PAID"
              }
            ];
          }
        );
    },

    queryMetricData: function() {
      let self = this;
      if (this.isOpensource) return;
      let time = this.timeIntervalList[this.intervalIndex].value;
      let period = this.timeIntervalList[this.intervalIndex].period;
      let zwatchScript = `
      zwatch{resultName='cpuAllUsed',metricName='CPUAllUsedUtilization',offsetAheadOfCurrentTime=${time},period=${period}},
      zwatch{resultName='memoryUsedBytes',metricName='MemoryUsedInPercent',offsetAheadOfCurrentTime=${time},period=${period}},
      zwatch{resultName='networkAllOutBytes',metricName='NetworkAllOutBytes',offsetAheadOfCurrentTime=${time},period=${period}},
      zwatch{resultName='networkAllInBytes',metricName='NetworkAllInBytes',offsetAheadOfCurrentTime=${time},period=${period}},
      zwatch{resultName='diskAllWriteOps',metricName='DiskAllWriteBytes',offsetAheadOfCurrentTime=${time},period=${period}},
      zwatch{resultName='diskAllReadOps',metricName='DiskAllReadBytes',offsetAheadOfCurrentTime=${time},period=${period}}`;
      let conditions = this.allZone
        ? `hypervisorType='KVM'`
        : `hypervisorType='KVM' and zoneUuid='${this.currentZone}'`;

      let zqlScript = `query host.uuid where ${conditions} return with (${zwatchScript})`;
      rpc
        .query("zql", {
          zql: encodeURIComponent(zqlScript)
        })
        .then(
          resp => {
            this.cpuAllUsed = this.initMetricData(
              [resp.results[0].returnWith.cpuAllUsed],
              [this.chartColor],
              "cpuAllUsed",
              { min: 0, max: 100 },
              this.percentFormatter,
              ["cpuUsed"]
            );

            this.memoryUsedBytes = this.initMetricData(
              [resp.results[0].returnWith.memoryUsedBytes],
              [this.chartColor],
              "memoryUsedBytes",
              { min: 0, max: 100 },
              this.percentFormatter,
              ["memoryUsed"]
            );

            this.networktBytes = this.initMetricData(
              [
                resp.results[0].returnWith.networkAllOutBytes,
                resp.results[0].returnWith.networkAllInBytes
              ],
              [this.chartColor, this.chartColorDouble],
              "networkAllBytes",
              null,
              this.numberFormatter,
              ["networkOutBytes", "networkInBytes"]
            );

            this.diskValue = this.initMetricData(
              [
                resp.results[0].returnWith.diskAllWriteOps,
                resp.results[0].returnWith.diskAllReadOps
              ],
              [this.chartColor, this.chartColorDouble],
              "diskAllOps",
              null,
              this.numberFormatter,
              ["diskWriteOps", "diskReadOps"]
            );
          },
          () => {
            this.cpuAllUsed = { title: "cpuAllUsed", dataList: [] };

            this.memoryUsedBytes = { title: "memoryUsedBytes", dataList: [] };

            this.networktBytes = { title: "networkAllBytes", dataList: [] };

            this.diskValue = { title: "diskAllOps", dataList: [] };
          }
        );
    },
    queryNormal: function() {
      let self = this;
      self.time = {
        time: self.currTimeMillion,
        identityName: self.identityName
      };
      let script = `
      def tmp = query("QueryZone count=true replyWithCount=true fields=uuid")
      def tmpEnable = query("QueryZone replyWithCount=true state=Enabled")
      put("zone", ["total": tmp.total, "enable": tmpEnable.total])

      tmp = call("org.zstack.header.identity.APIGetAccountQuotaUsageMsg", '{"uuid": ${localStorage.getItem(
        "accountUuid"
      )}}')
      put("usages", tmp.result.usages)

      tmp = query("QueryL3Network l2Network.cluster.type=vmware replyWithCount=true fields=uuid")
      def vCenterNetworkUuidList = tmp.result.collect { it.uuid }

      def ipv4PublicNetwork
      def ipv6PublicNetwork
      if (vCenterNetworkUuidList.size() > 0) {
        tmp = query("QueryL3Network system=false category=Public replyWithCount=true uuid!?=" + vCenterNetworkUuidList.join(","))
        ipv4PublicNetwork = query("QueryL3Network system=false ipVersion=4 category=Public replyWithCount=true uuid!?=" + vCenterNetworkUuidList.join(","))
        ipv6PublicNetwork = query("QueryL3Network system=false ipVersion=6 category=Public replyWithCount=true uuid!?=" + vCenterNetworkUuidList.join(","))
      } else {
        tmp = query("QueryL3Network system=false category=Public replyWithCount=true")
        ipv4PublicNetwork = query("QueryL3Network system=false ipVersion=4 category=Public replyWithCount=true")
        ipv6PublicNetwork = query("QueryL3Network system=false ipVersion=6 category=Public replyWithCount=true")
      }
      put("l3PublicNetwork", ["total": tmp.total])

      def ipv4PublicUuidList = ipv4PublicNetwork.result.collect { it.uuid }
      if (ipv4PublicUuidList.size() > 0) {
        tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv4PublicUuidList.join('","') + '"]}')
        put("ipv4PublicIpCapacity", tmp)
      } else {
        put("ipv4PublicIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0, "usedIpAddressNumber": 0]])
      }

      def ipv6PublicUuidList = ipv6PublicNetwork.result.collect { it.uuid }
      if (ipv6PublicUuidList.size() > 0) {
        tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv6PublicUuidList.join('","') + '"]}')
        put("ipv6PublicIpCapacity", tmp)
      } else {
        put("ipv6PublicIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0]])
      }

      def ipv4PrivateNetwork
      def ipv6PrivateNetwork
      if (vCenterNetworkUuidList.size() > 0) {
        tmp = query("QueryL3Network system=false category=Private replyWithCount=true type!=L3VpcNetwork fields=uuid uuid!?=" + vCenterNetworkUuidList.join(","))
        ipv4PrivateNetwork = query("QueryL3Network system=false category=Private replyWithCount=true type!=L3VpcNetwork ipVersion=4 fields=uuid uuid!?=" + vCenterNetworkUuidList.join(","))
        ipv6PrivateNetwork = query("QueryL3Network system=false category=Private replyWithCount=true type!=L3VpcNetwork ipVersion=6 fields=uuid uuid!?=" + vCenterNetworkUuidList.join(","))
      } else {
        tmp = query("QueryL3Network system=false category=Private replyWithCount=true type!=L3VpcNetwork fields=uuid")
        ipv4PrivateNetwork = query("QueryL3Network system=false category=Private replyWithCount=true ipVersion=4 type!=L3VpcNetwork fields=uuid")
        ipv6PrivateNetwork = query("QueryL3Network system=false category=Private replyWithCount=true ipVersion=6 type!=L3VpcNetwork fields=uuid")
      }
      put("l3PrivateNetwork", ["total": tmp.total])

      def ipv4PrivateUuidList = ipv4PrivateNetwork.result.collect { it.uuid }
      if (ipv4PrivateUuidList.size() > 0) {
        tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv4PrivateUuidList.join('","') + '"]}')
        put("ipv4PrivateIpCapacity", tmp)
      } else {
        put("ipv4PrivateIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0]])
      }

      def ipv6PrivateUuidList = ipv6PrivateNetwork.result.collect { it.uuid }
      if (ipv6PrivateUuidList.size() > 0) {
        tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + ipv6PrivateUuidList.join('","') + '"]}')
        put("ipv6PrivateIpCapacity", tmp)
      } else {
        put("ipv6PrivateIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0, "usedIpAddressNumber": 0]])
      }

      tmp = query("QueryVirtualRouterVm applianceVmType?=vrouter,VirtualRouter count=true")
      tmpEnable = query("QueryVirtualRouterVm applianceVmType?=vrouter,VirtualRouter count=true status=Connected state=Running")
      put("virtualRouterVm", ["total": tmp.total, "enable": tmpEnable.total])

      tmp = query("QuerySecurityGroup count=true")
      put("securityGroup", ["total": tmp.total])

      tmp = query("QueryVirtualRouterVm applianceVmType=vpcvrouter count=true")
      tmpEnable = query("QueryVirtualRouterVm applianceVmType=vpcvrouter count=true state=Running status=Connected")
      put("vpcVRouter", ["total": tmp.total, "enable": tmpEnable.total])

      tmp = query("QueryL3Network l2Network.cluster.type!=vmware type=L3VpcNetwork count=true")
      put("vpcNetwork", ["total": tmp.total])

      tmp = query("QueryGlobalConfig category=host name=cpu.overProvisioning.ratio")
      put("cpuOverProvision", tmp)

      tmp = query("QueryGlobalConfig category=mevoco name=overProvisioning.memory")
      put("memoryOverProvision", tmp)

      tmp = query("QueryGlobalConfig name=reservedMemory")
      put("reservedMemory", tmp)
      `;

      if (!this.isUser) {
        script += `
          tmp = query("QueryUser  count=true")
          put("user", ["total": tmp.total])

          tmp = query("QueryUserGroup  count=true")
          put("usergroup", ["total": tmp.total])
        `;
      }

      if (!this.isOpensource) {
        script += `
        tmp = query("QueryAlarm count=true uuid!?=${self.zWatchSystemAlarmUuidList.join(
          ","
        )}")
        tmpEnable = query("QueryAlarm count=true state=Enabled uuid!?=${self.zWatchSystemAlarmUuidList.join(
          ","
        )}")
        def alarmtmp = query("QueryEventSubscription count=true uuid!?=${self.zWatchSystemAlarmUuidList.join(
          ","
        )}")
        def alarmtmpEabled = query("QueryEventSubscription state=Enabled count=true uuid!?=${self.zWatchSystemAlarmUuidList.join(
          ","
        )}")

        put("alarm", ["total": tmp.total + alarmtmp.total, "enable": tmpEnable.total + alarmtmpEabled.total])

        tmp = query("QuerySNSEmailEndpoint count=true")
        def total = tmp.total
        tmp = query("QuerySNSHttpEndpoint count=true name!=created-by-SystemHTTPTopicAndEndpointCreator")
        total = tmp.total + total
        tmp = query("QuerySNSDingTalkEndpoint count=true")
        total = tmp.total + total

        tmpEnable = query("QuerySNSEmailEndpoint count=true state=Enabled")
        def totalEnable = tmpEnable.total
        tmpEnable = query("QuerySNSHttpEndpoint count=true state=Enabled name!=created-by-SystemHTTPTopicAndEndpointCreator")
        totalEnable = tmpEnable.total + totalEnable
        tmpEnable = query("QuerySNSDingTalkEndpoint count=true state=Enabled")
        totalEnable = tmpEnable.total + totalEnable

        put("endPoint", ["total": total, "enable": totalEnable])

        tmp = query("QueryIPSecConnection count=true")
        tmpEnable = query("QueryIPSecConnection count=true state=Enabled")
        put("ipsec", ["total": tmp.total, "enable": tmpEnable.total])

        tmp = zql("count vminstance where ((hostUuid is null and lastHostUuid is not null) or (hostUuid is not null and lastHostUuid is null) or (hostUuid is not null and lastHostUuid is not null)) and hypervisorType='ESX' and type='UserVM' and state not in ('Destroyed')")

        tmpEnable = zql("count vminstance where ((hostUuid is not null and state != 'Starting') or (hostUuid is not null and state = 'Starting') or (hostUuid is null and state != 'Starting')) and hypervisorType='ESX' and type='UserVM' and state not in ('Stopped', 'Destroying', 'Destroyed', 'Created')")
        put("vcenterVM", ["total": tmp, "enable": tmpEnable])
        `;
      }
      rpc
        .query("batch-queries", {
          script: encodeURIComponent(script)
        })
        .then(resp => {
          resp.result.usages.forEach(it => {
            let name = it.name;
            delete it.name;
            self.usages[name] = it;
          });
          self.cpuCapacity = {
            title: "cpu",
            availableCapacity: this.decimalsFormatter(
              self.usages["vm.cpuNum"].used
            ),
            totalCapacity: this.decimalsFormatter(
              self.usages["vm.cpuNum"].total
            ),
            ratio:
              (self.usages["vm.cpuNum"].used / self.usages["vm.cpuNum"].total) *
              100,
            isTwoColume: true
          };

          self.memoryCapacity = {
            title: "memory",
            availableCapacity: this.bytesToSize(
              self.usages["vm.memorySize"].used
            ),
            totalCapacity: this.bytesToSize(self.usages["vm.memorySize"].total),
            ratio:
              (self.usages["vm.memorySize"].used /
                self.usages["vm.memorySize"].total) *
              100,
            isTwoColume: true
          };

          self.volumeCapacity = {
            title: "volumeCapacity",
            availableCapacity: this.bytesToSize(
              self.usages["volume.capacity"].used
            ),
            totalCapacity: this.bytesToSize(
              self.usages["volume.capacity"].total
            ),
            ratio:
              (self.usages["volume.capacity"].used /
                self.usages["volume.capacity"].total) *
              100,
            isTwoColume: true
          };

          self.imageSize = {
            title: "imageSize",
            availableCapacity: this.bytesToSize(self.usages["image.size"].used),
            totalCapacity: this.bytesToSize(self.usages["image.size"].total),
            ratio:
              (self.usages["image.size"].used /
                self.usages["image.size"].total) *
              100,
            isTwoColume: true
          };

          self.publicIpCapacity = [
            {
              title: "publicIpCapacity",
              indexName: "IPv4",
              availableCapacity:
                resp.result.ipv4PublicIpCapacity.result.usedIpAddressNumber,
              totalCapacity:
                resp.result.ipv4PublicIpCapacity.result.totalCapacity,
              ratio:
                resp.result.ipv4PublicIpCapacity.result.totalCapacity === 0 &&
                resp.result.ipv4PublicIpCapacity.result.usedIpAddressNumber !==
                  0
                  ? 100
                  : (resp.result.ipv4PublicIpCapacity.result
                      .usedIpAddressNumber /
                      resp.result.ipv4PublicIpCapacity.result.totalCapacity) *
                    100,
              isTwoColume: true
            },
            {
              title: "publicIpCapacity",
              indexName: "IPv6",
              availableCapacity:
                resp.result.ipv6PublicIpCapacity.result.usedIpAddressNumber,
              totalCapacity:
                resp.result.ipv6PublicIpCapacity.result.totalCapacity,
              ratio:
                resp.result.ipv6PublicIpCapacity.result.totalCapacity === 0 &&
                resp.result.ipv6PublicIpCapacity.result.usedIpAddressNumber !==
                  0
                  ? 100
                  : (resp.result.ipv6PublicIpCapacity.result
                      .usedIpAddressNumber /
                      resp.result.ipv6PublicIpCapacity.result.totalCapacity) *
                    100,
              isTwoColume: true,
              permission: "LICENSE_BASIC_PAID"
            }
          ];
          self.privateIpCapacity = [
            {
              title: "privateIpCapacity",
              indexName: "IPv4",
              availableCapacity:
                resp.result.ipv4PrivateIpCapacity.result.usedIpAddressNumber,
              totalCapacity:
                resp.result.ipv4PrivateIpCapacity.result.totalCapacity,
              ratio:
                resp.result.ipv4PrivateIpCapacity.result.totalCapacity === 0 &&
                resp.result.ipv4PrivateIpCapacity.result.usedIpAddressNumber !==
                  0
                  ? 100
                  : (resp.result.ipv4PrivateIpCapacity.result
                      .usedIpAddressNumber /
                      resp.result.ipv4PrivateIpCapacity.result.totalCapacity) *
                    100,
              isTwoColume: true,
              permission: "LICENSE_BASIC_COMMUNITY"
            },
            {
              title: "privateIpCapacity",
              indexName: "IPv6",
              availableCapacity:
                resp.result.ipv6PrivateIpCapacity.result.usedIpAddressNumber,
              totalCapacity:
                resp.result.ipv6PrivateIpCapacity.result.totalCapacity,
              ratio:
                resp.result.ipv6PrivateIpCapacity.result.totalCapacity === 0 &&
                resp.result.ipv6PrivateIpCapacity.result.usedIpAddressNumber !==
                  0
                  ? 100
                  : (resp.result.ipv6PrivateIpCapacity.result
                      .usedIpAddressNumber /
                      resp.result.ipv6PrivateIpCapacity.result.totalCapacity) *
                    100,
              isTwoColume: true,
              permission: "LICENSE_BASIC_PAID"
            }
          ];

          self.storage = {
            dataList: [
              { name: "volume", ...self.usages["volume.data.num"] },
              { name: "image", ...self.usages["image.num"] },
              { name: "snapshot", ...self.usages["snapshot.volume.num"] }
            ],
            isLeft: true,
            title: "storage"
          };

          self.networks = {
            dataList: [
              { name: "publickNetwork", ...resp.result.l3PublicNetwork },
              { name: "privateNetwork", ...resp.result.l3PrivateNetwork },
              { name: "vpcNetwork", ...resp.result.vpcNetwork },
              { name: "vpcVRouter", ...resp.result.vpcVRouter },
              { name: "securityGroup", ...self.usages["securityGroup.num"] },
              // { name: 'virtualRouterVm', ...resp.result.virtualRouterVm },
              { name: "vip", ...self.usages["vip.num"] },
              { name: "eip", ...self.usages["eip.num"] },
              { name: "portFrowarding", ...self.usages["portForwarding.num"] },
              { name: "loadBalancer", ...self.usages["loadBalancer.num"] }
            ],
            isLeft: false,
            title: "network"
          };

          self.platform = {
            dataList: [],
            isLeft: false,
            title: "platform"
          };

          if (!self.isUser) {
            self.platform.dataList.push({
              name: "usergroup",
              ...resp.result.usergroup
            });
            self.platform.dataList.push({ name: "user", ...resp.result.user });
          }

          self.platform.dataList.push({
            name: "schedulerTrigger",
            ...self.usages["scheduler.trigger.num"]
          });
          self.platform.dataList.push({
            name: "scheduler",
            ...self.usages["scheduler.num"]
          });

          self.vm = {
            title: "vm",
            ...self.usages["vm.totalNum"],
            running: self.usages["vm.num"].used,
            runningTotal: self.usages["vm.num"].total,
            vcenterVM: resp.result.vcenterVM.total[0].total,
            vcenterVmRunning: resp.result.vcenterVM.enable[0].total
          };
        });

      if (_.isNull(this.currTimeInterval)) {
        this.currTimeInterval = setInterval(() => {
          this.currTimeMillion = this.currTimeMillion + 1000;
          this.time.time = this.currTimeMillion;
        }, 1000);
      }
    },

    bytesToSize(bytes, unit, width) {
      if (typeof bytes !== "number" || isNaN(bytes)) bytes = 0;
      if (bytes < 0) bytes = 0;
      if (typeof width === "undefined") width = 2;
      if (typeof unit === "undefined") unit = "B";
      var num = Math.pow(10, width);
      var sizes = ["K", "M", "G", "T", "P"];
      if (unit) {
        sizes.unshift("");
      } else {
        sizes.unshift("Byte");
      }
      if (bytes === 0) return "0 " + sizes[0] + unit;
      var i = Math.floor(Math.log(bytes) / Math.log(1024));
      if (sizes[i] === "B") num = 1;
      if (i >= 5) i = 5;
      let ret = /^(([1-9][0-9]*)|(([0]\.\d{1,1}|[1-9][0-9]*\.\d{1,1})))$/;
      if (!ret.test(((bytes / Math.pow(1024, i)) * num) / num)) {
        let value = (((bytes / Math.pow(1024, i)) * num) / num).toFixed(1);
        if (value - Math.floor(value) === 0) value = Math.floor(value);
        return value + " " + sizes[i] + unit;
      } else
        return (
          Math.round((bytes / Math.pow(1024, i)) * num) / num +
          " " +
          sizes[i] +
          unit
        );
    },
    getCurrentZone() {
      let self = this;
      return rpc.query("zones").then(resp => {
        if (resp.inventories.length > 0) {
          self.currentZone = resp.inventories[0].uuid;
          self.updateDbTable({
            tableName: "zone",
            list: resp.inventories
          });
        }
      });
    },

    getCurrentTime() {
      let self = this;
      return rpc
        .put("management-nodes/actions", {
          getCurrentTime: {}
        })
        .then(resp => {
          self.currTime = resp.currentTime.Seconds;
          self.currTimeMillion = resp.currentTime.MillionSeconds;
        });
    },

    percentFormatter(value) {
      if (_.isNumber(value)) return value.toFixed(2) + "%";
      else return value;
    },

    numberFormatter(value) {
      let self = this;
      if (value < 1.0) value = 0;
      return self.bytesToSize(value);
    },

    decimalsFormatter(value) {
      let str = value.toString();
      if (str.indexOf(".") > -1 && str.split(".")[1].length > 2)
        return value.toFixed(2);
      else return value;
    },

    initcurrQueryInterval() {
      let step =
        this.timeIntervalList[this.intervalIndex].period < 20
          ? 20
          : this.timeIntervalList[this.intervalIndex].period;
      if (!_.isNull(this.currQueryInterval))
        clearInterval(this.currQueryInterval);
      this.currQueryInterval = setInterval(this.queryMetricData, step * 1000);
    },
    changeInterval: function(item) {
      this.intervalIndex = item.index;
      this.queryMetricData();
      this.initcurrQueryInterval();
    },
    initMetricData: function(dataList, color, title, yAxis, fuc, name) {
      let value = [];
      let step =
        this.timeIntervalList[this.intervalIndex].period < 20
          ? 20
          : this.timeIntervalList[this.intervalIndex].period;
      dataList.forEach((item, index) => {
        let values = [];
        if (!item) item = [];
        if (item.length === 0) {
          let currTime =
            (Date.now() + window.___currServerTimeMillionDvalue) / 1000;
          for (let i = 60; i >= 0; i--) {
            let dummyValue = {
              time: currTime - step * i,
              value: 0
            };
            values.push(dummyValue);
          }
        } else {
          let data = _.groupBy(item, "time");
          for (let key in data) {
            let _value;
            if (title === "networkAllBytes" || title === "diskAllOps") {
              _value = _.sumBy(data[key], function(o) {
                return o.value;
              });
            } else
              _value =
                _.sumBy(data[key], function(o) {
                  return o.value;
                }) / data[key].length;
            values.push({
              time: key,
              value: _value
            });
          }
          let length =
            this.timeIntervalList[this.intervalIndex].value /
              this.timeIntervalList[this.intervalIndex].period +
            1;
          let step = this.timeIntervalList[this.intervalIndex].period;
          if (values.length < length) {
            let valueLenth = values.length;
            let currentTime =
              (Date.now() + window.___currServerTimeMillionDvalue) / 1000;
            let startTime = valueLenth > 0 ? values[0].time : currentTime;
            let endTime =
              valueLenth > 0 ? values[valueLenth - 1].time : currentTime;
            let __value = [];
            if (endTime < currentTime) {
              for (
                let i = 1;
                i <=
                Math.round((parseInt(currentTime) - parseInt(endTime)) / step);
                i++
              ) {
                values.push({ time: parseInt(endTime) + i * step, value: 0 });
              }
            }
            valueLenth = values.length;
            for (let i = 0; i < valueLenth; i++) {
              __value.push(values[i]);
              if (
                i + 1 < values.length &&
                values[i + 1].time - values[i].time > step
              ) {
                let num = Math.round(
                  (values[i + 1].time - values[i].time) / step
                );
                for (let n = 1; n < num; n++) {
                  __value.push({
                    time: parseInt(values[i].time) + step * n,
                    value: 0
                  });
                }
              }
            }
            let _length = __value.length;
            for (let i = 1; i <= length - _length; i++) {
              __value.unshift({ time: startTime - i * step, value: 0 });
            }
            values = __value;
          }
        }
        value.push({ values, color: color[index], id: name[index] });
      });
      if (yAxis === null) {
        let maxValue = _.max(
          value[0].values.concat(value[1].values).map(it => Math.ceil(it.value))
        );
        if (maxValue <= 4) yAxis = { min: 0, max: 4 };
        else yAxis = { min: 0, max: maxValue * 1.1 };
      }
      return {
        dataList: value,
        title,
        yAxis,
        fuc
      };
    },

    changeZone() {
      let self = this;
      self.allZone = !self.allZone;
      self.queryList();
    },
    ...Utils
  }
};
</script>

<style scoped lang="less">
@prefixCls: ~"home_wrapper";
.@{prefixCls} {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  &-container {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  &-tab {
    width: 180px;
    margin-left: 20px;
  }
  &-admin {
    margin: 10px 20px 20px;
    background: transparent;
    height: calc(100% - 44px);
    &-top {
      background: #fff;
      margin-bottom: 20px;
      height: 300px;
    }
    &-bottom {
      &-left {
        margin-right: 20px;
        &-item {
          background: #fff;
          height: 280px;
          margin-bottom: 20px;
        }
      }
      &-center {
        .item {
          width: 100%;
          margin-bottom: 20px;
          .content {
            background: #fff;
            height: 280px;
            width: calc(50% - 20px);
            margin-right: 20px;
          }
        }
        .item-last {
          height: 580px;
          background: #fff;
          width: calc(100% - 20px);
        }
      }
      &-right {
        .item {
          height: 280px;
          width: calc(100% + 50px);
          background: #fff;
          margin-bottom: 20px;
        }
        .item-last {
          height: 580px;
          width: calc(100% + 50px);
          background: #fff;
        }
      }
    }
  }
}

.tab-container {
  display: flex;
  justify-content: space-between;
}

.tab-toggletime {
  padding: 7px 20px;
}
</style>
