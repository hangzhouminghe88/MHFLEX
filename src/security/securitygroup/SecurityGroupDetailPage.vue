<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">安全组详情</span>
      <span @click="$router.push({name:'securitygroup'})" class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到安全组列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t("securityGroup.actions")}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="common-start" style="padding-top: 12px;"
                           @click="!instates('Enabled') && detailEnableorDisabled('enabled')"
                           :class="{'disabled-text': instates('Enabled')}">{{ $t("common.enable") }}</a>
                        <a id="common-stop" @click="!instates('Disabled') && detailEnableorDisabled('disabled')"
                           :class="{'disabled-text': instates('Disabled')}">{{ $t("common.disable") }}</a>
                        <a id="securityGroup-attachl3network" v-permission="'SG_L3.ATTACH'"
                           @click="detailAttach(windowData.dataUuid)">{{$t("securityGroup.attachl3network")}}</a>
                        <a id="securityGroup-detachl3network" v-permission="'SG_L3.DETACH'"
                           @click="(dbData.securitygroup[windowData.dataUuid].attachedL3NetworkUuids.length > 0) && detailDetach(windowData.dataUuid)"
                           :class="{'disabled-text': dbData.securitygroup[windowData.dataUuid] && dbData.securitygroup[windowData.dataUuid].attachedL3NetworkUuids.length <= 0}">{{$t("securityGroup.detachl3network")}}</a>
                        <a id="common-destroy" style="padding-bottom:12px;" v-permission="'SG.DELETE'"
                           @click="deleteOneSecurityGroup(windowData.dataUuid)">{{$t("common.destroy")}}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
      >
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.rule')" name="rules"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.vmInstanceNic')" name="vmInstances"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.l3network')" name="l3network"
        ></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')" name="log"
        ></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
          <base-icon name="security_group_large"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state"
                               :state="dbData.securitygroup[windowData.dataUuid] && dbData.securitygroup[windowData.dataUuid].state"/>
          </div>
          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>

        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>

          <detail-row :param="{
                    title: $t('common.ipVersion'),
                    content: `IPv${dbData.securitygroup[windowData.dataUuid] && dbData.securitygroup[windowData.dataUuid].ipVersion}`
                  }"/>
          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: formatDatetime(new Date(dbData.securitygroup[windowData.dataUuid] && dbData.securitygroup[windowData.dataUuid].createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: formatDatetime(new Date(dbData.securitygroup[windowData.dataUuid] && dbData.securitygroup[windowData.dataUuid].lastOpDate))
                  }"/>
          <div class="detail-splitter"></div>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div id="common-moreInformation" class="detail-block-header">
          {{$t("common.moreInformation")}}
        </div>
        <detail-row :param="{
                title: 'common.uuid',
                content: windowData.dataUuid,
                copy: true
              }"/>

      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'rules'">
      <rule-tab-list
        :param="{uuid: `${windowData.dataUuid}`, conditions: `securityGroupUuid=${windowData.dataUuid}`, createRule: createRule}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'vmInstances'">
      <vm-nic-tab-list :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'l3network'">
      <l3network-tab-list
        :param="{uuid: windowData.dataUuid, conditions: `uuid?=${dbData.securitygroup[windowData.dataUuid].attachedL3NetworkUuids}`, refresh: query}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>

    <div slot="footer">
      <create-rule v-if="showCreateRule" :param="createRuleParam" @close="showCreateRule = false;"></create-rule>
    </div>
  </detail-template>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';
  import PageTemplate from "../../component/PageTemplate";
  import DetailTemplate from "../../component/DetailTemplate";
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import LogList from "../../component/LogList";
  import DetailInfoState from "../../component/DetailInfoState";
  import DetailLongContent from "../../main-component/DetailLongContent";
  import RuleTabList from "./component/RuleTabList";
  import VmNicTabList from "./component/VmTabList";
  import L3networkTabList from './component/L3NetworkTabList'
  import CreateRule from "./component/CreateRule";

  export default {
    name: "L3NetworkDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      CreateRule,
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList,
      RuleTabList,
      VmNicTabList,
      L3networkTabList
    },
    created() {

      this.TablistAssignedInit('l3Network')
      let dataUuid = this.$route.params ? this.$route.params.uuid : ''
      this.updateWindow(
        {
          currTab: 'info',
          dataUuid,
          methods: {query: this.query}
        })
        .then(() => {
          return this.query()
        })
        .then(() => {
          this.$forceUpdate()
        })
      window.addEventListener('click', this.onWindowClick)

    },
    mounted() {

    },
    computed: {
      itemData: function () {
        return this.dbData.vm[this.windowData.dataUuid]
      }
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
    },
    watch: {
      'param.uuid': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({dataUuid: this.param.uuid})
      }
    },
    data() {
      return {
        activeName: 'info',
        editName: false,
        newName: '',
        editDescription: false,
        newDescription: '',
        vmUuidList: [],
        showCreateRule: false,
        createRuleParam: {}
      }
    },
    methods: {
      ...Utils,
      createRule(param) {
        let self = this;
        self.createRuleParam = param;
        self.showCreateRule = true;
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.securitygroup[this.windowData.dataUuid]) {
              return this.dbData.securitygroup[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('security-groups', 'updateSecurityGroup', 'name', 'securitygroup', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.securitygroup[self.windowData.dataUuid]) {
              return this.dbData.securitygroup[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('security-groups', 'updateSecurityGroup', 'description', 'securitygroup', value)
          }
        }
      },
      query: function () {
        let securitygroupInventory, self = this;
        return rpc.query(`security-groups/${this.windowData.dataUuid}`)
          .then((resp) => {
            securitygroupInventory = resp.inventories[0]
            return rpc.query('security-groups/vm-instances/nics')
          })
          .then((resp) => {
            let uuidList = resp.inventories.map((item) => item.vmInstanceUuid)
            return this.updateWindow({
              vmUuidList: uuidList
            })
          })
          .then(() => {
            return self.updateDbRow({
              tableName: 'securitygroup',
              id: self.windowData.dataUuid,
              data: securitygroupInventory
            })
          }).then(() => {
            this.$forceUpdate()
          })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
      },
      deleteOneSecurityGroup: function (uuid) {
        const self = this
        if (uuid === null || uuid === undefined || uuid === '') return
        let uuidList = [`${uuid}`]
        self.openDialog('ConfirmDlg', {
          uuidList,
          title: 'securityGroup.delete',
          description: "securityGroup.info.deleteConfirm",
          icon: 'security_group_popupico',
          ok: () => {
            self.delete(uuidList).then(() => {
              self.$router.push({name: 'securitygroup'})
            })
          },
          getName: (uuid) => {
            return self.dbData.securitygroup[uuid].name;
          }
        })
      },
      detailEnableorDisabled: function (param) {
        this[param]([this.windowData.dataUuid])
          .then(() => {
            return this.query()
          })
      },
      detailAttach: function (uuid) {
        const self = this
        let l3List = _.cloneDeep(self.dbData.securitygroup[uuid].attachedL3NetworkUuids)
        self.openDialog('L3NetworkMultiSelectListDlg', {
          conditions: ['system=false', 'networkServices.networkServiceType=SecurityGroup', `uuid!?=${l3List}`, `ipVersion=${this.dbData.securitygroup[uuid].ipVersion}`, 'l2Network.cluster.type=zstack'],
          select: (l3networkList) => {
            self.attach(uuid, l3networkList)
              .then(() => {
                return self.query()
              })
          }
        })
      },
      detailDetach: function (uuid) {
        const self = this
        let l3List = _.cloneDeep(self.dbData.securitygroup[uuid].attachedL3NetworkUuids)
        self.openDialog('L3NetworkMultiSelectListDlg', {
          conditions: [`uuid?=${l3List}`],
          select: (l3networkList) => {
            self.openDialog('ConfirmDlg', {
              uuidList: l3networkList,
              title: 'securityGroup.detachl3network',
              icon: 'l3_popupico',
              description: 'securityGroup.info.detachL3Confirm',
              ok: () => {
                self.detach(uuid, l3networkList)
                  .then(() => {
                    return self.query()
                  })
              },
              getName: (uuid) => {
                return self.dbData.l3network[uuid].name;
              }
            })
          }
        })
      },

      instates() {
        let self = this, states = [];
        if (!self.dbData.securitygroup[self.windowData.dataUuid] || !self.dbData.securitygroup[self.windowData.dataUuid].state) return false;
        for (let i in arguments) {
          states.push(arguments[i]);
        }

        let instate = states.some(state => {
          return self.dbData.securitygroup[self.windowData.dataUuid].state === state
        });
        return instate;
      }
    }
  }
</script>

<style scoped>
  .icon {
    position: absolute;
    display: inline-block;
    /*left: -2px;*/
    width: 58px;
    height: 60px;
  }

  .disabled-text {
    color: #97A4B6;
  }

  .disabled-text:hover {
    color: #97A4B6;
  }
</style>
