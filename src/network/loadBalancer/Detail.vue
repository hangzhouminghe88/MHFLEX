<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">负载均衡详情</span>
      <span @click="$router.push({name:'loadbalancer'})" class="create-back detail-header-item">
        <i class="el-icon-back"></i>回到负载均衡列表
      </span>

      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t("loadbalancer.actions")}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <span slot="title">
                <a id="loadbalancer-createListener" style="padding-top: 10px;"
                   v-permission="'LB_LISTENER.CREATE'"
                   @click="$router.push({name:'createloadbalancerlistener'})">
                  {{$t("loadbalancer.createListener")}}
                </a>
                <a id="common-destroy" style="padding-bottom:12px;" v-permission="'LB.DELETE'"
                   @click="pageDeleteThis(windowData.dataUuid)">
                  {{$t("common.destroy")}}
                </a>
              </span>
            </div>
          </span>
        </drop-down>
      </span>

      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.listener')" name="listeners" v-if="isDestroyed()"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log" v-if="isDestroyed()"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="load_banlance"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" v-if="updateState"
                               :state="dbData.loadBalancer[windowData.dataUuid] && dbData.loadBalancer[windowData.dataUuid].state"/>
          </div>
          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
                title: 'common.publicNetworkIP',
                content: dbData.loadBalancer[windowData.dataUuid] && dbData.loadBalancer[windowData.dataUuid].vipUuid && dbData.vip[dbData.loadBalancer[windowData.dataUuid].vipUuid] && dbData.vip[dbData.loadBalancer[windowData.dataUuid].vipUuid].ip
              }"
          />

          <detail-row
            :param="{
                title: 'common.owner',
                content: getResourceOwner(windowData.dataUuid),
                handler(){
                  if(!(dbData.resourceOwner[windowData.dataUuid]
                  && dbData.resourceOwner[windowData.dataUuid].uuid
                  && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid]
                  && dbData.accountA[dbData.resourceOwner[windowData.dataUuid].uuid].projectUuid)){
                    $router.push({name: 'detailAccount', params: {uuid: dbData.resourceOwner[windowData.dataUuid] && dbData.resourceOwner[windowData.dataUuid].uuid}})
                  }
                }
              }"
          />

          <detail-row
            :param="{
                title: 'common.createDate',
                content: dbData.loadBalancer[windowData.dataUuid] && formatDatetime(new Date(dbData.loadBalancer[windowData.dataUuid].createDate))
               }"
          />
          <detail-row
            :param="{
                title: 'common.lastOpDate',
                content: dbData.loadBalancer[windowData.dataUuid] && formatDatetime(new Date(dbData.loadBalancer[windowData.dataUuid].lastOpDate)),
               }"
          />
          <div class="detail-splitter"></div>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px;"></div>
        <div id="common-moreInfomation" class="detail-block-header">{{$t('common.moreInformation')}}</div>
        <div class="detail-row">
          <div class="detail-title">
            UUID:
          </div>
          <div class="detail-container">
            <detail-long-content :value="windowData.dataUuid"/>
          </div>
        </div>
        <div id="common-vip" class="detail-row">
          <div class="detail-title">
            {{$t("common.vip")}}{{$t("common.colon")}}
          </div>
          <div class="detail-content">
            <span class="link"
                  @click="$router.push({name: 'detailvip', params: {uuid: dbData.loadBalancer[windowData.dataUuid].vipUuid}})">{{ getVipName(windowData.dataUuid) }}</span>
          </div>
        </div>
        <div id="common-publicNetwork" class="detail-row">
          <div class="detail-title">
            {{$t("common.publicNetwork")}}{{$t("common.colon")}}
          </div>
          <div class="detail-content">
            <span class="link" v-if="canLinkToKvmL3()"
                  @click="$router.push({name: 'detailPublicNetwork', params: {uuid: dbData.l3network[$data.l3NetworkUuidForPublic].uuid}})">{{ dbData.l3network[$data.l3NetworkUuidForPublic] && dbData.l3network[$data.l3NetworkUuidForPublic].name }}</span>
            <span class="link" v-if="!canLinkToKvmL3()">{{ dbData.l3network[$data.l3NetworkUuidForPublic] && dbData.l3network[$data.l3NetworkUuidForPublic].name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName ==='listeners'">
      <listeners-tab-list :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>

  </detail-template>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils'
  import rpc from 'src/utils/rpc'
  import Root from 'src/windows/Root'
  import PageTemplate from 'src/component/PageTemplate'
  import DetailTemplate from "src/component/DetailTemplate"
  import DetailInfoState from "../../component/DetailInfoState"
  import {mapState} from 'vuex';
  import DetailLongContent from "../../main-component/DetailLongContent"
  import BalancerMethods from './Methods'
  import BalancerList from './List'
  import LogList from "src/component/LogList";
  import LoadBalancerListenersTabList from './dialog/ListenersList'

  export default {
    name: "LoadBalancerDetail",
    mixins: [Root, WindowBase, Utils, rpc, BalancerMethods, BalancerList],
    components: {
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      'log-list': LogList,
      'listeners-tab-list': LoadBalancerListenersTabList
    },
    data() {
      return {
        activeName: 'info',
        editName: false,
        newName: '',
        updateState: false
      }
    },
    created() {
      let dataUuid = this.$route.params.uuid
      this.updateWindow(
        {
          currTab: 'info',
          accountUuid: window.localStorage.getItem('accountUuid'),
          methods: {}
        }
      ).then(() => {
        this.updateState = true
        //console.log("state: "+dbData.loadBalancer[windowData.dataUuid] +" : " + dbData.loadBalancer[windowData.dataUuid].state)
      })

      if (dataUuid) {
        rpc.query(`vips/${dataUuid}`)
          .then((resp) => {
            this.updateDbTable({
              tableName: 'vip',
              list: resp.inventories
            })
          })
        this.updateWindow({dataUuid})
          .then(() => {
            return this.query()
          }).then(() => {
          this.$forceUpdate()
        })
      }
    },
    methods: {
      ...Utils,
      canLinkToKvmL3() {
        const self = this
        let value = true
        if (self.dbData.loadBalancer[self.windowData.dataUuid] && self.dbData.vip[self.dbData.loadBalancer[self.windowData.dataUuid].vipUuid] && self.dbData.l3NetworkOfHost[self.dbData.vip[self.dbData.loadBalancer[self.windowData.dataUuid].vipUuid].l3NetworkUuid] && (self.dbData.l3NetworkOfHost[self.dbData.vip[self.dbData.loadBalancer[self.windowData.dataUuid].vipUuid].l3NetworkUuid].length > 0) && self.dbData.l3NetworkOfHost[self.dbData.vip[self.dbData.loadBalancer[self.windowData.dataUuid].vipUuid].l3NetworkUuid][0] && self.dbData.l3NetworkOfHost[self.dbData.vip[self.dbData.loadBalancer[self.windowData.dataUuid].vipUuid].l3NetworkUuid][0].hypervisorType === 'ESX') {
          value = false
        }
        return value
      },

      queryVips(uuid) {
        return rpc.query(`vips/${uuid}`)
          .then((resp) => {
            return this.updateDbTable({
              tableName: 'vip',
              list: resp.inventories
            })
          })
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      isDestroyed() {
        let self = this;
        if (self.dbData.vm[self.$route.params.uuid]) {
          return self.dbData.vm[self.$route.params.uuid].state !== 'Destroyed';
        }
        return true;
      },
      getNameParam() {
        let self = this
        return {
          getValue: () => {
            if (self.dbData.loadBalancer[this.windowData.dataUuid]) {
              return self.dbData.loadBalancer[self.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            self.updateResource('load-balancers', 'updateLoadBalancer', 'name', 'loadBalancer', value)
          }
        }
      },
      query: function () {
        const self = this
        return rpc.query(`load-balancers`, {
          q: `uuid=${self.windowData.dataUuid}`
        }).then((resp) => {
          let lBInventories = resp.inventories[0]
          let loadBalancer = _.cloneDeep(lBInventories)
          return self.queryVips(loadBalancer.vipUuid)
            .then(() => {
              let vip = _.cloneDeep(self.dbData.vip[loadBalancer.vipUuid])
              let l3networkList = _.uniq([vip.l3NetworkUuid, vip.peerL3NetworkUuids])
              self.$data.l3NetworkUuidForPublic = vip.l3NetworkUuid
              // self.$data.l3NetworkForPrivate = vip.peerL3NetworkUuid
              let tasks = []
              let p = null
              p = rpc.getResourceAccount([self.windowData.dataUuid], self)
              tasks.push(p)
              p = rpc.query('l3-networks', {
                q: `uuid?=${l3networkList}`
              }).then((resp) => {
                return self.updateDbTable({
                  tableName: 'l3network',
                  list: resp.inventories
                })
              })
              tasks.push(p)
              p = rpc.query('hosts', {
                q: `cluster.l2Network.l3Network.uuid=${vip.l3NetworkUuid}`,
                limit: 1,
                fields: 'hypervisorType'
              }).then((l3host) => {
                if (l3host.inventories.length === 0) l3host.inventories = [{'hypervisorType': ''}]
                self.forceUpdateDbRow({
                  tableName: 'l3NetworkOfHost',
                  id: vip.l3NetworkUuid,
                  data: l3host.inventories
                })
              })
              tasks.push(p)
              // p = rpc.query(`vip/${lBInventories.vipUuid}/vip-qos`)
              // .then((resp) => {
              //   lBInventories = _.assign(lBInventories, {'inboundBandwidth': resp.inboundBandwidth, 'outboundBandwidth': resp.outboundBandwidth})
              // })
              // tasks.push(p)
              if (self.dbData.common.isAdmin) {
                p = rpc.query('accounts/resources/refs', {
                  q: `resourceUuid=${lBInventories.uuid}`
                }).then((account) => {
                  if (account.inventories.length > 0) {
                    lBInventories.accountUuid = account.inventories[0].accountUuid
                    self.updateDbRow({
                      tableName: 'loadBalancer',
                      id: lBInventories.uuid,
                      data: lBInventories
                    })
                  }
                })
                tasks.push(p)
              }
              return Promise.all(tasks).then(() => {
                return self.updateDbRow({
                  tableName: 'loadBalancer',
                  id: self.windowData.dataUuid,
                  data: lBInventories
                })
              })
            })
        })
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.loadBalancer[self.windowData.dataUuid]) {
              return this.dbData.loadBalancer[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('load-balancers', 'updateLoadBalancer', 'description', 'loadBalancer', value)
          }
        }
      },
    }
  }
</script>

<style scoped>
  .icon {
    position: absolute;
    display: inline-block;
    /*left: -2px;*/
    width: 57px;
    height: 60px;
  }

</style>
