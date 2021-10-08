<template>
  <div style="padding-top: 60px; height: 100%;">
    <div class="container" style="position: relative;">
      <scroll-bar>
       <div class="normal">
        <div class="flex-body" style="padding-top: 0;">
          <div class="left-item">
            <project-admin class="system-time" :param="{data: projectAdmin}"></project-admin>
            <project-billing class="system-time" :param="{data: projectBilling}"></project-billing>
            <line-list-for-project class="line-list-for-project" :param="{data: vm}"></line-list-for-project>
            <bar-ratio-list-account class="bar-ratio-list" style="height: 192px;" :param="{data: storage}"></bar-ratio-list-account>
          </div>
          <div class="center-item">
            <div class="item">
              <circle-ratio class="circle-ratio" :param="{data: cpuCapacity}"></circle-ratio>
              <circle-ratio class="circle-ratio" :param="{data: memoryCapacity}"></circle-ratio>
            </div>
            <div class="item">
              <circle-ratio class="circle-ratio" :param="{data: publicIpCapacity}"></circle-ratio>
              <circle-ratio class="circle-ratio" :param="{data: privateIpCapacity}"></circle-ratio>
            </div>
            <bar-ratio-list-account class="bar-ratio-list" :param="{data: networks}"></bar-ratio-list-account>
          </div>
          <div class="right-item">
            <circle-ratio class="circle-ratio" :param="{data: volumeCapacity}"></circle-ratio>
            <circle-ratio class="circle-ratio" :param="{data: imageSize}"></circle-ratio>
            <bar-ratio-list-account class="bar-ratio-list" :param="{data: platform}"></bar-ratio-list-account>
          </div>
        </div>
      </div>
     </scroll-bar>
     </div>
  </div>
</template>


<script>
  import rpc from '../../../utils/rpc'
  import _ from 'lodash'
  import Utils from '../../../utils/utils'
  import WindowBase from 'src/windows/Window';
  import BarRatioList from 'src/component/metric/BarRatioList'
  import BarRatio from 'src/component/metric/BarRatio'
  import BarRatioListAccount from 'src/component/metric/BarRatioListAccount'
  import BarRatioAccount from 'src/component/metric/BarRatioAccount'
  import CircleRatio from 'src/component/metric/CircleRatio'
  import LineMetric from 'src/component/metric/LineMetric'
  import SystemTime from 'src/component/metric/SystemTime'
  import ProjectAdmin from 'src/component/metric/ProjectAdmin'
  import ProjectUser from 'src/component/metric/ProjectUser'
  import ProjectBilling from 'src/component/metric/ProjectBilling'
  import LineListForProject from 'src/component/metric/LineListForProject'
  import Methods from 'src/ecs/home/Methods'
  import ScrollBar from "../../../component/vue-scroller-bars/scroll-bar";
  import Root from 'src/windows/Root';
  /* global localStorage:false */

  export default {
    name: 'NewHomePage',
    mixins: [WindowBase, Root, Methods],
    components: {
      ScrollBar,
      'bar-ratio-list': BarRatioList,
      'bar-ratio': BarRatio,
      'circle-ratio': CircleRatio,
      'metirc-data': LineMetric,
      'bar-ratio-list-account': BarRatioListAccount,
      'bar-ratio-account': BarRatioAccount,
      'system-time': SystemTime,
      'project-admin': ProjectAdmin,
      'project-billing': ProjectBilling,
      'line-list-for-project': LineListForProject,
      'project-user': ProjectUser
    },
    created: function () {
      this.scrollContainerSelector = '.container'
      this.scrollElementSelector = '.home-body'
      this.updateWindow({
        methods: {
          queryList: this.queryList
        }
      })
      this.currentZone = localStorage.getItem('currZoneUuid')
      if (!this.currentZone || !this.dbData.zone[this.currentZone]) {
        this.getCurrentZone()
      }
      let mainPageWindowId
      Object.keys(this.$store.state.windowManager.windows).forEach((_id) => {
        if (_id.indexOf('MainPage-') > -1) {
          mainPageWindowId = _id
        }
      })

      this._updateWindow({
        id: mainPageWindowId,
        currPageWindowId: this.windowId
      })
    },
    mounted: function () {
      this.currentZone = localStorage.getItem('currZoneUuid')
      if (localStorage.getItem('loginType') === 'account') {
        this.identityName = localStorage.getItem('accountName')
      } else if (localStorage.getItem('loginType') === 'user') {
        this.identityName = localStorage.getItem('userName')
        this.isUser = true
      } else if (localStorage.getItem('loginType') === 'ldap') {
        this.identityName = localStorage.getItem('uidName')
      }
      if (!this.currentZone || !this.dbData.zone[this.currentZone]) {
        this.getCurrentZone()
          .then(() => this.queryList())
      } else this.queryList()
      // if (_.isNull(this.currQueryInterval)) {
      //   this.currQueryInterval = setInterval(this.queryList, 20000)
      // }
    },
    destroyed: function () {
      // if (this.currQueryInterval !== null) {
      //   clearInterval(this.currQueryInterval)
      //   this.currQueryInterval = null
      // }
    },
    data () {
      return {
        allZone: true,
        projectBilling: {},
        identityName: '',
        currTime: 0,
        currQueryInterval: null,
        time: '',
        host: {
          title: 'host'
        },
        vm: {
          title: 'vm'
        },
        compute: {
          title: 'compute'
        },
        storage: {
          title: 'storage'
        },
        platform: {
          title: 'platform'
        },
        networks: {
          title: 'network'
        },
        primaryStorage: {
          title: 'primaryStorage'
        },
        cpuCapacity: {
          title: 'cpu'
        },
        memoryCapacity: {
          title: 'memory'
        },
        publicIpCapacity: {
          title: 'publicIpCapacity'
        },
        privateIpCapacity: {
          title: 'privateIpCapacity'
        },
        projectAdmin: {
          title: 'projectUpdate',
          role: 'project-admin',
          name: 'lala',
          member: '55',
          projectCycle: '2014-1-1'
        },
        isOpensource: false,
        usages: {},
        volumeCapacity: {},
        imageSize: {},
        isUser: false
      }
    },
    methods: {
      changeZone: function () {
        this.allZone = !this.allZone
        this.queryList()
      },
      getCurrentZone: function () {
        return rpc.query('zones')
          .then((resp) => {
            if (resp.inventories.length > 0) {
              this.currentZone = resp.inventories[0].uuid
              this.updateDbTable({
                tableName: 'zone',
                list: resp.inventories
              })
            }
          })
      },
      queryList: function () {
        this.currentZone = localStorage.getItem('currZoneUuid')
        if (!this.currentZone || !this.dbData.zone[this.currentZone]) this.getCurrentZone()
        let self = this
        rpc.query('licenses')
          .then((licenseResp) => {
            return rpc.query('meta-data/opensource')
              .then((opensourceResp) => {
                if (opensourceResp.opensource || licenseResp.inventory.licenseType === 'Community') {
                  self.isOpensource = true
                }
              })
          })
          .then(() => {
            return rpc.put('management-nodes/actions', {
              'getCurrentTime': {}
            })
          })
          .then((resp) => {
            this.currTime = resp.currentTime.Seconds
            this.currTimeMillion = resp.currentTime.MillionSeconds
            this.queryProject()
          })
      },
      queryProject: function () {
        let self = this
        self.time = {
          time: self.currTimeMillion,
          identityName: self.identityName
        }
        let script = `
      def tmp = query("QueryZone count=true replyWithCount=true fields=uuid")
      def tmpEnable = query("QueryZone replyWithCount=true state=Enabled")
      put("zone", ["total": tmp.total, "enable": tmpEnable.total])

      tmp = call("org.zstack.header.identity.APIGetAccountQuotaUsageMsg", '{"uuid": ${localStorage.getItem('accountUuid')}}')
      put("usages", tmp.result.usages)

      tmp = query("QueryIAM2VirtualID projects.uuid=${self.dbData.common.currProject.uuid} count=true")
      put("memberNum", ["total": tmp.total])

      tmp = query("QueryIAM2VirtualID projects.uuid=${self.dbData.common.currProject.uuid} fields=name attributes.name=__ProjectAdmin__")
      put("projectAdmin", ["name": tmp])

      tmp = call("org.zstack.billing.APICalculateAccountSpendingMsg", '{"accountUuid": "${this.dbData.common.currProject.linkedAccountUuid}"}')
      put("billing", tmp)
      `

        if (this.allZone) {
          script += `
          def vm = [:]
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state!=Destroyed")
          vm.total = tmp.total
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state=Running")
          vm.running = tmp.total
          put("vm", ["total": vm.total, "running": vm.running])

          tmp = query("QueryL3Network l2Network.cluster.type!=vmware system=false category=Public replyWithCount=true")
          put("l3PublicNetwork", ["total": tmp.total])

          def publicUuidList = tmp.result.collect { it.uuid }
          if (publicUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + publicUuidList.join('","') + '"]}')
            put("publicIpCapacity", tmp)
          } else {
            put("publicIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0]])
          }

          tmp = query("QueryL3Network l2Network.cluster.type!=vmware type!=L3VpcNetwork system=false category=Private replyWithCount=true fields=uuid")
          put("l3PrivateNetwork", ["total": tmp.total])

          def privateUuidList = tmp.result.collect { it.uuid }
          if (privateUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + privateUuidList.join('","') + '"]}')
            put("privateIpCapacity", tmp)
          } else {
            put("privateIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0]])
          }

          tmp = query("QueryVirtualRouterVm applianceVmType?=vrouter,VirtualRouter count=true status=Connected")
          tmpEnable = query("QueryVirtualRouterVm applianceVmType?=vrouter,VirtualRouter count=true status=Connected state=Running")
          put("virtualRouterVm", ["total": tmp.total, "enable": tmpEnable.total])

          tmp = query("QuerySecurityGroup count=true")
          put("securityGroup", ["total": tmp.total])

          tmp = query("QueryVirtualRouterVm applianceVmType=vpcvrouter count=true status=Connected")
          tmpEnable = query("QueryVirtualRouterVm applianceVmType=vpcvrouter count=true state=Running status=Connected")
          put("vpcVRouter", ["total": tmp.total, "enable": tmpEnable.total])

          tmp = query("QueryL3Network l2Network.cluster.type!=vmware type=L3VpcNetwork count=true")
          put("vpcNetwork", ["total": tmp.total])

          tmp = zql("count vminstance where ((hostUuid is null and lastHostUuid is not null) or (hostUuid is not null and lastHostUuid is null) or (hostUuid is not null and lastHostUuid is not null)) and hypervisorType='ESX' and type='UserVM' and state not in ('Destroyed')")

          tmpEnable = zql("count vminstance where ((hostUuid is not null and state != 'Starting') or (hostUuid is not null and state = 'Starting') or (hostUuid is null and state != 'Starting')) and hypervisorType='ESX' and type='UserVM' and state not in ('Stopped', 'Destroying', 'Destroyed', 'Created')")
          put("vcenterVM", ["total": tmp, "enable": tmpEnable])
        `
        } else {
          script += `
          def vm = [:]
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state!=Destroyed zoneUuid=${this.currentZone}")
          vm.total = tmp.total
          tmp = query("QueryVmInstance type=UserVm hypervisorType=KVM count=true state=Running zoneUuid=${this.currentZone}")
          vm.running = tmp.total
          put("vm", ["total": vm.total, "running": vm.running])

          tmp = query("QueryL3Network l2Network.cluster.type!=vmware system=false category=Public replyWithCount=true zoneUuid=${this.currentZone}")
          put("l3PublicNetwork", ["total": tmp.total])

          def publicUuidList = tmp.result.collect { it.uuid }
          if (publicUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + publicUuidList.join('","') + '"]}')
            put("publicIpCapacity", tmp)
          } else {
            put("publicIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0]])
          }

          tmp = query("QueryL3Network l2Network.cluster.type!=vmware type!=L3VpcNetwork system=false category=Private replyWithCount=true fields=uuid zoneUuid=${this.currentZone}")
          put("l3PrivateNetwork", ["total": tmp.total])

          def privateUuidList = tmp.result.collect { it.uuid }
          if (privateUuidList.size() > 0) {
            tmp = call("org.zstack.header.network.l3.APIGetIpAddressCapacityMsg", '{"l3NetworkUuids": ["' + privateUuidList.join('","') + '"]}')
            put("privateIpCapacity", tmp)
          } else {
            put("privateIpCapacity", ["result": ["totalCapacity": 0, "availableCapacity": 0]])
          }

          tmp = query("QueryVirtualRouterVm applianceVmType?=vrouter,VirtualRouter count=true status=Connected  zoneUuid=${this.currentZone}")
          tmpEnable = query("QueryVirtualRouterVm applianceVmType?=vrouter,VirtualRouter count=true status=Connected state=Running  zoneUuid=${this.currentZone}")
          put("virtualRouterVm", ["total": tmp.total, "enable": tmpEnable.total])

          tmp = query("QuerySecurityGroup count=true")
          def tmpOther = query("QuerySecurityGroup count=true l3Network.zoneUuid!=${this.currentZone}")
          put("securityGroup", ["total": tmp.total - tmpOther.total])

          tmp = query("QueryVirtualRouterVm applianceVmType=vpcvrouter count=true status=Connected zoneUuid=${this.currentZone}")
          tmpEnable = query("QueryVirtualRouterVm applianceVmType=vpcvrouter count=true state=Running status=Connected zoneUuid=${this.currentZone}")
          put("vpcVRouter", ["total": tmp.total, "enable": tmpEnable.total])


          tmp = query("QueryL3Network l2Network.cluster.type!=vmware type=L3VpcNetwork count=true zoneUuid=${this.currentZone}")
          put("vpcNetwork", ["total": tmp.total])

          tmp = query("QueryVmInstance hypervisorType=ESX type=UserVM count=true state!?=Destroyed,Destroying zoneUuid=${this.currentZone}")
          tmpEnable = query("QueryVmInstance hypervisorType=ESX type=UserVM count=true state!?=Starting,Stopped,Destroyed,Created,Destroying zoneUuid=${this.currentZone}")
          put("vcenterVM", ["total": tmp.total, "enable": tmpEnable.total])
        `
        }

        // let script2 = `tmp = query("QueryIAM2VirtualID projects.uuid=${this.dbData.common.currProject.uuid} count=true")
        // put("memberNum", ["total": tmp.total])

        // tmp = query("QueryIAM2VirtualID projects.uuid=${this.dbData.common.currProject.uuid} fields=name attributes.name=__ProjectAdmin__")
        // put("projectAdmin", ["name": tmp])
        // `
        rpc.query(`iam2/virtual-ids`, {
          q: [`projects.uuid=${this.dbData.common.currProject.uuid}`],
          replyWithCount: true
        }).then(resp => {
          if (resp.inventories.length > 0) {
            let name = ''
            resp.inventories.forEach((item) => {
              item.attributes.forEach((it) => {
                if (it.name === '__ProjectAdmin__' && it.value === this.dbData.common.currProject.uuid) {
                  item.attributes.forEach((it) => {
                    if (it.name === 'fullname') name = it.value
                  })
                }
              })
            })
            self.projectAdmin = {
              role: this.dbData.common.currProject.userRole,
              projectAdmin: name,
              memberNum: resp.total,
              projectCreateDate: localStorage.getItem('projectCreateDate'),
              projectExpiredDate: localStorage.getItem('projectExpiredDate')
            }
          }
        })

        rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          // self.projectAdmin = {
          //   role: this.dbData.common.currProject.userRole,
          //   projectAdmin: resp.result.projectAdmin.name.result.length > 0 ? resp.result.projectAdmin.name.result[0].name : 'noname',
          //   memberNum: resp.result.memberNum.total,
          //   projectCreateDate: localStorage.getItem('projectCreateDate'),
          //   projectExpiredDate: localStorage.getItem('projectExpiredDate')
          // }

          let spending = resp.result.billing.result.spending
          spending = self.getBillings(spending)
          spending.total = resp.result.billing.result.total
          self.projectBilling = spending

          resp.result.usages.forEach(it => {
            let name = it.name
            delete it.name
            self.usages[name] = it
          })
          self.cpuCapacity = {
            title: 'cpu',
            availableCapacity: self.decimalsFormatter(self.usages['vm.cpuNum'].used),
            totalCapacity: self.decimalsFormatter(self.usages['vm.cpuNum'].total),
            ratio: self.usages['vm.cpuNum'].used / self.usages['vm.cpuNum'].total * 100,
            isTwoColume: true
          }

          self.memoryCapacity = {
            title: 'memory',
            availableCapacity: self.bytesToSize(self.usages['vm.memorySize'].used),
            totalCapacity: self.bytesToSize(self.usages['vm.memorySize'].total),
            ratio: self.usages['vm.memorySize'].used / self.usages['vm.memorySize'].total * 100,
            isTwoColume: true
          }

          self.volumeCapacity = {
            title: 'volumeCapacity',
            availableCapacity: self.bytesToSize(self.usages['volume.capacity'].used),
            totalCapacity: self.bytesToSize(self.usages['volume.capacity'].total),
            ratio: self.usages['volume.capacity'].used / self.usages['volume.capacity'].total * 100,
            isTwoColume: true
          }

          self.imageSize = {
            title: 'imageSize',
            availableCapacity: self.bytesToSize(self.usages['image.size'].used),
            totalCapacity: self.bytesToSize(self.usages['image.size'].total),
            ratio: self.usages['image.size'].used / self.usages['image.size'].total * 100,
            isTwoColume: true
          }

          self.publicIpCapacity = {
            title: 'publicIpCapacity',
            availableCapacity: resp.result.publicIpCapacity.result.totalCapacity - resp.result.publicIpCapacity.result.availableCapacity,
            totalCapacity: resp.result.publicIpCapacity.result.totalCapacity,
            ratio: 100 - resp.result.publicIpCapacity.result.availableCapacity / resp.result.publicIpCapacity.result.totalCapacity * 100,
            isTwoColume: true
          }

          self.privateIpCapacity = {
            title: 'privateIpCapacity',
            availableCapacity: resp.result.privateIpCapacity.result.totalCapacity - resp.result.privateIpCapacity.result.availableCapacity,
            totalCapacity: resp.result.privateIpCapacity.result.totalCapacity,
            ratio: 100 - resp.result.privateIpCapacity.result.availableCapacity / resp.result.privateIpCapacity.result.totalCapacity * 100,
            isTwoColume: true
          }

          self.storage = {
            dataList: [
              { name: 'volume', ...self.usages['volume.data.num'] },
              { name: 'image', ...self.usages['image.num'] },
              { name: 'snapshot', ...self.usages['snapshot.volume.num'] }
            ],
            isLeft: true,
            title: 'storage'
          }

          self.networks = {
            dataList: [
              { name: 'publickNetwork', ...resp.result.l3PublicNetwork },
              { name: 'privateNetwork', ...resp.result.l3PrivateNetwork },
              { name: 'vpcNetwork', ...resp.result.vpcNetwork },
              { name: 'vpcVRouter', ...resp.result.vpcVRouter },
              { name: 'securityGroup', ...self.usages['securityGroup.num'] },
              // { name: 'virtualRouterVm', ...resp.result.virtualRouterVm },
              { name: 'vip', ...self.usages['vip.num'] },
              { name: 'eip', ...self.usages['eip.num'] },
              { name: 'portFrowarding', ...self.usages['portForwarding.num'] },
              { name: 'loadBalancer', ...self.usages['loadBalancer.num'] }
            ],
            isLeft: false,
            title: 'network'
          }

          self.platform = {
            dataList: [],
            isLeft: false,
            title: 'platform'
          }

          if (!self.isUser) {
            self.platform.dataList.push({ name: 'usergroup', ...resp.result.usergroup })
            self.platform.dataList.push({ name: 'user', ...resp.result.user })
          }

          self.platform.dataList.push({ name: 'schedulerTrigger', ...self.usages['scheduler.trigger.num'] })
          self.platform.dataList.push({ name: 'scheduler', ...self.usages['scheduler.num'] })
          self.vm = {
            title: 'vm',
            ...self.usages['vm.totalNum'],
            running: self.usages['vm.num'].used,
            runningTotal: self.usages['vm.num'].total,
            vcenterVM: resp.result.vcenterVM.total[0].total,
            vcenterVmRunning: resp.result.vcenterVM.enable[0].total
          }
        })
      },
      getBillings: function (billing) {
        let item = {}
        billing.forEach((billingItem) => {
          if (billingItem.spendingType === 'rootVolume') {
            item.rootVolume = billingItem.spending
          }
          if (billingItem.spendingType === 'VM') {
            let itemWithCPU = billingItem.details.filter(itemdetails => _.has(itemdetails, 'cpuInventory'))
            itemWithCPU.forEach(itemdetails => {
              itemdetails.cpuSpending = _.sum(itemdetails.cpuInventory.map((item) => item.spending))
            })
            item.cpu = _.sum(itemWithCPU.map((item) => item.cpuSpending))
            let itemWithMemory = billingItem.details.filter(itemdetails => _.has(itemdetails, 'memoryInventory'))
            itemWithMemory.forEach(itemdetails => {
              itemdetails.memorySpending = _.sum(itemdetails.memoryInventory.map((item) => item.spending))
            })
            item.memory = _.sum(itemWithMemory.map((item) => item.memorySpending))
          }
          if (billingItem.spendingType === 'dataVolume') {
            item.dataVolume = billingItem.spending
          }
          if (billingItem.spendingType === 'gpu') {
            item.gpuDevice = billingItem.spending
          }
        })
        return item
      },
      ...Utils
    }
  }
</script>

<style scoped>

  .home-header {
    width: 100%;
    height: 60px;
    color: #5E6978;
  }

  .home-header span {
    font-size: 14px;
    line-height: 60px;
    display: inline-block;
    width: 90px;
    text-align: center;
    margin-right: 20px;
    cursor: pointer;
  }

  @media (max-width: 1280px) {

    .home-header span {
      font-size: 12px;
    }

  }

  .home-header span:hover {
    color: #3C73B9;
  }

  .normal {
    height: 100%;
    width: 100%;
    margin-top: 20px;
  }



  .home-body {
    background-color: #f0f4f9;
    width: calc(100% + 20px);
    height: 100%;
    padding: 0 60px 0 40px;
    position: absolute;
    overflow-y: auto;
    overflow-x: hidden;
    top: 0;
    left: 0;
    right: -20px;
  }

  .high-light-line {
    width: 89px;
    height: 2px;
    top: 50px;
    background-color: #3C73B9;
    position: absolute;
    transition: left 0.2s;
    left: 40px;
  }

  .high-light-line.is-allZone {
    left: 150px;
  }

  .left-item .line-list-for-project {
    width: 100;
    height: 170px;
    margin-bottom: 20px;
    box-shadow: 0 1px 6px 0 #EEF5FF;
    border-radius: 4px;
  }


  .select-item {
    color: #3C73B9;
  }

  .normal .flex-body {
    display: flex;
    width: 100%;
    height: 100%;
    padding-top: 40px;
  }

  .normal .left-item {
    flex: 7 7 auto;
    width: 0;
  }

  .normal .center-item {
    flex: 12 12 auto;
    width: 0;
  }

  .normal .right-item {
    flex: 6 6 auto;
    width: 0;
    padding-left: 20px;
  }

  .normal .left-item .bar-ratio {
    height: 240px;
    width: 100%;
    background-color: #ffffff;
    box-shadow: 0 0 4px 0 rgba(238,245,255,0.70);
    margin-bottom: 20px;
  }

  .normal .left-item .system-time {
    width: 100%;
    height: 240px;
    box-shadow: 0 0 4px 0 rgba(238,245,255,0.70);
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .left-item .project-user {
    width: 100%;
    height: 500px;
    box-shadow: 0 0 4px 0 rgba(238,245,255,0.70);
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .normal .left-item .bar-ratio-list {
    height: 384px;
    width: 100%;
    background: #FFFFFF;
    box-shadow: 0 1px 6px 0 #EEF5FF;
    border-radius: 4px;
  }

  .normal .center-item .item {
    display: flex;
    width: 100%;
    height: 240px;
    margin-bottom: 20px;
  }

  .normal .center-item .circle-ratio {
    flex: 1 1 auto;
    background-color: #ffffff;
    margin-left: 20px;
    box-shadow: 0 1px 6px 0 #EEF5FF;
    border-radius: 4px;
  }

  .normal .center-item .bar-ratio-list {
    width: calc(100% - 20px);
    height: 384px;
    background: #ffffff;
    margin-left: 20px;
    margin-bottom: 30px;
    box-shadow: 0 1px 6px 0 #EEF5FF;
    border-radius: 4px;
  }

  .normal .right-item .circle-ratio {
    width: 100%;
    height: 240px;
    margin-bottom: 20px;
    background: #ffffff;
    box-shadow: 0 1px 6px 0 #EEF5FF;
    border-radius: 4px;
  }

  .normal .right-item .bar-ratio-list {
    width: 100%;
    height: 384px;
    background: #fff;
    margin-bottom: 30px;
    box-shadow: 0 1px 6px 0 #EEF5FF;
    border-radius: 4px;
  }

  .container {
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>

