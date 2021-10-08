<template>
  <div style="height: 100%;overflow: auto;">
    <div :class="prefixCls">
      <div :class="`${prefixCls}-container`">
        <div :class="`${prefixCls}-basic`">
          <div :class="`${prefixCls}-buttons`">
            <span @click="reload()" class="el-icon-refresh"></span>
            <a @click="openReloadLicenseDlg()"
               style="cursor: pointer;margin-left:30px;">{{$t('about.reloadLicense')}}</a>
          </div>
          <el-row :gutter="20">
            <el-col :class="`${prefixCls}-basic-top`" :offset="0" :span="24">
              <el-col :class="`${prefixCls}-basic-top-left`" :gutter="6" :span="10">
                <div
                  :class="{ 'community': licenseType === 'community', 'enterprise': licenseType === 'prepaid', 'hybrid': licenseType === 'hybrid' || licenseType === 'hybridtrialext' }"
                  class="icon"></div>
                <div class="title">
                  <h4 class="basic_license_name" v-if="getLicenseTypeString() === 'about.enterprise'">
                    {{ $t(getLicenseTypeString()) + ' ' + $t(getVersion()) }}
                    <span
                      :class="{'valid': !dbData.common.license || !dbData.common.license.expired, 'expired': dbData.common.license && dbData.common.license.expired}"
                      class="basic_license_status">{{ dbData.common.license && $t(`about.LicenseExpired.${dbData.common.license.expired}`)}}</span>
                  </h4>
                  <h4 class="basic_license_name" v-else>
                    {{ $t(getLicenseTypeString()) }}
                    <span
                      :class="{'valid': !dbData.common.license || !dbData.common.license.expired, 'expired': dbData.common.license && dbData.common.license.expired}"
                      class="basic_license_status">{{ dbData.common.license && $t(`about.LicenseExpired.${dbData.common.license.expired}`)}}</span>
                  </h4>
                </div>
                <ul class="details">
                  <li class="detail">
                   <span class="basic_license_detail-num">
                    {{ dbData.common.license && (normalizeLicenceType(dbData.common.license.licenseType) === 'community' ? $t('common.unlimited') : (dbData.common.license.hostNum !== undefined ? dbData.common.license.hostNum : dbData.common.license.cpuNum)) }}
                  </span>
                    <span class="basic_license_detail-title"
                          v-if="dbData.common.license && dbData.common.license.hostNum !== undefined">{{$t("about.licensedHosts")}}</span>
                    <span class="basic_license_detail-title"
                          v-if="dbData.common.license && dbData.common.license.hostNum === undefined">{{$t("about.licensedCPUs")}}</span>
                  </li>
                  <li class="detail">
                     <span class="basic_license_detail-num">
                    {{ dbData.common.license && (normalizeLicenceType(dbData.common.license.licenseType) === 'community' ? dbData.common.license.occupiedHostNum : (dbData.common.license.hostNum !== undefined ? dbData.common.license.occupiedHostNum : dbData.common.license.occupiedCpuNum)) }}
                  </span>
                    <span class="basic_license_detail-title"
                          v-if="dbData.common.license && dbData.common.license.hostNum !== undefined">{{$t("about.occupiedHosts")}}</span>
                    <span class="basic_license_detail-title"
                          v-if="dbData.common.license && dbData.common.license.hostNum === undefined">{{$t("about.occupiedCPUs")}}</span>
                  </li>
                  <li class="detail">
                    <span class="basic_license_detail-num">{{ windowData ? windowData.version : '' }}</span>
                    <span class="basic_license_detail-title">{{ $t("about.version") }}</span>
                  </li>
                </ul>
              </el-col>
              <el-col :class="`${prefixCls}-basic-top-right`" :gutter="6" :span="14">
                <ul class="details">
                  <li class="detail">
                    <el-col :span="12">
                      <el-col :span="8">
                        {{$t("about.authority")}}{{$t("common.colon")}}
                      </el-col>
                      <el-col :span="16"
                              v-if="dbData.common.license && dbData.common.license.licenseType === 'Trial' && dbData.common.license.user === '测试用户'">
                        {{ $t('about.testUser') }}
                      </el-col>
                      <el-col :span="16" v-else>
                        {{ dbData.common.license && dbData.common.license.user}}
                      </el-col>
                    </el-col>
                    <el-col :span="12">
                      <el-col :span="8">
                        {{$t("about.issuedDate")}}{{$t("common.colon")}}
                      </el-col>
                      <el-col :span="16">
                        {{ dbData.common.license && dbData.common.license.issuedDate && formatDatetime (new
                        Date(dbData.common.license.issuedDate)) }}
                      </el-col>
                    </el-col>
                  </li>
                  <li class="detail">
                    <el-col :span="12">
                      <el-col :span="8">
                        {{$t("about.requestKey")}}{{$t("common.colon")}}
                      </el-col>
                      <el-col :span="16">
                        <detail-long-content :value="dbData.common.license && dbData.common.license.licenseRequest"/>
                      </el-col>
                      <a @click="() => { copyText(dbData.common.license.licenseRequest) }"
                         style="cursor: pointer; margin-right: 10px;">
                        <img class="copy" src="~assets/copy.svg"/>
                      </a>
                      <a :href="`${getServerUrl()}/apiCall/downloadLicenseRequestCode`">
                        <img class="download" src="~assets/download.svg"/>
                      </a>
                    </el-col>
                    <el-col :span="12">
                      <el-col :span="8">
                        {{$t("about.expiredDate")}}{{$t("common.colon")}}
                      </el-col>
                      <el-col :span="16" v-if="dbData.common.license && !dbData.common.license.permanentEffective">
                        {{ dbData.common.license && dbData.common.license.expiredDate && formatDatetime(new
                        Date(dbData.common.license.expiredDate)) }}
                      </el-col>
                      <el-col :span="16" v-if="dbData.common.license && dbData.common.license.permanentEffective">
                        {{ $t('about.permanentEffective')}}
                      </el-col>
                    </el-col>
                  </li>
                  <p>{{$t("about.licenseIntroduce.text1")}}<a :href="`mailto:${$t('common.salesEmail')}`"
                                                              style="color: #3C73B9; text-decoration: none;">{{
                    $t('common.salesEmail') }}</a>{{$t("about.licenseIntroduce.text2")}}</p>
                </ul>
              </el-col>
            </el-col>
            <hr/>
            <el-col :offset="0" :span="24">
              <el-col :key="index" :span="8" class="item" v-for="(item, index) in introduceItems">
                <el-col :span="2" class="check_icon"><span class="el-icon-check"></span></el-col>
                <el-col :span="22">{{ $t(`about.${licenseType}Introduce.${item}`) }}</el-col>
              </el-col>
            </el-col>
          </el-row>
        </div>
        <div :class="`${prefixCls}-content`">
          <el-row>
            <el-col :key="index" :span="5" :style="{'margin-right': (index+1)%3 ? '20px' : '0px'}" class="module"
                    v-for="(module, index) in addonLicenses">
              <a @click="deleteLicense(module)" class="delete_module"
                 v-if="!dbData.common.isPlatformAdmin && !module.disable && dbData.common.license && dbData.common.license.licenseType !== 'Trial'">
                <i class="el-icon-delete"></i>
              </a>
              <el-col :span="24">
                <h4 class="module_title-name">
                  {{ $t(`about.${module.modules[0]}`) }} {{ (dbData.common.license &&
                  dbData.common.license.licenseType === 'Trial') ? $t('about.One-Host-Trial') : void 0 }}
                  <div
                    :class="{'valid': module.expired === false, 'expired': module.expired === true, 'undefined': module.expired === undefined}"
                    class="module_title-status">
                    {{ $t(`about.expired.${module.expired}`)}}
                  </div>
                </h4>
                <div class="module_title-intro">
                  {{ $t(`about.introduction.${module.modules[0]}`) }}
                </div>
                <div class="vmware-capacity"
                     v-if="module.modules[0] === 'vmware' && dbData.common.license && dbData.common.license.licenseType !== 'Trial'">
                  <div v-if="module.cpuNum">
                    <span>{{ $t('about.module.cpu1', {total: module.cpuNum}) }}</span>
                    <span
                      style="color: #5E6978;">{{ $t('about.module.cpu2', {occupied: module.occupiedCPUs}) }}</span>
                    <el-progress :percentage="(module.occupiedCPUs/module.cpuNum)*100" style="margin-top: -2px;"
                                 :width="260"></el-progress>
                  </div>
                  <div v-if="module.hostNum">
                    <span>{{ $t('about.module.host1', {total: module.hostNum}) }}</span>
                    <span
                      style="color: #5E6978;">{{ $t('about.module.host2', {occupied: module.occupiedHosts}) }}</span>
                    <el-progress :percentage="module.occupiedHosts/module.hostNum" :width="260"
                                 style="margin-top: -2px;"></el-progress>
                  </div>
                  <!-- <span>{{ $t('about.module.host'), {occupied: item.occupiedHosts, total: item.totalHosts} }}</span> -->
                </div>
                <div :class="{'trial-vmware-header': Vue.config.lang === 'en'}" class="vmware-capacity"
                     v-if="module.modules[0] === 'vmware' && dbData.common.license && dbData.common.license.licenseType === 'Trial'">
                  <div>
                    <span>{{ $t('about.module.host1', {total: 0}) }}</span>
                    <span style="color: #5E6978;">{{ $t('about.module.host2', {occupied: 0}) }}</span>
                    <el-progress :percentage="0" :width="260" style="margin-top: -2px;"/>
                  </div>
                  <!--<span>{{ $t('about.module.host'), {occupied: module.occupiedHosts, total: module.totalHosts} }}</span>-->
                </div>
                <div class="module_date">
                  <div :class="{'vmware_assign_date': module.modules[0] === 'vmware'}" class="module_assign_date">
                    <span class="item_name">{{$t("about.issuedDate")}}{{$t("common.colon")}}</span>
                    <span class="item_value">{{ module.issuedDate ? formatDatetime(new Date(module.issuedDate)) : $t("common.empty") }}</span>
                  </div>
                  <div :class="{'vmware_expired_date': module.modules[0] === 'vmware'}" class="module_expired_date">
                    <span class="item_name">{{$t("about.expiredDate")}}{{$t("common.colon")}}</span>
                    <span class="item_value" v-if="!module.permanentEffective">{{ module.expiredDate ? formatDatetime(new Date(module.expiredDate)) : $t("common.empty") }}</span>
                    <span class="item_value" v-else>{{ $t('about.permanentEffective')}}</span>
                  </div>
                </div>
              </el-col>
            </el-col>
            <el-col :span="5" class="module">
              <div style="position: absolute;top: 100px;left: 50px;">
                <div style="font-size: 18px;color: #3C73B9;line-height: 40px;">
                  {{ $t('about.moreModules') }}
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        <span class="about-bottom">
         <p class="about-bottom-warn">
          {{$t("about.copyrightInfo")}}
         </p>
      </span>
      </div>
    </div>
    <reload-license-dlg :message="managementNodesUuidList" :model="showReloadLicense" :param="{queryList: queryList}"
                        @setDisVisiable="()=>showReloadLicense = false"></reload-license-dlg>
  </div>
</template>

<script>
  import Vue from 'vue';
  import rpc from 'src/utils/rpc';
  import Utils from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import ReloadLicenseDlg from "../../dialog/ReloadLicenseDlg";
  import DetailLongContent from 'src/main-component/DetailLongContent';

  const prefixCls = "about_wrapper";
  export default {
    name: "AboutPage",
    components: {
      ReloadLicenseDlg,
      DetailLongContent
    },
    mixins: [WindowBase],
    created() {
      let self = this;
      self.queryList();
      self.getManagementNodes();
    },
    data() {
      return {
        prefixCls: prefixCls,
        showReloadLicense: false,
        community: ['text1', 'text2', 'text3', 'text4', 'text5', 'text6'],
        hybrid: ['text1', 'text2', 'text3', 'text4', 'text5', 'text6', 'text7'],
        hybridtrialext: ['text1', 'text2', 'text3', 'text4', 'text5', 'text6', 'text7'],
        prepaid: ['text1', 'text2', 'text3', 'text4', 'text5', 'text6'],
        Vue: Vue,
        managementNodesUuidList: [],
        addonLicensesSortTemple: ['vmware', 'project-management', 'disaster-recovery', 'baremetal', 'v2v'],
        addonLicensesTemple: {
          'vmware': {
            'disable': true,
            'licenseType': 'AddOn',
            'modules': [
              'vmware'
            ]
          },
          'project-management': {
            'disable': true,
            'licenseType': 'AddOn',
            'modules': [
              'project-management'
            ]
          },
          'disaster-recovery': {
            'disable': true,
            'licenseType': 'AddOn',
            'modules': [
              'disaster-recovery'
            ]
          },
          'baremetal': {
            'disable': true,
            'licenseType': 'AddOn',
            'modules': [
              'baremetal'
            ]
          },
          'v2v': {
            'disable': true,
            'licenseType': 'AddOn',
            'modules': [
              'v2v'
            ]
          }
        },
        addonLicenses: [
          {
            'disable': true,
            'licenseType': 'AddOn',
            'modules': [
              'vmware'
            ]
          },
          {
            'disable': true,
            'licenseType': 'AddOn',
            'modules': [
              'project-management'
            ]
          },
          {
            'disable': true,
            'licenseType': 'AddOn',
            'modules': [
              'disaster-recovery'
            ]
          },
          {
            'disable': true,
            'licenseType': 'AddOn',
            'modules': [
              'baremetal'
            ]
          }
        ]
      }
    },
    methods: {
      ...Utils,
      queryList: function () {
        let license = {}
        let addonLicenses
        let isOpensource = false
        return rpc.put('management-nodes/actions', {
          getVersion: {}
        }).then(resp => {
          return this.updateWindow({
            version: resp.version
          })
        }).then(() => {
          return rpc.query('licenses').then(resp => {
            license = resp.inventory
            license.permanentEffective = ((new Date(license.expiredDate)) - (new Date(license.issuedDate))) / (1000 * 3600 * 24) >= 3650 ? 'permanentEffective' : undefined
          })
        }).then(() => {
          return rpc.query('hosts').then(hostResp => {
            license.occupiedHostNum = hostResp.inventories.length
            let occupiedCpuNum = 0
            hostResp.inventories.forEach(host => {
              occupiedCpuNum += host.cpuSockets
            })
            license.occupiedCpuNum = occupiedCpuNum
          })
        }).then(() => {
          return rpc.query('meta-data/opensource')
        }).then(opensourceResp => {
          if (opensourceResp.opensource || license.licenseType === 'Community') {
            isOpensource = true
          }
          return Promise.resolve()
        }).then(() => {
          return rpc.query('licenses/addons').then(addonResp => {
            addonLicenses = addonResp.addons
            let cpuSockets = 0
            let esxHosts = 0
            let index = -1
            for (let i = 0; i < addonLicenses.length; i++) {
              if (addonLicenses[i].modules[0] === 'vmware') {
                index = i
              }
              addonLicenses[i].permanentEffective = ((new Date(addonLicenses[i].expiredDate)) - (new Date(addonLicenses[i].issuedDate))) / (1000 * 3600 * 24) >= 3650 ? 'permanentEffective' : undefined
            }
            if (index > -1) {
              return rpc.query('hosts', {q: 'hypervisorType=ESX'}).then(resp => {
                resp.inventories.forEach(host => {
                  cpuSockets = host.cpuSockets + cpuSockets
                  esxHosts++
                })
                let occupiedCPUs = Math.min(cpuSockets, addonLicenses[index].cpuNum || 0) // cpuNum undefined
                let occupiedHosts = Math.min(esxHosts, addonLicenses[index].hostNum || 0) // hostNum undefined
                license.occupiedCpuNum -= occupiedCPUs
                license.occupiedHostNum -= occupiedHosts
                addonLicenses[index].occupiedCPUs = occupiedCPUs
                addonLicenses[index].occupiedHosts = occupiedHosts
                return Promise.resolve()
              })
            } else {
              return Promise.resolve()
            }
          })
        }).then(() => {
          return this.updateDbObject({
            name: 'common',
            data: {
              addonLicenses: addonLicenses,
              isOpensource,
              license
            }
          }).then(() => {
            this.setAddonLicenses()
          })
        })
      },
      setAddonLicenses: function () {
        const self = this
        let SortTemple = []
        let addonLicenses = []
        let dbDataAddonLicenses = self.dbData.common.addonLicenses || []
        for (let i = 0; i < self.addonLicensesSortTemple.length; ++i) {
          for (let j = 0; j < dbDataAddonLicenses.length; ++j) {
            if (self.addonLicensesSortTemple[i] === dbDataAddonLicenses[j].modules[0]) {
              addonLicenses.push(dbDataAddonLicenses[j])
              SortTemple.push(self.addonLicensesSortTemple[i])
            }
          }
        }
        SortTemple = _.difference(self.addonLicensesSortTemple, SortTemple)
        let addonLicensesTemple = _.cloneDeep(self.addonLicensesTemple)
        if (SortTemple.length > 0) {
          SortTemple.forEach((item) => {
            if (self.dbData.common && self.dbData.common.license && self.dbData.common.license.licenseType === 'Trial') {
              addonLicensesTemple[item].disable = false
              addonLicensesTemple[item].expired = false
            }
            addonLicenses.push(addonLicensesTemple[item])
          })
        }
        self.addonLicenses = addonLicenses
        if (self.dbData.common && self.dbData.common.license && self.dbData.common.license.licenseType === 'Community') {
          self.addonLicenses.forEach(item => {
            item.disable = true
            item.expired = undefined
          })
        }
        return self.addonLicenses
      },
      getManagementNodes: function () {
        let self = this
        return rpc.query('management-nodes').then(resp => {
          let uuidList = resp.inventories.map(item => item.uuid)
          self.managementNodesUuidList = uuidList
          return self.updateDbTable({
            tableName: 'managementNode',
            list: resp.inventories
          })
        })
      },
      getModuleBg(moduleName) {
        let obj = {
          'project-management': 'bussiness_management',
          'disaster-recovery': 'disaster_backup',
          'vmware': 'vmware',
          'baremetal': 'baremetal',
          'v2v': 'v2v'
        }
        return obj[moduleName]
      },
      getDisableModuleBg(moduleName) {
        let obj = {
          'project-management': 'bussiness_management_d',
          'disaster-recovery': 'disaster_backup_d',
          'vmware': 'vmware_d',
          'baremetal': 'baremetal_d',
          'v2v': 'v2v_d'
        }
        return obj[moduleName]
      },
      getLicenseTypeString: function (type) {
        if (!this.dbData.common.license) return ''
        if (this.dbData.common.isOpensource) return 'about.community'
        if (this.dbData.common.license.licenseType === 'Trial') return 'about.enterprise'
        if (this.dbData.common.license.licenseType === 'TrialExt') return 'about.enterprise'
        if (this.dbData.common.license.licenseType === 'Prepaid') return 'about.enterprise'
        if (this.dbData.common.license.licenseType === 'OEM') return 'about.prepaid'
        if (this.dbData.common.license.licenseType === 'Paid') return 'about.enterprise'
        if (this.dbData.common.license.licenseType === 'Hybrid') return 'about.Hybrid'
        if (this.dbData.common.license.licenseType === 'HybridTrialExt') return 'about.HybridTrialExt'
      },
      getVersion() {
        if (!this.dbData.common.license) return ''
        if (this.dbData.common.license.licenseType === 'Trial') return 'about.trial'
        if (this.dbData.common.license.licenseType === 'TrialExt') return 'about.trialext'
        if (this.dbData.common.license.licenseType === 'Prepaid') return 'about.prepaid'
        if (this.dbData.common.license.licenseType === 'Paid') return 'about.prepaid'
      },
      reload: function () {
        let self = this
        let event = self.createEvent('about.action.reload')
        rpc.put('licenses/actions', {
          'reloadLicense': {}
        }, event)
          .then((resp) => {
            this.updateDbObject({
              name: 'licenses',
              data: resp.inventory
            })
            this.queryList()
            this.incEventSuccess(event)
            window.fetch(`${Utils.getServerUrl()}/apiCall/refreshLicense`)
          }, () => {
            this.incEventFail(event)
          })
      },
      openReloadLicenseDlg() {
        let self = this;
        self.getManagementNodes();
        self.showReloadLicense = true;
      },

      deleteLicense(item) {
        let uuid = item.uuid
        let managementNodeUuid = item.managementNodeUuid || undefined
        let name = this.getLicenseTypeString(item.licenseType)
        if (item.licenseType === 'AddOn') {
          name = `about.${item.modules[0]}`
        }
        this.openDialog('ConfirmDlg', {
          title: 'about.deleteLicense',
          description: this.$t('about.deleteLicenseConfirm', {name: name}),
          warning: 'about.deleteLicenseWarning',
          ok: () => {
            this._delete(uuid, name, managementNodeUuid).then(() => {
              this.queryList()
              window.fetch(`${Utils.getServerUrl()}/apiCall/refreshLicense`)
            })
          }
        })
      },
      //删除模块
      _delete: function (uuid, name, managementNodeUuid) {
      const self = this
      let managementNodeUuidList = Object.keys(this.dbData.managementNode)
      let tasks = []
      let p = null
      if (managementNodeUuid) {
        let event = self.createEvent('about.action.delete', this.$t(name))
        p = rpc._delete(`licenses/mn/${managementNodeUuid}/actions`, {
          uuid: uuid
        }, event)
        .then((resp) => {
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
        tasks.push(p)
      } else {
        let event = self.createEvent('about.action.delete', managementNodeUuidList.length === 1 ? this.$t(name) : '', managementNodeUuidList.length)
        managementNodeUuidList.forEach(function (mNUuid) {
          ((mNUuid) => {
            p = rpc._delete(`licenses/mn/${mNUuid}/actions`, {
              uuid: uuid
            }, event)
            .then((resp) => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
            tasks.push(p)
          })(mNUuid)
        })
      }
      return Promise.all(tasks)
      },
    },
    computed: {
      //计算方法计算是否为付费版或者混合云版
      licenseType() {
        let type = this.dbData.common.license && this.dbData.common.license.licenseType.toLowerCase()
        if (['paid', 'trialext', 'trial'].indexOf(type) > -1) type = 'prepaid'
        if (['hybrid', 'hybridtrialext'].indexOf(type) > -1) type = 'hybrid'
        return type
      },
      introduceItems() {
        return this.licenseType && this.$data[this.licenseType]
      }
    }
  }
</script>

<style scoped lang="less">
  @prefixCls: ~'about_wrapper';
  .@{prefixCls} {
    padding-top: 120px;

    &-container {
      margin: 0 auto;
      height: 100%;
      max-width: 1425px;

      .about-bottom {
        display: block;
        height: 60px;
        line-height: 60px;
        text-align: center;
      }
    }

    &-basic {
      background: hsla(0, 0%, 100%, .95);
      padding: 60px 6% 40px;
      position: relative;
      box-shadow: 1px 1px 1px rgba(224, 228, 233, .6), -1px -1px 1px rgba(224, 228, 233, .6);
      border-radius: 3px;
      margin-bottom: 20px;

      &-top {
        position: relative;
        height: 300px;
        width: 100%;
        border-bottom: 1px solid #dae0e6;
        padding: 0 24px 50px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        justify-content: space-around;

        &-left {
          .icon {
            width: 141px;
            height: 115px;
            margin: 0px auto;
          }

          .icon.community {
            background-image: url('~assets/sys_about_community.svg');
          }

          .icon.enterprise {
            background-image: url('~assets/sys_about_enterprise.svg');
          }

          .icon.hybrid {
            background-image: url('~assets/sys_about_hybrid.svg');
          }

          .title {
            position: relative;
            height: 30px;
            line-height: 30px;
            padding: 12px 0 44px;
            text-align: center;
          }

          .basic_license_name {
            font-size: 24px;
            font-weight: 500;
          }

          .basic_license_status.valid {
            height: 22px;
            line-height: 22px;
            text-align: center;
            border-radius: 22px;
            border: 1px solid #006eff;
            width: 49px;
            display: inline-block;
            color: #006eff;
          }

          .basic_license_status.expired {
            height: 22px;
            line-height: 22px;
            text-align: center;
            border-radius: 22px;
            border: 1px solid #f56c6c;
            width: 49px;
            display: inline-block;
            color: #f56c6c;
          }

          .details {
            width: 100%;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-pack: justify;
            -ms-flex-pack: justify;
            justify-content: space-between;

            .detail {
              list-style: none;

              .basic_license_detail-num {
                display: inline-block;
                width: 100%;
                text-align: center;
                font-size: 20px;
              }

              .basic_license_detail-title {
                display: inline-block;
                width: 100%;
                text-align: center;
                font-size: 12px;
              }
            }
          }
        }

        &-right {
          position: relative;
          height: 100%;
          overflow: hidden;

          .details {
            width: 100%;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-pack: justify;
            flex-direction: column;
            -ms-flex-pack: justify;
            justify-content: space-between;
            position: absolute;
            margin-bottom: 20px;
            bottom: 0;

            .detail {
              list-style: none;
              margin-bottom: 20px;
            }

            p {
              font-size: 12px;
            }
          }
        }
      }

      .item {
        margin-top: 20px;
      }
    }

    &-buttons {
      position: absolute;
      right: 40px;
      color: #409EFF;
      top: 30px;

      &:first-child {
        cursor: pointer;
      }
    }

    &-content {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .module {
      position: relative;
      width: calc((100% - 40px) / 3);
      height: 240px;
      border-radius: 4px;
      background-position: 50%;
      background-repeat: no-repeat;
      -webkit-box-shadow: 0 1px 10px rgba(224, 228, 233, .6);
      box-shadow: 0 1px 10px rgba(224, 228, 233, .6);
      padding: 30px 0 0 30px;
      margin-bottom: 20px;
      background: #fff;

      .module_title-name {
        margin: 10px 0px 10px 0px;
        font-size: 24px;
        font-weight: 500;
      }

      .module_title-status {
        display: inline-block;
        height: 22px;
        line-height: 22px;
        text-align: center;
        border-radius: 22px;
        width: 49px;
      }

      .module_title-status.valid {
        border: 1px solid #006eff;
        width: 49px;
        color: #006eff;
      }

      .module_title-status.expired {
        border: 1px solid #f56c6c;
        width: 49px;
        color: #f56c6c;
      }

      .module_title-intro {
        font-size: 12px;
      }

      .vmware-capacity {
        margin-top: 3px;
      }

      .module_date {
        position: absolute;
        bottom: 0;
        margin-bottom: 40px;
      }
    }
  }

  .delete_module{
    display: inline-block;
    position: absolute;
    right: 20px;
    top: 20px;
    width: 10px;
    height: 10px;
    color: #97A4B6;
    cursor: pointer;
    &:hover{
      color: #409EFF;
    }
  }
</style>
