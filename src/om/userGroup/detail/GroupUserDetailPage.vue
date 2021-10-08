<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">用户组详情</span>
       <span @click="$router.push({name: 'groupuser'})" class="create-back detail-header-item"
            ><i
         class="el-icon-back"></i>
        回到用户组列表
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown" v-if="!dbData.common.isAdmin">
          <span slot="title">
            <span class="text">{{$t('usergroup.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px;" @click="attachUser([windowData.dataUuid])">{{$t('common.addUser')}}</a>
              <a style="margin-bottom: 12px" @click="detailDelete()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <span class="detail-tab">
         <el-tabs @tab-click="handleTabChange" style="display: inline-block;height: 100%;" tabPosition="bottom"
                  v-model="activeName">
          <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
           <el-tab-pane :label="$t('common.user')" name="user"></el-tab-pane>
           <el-tab-pane v-if="!dbData.common.isAdmin" :label="$t('common.permission')" name="permission"></el-tab-pane>
           <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div slot="body" class="detail-body" v-if="activeName ==='info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="user_group_ico"/>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>
          <detail-row
            :param="{
              title: 'common.createDate',
              content: model && formatDatetime(new Date(model.createDate)),
            }"
          />
          <div class="split-line"></div>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t("common.moreInformation")}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: model && model.uuid,
            copy: true
          }"
        />
        <detail-row
          :param="{
           title: 'common.account',
           content: model && model.accountName
          }"
        />
        <div class="split-line"></div>
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'user'">
      <user-tab-list :param="{conditions: `group.uuid=${windowData.dataUuid}`, uuid: windowData.dataUuid}"></user-tab-list>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body permission-body" v-if="activeName === 'permission'">
      <div class="group" v-for="group in policyGroup">
        <div class="detail-block-header" style="position: relative;">
          {{$t(`identity.group.${group.name}`)}}
          <div class="value" style="width: 300px;">
            <detail-switch
              :param="{
                 getTitle: () => {return ''},
                 getLeftText: () =>  $t('identity.allOff'),
                 getRightText: () => $t('identity.allOn'),
                 getValue: () => {
                   return (group.status === 'on' && !group.usergroupAllSet) ? true : false
                 },
                 setValue: val => {group.status === 'on' ? (!group.usergroupAllSet && switchOffGroup(group)) : switchOnGroup(group)},
                 title: () => {
                   return true;
                 }
              }"
            />
          </div>
        </div>
        <div class="part">
          <div class="row" v-for="item in group.left">
            <div class="value">
              <detail-switch :param="{
                  showSwitch: dbData && dbData.common && !dbData.common.isOpensource,
                  getTitle: () => {return $t(`identity.${item.name}`)},
                  getLeftText: () => 'OFF',
                  getRightText: () => 'ON',
                  getValue: () => item.value,
                  setValue: val => {togglePermission(item) },
                  disabled: item.groupValue
               }"></detail-switch>
            </div>
          </div>
        </div>
        <div class="part">
          <div class="row" v-for="item in group.right">
            <div class="value">
              <detail-switch :param="{
                  showSwitch: dbData && dbData.common && !dbData.common.isOpensource,
                  getTitle: () => {return $t(`identity.${item.name}`)},
                  getLeftText: () => 'OFF',
                  getRightText: () => 'ON',
                  getValue: () => item.value,
                  setValue: val => {togglePermission(item) },
                  disabled: item.groupValue
               }"></detail-switch>
            </div>
          </div>
        </div>
      </div>
    </div>
  </detail-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import GroupUserList from 'src/om/userGroup/List';
  import DetailTemplate from "../../../component/DetailTemplate";
  import LogList from "../../../component/LogList";
  import Utils from 'src/utils/utils';
  import UserTabList from "../components/UserTabList";
  import { getPolicyGroup, virtualPolicyMap } from 'src/utils/policy'
  import rpc from 'src/utils/rpc';
  export default {
    components: {UserTabList, LogList, DetailTemplate},
    mixins: [WindowBase, GroupUserList],
    name: "GroupUserDetailPage",
    data(){
      return {
        activeName: 'info',
        policyGroup: {}
      }
    },
    computed: {
      model(){
        let self = this;
        return self.get(self.windowData.dataUuid);
      }
    },
    created(){
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      let curisAdmin = localStorage.getItem('isAdmin');
      self.updateWindow({
        dataUuid,
        curisAdmin: curisAdmin,
        methods: {
          queryList: self.detailQuery
        }
      })
        .then(() => {
          return self.detailQuery();
        })
        .then(() => {
        this.queryPolicies()
        this.$forceUpdate()
      })
    },
    methods: {
      ...Utils,
      detailQuery() {
        let self = this;
        self.dispatchAction('userGroup/detailQuery', self.windowData.dataUuid);
      },
      handleTabChange(){

      },
      updateResourceParam(param){
        let self = this;
        return {
          getValue(){
            return self.model && self.model[param];
          },
          setValue(value){
            self.updateResource(param, value);
          },
          canEdit(){
            return true;
          }
        }
      },
      updateResource(key, value){
        if(!key) return;
        let param = {}, self = this;
        param[key] = value;
        param.uuid = self.$route.params.uuid;
        let event = this.createEvent('common.updateInfo' + key, value);
        self.dispatchActionWithEvent('userGroup/update', {
          uuid: self.$route.params.uuid,
          param
        }, undefined, event);
      },
      attachUser(){
        let self = this;
        let selectedUuidList = [self.windowData.dataUuid]
        self.openDialog('UserSelectConfirmDlg', {
          uuid: selectedUuidList[0],
          select: (uuidList) => {
            self.addUser(uuidList,selectedUuidList[0]);
          }
        });
      },
      detailDelete(){
        let self = this;
        self.openDialog('ConfirmDlg', {
          uuidList: [self.windowData.dataUuid],
          title: 'usergroup.delete',
          description: 'usergroup.info.deleteConfirm',
          icon: 'user_group_popupico',
          getName(){
            return self.model.name
          },
          ok(){
            self.delete([self.windowData.dataUuid])
              .then(() => {
                self.$router.push({name: 'groupuser'});
              })
          }
        })
      },
      queryPolicies() {
        let policyGroup = _.cloneDeep(getPolicyGroup())
        rpc.query('accounts/policies', {
          q: `group.uuid=${this.windowData.dataUuid}`
        }).then((resp) => {
          let allowedPolicy = {}
          resp.inventories.forEach((it) => {
            allowedPolicy[it.name] = 'Allow'
          })

          // Process Virtual Policy
          Object.keys(virtualPolicyMap).forEach(virtualPolicyName => {
            let allowedCount = 0
            virtualPolicyMap[virtualPolicyName].forEach((nativePolicyName) => {
              if (allowedPolicy[nativePolicyName] === 'Allow') {
                allowedCount++
              }
            })
            if (allowedCount === virtualPolicyMap[virtualPolicyName].length) {
              allowedPolicy[virtualPolicyName] = 'Allow'
            }
          })

          policyGroup.forEach((group) => {
            let list = []
            Object.keys(group.left).forEach((itemName) => {
              list.push(group.left[itemName])
            })
            Object.keys(group.right).forEach((itemName) => {
              list.push(group.right[itemName])
            })
            list.forEach(item => {
              if (allowedPolicy[item.name] === 'Allow') {
                item.value = true
              } else {
                item.value = false
              }
            })

            // get group status
            let onCount = 0
            list.forEach(item => {
              if (item.value) {
                onCount++
              }
            })

            if (onCount === 0) {
              group.status = 'off'
            } else if (onCount === list.length) {
              group.status = 'on'
            } else {
              group.status = 'middle'
            }
          })
          this.policyGroup = policyGroup
        })
      },
      updateUserGroup (key, newValue) {
        if (this.dbData.usergroup[this.windowData.dataUuid][key] === newValue) return
        this.updateResources('accounts/groups', 'updateUserGroup', key, 'usergroup', newValue)
      },
      switchOnGroup(group) {
        if (group.status === 'on') return
        let list = []
        Object.keys(group.left).forEach((itemName) => {
          list.push(group.left[itemName])
        })
        Object.keys(group.right).forEach((itemName) => {
          list.push(group.right[itemName])
        })
        let taskList = []
        list.forEach(item => {
          let p = this.switchOnPermission(item)
          if (p) taskList.push(p)
        })
        Promise.all(taskList)
          .then(() => {
            group.status = this.getGroupStatus(group)
            this.$forceUpdate()
          })
      },
      switchOffGroup(group) {
        if (group.status === 'off') return
        let list = []
        Object.keys(group.left).forEach((itemName) => {
          list.push(group.left[itemName])
        })
        Object.keys(group.right).forEach((itemName) => {
          list.push(group.right[itemName])
        })
        let taskList = []
        list.forEach(item => {
          let p = this.switchOffPermission(item)
          if (p) taskList.push(p)
        })
        Promise.all(taskList)
          .then(() => {
            group.status = this.getGroupStatus(group)
            this.$forceUpdate()
          })
      },
      getGroupStatus(group) {
        let groupList = group.left.concat([], group.right)
        let onCount = 0
        groupList.forEach((item) => {
          if (item.value) onCount++
        })
        if (onCount === 0) {
          return 'off'
        } else if (onCount === groupList.length) {
          return 'on'
        } else {
          return 'middle'
        }
      },
      togglePermission(item) {
        if (item.value) {
          this.switchOffPermission(item)
        } else {
          this.switchOnPermission(item)
        }
      },
      switchOnPermission(item) {
        if (item.value) return
        let isNativePolicy = true
        let nativePolicyNameList = []
        if (virtualPolicyMap[item.name]) {
          nativePolicyNameList = nativePolicyNameList.concat(virtualPolicyMap[item.name])
          isNativePolicy = false
        }
        if (isNativePolicy) {
          nativePolicyNameList.push(item.name)
        }

        let taskList = []

        nativePolicyNameList.forEach(policyName => {
          let p = rpc.query('accounts/policies', {
            q: `name=${policyName}`
          }).then((resp) => {
            if (resp.inventories.length === 0) return
            return rpc.post(`accounts/groups/${this.windowData.dataUuid}/policies`, {
              params: {
                policyUuid: resp.inventories[0].uuid
              }
            })
          })
          taskList.push(p)
        })

        return Promise.all(taskList)
          .then(() => {
            if (!isNativePolicy) {
              nativePolicyNameList.forEach(policyName => {
                this.setPolicyGroupItemValue(policyName, true)
              })
            }

            this.setPolicyGroupItemValue(item.name, true)
          })
      },
      switchOffPermission(item) {
        if (!item.value) return
        let isNativePolicy = true
        let nativePolicyNameList = []
        if (virtualPolicyMap[item.name]) {
          nativePolicyNameList = nativePolicyNameList.concat(virtualPolicyMap[item.name])
          isNativePolicy = false
        }
        if (isNativePolicy) {
          nativePolicyNameList.push(item.name)
        }

        let taskList = []

        nativePolicyNameList.forEach(policyName => {
          let p = rpc.query('accounts/policies', {
            q: `name=${policyName}`
          }).then((resp) => {
            if (resp.inventories.length === 0) return
            return rpc._delete(`accounts/groups/${this.windowData.dataUuid}/policies/${resp.inventories[0].uuid}`)
          })
          taskList.push(p)
        })

        return Promise.all(taskList)
          .then(() => {
            if (!isNativePolicy) {
              nativePolicyNameList.forEach(policyName => {
                this.setPolicyGroupItemValue(policyName, false)
              })
            }

            this.setPolicyGroupItemValue(item.name, false)
          })
      },
      setPolicyGroupItemValue(name, value) {
        let item
        for (let i = 0; i < this.policyGroup.length; i++) {
          let group = this.policyGroup[i]
          for (let j = 0; j < group.left.length; j++) {
            if (group.left[j].name === name) {
              item = group.left[j]
              break
            }
          }
          for (let j = 0; j < group.right.length; j++) {
            if (group.right[j].name === name) {
              item = group.right[j]
              break
            }
          }
        }

        // some policy is not shown in list, so skip it.
        if (item) {
          item.value = value
        }
      },
    }
  }
</script>

<style scoped lang="less">
 .icon{
   position: absolute;
   display: inline-block;
   width: 62px;
   height: 62px;
   background-repeat: no-repeat;
 }
 .group{
   flex-grow: 1;
   flex: 1 1 100%;
 }
 .permission-body{
   position: relative;
   display: block;
 }
 .detail-block-header{
 .value{
   width: 300px;
   position: absolute;
   right: 20px;
   top: -10px;
   font-size: 12px;
   }
 }
 .part{
   display: inline-block;
   width: 49%;
 .row{
   position: relative;
   display: inline-block;
   width: 100%;
 }
 }
</style>
