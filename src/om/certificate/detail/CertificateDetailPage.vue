<template>
 <detail-template>
   <div slot="header" class="detail-header">
     <span class="detail-title">证书详情</span>
     <span class="detail-header-item create-back" @click="$router.push({name: 'certificate'})">
       <i class="el-icon-back"></i>
       <span style="font-size: 12px">回到证书列表</span>
     </span>
     <span class="detail-header-item">
       <drop-down class="detail-dropdown">
         <span slot="title">
           <span class="text">{{$t('certificate.actions')}}</span>
         </span>
         <span slot="content">
           <div class="dropdown-content">
             <a style="margin: 12px 0px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
           </div>
         </span>
       </drop-down>
     </span>
     <el-tabs class="detail-tab" v-model="currTab" :active-name="currTab" tab-position="bottom">
       <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
       <el-tab-pane :label="$t('common.listener')" name="listener"></el-tab-pane>
     </el-tabs>
   </div>
   <div slot="body" class="detail-body" v-if="currTab === 'info'">
     <div class="left">
       <div class="left-header">
         <base-icon name="certificate_ico"/>
         <div class="after-icon"></div>
       </div>
       <div class="left-body">
         <detail-name class="name" :param="updateResource('name')"/>
         <detail-description class="description" :param="updateResource('description')"/>
         <div class="detail-block-header">
           {{$t('common.overview')}}
         </div>
         <detail-row
           :param="{
             title: 'common.createDate',
             content: model.createDate && formatDatetime(new Date(model.createDate))
           }"
         />
         <detail-row
           :param="{
             title: 'common.lastOpDate',
             content: model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
           }"
         />
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
           content: model && model.uuid,
           copy: () => {return true}
         }"
       />
       <detail-row
         :param="{
           title: 'common.certificate',
           content: model && model.certificate,
           copy: true
         }"
       />
     </div>
   </div>
   <div slot="body" class="detail-body" v-if="currTab === 'listener'">
     <load-balance-listener-tab-list :param="{conditions: '', uuid: windowData.dataUuid}" />
   </div>
 </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  import LoadBalanceListenerTabList from "../components/LoadBalanceListenerTabList";
  export default {
    name: "CertificateDetailPage",
    mixins: [WindowBase],
    components: {LoadBalanceListenerTabList, DetailTemplate},
    data(){
      return {
        currTab: 'info',
      }
    },
    created(){
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
      self.updateWindow({
        dataUuid,
      }).then(() => {
        self.detailQuery();
      })
    },
    computed: {
      ...mapGetters({
        get: 'certificate/get'
      }),
      model(){
        let self = this;
        return self.get(self.$route.params.uuid);
      }
    },
    methods: {
      ...Utils,
      detailQuery(){
        let self = this;
        return self.dispatchAction('certificate/batchQuery', {q: [`uuid=${self.windowData.dataUuid}`]})
      },
      updateResource(name){
        let self = this;
        if(!self.model[name]) true;
        return {
          getValue(){
            return self.model[name];
          },
          setValue(newVal){
           self.updateRes(name, newVal);
          },
          canEdit:() => {return true}
        }
      },
      updateRes(key, value){
        let realParam = {}, self = this;
        if(!key)return ;
        realParam[key] = value;
        let event = self.createEvent('common.updateInfo' + key, value);
        self.dispatchActionWithEvent('certificate/update', {uuid: self.model.uuid, param: realParam}, undefined, event)
      },
      //删除证书
      detailDelete(){
        let self = this, selectedUuidList = [];
        selectedUuidList = [self.$route.params.uuid];
        self.openDialog('ConfirmDlg',{
          title: 'certificate.delete',
          description: 'certificate.deleteConfirm',
          icon: 'certificate_n',
          uuidList: selectedUuidList,
          ok: () => {
            return self.dispatchActionWithEvent('certificate/delete', selectedUuidList)
              .then(() => {
                self.$router.push({name: 'certificate'})
              })
          },
          getName(uuid){
            return self.model.name;
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
 @import "../../../style/mixins.less";
  .icon{
    .detail-icon('~assets/certificate_ico.svg');
  }
</style>
