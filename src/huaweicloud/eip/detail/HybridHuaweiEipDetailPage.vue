<template>
   <detail-template>
     <div slot="header" class="detail-header">
       <span class="detail-header-item">
         <span class="detail-title">华为云弹性Eip详情</span>
         <span class="create-back el-icon-back" @click="close()">回到华为云Eip列表</span>
       </span>
       <span class="detail-header-item">
         <drop-down class="detail-dropdown">
           <span slot="title">
             <span class="text">{{$t('common.actions')}}</span>
           </span>
           <span slot="content">
             <div class="dropdown-content">
              <a style="padding-top: 12px;" :class="{'disabled-text': isAttachEcs()}" @click="!isAttachEcs() && detailAttach()">{{$t('common.attach')}}</a>
              <a :class="{'disabled-text': !isAttachEcs()}" @click="isAttachEcs() && detailDetach()">{{$t('common.detach')}}</a>
              <a style="padding-bottom: 12px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
             </div>
           </span>
         </drop-down>
       </span>
       <el-tabs class="detail-tab" tab-position="bottom"
                v-model="currTab">
         <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
       </el-tabs>
     </div>
     <div slot="body" class="detail-body">
       <div class="left">
         <div class="left-header">
           <div class="icon"></div>
           <div class="after-icon"></div>
           <detail-name class="name" :param="updateResourceParam('name')"/>
           <detail-description class="description" :param="updateResourceParam('description')"></detail-description>
         </div>
         <div class="left-body">
           <div class="detail-block-header">{{$t('common.overview')}}</div>
           <detail-row :param="{
             title: $t('common.ipAddress'),
             content: hybridHuaweiEip && hybridHuaweiEip.eipAddress
           }"/>
            <detail-row :param="{
             title: $t('common.bandwidth'),
             content: hybridHuaweiEip && hybridHuaweiEip.bandWidth + 'M'
           }"/>
            <detail-row :param="{
             title: $t('common.createDate'),
             content: hybridHuaweiEip && hybridHuaweiEip.createDate  && formatDatetime(new Date(hybridHuaweiEip.createDate))
           }"/>
            <detail-row :param="{
             title: $t('common.lastOpDate'),
             content: hybridHuaweiEip && hybridHuaweiEip.lastOpDate  && formatDatetime(new Date(hybridHuaweiEip.lastOpDate))
           }"/>
           <div class="split-line"></div>
         </div>
       </div>
       <div class="right">
          <div style="height: 40px;"></div>
          <div class="detail-block-header">
            {{$t('common.moreInformation')}}
          </div>
          <detail-row :param="{
            title: 'common.uuid',
            content: windowData.dataUuid,
            copy: true
          }"></detail-row>
          <detail-row :param="{
            title: $t('hybridecsinstance.instance'),
            content: hybridHuaweiEip && hybridHuaweiEip.ecsName,
            handler: () => {
              $router.push({name: 'detailHybridHuaweiEcs', params: {uuid: hybridHuaweiEip.allocateResourceUuid}})
            }
          }"></detail-row>
          <detail-row :param="{
            title: $t('hybriddatacenter.region'),
            content: hybridHuaweiEip && hybridHuaweiEip.dataCenterName,
            handler: () => {
               $router.push({name: 'detailHybridHuaweiDataCenter', params: {uuid: hybridHuaweiEip.dataCenterUuid}})
            }
          }"></detail-row>
       </div>
     </div>
   </detail-template>
</template>

<script>
import DetailTemplate from 'src/component/DetailTemplate'
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import { mapGetters } from 'vuex';
import rpc from 'src/utils/rpc';
import Methods from '../Methods';
export default {
   name: 'HybridHuaweiEipDetailPage',
   mixins: [WindowBase, Methods],
   components: {
     'detail-template': DetailTemplate
   },
   computed: {
     ...mapGetters({
       'get': 'hybridHuaweiEip/get'
     }),
     hybridHuaweiEip:{
       get() {
          let _this = this;
         return _this.hybridObj;
       },
       set(val) {
         let _this = this;
         _this.hybridObj =  _this.get(_this.windowData.dataUuid);
       }
     }
   },
   data() {
     return {
       currTab: 'info',
       hybridObj: {}
     }
   },
   created() {
     let _this = this, dataUuid = _this.$route.params.uuid ? _this.$route.params.uuid : '';
     _this.updateWindow({
       dataUuid,
       methods: {
         query: _this.detailQuery
       }
     }).then(() => {
       _this.detailQuery();
     })
   },
   methods: {
     formatDatetime,
     //查询单条数据
     detailQuery() {
       let _this = this;
       return _this.dispatchAction('hybridHuaweiEip/basicQuery', {
         q: [`uuid=${_this.windowData.dataUuid}`]
       }).then(() => {
          _this.hybridHuaweiEip =  _this.get(_this.windowData.dataUuid)
        setTimeout(() => {
          _this.hybridHuaweiEip =  _this.get(_this.windowData.dataUuid)
        }, 500);
       });
     },
     //更新资源
     updateResourceParam(param) {
       let _this = this;
       return {
         setValue: (newVal) => {
           debugger;
            if(_.isEqual(newVal, _this.hybridHuaweiEip[param])) return;
            let event = this.createEvent(`common.updateInfo${param}`, _this.hybridHuaweiEip.name);
            let paramObj = {
              [param]: newVal,
              type: 'huawei'
            }
            _this.dispatchActionWithEvent('hybridHuaweiEip/update', {param: paramObj, uuid: _this.windowData.dataUuid}, null, event);
         },
         getValue: () => {
           return param === 'name' ? _this.hybridHuaweiEip && _this.hybridHuaweiEip[param] && _this.hybridHuaweiEip[param].replace(/zstack/g, '') : _this.hybridHuaweiEip && _this.hybridHuaweiEip[param] && _this.hybridHuaweiEip[param];
         },
         canEidt: () => {
           return true;
         }
       }
     },
     //是否绑定云主机
     isAttachEcs() {
      let _this = this;
      if(!_this.hybridHuaweiEip) return false;
      if(_.has(_this.hybridHuaweiEip, 'allocateResourceUuid')) return true;
      else return false;
    },
    //绑定云主机
    detailAttach() {
      let _this = this, allocateResourceUuidList = [];
       rpc.query('hybrid/huawei/eip')
          .then((resp) => {
            allocateResourceUuidList = resp.inventories.map(item => item.allocateResourceUuid);
            _this.updateDbTable({
              tableName: 'hybridHuaweiEip',
              list: resp.inventories
            })
            _this.openDialog('HybridHuaweiEcsInstanceSingleSelect', {
              conditions: [`uuid!?=${allocateResourceUuidList}`],
              select : (vmNicUuid) => _this.attach(vmNicUuid, [_this.windowData.dataUuid]).then(() => _this.detailQuery())
            })
          })
    },
    //删除云主机
    detailDelete() {
      let _this = this, uuidList = [];
       uuidList = [_this.windowData.dataUuid];
       _this.openDialog('ConfirmDlg', {
        title:'hybrideip.delete',
        description: 'hybrideip.deleteEip',
        icon: 'eip_popupico',
        uuidList,
        isChecked: true,
        checkBoxText: '同时删除华为云上资源',
         getName: (uuid) => {
           return _this.dbData.hybridHuaweiEip[uuid].name.replace(/zstack/, '');
         },
         ok: (isDeleteOrigin) => {
            _this.delete(uuidList, isDeleteOrigin)
            .then(() => {
              _this.close();
            });
         }
       })
    },
    //解绑云主机
    detailDetach() {
      let _this = this, uuidList = [];
      if (_.has(_this.hybridHuaweiEip, 'allocateResourceUuid')) uuidList.push(_this.windowData.dataUuid)
      _this.openDialog('ConfirmDlg', {
        uuidList: uuidList,
        title: 'hybrideip.detachEip',
        description: 'hybrideip.detach',
        icon: 'eip_popupico',
        getName: (uuid) => {
          return _this.dbData.hybridHuaweiEip[uuid].name.replace(/zstack/g, '');
        },
        ok: () => _this.detach(uuidList).then(() => _this.detailQuery())
      })
    },
    close() {
      let _this = this;
      _this.$router.push({name: 'hybridhuaweieip'})
    }
   }
}
</script>

<style lang="less" scoped>
  @import url('../../../style/mixins');
  .icon{
    .detail-icon('~assets/eip_ico.svg');
  }
</style>
