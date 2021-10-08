<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">告警模板详情</span>
     <span class="create-back detail-header-item" @click="$router.push({name: 'zwatchsnstexttemplate'})">
       <i class="el-icon-back"></i>
       <span style="font-size: 12px;">回到告警模板列表</span>
     </span>
      <span class="detail-header-item">
       <drop-down class="detail-dropdown">
         <span slot="title">
           <span class="text">{{$t('zwatchSNSTextTemplate.actions')}}</span>
         </span>
         <span slot="content">
           <div class="dropdown-content">
             <a style="margin-top: 12px;" :class="{'disabled-text': !canSetDefault([windowData.dataUuid])}"
                @click="canSetDefault([windowData.dataUuid]) && setDefault(windowData.dataUuid, true)">{{$t('zwatchSNSTextTemplate.setDefault')}}</a>
             <a :class="{'disabled-text': canSetDefault([windowData.dataUuid])}"
                @click="!canSetDefault([windowData.dataUuid]) && setDefault(windowData.dataUuid, false)">{{$t('zwatchSNSTextTemplate.unsetDefault')}}</a>
             <a style="margin-bottom: 12px;" @click="detailDelete()">{{$t('common.destroy')}}</a>
           </div>
         </span>
       </drop-down>
     </span>
      <el-tabs tab-position="bottom" v-model="currTab" class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="zwatch_snstext_template_ico"/>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <div class="detail-row editable">
            <div class="detail-title">{{$t('zwatchSNSTextTemplate.templateText')}}{{$t('common.colon')}}</div>
            <div class="detail-container">
              <span class="edit-icon" v-if="!editTemplate" @click="editTemplate=true; templateText = model.template">
                <i class="el-icon-edit"></i>
              </span>
            </div>
          </div>
          <span v-if="!editTemplate">{{model.template}}</span>
          <span v-if="editTemplate">
             <textarea rows="20" v-model="templateText" @blur="updateTemplate('template', templateText)"></textarea>
          </span>
          <div class="detail-row editable">
            <div class="detail-title">{{$t('zwatchSNSTextTemplate.recoverTemplateText')}}{{$t('common.colon')}}</div>
            <div class="detail-container">
              <span class="edit-icon" v-if="!editRecoveryTemplate" @click="editRecoveryTemplate=true; recoveryTemplateText = model.recoveryTemplate">
                <i class="el-icon-edit"></i>
              </span>
            </div>
          </div>
          <span v-if="!editRecoveryTemplate">{{model.template}}</span>
          <span v-if="editRecoveryTemplate">
            <textarea rows="20" v-model="recoveryTemplateText" @blur="updateTemplate('recoveryTemplate', recoveryTemplateText)"></textarea>
          </span>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
           title: 'common.uuid',
           content: model.uuid
          }"
        />
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import {mapGetters} from 'vuex';
  import List from '../List';
  import LogList from "../../../component/LogList";

  export default {
    name: "ZwatchSNSTextTemplateDetailPage",
    mixins: [List],
    components: {LogList, DetailTemplate},
    data() {
      return {
        currTab: 'info',
        editTemplate: false,
        templateText: '',
        recoveryTemplateText: '',
        editRecoveryTemplate: false
      }
    },
    created() {
      let self = this, dataUuid = '';
      dataUuid = self.$route.params.uuid ? self.$route.params.uuid : ''
      self.updateWindow({
        dataUuid
      })
        .then(() => {
          self.detailQuery();
        })
    },
    computed: {
      ...mapGetters({
        get: 'zwatchSNSTextTemplate/get'
      }),
      model(){
        let self = this;
        return self.get(self.windowData.dataUuid);
      }
    },
    methods: {
      detailQuery(){
        let self = this;
        self.dispatchAction('zwatchSNSTextTemplate/basicQuery', {q: [`uuid=${self.windowData.dataUuid}`]})
      },
      setDefault(uuid, param) {
        let self = this;
        self.default(uuid, param);
      },
      async detailDelete() {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: 'zwatchSNSTextTemplate.delete',
          icon: 'zwatch_snstext_template_n',
          description: 'zwatchSNSTextTemplate.deleteConfirm',
          uuidList: [self.windowData.dataUuid],
          getName(uuid) {
            return self.zwatchSNSTextTemplate[uuid].name;
          },
          ok() {
            self.delete([self.windowData.dataUuid]).then(() => {
              self.$router.push({name: 'zwatchsnstexttemplate'})
            })
          }
        })
      },
      updateResourceParam(param){
        let self = this;
        return {
          getValue(){
            return self.model[param];
          },
          setValue(newVal){
            let realParam ={
              uuid: [self.windowData.dataUuid]
            }
            realParam['param'] = {}
            realParam['param'][param] = newVal;
            let event = self.createEvent(`common.updateInfo${param}`, newVal)
            self.dispatchActionWithEvent('zwatchSNSTextTemplate/update', realParam, null, event)
              .then(self.detailQuery());
          },
          canEdit(){
            return true;
          }
        }
      },
      updateTemplate(param, newVal){
        let self = this;
        if(newVal ===  self.model.template) {
          self[`edit${param.replace(/^[a-z]/, param.slice(0,1).toUpperCase())}`] = false;
          return;
        }
        let realParam ={
          uuid: [self.windowData.dataUuid]
        }
        realParam['param'] = {}
        realParam['param'][param] = newVal;
        let event = self.createEvent(`common.updateInfo${param}`, newVal)
        self.dispatchActionWithEvent('zwatchSNSTextTemplate/update', realParam, null, event)
          .then(self.detailQuery());
        self[`edit${param.replace(/^[a-z]/, param.slice(0,1).toUpperCase())}`] = false;
      }
    }
  }
</script>

<style scoped>
 .icon{
   position: absolute;
   display: inline-block;
   width: 60px;
   height: 60px;
   background-repeat: no-repeat;
 }
</style>
