<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">用户详情</span>
       <span @click="$router.push({name: 'user'})" class="create-back detail-header-item"><i
         class="el-icon-back"></i>
        回到用户列表
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('user.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px" @click="canChangePassword([windowData.dataUuid]) && pageModifyPsw()" :class="{'disabled-text':!canChangePassword([windowData.dataUuid])}">{{$t('common.updateInfopassword')}}</a>
              <a style="margin-bottom:12px" :class="{'disabled-text': !isSelfUser([windowData.dataUuid])}" @click="isSelfUser([windowData.dataUuid]) && pageDelete();">{{$t('common.destroyed')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <span class="detail-tab">
         <el-tabs @tab-click="handleTabChange" tabPosition="bottom"
                  v-model="activeName">
          <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
           <el-tab-pane v-if="!dbData.common.isAdmin" :label="$t('common.permission')" name="permission"></el-tab-pane>
           <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div slot="body" class="detail-body" v-if="activeName ==='info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="user_ico"/>
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
              title: 'common.account',
              content: model && model.accountName,
              handler: () => {
                $router.push({name: 'detailAccount', params:{uuid: model && model.accountUuid}})
              }
            }"
          />
          <detail-row
            :param="{
              title: 'common.usergroup',
              content: getUserGroupName(),
              handler: () => {

              }
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: model && formatDatetime(new Date(model.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: model && formatDatetime(new Date(model.lastOpDate))
            }"
          />
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
      </div>
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
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import { getPolicyGroup, virtualPolicyMap } from 'src/utils/policy'
  import DetailTemplate from "../../../component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import UserList from 'src/om/user/List';
  import Utils from "../../../utils/utils";
  import rpc from 'src/utils/rpc';
  import LogList from "../../../component/LogList";
  import {mapGetters, mapState} from 'vuex';

  export default {
    name: "UserDetailPage",
    components: {LogList, DetailTemplate},
    mixins: [WindowBase, UserList],
    data() {
      return {
        activeName: "info",
        policyGroup: []
      }
    },
    computed: {
      model(){
        let self = this;
        return self.get(self.$route.params.uuid);
      },
      isSelected(){
        return true;
      },
      ...mapState({
        user: state => state.user
      }),
      selectedList(){
        return [this.windowData.dataUuid];
      },
    },
    created(){
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          queryList: self.detailQuery
        }
      })
        .then(() => {
          self.detailQuery();
        })
        .then(() => {
          self.queryPolicies();
        })
    },
    methods: {
      ...Utils,
      detailQuery(){
        let self = this;
        self.dispatchAction('user/detailQuery', self.windowData.dataUuid);
      },
      handleTabChange(){
      },
      queryPolicies () {
        let policyGroup = _.cloneDeep(getPolicyGroup())
        rpc.query('accounts/policies', {
          q: `user.uuid=${this.windowData.dataUuid}`
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
              item.groupValue = false
              if (allowedPolicy[item.name] === 'Allow') {
                item.value = true
              } else {
                item.value = false
              }
            })
          })
          return rpc.query('accounts/groups', {
            q: `user.uuid=${this.windowData.dataUuid}`
          })
        }).then((resp) => {
          if (resp.inventories.length > 0) {
            rpc.query('accounts/policies', {
              q: `group.uuid=${resp.inventories[0].uuid}`
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
                group.haveGroupOn = false
                list.forEach(item => {
                  if (allowedPolicy[item.name] === 'Allow') {
                    group.haveGroupOn = true
                    item.groupValue = true
                  } else {
                    item.groupValue = false
                  }
                })
                // get group status
                let onCount = 0
                list.forEach(item => {
                  if (item.groupValue || item.value) {
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

                let groupOnCount = 0
                list.forEach(item => {
                  if (item.groupValue) {
                    groupOnCount++
                  }
                })

                group.usergroupAllSet = false

                if (groupOnCount === list.length) {
                  group.usergroupAllSet = true
                }
              })

              this.policyGroup = policyGroup
              return
            })
          }
          policyGroup.forEach(group => {
            let list = []
            Object.keys(group.left).forEach((itemName) => {
              list.push(group.left[itemName])
            })
            Object.keys(group.right).forEach((itemName) => {
              list.push(group.right[itemName])
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
        self.dispatchActionWithEvent('user/update', {
          uuid: self.$route.params.uuid,
          param
        }, undefined, event);
      },
      getUserGroupName: function () {
        let value = ''
        try {
          value = this.dbData.usergroup[this.dbData.user[this.windowData.dataUuid].userGroupUuid].name
        } catch (e) {
          rpc.query(`accounts/groups`, {
            q: [`user.uuid=${this.windowData.dataUuid}`]
          })
            .then((resp) => {
              if (resp.inventories.length > 0) {
                this.updateDbRow({
                  tableName: 'usergroup',
                  id: resp.inventories[0].uuid,
                  data: resp.inventories[0]
                })
                  .then(() => {
                    let data = _.cloneDeep(this.dbData.user[this.windowData.dataUuid])
                    data.userGroupUuid = resp.inventories[0].uuid
                    this.updateDbRow({
                      tableName: 'user',
                      id: this.windowData.dataUuid,
                      data
                    })
                  })
              }
            })
        }
        return value
      },
      togglePermission: function (item) {
        if (item.value) {
          this.switchOffPermission(item)
        } else {
          this.switchOnPermission(item)
        }
      },
      switchOnPermission: function (item) {
        if (item.groupValue || item.value) return
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
            if (resp.inventories.length > 0) {
              return rpc.post(`accounts/users/${this.windowData.dataUuid}/policy-collection`, {
                params: {
                  policyUuids: [resp.inventories[0].uuid]
                }
              })
            }
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
      switchOffPermission: function (item) {
        if (item.groupValue || !item.value) return
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
            if (resp.inventories.length > 0) {
              return rpc._delete(`accounts/users/${this.windowData.dataUuid}/policies`, {
                policyUuids: [resp.inventories[0].uuid]
              })
            }
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
      setPolicyGroupItemValue: function (name, value) {
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
      switchOnGroup: function (group) {
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
            group.status = 'on'
            this.$forceUpdate()
          })
      },
      switchOffGroup: function (group) {
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
            group.status = 'off'
            this.$forceUpdate()
          })
      },
      isSelfUser (windowUuidList) {
        // if (this.dbData.common.isAdmin) return true
        debugger
        let isSelfUser = true, self = this;
        if (windowUuidList === false || windowUuidList === undefined) return true
        windowUuidList.forEach((uuid) => {
          console.log(self.user[uuid].accountUuid);
          if (self.dbData.user[uuid].accountUuid !== localStorage.getItem('accountUuid')) isSelfUser = false
        })
        return isSelfUser
      },
      canChangePassword (uuid) {
        if (this.dbData.common.isAdmin) return true
        else return this.isSelfUser([uuid])
      },
    }
  }
</script>

<style scoped lang="less">
  .icon{
    position: absolute;
    width: 62px;
    height: 60px;
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
