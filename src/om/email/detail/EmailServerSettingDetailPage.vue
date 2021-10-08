<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">邮箱服务器详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'emailserversetting'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到邮箱服务器列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('monitoralarm.emailServerActions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
               <a style="margin-top: 12px;" @click="!inStates('Enabled') && pageEnable('Enabled', query)"
                  :class="{'disabled-text': inStates('Enabled')}">{{$t('common.enable')}}</a>
                <a  @click="!inStates('Disabled') && pageEnable('Disabled', query)"
                    :class="{'disabled-text': inStates('Disabled')}">{{$t('common.disable')}}</a>
              <a v-permission="'SHARE-RESOURCE'" v-if="dbData.common.isAdmin"
                 @click="model && canShare() && pageShareToAll('share', query)"
                 :class="{ 'disabled-text': (!model || !canShare())}">{{$t("common.shareToAll")}}</a>
             <a v-permission="'SHARE-RESOURCE'" v-if="dbData.common.isAdmin"
                @click="model && !canShare() && pageShareToAll('recall', query)" :class="{ 'disabled-text':(!model || canShare())}">{{$t("common.recallFromAll")}}</a>
             <a v-permission="'SHARE-RESOURCE'" v-if="dbData.common.isAdmin" @click="pageChangeResourceOwner(query)">{{$t("common.changeResourceOwner")}}</a>
             <a v-permission="'SNS.VALIDATE_EMAIL_PLATFORM'" @click="pageValidate()">{{ $t("common.validate") }}</a>
             <a v-permission="'SNS.DELETE_PLATFORM'" @click="pageDelete(query)" style="padding-bottom: 12px;">{{ $t("common.destroy") }}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs v-model="currTab" :active-name="currTab" tabPosition="bottom" class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('common.share')" name="shared"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="mail_detail"/>
          <div class="after-icon">
            <detail-info-state v-if="model.state" outer-class-name="detail-page-state" :state="model.state"/>
          </div>
          <detail-name class="name" :param="updateResourceParam('name')"/>
          <detail-description class="description" :param="updateResourceParam('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
              title: 'common.shareToAll',
              content: model.toPublic ? '是' : '否'
            }"
          />
          <detail-row
            :param="{
              title: 'common.owner',
              content: getOwnerName(),
              handler: () => {
                $router.push({name: 'detailAccount', params: {uuid: model.accountUuid}})
              }
            }"
          />
          <detail-row
            :param="{
              title: 'monitoralarm.smtpServer',
              content: model.smtpServer
            }"
          />
          <detail-row
            :param="{
              title: 'monitoralarm.smtpPort',
              content: model.smtpPort
            }"
          />
          <detail-row
            :param="{
              title: 'common.username',
              content: model.username
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
            content: model.uuid,
            copy: () => {
              return true;
            }
          }"
        />
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'shared'">
      <share-tab-list :param="{conditions: `resourceUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, tableName: 'emailserversetting'}"/>
    </div>
    <div slot="body" class="detail-body" v-if="currTab === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import EmailServerSettingList from 'src/om/email/List';
  import rpc from 'src/utils/rpc';
  import WindowBase from 'src/windows/Window';
  import Utils from  'src/utils/utils';
  import DetailInfoState from "../../../component/DetailInfoState";
  import ShareTabList from "../../../ecs/image/component/ShareTabList";
  import LogList from "../../../component/LogList";

  export default {
    name: "EmailServerSettingDetailPage",
    mixins: [WindowBase, EmailServerSettingList],
    components: {LogList, ShareTabList, DetailInfoState, DetailTemplate},
    data() {
      return {
        currTab: 'info',
        ownerName: ''
      }
    },
    computed: {
      selectedList() {
        let self = this;
        return [self.$route.params.uuid];
      },
      isSelected(){
        let self = this;
        return [self.$route.params.uuid].length >= 1;
      },
      model(){
        let self = this, emailserversettingA ={}, emailserversetting ={};
        emailserversettingA = _.get(self, `dbData.emailserversettingA[${self.$route.params.uuid}]`) || {};
        emailserversetting = _.get(self, `dbData.emailserversetting[${self.$route.params.uuid}]`);
        return _.assign({}, emailserversetting, emailserversettingA);
      }
    },
    created() {
      let dataUuid = this.$route.params.uuid
      this.updateWindow({
        justUpdateResource: false,
        dataUuid: dataUuid,
        methods: {
          query: this.query
        }
      })
        .then(() => {
          return this.query()
        }).then(() => {
        this.$forceUpdate()
      })
    },
    methods: {
      ...Utils,
      query() {
        let self = this;
        let script = `

def tmp = query("QuerySNSEmailPlatform uuid?=${this.$route.params.uuid}")
def EmailServerSettingList = tmp.result
put("emailserversetting", EmailServerSettingList)
`
        if (this.dbData.common.isAdmin) {
          script += `
def uuidList = EmailServerSettingList.collect{ it.uuid }
def EmailServerSettingA = []
def accountResourceRef = query("QueryAccountResourceRef resourceUuid?=" + uuidList.join(",")).result
def sharedResourceRef = query("QuerySharedResource resourceUuid?=" + uuidList.join(",")).result
uuidList.each{ uuid ->
  tmp = [:]
  tmp["uuid"] = uuid
  def accountRef = accountResourceRef.find { it.resourceUuid == uuid }
  tmp["accountUuid"] = ""
  if (accountRef && accountRef.accountUuid) {
    tmp["accountUuid"] = accountRef.accountUuid
  }
  tmp["toPublic"] = false
  def sharedRef = sharedResourceRef.find { it.resourceUuid == uuid }
  if (sharedRef && sharedRef.toPublic) {
    tmp["toPublic"] = true
  }
  EmailServerSettingA.push(tmp)
}
put("emailserversettingA", EmailServerSettingA)
`
        } else {
          script += `
def uuidList = EmailServerSettingList.collect{ it.uuid }
def EmailServerSettingA = []
def accountResourceRef = query("QueryAccountResourceRef resourceUuid?=" + uuidList.join(",")).result
def sharedResourceRef = query("QuerySharedResource resourceUuid?=" + uuidList.join(",")).result
uuidList.each{ uuid ->
  tmp = [:]
  tmp["uuid"] = uuid
  def accountRef = accountResourceRef.find { it.resourceUuid == uuid }
  tmp["accountUuid"] = ""
  if (accountRef && accountRef.accountUuid) {
    tmp["accountUuid"] = accountRef.accountUuid
  }
  tmp["toPublic"] = false
  def sharedRef = sharedResourceRef.find { it.resourceUuid == uuid }
  if (sharedRef && sharedRef.toPublic) {
    tmp["toPublic"] = true
  }
  EmailServerSettingA.push(tmp)
}
put("emailserversettingA", EmailServerSettingA)
`
        }
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          let result = resp.result
          return self.applyRespToDb(result, self)
        })
      },
      canShare(){
        let self = this;
        if(self.model.toPublic) return false;
        else return true;
      },
      updateResourceParam(name){
        let self = this;
        return {
          getValue(){
            return self.model && self.model[name];
          },
          canEdit(){
            return true;
          },
          setValue(value){
            self.update(name, value);
          }
        }
      },
      update(key, value){
        let  self = this, param = {};
        if(!key) return;
        self.updateResource('sns/application-platforms', 'updateSNSApplicationPlatform', key, 'emailserversetting', value)
      },
      getOwnerName(){
        let self = this;
        if(!self.model.accountUuid) return;
        let value = ''
        try {
          value = this.dbData.account[self.model.accountUuid].name
        } catch (e) {
          rpc.query(`accounts/${self.model.accountUuid}`)
            .then((resp) => {
              if (resp.inventories.length > 0) {
                this.updateDbRow({
                  tableName: 'account',
                  id: self.model.accountUuid,
                  data: resp.inventories[0]
                })
              }
            })
        }
        return value
      },
    }
  }
</script>

<style scoped lang="less">
  @import '~src/style/mixins';
  .icon{
    .detail-icon('~assets/mail_detail.svg')
  }
</style>
