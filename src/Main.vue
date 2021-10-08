<style scoped lang="less">
  @import './style/main';
</style>
<template>
  <div :class="prefixCls" style="height: 100%;">
    <div :class="`${prefixCls}-top`">
      <div :class="`${prefixCls}-logo`" @click="$router.push({name: 'home'})"></div>
      <top-menu :menuList="menuTopList"></top-menu>
      <ul :class="`${prefixCls}-top-right`">
        <li>
          <el-dropdown v-if="zoneList.length >= 0 && !dbData.common.currProject" class="header-zone"
                       style="float: left;" @click="zoneList.length > 0 ">
            <div>
              <i class="icon-winfo-icon-quyusaomiao" style="font-size: 25px; color: #fff;vertical-align:  middle;"></i>
              <span v-if="zoneList.length > 0" class="text" :title="getZoneName()">{{getZoneName()}}
              <i class="el-icon-arrow-down el-icon--right"></i></span>
              <span v-else class="text disabled-text">{{ $t("common.noZone") }}</span>
            </div>
            <el-dropdown-menu style="margin-top:0px;">
              <el-dropdown-item :title="it.name" v-for="(it, index) in zoneList" :key="index" @click.native="switchZone(it)">{{
                it.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>
        <li @click="openOverview()">
          <i class="icon-computer computer"></i>
        </li >
        <li>
          <alarm-log></alarm-log>
        </li>
        <li>
          <notification-message></notification-message>
        </li>
        <li>
          <i class="icon-bangzhu helper"></i>
        </li>
        <li>
          <el-dropdown @command="handleClick" placement="bottom-start">
            <div class="user_icon">
              <i class="icon-yonghu" style="color: #fff;"></i>
            </div>
            <el-dropdown-menu slot="dropdown" style="margin-top:10px;">
              <el-dropdown-item>
                {{identityName}}
              </el-dropdown-item>
              <el-dropdown-item command="modifyPassword">修改密码</el-dropdown-item>
              <el-dropdown-item command="about" v-if="isAdmin" @click.native="$router.push('/main/ecs/about')">关于</el-dropdown-item>
              <el-dropdown-item command="layout">登出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>
      </ul>
    </div>
    <modify-password-dlg :model="showModifyPswDlg" @setDisVisiable="()=>showModifyPswDlg = false"></modify-password-dlg>
    <router-view></router-view>
    <toast-manager/>
    <dialog-manager/>
    <assistant-manager/>
    <help-tool-tip></help-tool-tip>
    <capability-tool-tip></capability-tool-tip>
    <div class="expired-tips" v-if="showExpiredTips">
      <i class="el-icon-close" @click="showExpiredTips = false;"
         style="position: absolute;right: 10px;font-size: 16px;"
      ></i>
      <a @click="$router.push({name:'about'})" style="cursor: pointer;">版本已过期请前往关于页面查看详情</a>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import TopMenu from './component/menu/TopMenu';
  import menuList from './component/menu/menuList/index.js';
  import AlarmLog from './main-component/AlarmLog';
  import notificationMessage from './main-component/NotificationMessage';
  import Root from 'src/windows/Root';
  import Utils, {bytesToSize, formatDatetime} from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import ZWatchEndpointMethods from 'src/om/zwatchEndPoint/Methods';
  import ToastManager from './main-component/ToastManager';
  import HelpToolTip from './component/HeplerToolTip';
  import HelpTrigger from "./component/HelperTrigger";
  import PermissionDirective from 'src/directives/Permissions';
  import DetailName from 'src/component/Detail/Name';
  import DropDown from 'src/component/DropDown';
  import DetailDescription from 'src/component/Detail/Description';
  import TagListForDetail from 'src/component/TagListForDetail';
  import DetailSizeEditor from 'src/component/Detail/SizeEditor';
  import DetailTimeEditor from 'src/component/Detail/TimeEditor';
  import DetailDropdown from 'src/component/Detail/Dropdown';
  import DetailSwitch from 'src/component/Detail/Switch';
  import DetailRow from 'src/component/Detail/RowContent';
  import DetailRowList from 'src/component/Detail/RowList';
  import BaseIcon from 'src/component/BaseIcon';
  import DialogManager from 'src/dialog/Manager';
  import rpc from './utils/rpc.js';
  import ModifyPasswordDlg from "./dialog/ModifyPasswordDlg";
  import CapabilityToolTip from "./component/CapabilityTip";
  import DetailInput from 'src/component/Detail/Input';
  import AssistantManager from 'src/windows/Assistant/Manager';
  import Table from 'src/component/Table';
  import RowInputEditor from'src/component/Detail/RowInputEditor';
  import AlarmToast from './main-component/AlaramToast';
  import TimerManager from 'src/windows/GlobalTimer/Manager';
  import Input from 'src/component/Input';
  import _ from 'lodash';

  Vue.component('dialog-manager', DialogManager);
  Vue.component('base-icon', BaseIcon);
  Vue.component('detail-row-list', DetailRowList);
  Vue.component('detail-row', DetailRow);
  Vue.component('detail-switch', DetailSwitch);
  Vue.component('detail-dropdown', DetailDropdown);
  Vue.component('detail-size-editor',DetailSizeEditor);
  Vue.component('detail-name', DetailName);
  Vue.component('detail-description', DetailDescription);
  Vue.component('detail-time-editor', DetailTimeEditor);
  Vue.component('tag-list-for-detail', TagListForDetail);
  Vue.directive('permission', PermissionDirective);
  Vue.component('help-tooltip', HelpToolTip);
  Vue.component('help-trigger', HelpTrigger);
  Vue.component('drop-down', DropDown);
  Vue.component('detail-input', DetailInput);
  Vue.filter('bytesToSize', bytesToSize);
  Vue.filter('formatDatetime', formatDatetime);
  Vue.component('mh-table', Table);
  Vue.component('row-input-editor', RowInputEditor);
  Vue.component('mh-input', Input);

  const prefixCls = "main";
  //入口文件
  export default {
    name: "MainPage",
    mixins: [Root, WindowBase, AlarmToast, TimerManager],
    components: {
      CapabilityToolTip,
      HelpToolTip,
      ToastManager,
      ModifyPasswordDlg,
      TopMenu,
      AlarmLog,
      notificationMessage,
      'assistant-manager': AssistantManager,
    },
    data() {
      return {
        menuTopList: menuList.topMenuList,
        prefixCls: prefixCls,
        params: {},
        currZoneUuid: '',
        identityName: '',
        showModifyPswDlg: false,
        isAdmin: false,
        showExpiredTips: false
      }
    },

    methods: {
      ...Utils,
      ...{
        getSystemEndpoint: ZWatchEndpointMethods.methods.getSystemEndpoint
      },
      //打开大屏监控
      openOverview(){
        window.open('/#/overview')
      },
      //登出
      layout() {
        let self = this;
        rpc._delete(`accounts/sessions/${localStorage.getItem('sessionUuid')}`);
        localStorage.removeItem('sessionUuid');
        this.$router.push('/login');
      },

      handleClick(e) {
        switch (e) {
          //跳转到关于
          case 'about':
            break;
          case 'modifyPassword':
            //打开修改密码框
            this.openModifyPassword();
            break;
            //登出
          case 'layout':
            this.layout();
            break;
        }
      },
      //查询项目角色
      queryProjects() {
        const self = this;
        rpc.query('/iam2/virtual-ids/projects').then((resp) => {
          self.projects = resp.inventories.sort((a, b) => {
            if (!a.name && b.name) return -1;
            if (a.name && !b.name) return 1;
            if (!a.name && !b.name) return 0;
            return a.name.localeCompare(b.name)
          });
          self.projects = self.projects.filter(project => project.state === 'Enabled');
          self.projects.forEach((project) => {
            project.projectRole = 'normal'
          });
          rpc.query('iam2/virtual-ids/' + window.localStorage.getItem('userUuid'))
            .then((virtualIDresp) => {
              for (let attribute of virtualIDresp.inventories[0].attributes) {
                if (attribute.name === '__ProjectOperator__') {
                  let projects = _.cloneDeep(self.projects);
                  projects.forEach((project) => {
                    if (project.uuid === attribute.value) project.projectRole = 'projectOperator'
                  });
                  self.projects = projects
                }
                if (attribute.name === '__ProjectAdmin__') {
                  let projects = _.cloneDeep(self.projects);
                  projects.forEach((project) => {
                    if (project.uuid === attribute.value) project.projectRole = 'projectAdmin'
                  });
                  self.projects = projects
                }
              }
              self.updateDbTable({
                tableName: 'iam2project',
                list: self.projects
              })
            }, () => {
              let projects = _.cloneDeep(self.projects);
              projects.forEach((project) => {
                project.projectRole = 'unknown'
              });
              self.projects = projects;
              self.updateDbTable({
                tableName: 'iam2project',
                list: projects
              })
            })
        })
      },
      //获得licenses过期时间信息
      getLicenseExpiredInfo: function (licenseList) {
        const self = this;
        let licenseInfo = {
          'expiredNum': 0,
          'willBeExpiredNum': 0,
          'masterLicense': [],
          'addonLicense': []
        };
        if (!Array.isArray(licenseList)) {
          licenseList = [licenseList]
        } else if (licenseList.length <= 0) {
          return licenseInfo
        }
        let dayDifference = 0;
        licenseList.forEach(function (item) {
          ((item) => {
            dayDifference = 0;
            dayDifference = self.getWillBeExpiredLicenseDayDifference(item.expiredDate, self.currTimeMillion);
            item.dayDifference = dayDifference;
            if (dayDifference > 0 && dayDifference <= 15) {
              licenseInfo.willBeExpiredNum++;
              if (item.licenseType === 'AddOn') {
                licenseInfo.addonLicense.push(item)
              } else {
                licenseInfo.masterLicense.push(item)
              }
            } else if (dayDifference <= 0) {
              licenseInfo.expiredNum++;
              if (item.licenseType === 'AddOn') {
                licenseInfo.addonLicense.push(item)
              } else {
                licenseInfo.masterLicense.push(item)
              }
            }
          })(item)
        });
        return licenseInfo
      },
      //得到license过期时间
      getWillBeExpiredLicenseDayDifference: function (expiredDate, currTimeMillion) {
        let dayDifference = 0;
        let expiredMillionSeconds = new Date(expiredDate).getTime();
        dayDifference = Math.ceil((expiredMillionSeconds - currTimeMillion) / (1000 * 60 * 60 * 24));
        return dayDifference
      },
      //获得区域名称
      getZoneName: function () {
        if (this.currZoneUuid && this.dbData.zone[this.currZoneUuid]) {
          return this.dbData.zone[this.currZoneUuid].name
        } else {
          if (_.keys(this.dbData.zone).length > 0) {
            let newZoneUuid = _.keys(this.dbData.zone)[0];
            this.currZoneUuid = newZoneUuid;
            localStorage.setItem('currZoneUuid', newZoneUuid);
            return this.dbData.zone[newZoneUuid].name
          }
        }
        return ''
      },
      //计算帮助数量
      async queryAssignmentCount () {
        let currAccountUuid = window.localStorage.getItem('userUuid');
        if (this.isAdmin) {
          currAccountUuid = window.localStorage.getItem('accountUuid')
        }
        let queryStr = `count ticket where (currentFlowUuid is null and flowCollectionUuid in (query iam2ticketflow.collectionUuid where parentFlowUuid is null and approverUuid = '${currAccountUuid}') and status = 'Pending') or (currentFlowUuid in (query iam2ticketflow.parentFlowUuid where approverUuid = '${currAccountUuid}')) and status = 'IntermediateApproved'`;

        let resp = await rpc.query('zql', {
          zql: encodeURIComponent(queryStr)
        });
        this.updateDbObject({
          name: 'common',
          data: {
            pendingAssignmentCount: resp.results[0].total
          }
        })
      },
      //查询帮助
      queryLicenseAssistant() {
        const self = this;
        const license = self.dbData.common.license;
        const addonLicenses = self.dbData.common.addonLicenses;
        const licenseList = _.concat([license], addonLicenses);
        if (_.includes(['Trial'], _.get(self.dbData, ['common', 'license', 'licenseType']))) return;
        let licenseInfo = self.getLicenseExpiredInfo(licenseList);
        // let getAddonCompanyText = this.checkAddonCompanyLicense()

        // let text1 = self.$t('assistant.licenseExpiredInfoText1', {expired: licenseInfo.expiredNum})
        // let text2 = self.$t('assistant.licenseExpiredInfoText2', {willBeExpired: licenseInfo.willBeExpiredNum})
        // let text3 = self.$t('assistant.licenseExpiredInfoText3', {expired: licenseInfo.expiredNum, willBeExpired: licenseInfo.willBeExpiredNum})

        const actions = new Map([
          ['expired>=1,willBeExpired=0', () => {
            return self.$t('assistant.licenseExpiredInfoText1', {expired: licenseInfo.expiredNum})
          }],
          ['expired=0,willBeExpired>=1', () => {
            return self.$t('assistant.licenseExpiredInfoText2', {willBeExpired: licenseInfo.willBeExpiredNum})
          }],
          ['expired>=1,willBeExpired>=1', () => {
            return self.$t('assistant.licenseExpiredInfoText3', {
              expired: licenseInfo.expiredNum,
              willBeExpired: licenseInfo.willBeExpiredNum
            })
          }],
          ['expired=0,willBeExpired=0', () => {

          }]
        ]);

        function checkLicense(expiredNum, willBeExpiredNum) {
          expiredNum = expiredNum || 0;
          willBeExpiredNum = willBeExpiredNum || 0;
          let str = '';
          if (expiredNum >= 1 && willBeExpiredNum === 0) str = 'expired>=1,willBeExpired=0';
          else if (expiredNum === 0 && willBeExpiredNum >= 1) str = 'expired=0,willBeExpired>=1';
          else if (expiredNum >= 1 && willBeExpiredNum >= 1) str = 'expired>=1,willBeExpired>=1';
          else str = 'expired=0,willBeExpired=0';
          return str
        }

        function newAssistant(getContent) {
          let id = `assistant-${self.genUniqueId()}`;
          let params = {
            id,
            title: 'licenseTitle',
            getStyle: () => {
              return 'border-bottom: 1px solid #DAE0E6;'
            },
            getContent,
            getLicenseInfo: () => {
              return licenseInfo
            }
          };
          this.$notification.info({
            title: $t(`assistant.${params.title}`),
            message: params.getContent,
            showClose: false
          })
        }

        let getContent;

        let text = actions.get(checkLicense(licenseInfo.expiredNum, licenseInfo.willBeExpiredNum)).call(this);
        if (text === '' || text === undefined || text === null) return;
        getContent = () => {
          return actions.get(checkLicense(licenseInfo.expiredNum, licenseInfo.willBeExpiredNum)).call(this)
        };
        this.params.getContent = getContent;
      },
      //查询项目帮助
      queryProjectAssistant() {
        const self = this;

        function newAssistant(getContent) {
          let id = `assistant-${self.genUniqueId()}`;
          let params = {
            id,
            title: 'projectExpiredTitle',
            getContent
          };
          this.$notification.info({
            title: this.$t(`assistant.${params.title}`),
            message: params.getContent,
            showClose: false
          })
        }

        let getContent;
        let projectExpiredDate = this.browserLocalStorageGetItem('projectExpiredDate');
        let projectEcoveryStrategy = this.browserLocalStorageGetItem('projectEcoveryStrategy');
        if (projectExpiredDate === 'noLimit') {
          return
        }
        let expiredMillionSeconds = new Date(projectExpiredDate).getTime();
        let dayDifference = Math.ceil((expiredMillionSeconds - this.currTimeMillion) / (1000 * 60 * 60 * 24));
        let text = '';
        if (dayDifference === 1) {
          let hourLeft = Math.floor((expiredMillionSeconds - this.currTimeMillion) / (1000 * 60 * 60));
          text = () => {
            return self.$t('assistant.expiredProjectHourText', {
              strategy: self.$t(`iam2project.${projectEcoveryStrategy}`),
              hourCount: hourLeft
            })
          }
        }
        if (dayDifference <= 7 && dayDifference !== 1) {
          text = () => {
            return self.$t('assistant.expiredProjectDayText', {
              strategy: self.$t(`iam2project.${projectEcoveryStrategy}`),
              dayCount: dayDifference
            })
          }
        }
        if (text === '') return;
        getContent = () => {
          return self.$t(`assistant.expiredProjectText`, {text: text()})
        };
        this.$notification.info({
          title: "警告",
          message: getContent,
          showClose: false
        })
      },
      //选择区域，切换区域
      switchZone(item){
        if (item.uuid === this.currZoneUuid) return;
        this.currZoneUuid = item.uuid;
        localStorage.setItem('currZoneUuid', this.currZoneUuid);
        if (!this.windowData.currPageWindowId) return;
        let currWindowData = this.$store.state.windowManager.windows[this.windowData.currPageWindowId];
        let windowObj = {
          id: this.windowData.currPageWindowId,
          pageIndex: 1,
          currItemUuid: ''
        };
        rpc.query('backup-storage', {
          q: [
            `zone.uuid=${this.currZoneUuid}`,
            '__systemTag__!=remote',
            'state?=Enabled,Disabled',
            'status?=Connected,Disconnected',
            'type?=ImageStoreBackupStorage,Ceph,SftpBackupStorage'
          ]
        }).then(resp => {
          return this.updateDbTable({
            tableName: 'backupstorage',
            list: resp.inventories
          }).then(() => {
            return this.updateDbObject({
              name: 'common',
              data: {
                backupStorageInCurrentZoneUuidList: resp.inventories.map(it => it.uuid)
              }
            })
          })
        }).then(() => {
          this._updateWindow(windowObj).then(() => {
            let methods = currWindowData.methods;
            if (methods && methods.queryList) {
              methods.queryList()
            }
          })
        })
      },
      //修改密码弹框
      openModifyPassword(){
        let isPlatformAdmin = localStorage.getItem('isPlatformAdmin') === 'true';
        let isProjectLogin = localStorage.getItem('isProjectLogin') === 'true';
        if (isPlatformAdmin || isProjectLogin) {
          this.changeVirtualIDPassword();
          return
        }
        Promise.resolve(this.queryAccount()).then(()=>{
          if(this.dbData.account)
            this.queryIdentity();
        });
        this.showModifyPswDlg = true;
      },
      queryIdentity: function () {
        let loginType = localStorage.getItem('loginType');
        if (this.isAdmin) {
          let accountUuid = localStorage.getItem('accountUuid');
          rpc.query(`accounts/${accountUuid}`).then((resp) => {
            this.updateDbObject({
              name: 'identity',
              data: resp.inventories[0]
            })
          })
        } if (loginType === 'user') {
          let userUuid = localStorage.getItem('userUuid');
          rpc.query(`accounts/users/${userUuid}`).then((resp) => {
            this.updateDbObject({
              name: 'identity',
              data: resp.inventories[0]
            })
          })
        }
      },
      //查询账户
      queryAccount: function () {
        let accountUuid = localStorage.getItem('accountUuid');
        return rpc.query(`accounts/${accountUuid}`).then((resp) => {
          this.updateDbObject({
            name: 'account',
            data: resp.inventories[0]
          })
        })
      },
      //设置定时长任务
      triggerLongJobTimer () {
        const self = this
        return self.addTimerTask({
          id: self.$data.timerId,
          interval: 4,
          method: async () => {
            self.queryLongJobs()
           // self.queryLocalStorageMessage()
            await self.genActionProgresses()
          }
        })
      },
      //取消长任务
      cancelLongJobTimer () {
        return this.removeTimerTask(this.$data.timerId)
      },
    },
    created() {
      let self = this;
      this.isAdmin = localStorage.getItem('isAdmin') === 'true';
      // if (this.isAdmin) this.checkMonitor()
      let currProject = null;
      if (localStorage.getItem('isProjectLogin') === 'true') {
        currProject = {
          name: localStorage.getItem('currProjectName'),
          uuid: localStorage.getItem('currProjectUuid'),
          userRole: localStorage.getItem('userRole'),
          linkedAccountUuid: localStorage.getItem('accountUuid')
        };
        self.currProject = currProject;
        self.isInProject = true;
        self.queryProjects()
      }
      self.updateDbObject({
        name: 'common',
        data: {
          ...this.dbData.common,
          isAdmin: localStorage.getItem('isAdmin') === 'true',
          isPlatformAdmin: localStorage.getItem('isPlatformAdmin') === 'true',
          platformAdminRelatedZones: localStorage.getItem('isPlatformAdmin') === 'true' && localStorage.getItem('platformAdminRelatedZones') !== '' ? localStorage.getItem('platformAdminRelatedZones').split(',') : null,
          isNormalAccount: localStorage.getItem('isNormalAccount') === 'true',
          isUser: localStorage.getItem('isUser') === 'true',
          loginType: localStorage.getItem('loginType'),
          closeMap: true,
          backupStorageInCurrentZoneUuidList: [],
          currProject
        }
      });
      this.updateDbObject({
        name: 'job',
        data: {
          runningJobs: 0,
          longJobUuidList: [],
          isRunning: false,
          trigger: null,
          canceler: null
        }
      }).then(() => {
        return this.registerLongJobTask(this.triggerLongJobTimer, this.cancelLongJobTimer).then(() => {
          return this.triggerLongJobTask()
        })
      });
      this.currZoneUuid = localStorage.getItem('currZoneUuid');
      rpc.query('zones')
        .then((resp) => {
          if (resp.inventories.length === 0 && this.isAdmin && !this.dbData.common.isPlatformAdmin) {
            rpc.query('licenses').then((licenseResp) => {
              let isTrial = licenseResp.inventory.licenseType === 'Trial';
              return rpc.query('licenses/addons').then(resp => {
                if (licenseResp.inventory.licenseType === 'Community') {
                  // this.openDialog('TermPopupDlg', {}).then(dialogUuid => {
                  //   // for close dialog
                  //   let dialogList = _.cloneDeep(self.windowData.dialogList)
                  //   dialogList.push(dialogUuid)
                  //   self.updateWindow({ dialogList })
                  // })
                }
                let path = 'wizard';
                let hasBackupModlue = resp.addons.some(it => it.modules[0] === 'disaster-recovery' && !it.expired) || isTrial;
                if (hasBackupModlue) {
                  this.openDialog('ChooseWizardDlg', {
                    ok: way => {
                      path = way === 'zone' ? 'wizard' : 'dbbackupwizard'
                      if (licenseResp.inventory.expired) path = 'about'
                      this.$router.push({name: path});
                    }
                  })
                } else {
                  if (licenseResp.inventory.expired) path = 'about';
                   this.showExpiredTips = true;
                  this.$router.push({name: path});
                }
              })
            })
          } else {
            rpc.query('licenses').then(licenseResp => {
              if (licenseResp.inventory.expired && this.isAdmin) {
                this.showExpiredTips = true;
                this.$router.push({name: 'about'})
              }
            });
            this.forceUpdateDbTable({
              tableName: 'zone',
              list: resp.inventories
            }).then(() => {
              if (!self.currZoneUuid || !self.dbData.zone[this.currZoneUuid]) {
                if (this.zoneList[0]) {
                  this.currZoneUuid = this.zoneList[0].uuid;
                  localStorage.setItem('currZoneUuid', this.currZoneUuid)
                }
              }
              rpc.query('backup-storage', {
                q: [
                  `zone.uuid=${this.currZoneUuid}`,
                  '__systemTag__!=remote',
                  'state?=Enabled,Disabled',
                  'status?=Connected,Disconnected',
                  'type?=ImageStoreBackupStorage,Ceph,SftpBackupStorage'
                ]
              }).then(resp => {
                return this.updateDbTable({
                  tableName: 'backupstorage',
                  list: resp.inventories
                }).then(() => {
                  return this.updateDbObject({
                    name: 'common',
                    data: {
                      backupStorageInCurrentZoneUuidList: resp.inventories.map(it => it.uuid)
                    }
                  })
                })
              })
            })
          }
        });
      // this.queryAccount()
      if (localStorage.getItem('loginType') === 'account') {
        this.identityName = localStorage.getItem('accountName')
      } else if (localStorage.getItem('loginType') === 'user') {
        this.identityName = localStorage.getItem('userName')
      } else {
        this.identityName = localStorage.getItem('uidName')
      }

      let tasks = [];

      //查询用户权限
      if (localStorage.getItem('loginType') === 'user') {
        let apiPermissionTask = rpc.put('iam2/virtual-ids/api-permissions').then((resp) => {
          return this.updateDbObject({
            name: 'policy',
            data: resp.permissions
          })
        }, () => {
          return Promise.resolve()
        });
        tasks.push(apiPermissionTask)
      }

      // 查询总量
      Promise.all([
        ...tasks,
        rpc.put('management-nodes/actions', {
          'getCurrentTime': {}
        })
          .then((resp) => {
            this.currTimeMillion = resp.currentTime.MillionSeconds
          }),
        rpc.query('licenses/addons')
          .then((addonResp) => {
            let addonLicenses = addonResp.addons;
            return this.updateDbObject({
              name: 'common',
              data: {
                addonLicenses: addonLicenses
              }
            })
          }),
        rpc.query('licenses')
          .then((licenseResp) => {
            this.updateDbObject({
              name: 'common',
              data: {
                license: licenseResp.inventory
              }
            })
              .then(() => {
                return rpc.query('meta-data/opensource')
              })
              .then((opensourceResp) => {
                let isOpensource = false;
                if (opensourceResp.opensource || licenseResp.inventory.licenseType === 'Community') {
                  isOpensource = true
                }
                // NOTICE: create system endpoint for system topic.
                if (!isOpensource) {
                  this.getSystemEndpoint()
                }
                this.updateDbObject({
                  name: 'common',
                  data: {
                    isOpensource
                  }
                })
              })
          }),
        rpc.query('licenses/capabilities')
          .then((resp) => {
            this.updateDbObject({
              name: 'common',
              data: {
                capabilities: resp.capabilities
              }
            })
          })
      ]).then(() => {
        return this.updateDbObject({
          name: 'common',
          data: {
            isCapabilitiesReady: true
          }
        })
      }).then(() => {
        if (this.dbData.common.isAdmin && this.$route.fullPath.indexOf('about') === -1) {
          return this.queryLicenseAssistant()
        } else if (this.dbData.common.currProject) {
          return this.queryProjectAssistant()
        } else {
          return new Promise((resolve, reject) => {
            resolve()
          })
        }
      });

      rpc.query('global-configurations', {
        q: ['category=ha', 'name=enable']
      })
        .then((resp) => {
          this.updateDbObject({
            name: 'common',
            data: {
              haEnabled: resp.inventories[0].value === 'true'
            }
          })
        });

      rpc.query('global-configurations', {
        q: ['category=vm', 'name=numa']
      })
        .then((resp) => {
          this.updateDbObject({
            name: 'common',
            data: {
              numa: resp.inventories[0].value === 'true'
            }
          })
        });

      rpc.query('global-configurations', {
        q: ['category=localStoragePrimaryStorage', 'name=liveMigrationWithStorage.allow']
      })
        .then((resp) => {
          this.updateDbObject({
            name: 'common',
            data: {
              liveMigrate: resp.inventories[0].value === 'true'
            }
          })
        });

      rpc.query('global-configurations', {
        q: ['category=mevoco', 'name=vm.consoleMode']
      })
        .then((resp) => {
          this.updateDbObject({
            name: 'common',
            data: {
              spiceOn: resp.inventories[0].value === 'spice'
            }
          })
        });

      // this.clearEventLocalStorage()

      rpc.put('management-nodes/actions', {
        'getCurrentTime': {}
      })
        .then((resp) => {
          window.___currServerTimeMillionDvalue = resp.currentTime.MillionSeconds - Date.now()
        });

      let isRightLicense = this.getLicensePermission('LICENSE_EXTRA_COMPANY');
      if (isRightLicense) {
        this.queryAssignmentCount()
      }
    },
    computed: {
      //计算区域列表
      zoneList: function () {
        let list = _.values(this.dbData.zone);
        list.sort((a, b) => {
          if (!a.name && b.name) return -1;
          if (a.name && !b.name) return 1;
          if (!a.name && !b.name) return 0;
          return a.name.localeCompare(b.name)
        });
        return list
      },
    },
  }
</script>

