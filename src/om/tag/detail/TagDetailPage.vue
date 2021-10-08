<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">标签详情</span>
      <span class="detail-header-item create-back" @click="$router.push({name: 'tag'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到标签列表</span>
      </span>
      <span class="detail-header-item">
      	<drop-down class="detail-dropdown">
				  <span slot="title">
				  	<span class="text">{{$t('tag.action.name')}}</span>
			  	</span>
				  <span slot="content">
						<div class="dropdown-content">
              <a style="height: 25px; line-height: 25px;" @click="detailDelete()">{{$t('common.destroyed')}}</a>
						</div>
					</span>
			 </drop-down>
			</span>
      <el-tabs  v-model="activeName" tabPosition="bottom"
                class="detail-tab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane :label="$t('tag.bindedResource')" name="resource"></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="detail_tag"/>
          <div class="after-icon"></div>
          <detail-name class="name" :param="updateResource('name')"/>
          <detail-description class="description" :param="updateResource('description')"/>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
              title: 'common.color',
              content:`<span style='background-color: ${model.color};
                display: inline-block;
                width: 15px;
                height: 15px'></span>`,
                vHtml: () => {
                return true
              }
            }"
          />
          <detail-row
            :param="{
              title: 'UUID',
              content: model && model.uuid,
              copy: () => {
                return true;
              }
            }"
          />
          <detail-row
            :param="{
              title: 'common.owner',
              content: model && model.ownerName,
              handler: () => {
                $router.push({name: 'detailAccount', params: {uuid:model.ownerUuid}})
              }
            }"
          />
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
          {{$t('tag.resourceInfo')}}
        </div>
        <detail-row
          :param="{
            title: 'tag.allResourceCount',
            content: model && model.resourceCount
          }"
        />
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'resource'">
      <bind-tag-for-resource-tab :param="{uuid: windowData.dataUuid, refresh: detailQuery}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import TagMethods from 'src/om/tag/Methods';
  import Utils from 'src/utils/utils';
  import LogList from "../../../component/LogList";
  import BindTagForResourceTab from "../components/BindTagForResourceTab";
  export default {
    name: "TagDetailPage",
    mixins: [TagMethods, WindowBase],
    components: {BindTagForResourceTab, LogList, DetailTemplate},
    data(){
      return {
        activeName: 'info'
      }
    },
    computed: {
      model(){
        let self = this;
        return self.get(self.$route.params.uuid);
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        dataUuid: self.$route.params.uuid ? self.$route.params.uuid : ''
      })
        .then(() => {
          self.detailQuery();
        })
    },
    methods: {
      ...Utils,
      detailQuery() {
        let self = this;
        self.dispatchAction('tag/query', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
          .then(() => {
            self.dispatchAction('tag/queryResourceCount', [self.windowData.dataUuid])
          })
      },
      updateResource(resourceName){
        let self = this;
        return {
          getValue(){
            return  self.model && self.model[resourceName] ? self.model[resourceName] : '';
          },
          setValue(value){
            return self.update(resourceName, value);
          },
          canEdit(){
            return true;
          }
        }
      },
      update(key, value){
        let self = this, param = {};
        if(!key) return;
        param[key] = value;
        self.dispatchActionWithEvent('tag/update', {uuid: self.model.uuid, param})
          .then(() =>  {
            self.detailQuery();
          })
      },
      colorContent(){
        let self = this;
        return
      },
      //删除tag
      detailDelete(){
        let self = this;
        let uuidList = [self.$route.params.uuid];
        if (uuidList.length <= 0) return
        let paramObj = {
          title: 'tag.delete',
          description: 'tag.deleteDescription',
          uuidList,
          icon: 'tag_n',
          getName: (uuid) => {
            return this.getTag(uuid).name
          },
          ok: () => {
            self.delete(uuidList)
              .then(() => {
                self.$router.push({name: 'tag'})
              })
          }
        }
        let currOwnerUuid
        if (window.localStorage.getItem('isLoginFromProject') === 'true') {
          if (window.localStorage.getItem('isPlatformAdmin') === 'true') {
            currOwnerUuid = window.localStorage.getItem('accountUuid')
          } else {
            currOwnerUuid = window.localStorage.getItem('currProjectUuid')
          }
        } else {
          currOwnerUuid = window.localStorage.getItem('accountUuid')
        }

        let hasOtherTag = false
        uuidList.forEach(uuid => {
          if (self.getTag(uuid).ownerUuid !== currOwnerUuid) {
            hasOtherTag = true
          }
        })
        if (hasOtherTag) {
          paramObj.warning = 'tag.deleteOtherWarning'
        }
        return this.openDialog('ConfirmDlg', paramObj)
      }
    }
  }
</script>

<style scoped lang="less">
  @import "~src/style/mixins";
  .icon{
    .detail-icon('~assets/detail_tag.svg')
  }
  .tag{
    display: inline-block;
    width: 15px;
    height: 15px
  }
</style>
