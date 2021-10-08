<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">阿里云镜像详情</span>
      <div class="detail-header-item create-back"  @click="$router.push({name: 'hybridalicloudimage', params: {currTab: windowData.currTab}})">
        <i class=" el-icon-back"></i>
        <span style="font-size: 12px">回到阿里云镜像列表</span>
      </div>
      <div class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('hybridimage.moreActions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding: 12px 0px;" @click="detailDelete()">{{$t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
      </div>
      <el-tabs class="detail-tab" tab-position="bottom" v-model="currTab">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="currTab === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="image_large"/>
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
              title: 'common.platform',
              content: hybridImage && hybridImage.platform
            }"
          />
          <detail-row
            :param="{
              title: 'common.format',
              content: hybridImage && hybridImage.format
            }"
          />
          <detail-row
           :param="{
             title: 'hybridimage.ecsImageSize',
             content: hybridImage.ecsImageSize && `${hybridImage.ecsImageSize}GB`
           }"
          />
          <detail-row
            :param="{
              title: 'hybridimage.type',
              content:  hybridImage.type && $t(`hybridimage.${hybridImage.type}`)
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: hybridImage.createDate && formatDatetime(new Date(hybridImage.createDate))
            }"
          />
        </div>
        <div class="split-line"></div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t("common.moreInformation")}}
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
            title: 'hybridimage.osName',
            content: hybridImage.osName && hybridImage.osName
          }"
        />

        <detail-row v-if="hybridImage.localImageUuid && hybridImage.localImageUuid"
          :param="{
            title: 'hybridimage.zstackImage',
            content: hybridImage.localImageUuid && getImageName(hybridImage.localImageUuid),
            handler: () => {
              if(hybridImage && hybridImage.localImageUuid && dbData.image[hybridImage.localImageUuid]){
                $router.push({name: 'detailImage', params:{ uuid: hybridImage.localImageUuid, currTab: 'available' }})
              }
            }
          }"
        />
        <detail-row
          :param="{
            title: 'hybridimage.ecsImageId',
            content: hybridImage.ecsImageId && hybridImage.ecsImageId
          }"
        />
        <detail-row
          :param="{
            title: 'hybridimage.dataCenter',
            content: hybridImage.dataCenterUuid &&  getDataCenterName(hybridImage.dataCenterUuid),
            handler: () => {
              if(hybridImage.dataCenterUuid) {
                $router.push({name: 'detailHybridAliCloudDataCenter', params: {uuid: hybridImage.dataCenterUuid}})
              }
            }
          }"
        />
      </div>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Utils from 'src/utils/utils';
  import { mapGetters } from 'vuex';
  import Methods from '../Methods';

  export default {
    name: "DetailHybridAliCloudImagePage",

    mixins: [WindowBase, PageBase, Methods],

    components: {DetailTemplate},

    data() {
      return {
        currTab: 'info'
      }
    },

    created() {
      let self = this, currTab = '', dataUuid = '';
      currTab = self.$route.params.currTab ? self.$route.params.currTab : '';
      dataUuid =  self.$route.params.uuid ?  self.$route.params.uuid : '';
      self.updateWindow({
        currTab,
        dataUuid,
        methods: {
          query: self.detailQuery
        }
      }).then(() => {
        self.detailQuery()
      })
    },

    computed: {
      ...mapGetters({
        get: 'hybridAliCloudImage/get'
      }),
      hybridImage(){
        let self = this;
        return self.get(self.windowData.dataUuid);
      }
    },

    methods: {
      ...Utils,
      //查询单个表数据
      detailQuery() {
        let self = this;
        return self.dispatchAction('hybridAliCloudImage/basicQuery', {
          q: [`uuid=${self.windowData.dataUuid}`]
        })
      },
      //更新资源
      updateResourceParam(param) {
        let self = this;
        return {
          getValue: () => {
            return self.hybridImage[param];
          },
          setValue: (newVal) => {
            if(newVal === self.hybridImage[param]) return;
            self.updateAliyunResouce([self.windowData.dataUuid], 'hybrid/aliyun/image', 'updateEcsImage', param, newVal, 'hybridImage');
          },
          canEdit: () => {
            return self.windowData.currTab === 'self';
          }
        }
      },
      //删除阿里云镜像
      detailDelete() {
       let self = this, uuidList = [];
        uuidList = [self.windowData.dataUuid];
        self.openDialog('ConfirmDlg', {
          uuidList,
          title: 'image.deleteImage',
          description: 'image.info.deleteConfirm',
          icon: 'image_popupico',
          checkBoxText: 'hybrid.deleteOrigin',
          isChecked: !self.isAllSystemImage(),
          warning: !self.isAllSystemImage() ? 'hybrid.info.deleteImage' : '',
          getName: (uuid) => {
            return self.hybridImage.name;
          },
          ok: (isChecked) => {
            self.delete(isChecked, uuidList)
          }
        })
      },
      //判断是否是系统镜像
      isAllSystemImage() {
        let self = this;
        return [self.windowData.dataUuid].every((uuid) => self.hybridImage.type === 'system')
      },
    }
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins.less";
  .icon {
    .detail-icon('~assets/image_large.svg')
  }
</style>
