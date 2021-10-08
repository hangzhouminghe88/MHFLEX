<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <div class="detail-header-item" @click="close()">
        <span class="detail-title">华为云云盘详情</span>
        <span class="create-back el-icon-back">
          回到华为云云盘列表
        </span>
      </div>
      <div class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">
              {{$t('common.actions')}}
            </span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
               <a style="padding-top: 12px"
                  :class="{'disabled-text': !!dbData.hybridHuaweiDisk[windowData.dataUuid].ecsInstanceUuid}"
                  @click="!dbData.hybridHuaweiDisk[windowData.dataUuid].ecsInstanceUuid && detailHuaweiAttachEcs()">{{$t('common.attach')}}</a>
              <a @click="canDetachEcsInstance() && detailHuaweiDiskDetach()"
                 :class="{'disabled-text': !canDetachEcsInstance()}">{{$t('common.detach')}}</a>
              <a style="padding-bottom: 12px"
                 @click="canDeleteDisk() && detailHuaweiDiskDelete()"
                 :class="{ 'disabled-text': !canDeleteDisk() }">
                {{$t('common.destroy')}}
              </a>
            </div>
          </span>
        </drop-down>
      </div>
      <el-tabs class="detail-tab" v-model="currTab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="'云盘快照'" name="shapshot"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <div class="icon"></div>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div id="common-overview" class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row :param="{
            title: '云盘Id',
            content: hybridHuaweiDisk && hybridHuaweiDisk.diskId
          }"/>
          <detail-row :param="{
            title: ' 云盘类型',
            content: hybridHuaweiDisk && $t(`hybridHuaweiecsinstance.${hybridHuaweiDisk.diskCategory}`)
          }"/>
          <detail-row :param="{
            title: '云盘大小',
            content: hybridHuaweiDisk && `${hybridHuaweiDisk.sizeWithGB}GB`
          }"/>
          <detail-row :param="{
            title: '云盘类型',
            content: $t(`hybridHuaweiDisk.${hybridHuaweiDisk.diskType}`)
          }"/>
          <detail-row :param="{
            title: 'common.createDate',
            content: hybridHuaweiDisk && hybridHuaweiDisk.createDate && formatDatetime(new Date(hybridHuaweiDisk.createDate))
          }"/>
          <detail-row :param="{
            title: 'common.lastOpDate',
            content: hybridHuaweiDisk && hybridHuaweiDisk.lastOpDate && formatDatetime(new Date(hybridHuaweiDisk.lastOpDate))
          }"/>
        </div>
        <div class="split-line"></div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row :param="{
          title: 'UUID',
          content: windowData.dataUuid,
          copy: true
        }"/>
        <detail-row v-if="hybridHuaweiDisk && hybridHuaweiDisk.ecsName" :param="{
          title: 'hybridecsinstance.instance',
          content: hybridHuaweiDisk && hybridHuaweiDisk.ecsName ? hybridHuaweiDisk.ecsName : $t('common.noAttach'),
          handler: () => {

          }
        }"/>
        <detail-row v-else :param="{
          title: 'hybridecsinstance.instance',
          content: hybridHuaweiDisk && hybridHuaweiDisk.ecsName ? hybridHuaweiDisk.ecsName : $t('common.noAttach'),
        }"/>
        <detail-row :param="{
          title: 'hybrididentityzone.identityzone',
          content: hybridHuaweiDisk && hybridHuaweiDisk.identityZoneName,
          handler: ()=> {

          }
        }"/>
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'shapshot'">
      <hybrid-huawei-disk-shap-shot-tab-list :param="{createShap: createShap, conditions: [`diskUuid=${windowData.dataUuid}`], uuid:`${windowData.dataUuid}`}"
                                             @showCreateShap="showCreateShap"></hybrid-huawei-disk-shap-shot-tab-list>
    </div>

    <div slot="footer">
      <create-huawei-shap :param="createShapParam"
                          v-if="showShap" @close="showShap = false"></create-huawei-shap>
    </div>
  </detail-template>
</template>

<script>
   //详情模板
   import DetailTemplate from 'src/component/DetailTemplate';
   import WindowBase from 'src/windows/Window';
   //导入mapGetters计算云盘对象
   import { mapGetters } from 'vuex';
   import { formatDatetime } from 'src/utils/utils';
   import Methods from '../Methods';
   import HybridHuaweiDiskShapShotTabList from "../components/HybridHuaweiDiskShapShotTabList";
   import CreateHuaweiShap from "../components/CreateHuaweiShap";
    export default {
      name: "DetailHybridHuaweiDiskPage",
      mixins: [WindowBase, Methods],
      components: {
        HybridHuaweiDiskShapShotTabList,
        DetailTemplate,
        CreateHuaweiShap
      },
      //计算方法计算详情数据对象
      computed: {
        ...mapGetters({
          get: 'hybridHuaweiDisk/get'
        }),
        hybridHuaweiDisk() {
          let self = this;
          return self.get(self.windowData.dataUuid);
        }
      },
      //初始化数据
      data() {
        return {
          currTab: 'info',
          createShapParam: {},
          showShap: false
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
      formatDatetime,
        //返回华为云云盘列表
        close() {
          let self = this;
          self.$router.push({name: 'hybridhuaweidisk'})
        },
        //查询华为云云盘详情
        detailQuery() {
          let self = this;
          self.dispatchAction('hybridHuaweiDisk/basicQuery', {
            q: [`uuid=${self.windowData.dataUuid}`]
          })
        },
        //是否可以卸载ecs
        canDetachEcsInstance(){
          let self = this, isDetach;
          isDetach = self.dbData.hybridHuaweiDisk[self.windowData.dataUuid] && self.dbData.hybridHuaweiDisk[self.windowData.dataUuid].ecsInstanceUuid && self.dbData.hybridHuaweiDisk[self.windowData.dataUuid].diskType.toLocaleLowerCase() === 'data'
          if(isDetach){
            return true;
          }else{
            return false;
          }
        },
        detailHuaweiAttachEcs() {
          let self = this, uuid = '';
          uuid = self.windowData.dataUuid;
          self.openDialog('HybridHuaweiEcsInstanceSingleSelect', {
            conditions: [`identityZoneUuid=${self.dbData.hybridHuaweiDisk[uuid].identityZoneUuid}`],
            select: (ecsUuid) => {
              self.attach(ecsUuid, [uuid])
                .then(() => {
                  self.detailQuery()
                })
            }
          })
        },
        detailHuaweiDiskDetach() {
          const self = this
          let uuid = self.windowData.dataUuid, uuidList = [];
          if (self.dbData.hybridHuaweiDisk[self.windowData.dataUuid] && self.dbData.hybridHuaweiDisk[uuid].ecsInstanceUuid && self.dbData.hybridHuaweiDisk[uuid].diskType.toLocaleLowerCase() === 'data') uuidList.push(uuid)
          if (uuidList.length <= 0) return
          self.openDialog('ConfirmDlg', {
            uuidList: uuidList,
            title:'hybridAliyunDisk.detach',
            description: 'hybridAliyunDisk.detachDisk',
            icon: 'volume_popupico',
            getName: (uuid) => {
              return self.dbData.hybridHuaweiDisk[uuid].name;
            },
            ok: () => {
              self.detach(self.selectedList)
                .then(() => {
                  self.detailQuery()
                })
            }
          })
        },
        detailHuaweiDiskDelete() {
          let self = this,
            uuidList = [], uuid = self.windowData.dataUuid;
          self.dbData.hybridHuaweiDisk[self.windowData.dataUuid] && self.dbData.hybridHuaweiDisk[uuid].diskType.toLocaleLowerCase() === 'data' && !self.dbData.hybridHuaweiDisk[uuid].ecsInstanceUuid ? uuidList.push(uuid) : uuidList;
          self.openDialog('ConfirmDlg', {
            title: 'hybridAliyunDisk.delete',
            description: 'hybridAliyunDisk.deleteDisk',
            icon: 'volume_popupico',
            isChecked: true,
            uuidList,
            checkBoxText: self.$t('hybridTencentDisk.warning'),
            getName: (uuid) => {
              return self.dbData.hybridHuaweiDisk[uuid].name;
            },
            ok: (isDeleteOrigin) => {
              return self.delete(uuidList, isDeleteOrigin)
                .then(() => {
                  self.close();
                });
            }
          })
        },
        canDeleteDisk() {
          const self = this
          if (self.dbData.hybridHuaweiDisk[self.windowData.dataUuid].diskType.toLocaleLowerCase() !== 'data' || self.dbData.hybridHuaweiDisk[self.windowData.dataUuid].ecsInstanceUuid) {
            return false
          }
          return true
        },
        //更新华为云云盘名称、描述
        updateResourceParam(param) {
          let self = this;
          return {
            getValue: () => {
              return self.hybridHuaweiDisk && self.hybridHuaweiDisk[param];
            },
            setValue: (newVal) => {
              if(self.hybridHuaweiDisk && self.hybridHuaweiDisk[param] === newVal) return;
              let event = self.createEvent(`common.updateInfo${param}`, self.hybridHuaweiDisk.name);
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
                    name: self.hybridHuaweiDisk.name
                  }
                };
              }
              self.dispatchActionWithEvent('hybridHuaweiDisk/update', realParam, null, event).then(() => self.detailQuery());
            },
            canEdit: () => {
              return true;
            }
          }
        },
        //展示创建云盘快照页
        showCreateShap(isShow) {
          this.showShap = isShow
        },
        createShap(param) {
          let self = this;
          self.createShapParam = param;
        }
      }
    }
</script>

<style scoped lang="less">
   @import "../../../style/mixins.less";
  .icon{
   .detail-icon('~assets/volume_large.svg')
  }
</style>
