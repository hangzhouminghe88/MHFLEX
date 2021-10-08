<template>
 <detail-template>
   <div slot="header" class="detail-header">
     <span class="detail-title">
       腾讯云云盘详情
     </span>
     <span class="detail-header-item" @click="close()">
       <span class="create-back">
         <i class="el-icon-back"></i>
         <span style="font-size: 12px;">
           回到腾讯云云盘列表
         </span>
       </span>
     </span>
     <span class="detail-header-item">
       <drop-down class="detail-dropdown">
         <span slot="title">
           <span class="text">
             {{$t('hybridAliyunDisk.Actions')}}
           </span>
         </span>
         <span slot="content">
           <div class="dropdown-content">
              <a style="margin-top: 12px;" @click="tencentDisk && !tencentDisk.ecsInstanceUuid && detailTencentAttach()" :class="{'disabled-text': !(tencentDisk && !tencentDisk.ecsInstanceUuid)}">{{$t('common.attach')}}</a>
              <a @click="!canDetachEcsInstance && detailTencentDetach()" :class="{'disabled-text': !!canDetachEcsInstance}">{{$t('common.detach')}}</a>
              <!--<a @click="isSelected && pageTencentDiskAsync()" :class="{'disabled-text': !isSelected}">从可用区同步</a> -->
              <a style="margin-bottom: 12px;" @click="canDeleteDisk() && detailTencentDelete()" :class="{'disabled-text': !canDeleteDisk()}">{{$t('common.destroy')}}</a>
           </div>
         </span>
       </drop-down>
     </span>
     <el-tabs v-model="activeName" tab-position="bottom" class="detail-tab">
       <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
     </el-tabs>
   </div>

   <div slot="body" class="detail-body">
     <div class="left">
       <div class="left-header">
         <div class="icon"></div>
         <div class="after-icon"></div>
         <detail-name class="name" :param="updateResourceParam('name')"/>
         <detail-description class="description" :param="updateResourceParam('description')"/>
       </div>
       <div class="left-body">
         <div class="detail-block-header">
           {{$t('common.overview')}}
         </div>
         <detail-row
           v-for="(item, index) in leftGroup"
           :key="index"
           :param="{
             title: $t(item.title),
             content: item.content
         }"/>
         <detail-switch
           v-if="tencentDisk && tencentDisk.diskType=== 'DATA_DISK'"
           :param="{
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
       </div>
       <div class="split-line"></div>
     </div>
     <div class="right">
       <div style="height: 40px"></div>
       <div class="detail-block-header">
         {{$t('common.moreInformation')}}
       </div>
       <detail-row
        v-for="(item, index) in rightGroup"
        :key="index"
        :param="{
          title: $t(item.title),
          content: item.content,
          copy: item.copy,
          handler: () => {
          if(item.type === 'izone')
            $router.push({name: 'detailHybridTencentIdentityZone', params: {uuid: tencentDisk.identityZoneUuid}})
          if(item.type === 'ecs')
            $router.push({name: 'detailHybridTencentEcs', params: {uuid: tencentDisk.ecsInstanceUuid}})
          }
        }"
       />
      <div class="split-line"></div>
     </div>
   </div>
 </detail-template>
</template>

<script>
  import DetailTemplate from 'src/component/DetailTemplate';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import { mapGetters } from 'vuex';
  import Methods from '../Methods';

  export default {
    name: "DetailHybridTencentDiskPage",

    mixins: [WindowBase, Methods, PageBase],

    components: {
      DetailTemplate
    },

    computed: {
      ...mapGetters({
        get: 'hybridTencentDisk/get'
      }),
      tencentDisk() {
        return this.get(this.windowData.dataUuid);
      },
      leftGroup() {
        return [
          {title: 'hybridAliyunDisk.diskId', content: this.tencentDisk && this.tencentDisk.diskId},
          {title: 'hybridAliyunDisk.diskCategory', content: this.tencentDisk && this.$t(`hybridTencentDisk.${(this.tencentDisk.diskCategory)}`)},
          {title: 'common.size', content: this.tencentDisk && this.tencentDisk.sizeWithGB + 'G'},
          {title: 'hybridAliyunDisk.billingMethod', content: this.tencentDisk && this.tencentDisk.diskChargeType ? this.$t(`hybridTencentDisk.${this.tencentDisk.diskChargeType}`) : this.$t('hybridTencentDisk.afterPayment') },
          {title: 'hybridAliyunDisk.diskType', content: this.tencentDisk && this.$t(`hybridTencentDisk.${this.tencentDisk.diskType}`)},
          {title: 'common.createDate', content: this.tencentDisk && this.tencentDisk.createDate && formatDatetime(new Date(this.tencentDisk.createDate))},
          {title: 'common.lastOpDate', content: this.tencentDisk && this.tencentDisk.lastOpDate && formatDatetime(new Date(this.tencentDisk.lastOpDate))},
        ]
      },
      rightGroup() {
        return [
          {title: 'common.uuid', content: this.windowData.dataUuid, copy: true},
          {title: 'hybridecsinstance.instance', content: this.tencentDisk && this.tencentDisk.ecsName, link: true, type: 'ecs'},
          {title: 'common.hybrididentityzone', content: this.tencentDisk && this.tencentDisk.identityZoneName, link: true, type: 'izone'},
        ]
      },
          //是否可以加载云主机
     canDetachEcsInstance() {
        let self = this;
         if(self.tencentDisk && self.tencentDisk.ecsInstanceUuid) {
            return false;
         }
         return true;
      },
    },

    data() {
      return {
        activeName: 'info',
        deleteEcsFollowDeleteVolume: false
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
      }).then( () => {
        self.detailQuery();
      })
    },

    methods: {
      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridTencentDisk/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },
       //更新名称、描述
      updateResourceParam(param) {
        let self = this;
        return {
          getValue: () => {
            return self.tencentDisk && self.tencentDisk[param];
          },
          setValue: (newVal) => {
            if(self.tencentDisk && self.tencentDisk[param] === newVal) return;
            let event = self.createEvent(`common.updateInfo${param}`, self.tencentDisk.name);
            let realParam = {
              uuid: self.windowData.dataUuid,
              param: {
                [param]: newVal
              }
            };
            if(param === 'description') {
              realParam = {
              uuid: self.windowData.dataUuid,
              param: {
                [param]: newVal,
                name: self.tencentDisk.name
              }
            };
            }
            self.dispatchActionWithEvent('hybridTencentDisk/update', realParam, null, event).then(() => self.detailQuery());
          }
        }
      },
      canDeleteEcs() {
        let self  = this;
        if(self.tencentDisk && !self.tencentDisk.ecsInstanceUuid){
          return true;
        }
        return false;
      },

    //是否可以删除
    canDeleteDisk () {
      let self = this;
      let canDelete = [self.windowData.dataUuid].some( (uuid) => {
        return self.tencentDisk && self.tencentDisk.diskType === 'DATA_DISK' && !self.tencentDisk.ecsInstanceUuid
      })
      return canDelete;
    },
    //删除云盘
    detailTencentDelete() {
      let self = this,
        uuidList = [];
      self.tencentDisk.diskType === 'DATA_DISK' && !self.tencentDisk.ecsInstanceUuid ? uuidList.push(self.windowData.dataUuid) : uuidList = uuidList;
      self.openDialog('ConfirmDlg', {
        title: 'hybridAliyunDisk.delete',
        description: 'hybridAliyunDisk.deleteDisk',
        icon: 'volume_popupico',
        isChecked: true,
        uuidList,
        checkBoxText: '同时删除腾讯云上资源',
        getName: (uuid) => {
           return self.dbData.hybridTencentDisk[uuid].name;
        },
        ok: (isDeleteOrigin) => {
          return self.delete(uuidList, isDeleteOrigin)
            .then(() => {
              self.detailQuery();
            });
        }
      })
    },
    //绑定云主机
    detailTencentAttach() {
      let self = this, uuid = '';
      uuid = [self.windowData.dataUuid];
      self.openDialog('HybridTencentEcsInstanceSingleSelect', {
        conditions: [],
        select: (ecsUuid) => {
          self.attach(ecsUuid, [uuid])
            .then(() => {
              self.detailQuery()
            })
        }
      })
    },
    //解绑云主机
    detailTencentDetach() {
      const self = this
      let uuidList = []
      if (self.dbData.hybridTencentDisk[self.windowData.dataUuid].ecsInstanceUuid && self.dbData.hybridTencentDisk[self.windowData.dataUuid].diskType === 'DATA_DISK') uuidList.push(self.windowData.dataUuid)
      if (uuidList.length <= 0) return
      self.openDialog('ConfirmDlg', {
        uuidList: uuidList,
        title:'hybridAliyunDisk.detach',
        description: 'hybridAliyunDisk.detachDisk',
        icon: 'volume_popupico',
        getName: (uuid) => {
          return self.dbData.hybridTencentDisk[uuid].name;
        },
        ok: () => {
          self.detach(uuidList)
            .then(() => {
              delete self.dbData.hybridTencentDisk[self.windowData.dataUuid].ecsInstanceUuid;
              self.detailQuery()
            })
        }
      })
    },
      setDeleteEcs() {
        let self = this;
        let param = {
          uuid: self.windowData.dataUuid,
          param: {
            "deleteWithInstance": self.deleteEcsFollowDeleteVolume
          }
        }
        let event = self.createEvent('hybridAliyunDisk.action.updateDeleteWithInstance', self.tencentDisk.name)
        return self.dispatchActionWithEvent('hybridTencentDisk/update', param, null, event);
      },

      close(){
        this.$router.push({name: 'hybridtencentdisk'})
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
