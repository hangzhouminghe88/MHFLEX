<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">SAN存储详情</span>
      <span @click="$router.push({name:'sanstorage'})" class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到SAN存储列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t('iSCSI.action.name')}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a style="padding-top: 12px;" @click="model.state === 'Disabled' && detailStart()"
                           :class="{'disabled-text': model.state === 'Enabled'}">{{ $t("common.start")}}</a>
                        <a @click="model.state === 'Enabled' && detailStop()"
                           :class="{'disabled-text': model.state === 'Disabled'}">{{ $t("common.stop")}}</a>
                        <a @click="detailAttachCluster()">{{ $t("common.attachCluster")}}</a>
                        <a :class="{ 'disabled-text': !canDetach()}" @click="canDetach() && detailDetachCluster()">{{ $t("common.detachCluster")}}</a>
                        <a @click="detailSyncServer()">{{ $t("common.update")}}</a>
                        <a @click="detailDelete()">{{ $t("common.destroy")}}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
      >
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"
        ></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.cluster')" name="cluster"
        ></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')" name="log"
        ></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
          <base-icon name="primary_storage_large"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" :state="model.state"/>
          </div>
          <detail-name :param="getNameParam()" class="name"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>
          <detail-row :param="{
                    title: $t('common.ip'),
                    content: model.ip
                  }"/>
          <detail-row :param="{
                    title: $t('common.port'),
                    content: model.port
                  }"/>
          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: model && formatDatetime(new Date(model.createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: model && formatDatetime(new Date(model.lastOpDate))
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
    <div slot="body" class="detail-body" v-if="activeName === 'cluster'">
      <cluster-tab-list :param="{ uuid: windowData.dataUuid, isISCSI: true }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>

  </detail-template>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'
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
  import ClusterTabList from "src/om/cluster/components/ClusterTabList";

  export default {
    name: "SanStorageDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList,
      ClusterTabList
    },
    created() {
      this.updateWindow({
        currTab: 'info',
        dataUuid: this.$route.params ? this.$route.params.uuid : '',
        methods: {
          query: this.query
        }
      }).then(() => {
        return this.query()
      })
    },
    mounted() {

    },
    computed: {
      ...mapState({
        webStorage: state => state.webStorage
      }),
      ...mapGetters({
        get: 'webStorage/get'
      }),
      model: {
        get() {
          let self = this;
          return self.value;
        },
        set(val) {
          let self = this;
          self.value = val;
        }
      }
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
    },
    watch: {
      'param.uuid': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({dataUuid: this.param.uuid})
        this.destroyDialogs()
        this.destroyAllPanels()
      },
      'windowData.currTab': function () {
        setTimeout(this.drawChart, 0)
      }
    },
    data() {
      let self = this;
      return {
        activeName: 'info',
        value: ''
      }
    },
    methods: {
      ...Utils,
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.webStorage[this.windowData.dataUuid]) {
              return this.webStorage[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.detailUpdate('name', value);
          }
        }
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      query: function () {
        let uuid = this.windowData.dataUuid

        return rpc.query(`storage-devices/iscsi/servers/${uuid}`).then(resp => {
          this.updateDbRow({
            tableName: 'webStorage',
            id: uuid,
            data: resp.inventories[0]
          }).then(() => {
            this.model = _.get(this.dbData.webStorage, this.windowData.dataUuid)
          })

        })
      },
      detailUpdate: function (propName, value) {
        let param = {
          uuid: this.windowData.dataUuid
        }
        param[propName] = value
        this.dispatchActionWithEvent('webStorage/update', param)
        this.editName = false
      },
      canDetach() {
        let uuid = this.windowData.dataUuid
        let iscsi;
        if (typeof (this.model) === 'object') {
          iscsi = this.model;
        }
        if (!iscsi) return false;
        return iscsi.iscsiClusterRefs.length > 0
      },
      detailStart: function () {
        let param = {
          uuid: this.windowData.dataUuid,
          'state': 'Enabled'
        }
        this.dispatchActionWithEvent('webStorage/start', param)
      },
      detailStop: function () {
        let param = {
          uuid: this.windowData.dataUuid,
          'state': 'Disabled'
        }
        this.dispatchActionWithEvent('webStorage/stop', param)
      },
      detailDelete: function () {
        let existedList = this.model.iscsiClusterRefs.map((item) => {
          return item.clusterUuid
        })
        let hasCluster = false
        existedList.length > 0 ? hasCluster = true : hasCluster = false
        this.openDialog('ConfirmDlg', {
          title: 'iSCSI.delete',
          description: 'iSCSI.info.deleteConfirm',
          uuidList: [this.windowData.dataUuid],
          icon: 'pop_iscsi_server_n',
          warning: hasCluster ? 'primaryStorage.deleteWarningThree' : 'iSCSI.info.deleteWarning',
          ok: () => {
            this.dispatchActionWithEvent('webStorage/delete', [this.windowData.dataUuid])
              .then(() => {
                this.$router.push({name: 'sanstorage'});
              })
          },
          getName: (uuid) => {
            return this.dbData.webStorage[uuid].name;
          }
        })
      },
      detailSyncServer: function () {
        let param = {
          uuid: this.windowData.dataUuid
        }
        this.dispatchActionWithEvent('webStorage/refreshIscsiServer', param)
          .then(() => {
            this.windowData.methods.refresh()
          })
      },
      detailAttachCluster: async function () {
        let uuid = this.windowData.dataUuid
        let existedList = this.model.iscsiClusterRefs.map((item) => {
          return item.clusterUuid
        })
        let conditions = ['hypervisorType=KVM']
        if (existedList.length > 0) {
          conditions.push(`uuid!?=${existedList}`)
        }
        this.openDialog('ClusterSelectListDlg', {
          conditions: conditions,
          type: 'selection',
          select: clusterList => {
            return this.attachCluster(uuid, clusterList).then(() => {
              this.query();
            }, () => {
              this.query();
            })
          }
        })
      },
      detailDetachCluster: function () {
        let uuid = this.windowData.dataUuid
        let existedList = this.model.iscsiClusterRefs.map((item) => {
          return item.clusterUuid
        })
        this.openDialog('ClusterSelectListDlg', {
          conditions: [`uuid?=${existedList}`],
          type: 'selection',
          select: clusterList => {
            return this.detachCluster(uuid, clusterList).then(() => {
              this.query();
            }, () => {
              this.query();
            })
          }
        })
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
