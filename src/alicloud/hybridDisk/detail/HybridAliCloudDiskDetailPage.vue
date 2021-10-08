<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云云盘详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'hybridaliclouddisk'})">
        <i class="el-icon-back"></i>
        回到阿里云云盘列表
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.volumeActions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a :class="{'disabled-text': !canDeleteEcs()}" @click="canDeleteEcs () && pageAttach()">{{$t('common.attach')}}</a>
              <a style="padding-bottom: 12px;" :class="{'disabled-text': !canDetach()}" @click="canDetach() && pageDetach()">{{$t('common.detach')}}</a>
              <a style="padding-bottom: 12px;" :class="{'disabled-text': !canDeleteDisk()}" @click="canDeleteDisk() && pageDelete()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" tab-position="bottom" v-model="activeName">
        <el-tab-pane :label="$t('common.basicAttributes')"
                     name="info"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body">
      <div class="left">
        <div class="left-header">
          <base-icon name="volume_large"/>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
              title: 'hybridAliyunDisk.diskId',
              content: hybridAliCloudDisk && hybridAliCloudDisk.diskId
            }"
          />
          <detail-row
            :param="{
              title: 'hybridAliyunDisk.diskCategory',
              content: hybridAliCloudDisk && hybridAliCloudDisk.diskCategory && $t(`hybridAliyunDisk.${(hybridAliCloudDisk.diskCategory).toLowerCase()}`)
            }"
          />
          <detail-switch :param="{
                  showSwitch: dbData && dbData.common && !dbData.common.isOpensource,
                  getTitle: () => $t('hybridAliyunDisk.deleteWithInstance'),
                  getLeftText: () => $t('common.disable'),
                  getRightText: () => $t('common.enable'),
                  getValue: () => deleteEcsFollowDeleteVolume,
                  setValue: val => {
                    if(!canDeleteEcs()){
                      deleteEcsFollowDeleteVolume = !deleteEcsFollowDeleteVolume;
                      setDeleteEcs();
                     }
                   },
                  permission: ['VM.SET_QGA', 'LICENSE_BASIC_PAID'],
                  doc: 'deleteWithInstance',
                  disabled: canDeleteEcs()
                }"/>
          <detail-row
            :param="{
              title: 'common.size',
              content: hybridAliCloudDisk && `${hybridAliCloudDisk.sizeWithGB}G`
            }"
          />
          <detail-row
            :param="{
              title: 'hybridAliyunDisk.billingMethod',
              content: (hybridAliCloudDisk && hybridAliCloudDisk.diskChargeType) ? $t(`hybridAliyunDisk.${hybridAliCloudDisk.diskChargeType}`) : $t('hybridAliyunDisk.afterPayment')
            }"
          />
          <detail-row
            :param="{
              title: 'hybridAliyunDisk.diskType',
              content: $t(`hybridAliyunDisk.${hybridAliCloudDisk.diskType}`)
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: hybridAliCloudDisk.createDate && formatDatetime(new Date(hybridAliCloudDisk.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: hybridAliCloudDisk.lastOpDate && formatDatetime(new Date(hybridAliCloudDisk.lastOpDate))
            }"
          />
          <div class="split-line"></div>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title: 'UUID',
            content: windowData.dataUuid,
            copy: true
          }"
        />
        <detail-row
          :param="{
            title: 'hybridecsinstance.instance',
            content: (hybridAliCloudDisk && hybridAliCloudDisk.ecsInstanceUuid) ? hybridAliCloudDisk.ecsName : '',
            handler: () => {
              $router.push({name: 'detailHybridAliCloudEcs', params: {uuid: hybridAliCloudDisk.ecsInstanceUuid}})
            }
          }"
        />
        <detail-row
          :param="{
            title: 'hybrididentityzone.identityzone',
            content: hybridAliCloudDisk && hybridAliCloudDisk.identityZoneName,
            handler: () => {
              $router.push({name: 'detailHybridAliCloudIdentityZone', params: {uuid: hybridAliCloudDisk.identityZoneUuid}})
            }
          }"
        />
      </div>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "src/component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import  Utils from 'src/utils/utils';
  import { mapGetters } from 'vuex';
  import Methods from '../Methods';

  export default {
    name: "HybridAliCloudDiskDetailPage",

    components: {DetailTemplate},

    mixins: [WindowBase, Methods],

    data() {
      return {
        activeName: 'info',
        deleteEcsFollowDeleteVolume: false
      }
    },

    computed: {
      ...mapGetters({
        get: 'hybridAliCloudDisk/get'
      }),
      hybridAliCloudDisk(){
        let self = this;
        return self.get(self.windowData.dataUuid);
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
        methods: {
          query: self.detailQuery
        }
      }).then(() => {
        self.detailQuery();
      })
    },

    methods: {
      ...Utils,

      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridAliCloudDisk/basicQuery', {q: [`uuid=${self.windowData.dataUuid}`]})
          .then( () => {
            rpc.query('system-tags', {
              q: [`resourceUuid=${this.windowData.dataUuid}`, 'resourceType=AliyunDiskVO', 'tag=deleteWithInstance']
            }).then( (respDeleteWithInstance) => {
              if (respDeleteWithInstance.inventories.length > 0) {
                self.deleteEcsFollowDeleteVolume = true;
              } else {
                self.deleteEcsFollowDeleteVolume = false;
              }
            })
          })
      },

      updateResourceParam(param) {
        let self = this;
        return {
          getValue: () => {
            return self.hybridAliCloudDisk[param];
          },
          setValue: (newVal) => {
            let self = this;
            if(newVal === self.hybridAliCloudDisk[param]) return;
            let event = self.createEvent(`common.updateInfo${param}`, self.hybridAliCloudDisk.name)
            let obj = {}; obj['uuid'] = self.windowData.dataUuid; obj['param'] = {};
            obj['param'][param] = newVal;
            return self.dispatchActionWithEvent('hybridAliCloudDisk/update', obj, null, event);
          },
          canEdit: () => {
            return true;
          }
        }
      },

      canDeleteDisk () {
        let self = this;
        let disk = self.hybridAliCloudDisk;
        if (!disk) return
        return disk.diskType === 'data' && !disk.ecsInstanceUuid
      },

      canDeleteEcs() {
        let self  = this;
        if(self.hybridAliCloudDisk && !self.hybridAliCloudDisk.ecsInstanceUuid){
          return true;
        }
        return false;
      },

      canDetach() {
        let self = this;
        if (self.hybridAliCloudDisk && self.hybridAliCloudDisk.ecsInstanceUuid && self.hybridAliCloudDisk.diskType === 'data')
           return true;
        return false;
      },

      setDeleteEcs() {
        let self = this;
        let param = {
          uuid: self.windowData.dataUuid,
          param: {
            "deleteWithInstance": self.deleteEcsFollowDeleteVolume
          }
        }
        let event = self.createEvent('hybridAliyunDisk.action.updateDeleteWithInstance', self.hybridAliCloudDisk.name)
        return self.dispatchActionWithEvent('hybridAliCloudDisk/update', param, null, event);
      },

      pageAttach() {
        let self = this, uuid = '';
        uuid = self.windowData.dataUuid;
        self.openDialog('HybridAliCloudEcsSingleSelect', {
          conditions: [],
          select: (ecsUuid) => {
            self.attach(ecsUuid, [uuid])
              .then(() => {
                self.detailQuery()
              })
          }
        })
      },

      pageDetach() {
        const self = this
        let uuid = self.windowData.dataUuid;
        if (!(self.dbData.hybridAliyunDisk[uuid].ecsInstanceUuid && self.dbData.hybridAliyunDisk[uuid].diskType === 'data'))
          return
        self.openDialog('ConfirmDlg', {
          uuidList: [uuid],
          title:'hybridAliyunDisk.detach',
          description: 'hybridAliyunDisk.detachDisk',
          icon: 'volume_popupico',
          getName: (uuid) => {
            return self.dbData.hybridAliyunDisk[uuid].name;
          },
          ok: () => {
            self.detach( [uuid])
              .then(() => {
                self.detailQuery()
              })
          }
        })
      },

      pageDelete() {
        let self = this,  uuidList = [];
        uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          uuidList: uuidList,
          title:'hybridAliyunDisk.delete',
          description: 'hybridAliyunDisk.deleteDisk',
          icon: 'volume_popupico',
          isChecked: true,
          checkBoxText: 'hybrid.deleteOrigin',
          getName: (uuid) => {
            return self.dbData.hybridAliyunDisk[uuid].name;
          },
          ok: (isDeleteOrigin) => {
            self.delete(isDeleteOrigin, [self.windowData.dataUuid])
              .then(() => {
                self.$router.push({name: 'hybridaliclouddisk'})
              })
          }
        })
      },
    }
  }
</script>

<style scoped lang="less">
  @import '../../../style/mixins.less';
  .icon{
    .detail-icon('~assets/volume_large.svg')
  }
</style>
