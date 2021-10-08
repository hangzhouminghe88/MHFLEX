<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-header-item">
        <span class="detail-title">华为云镜像详情</span>
        <span class="create-back el-icon-back" @click="close()">回到华为云镜像列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding: 12px" @click="detailDelete()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <el-tabs class="detail-tab" v-model="currSelectTab" tab-position="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
      </el-tabs>
    </div>
    <div class="detail-body" slot="body" v-if="currSelectTab === 'info'">
       <div class="left">
         <div class="left-header">
           <div class="icon"></div>
           <div class="after-icon"></div>
           <detail-name class="name" :param="updateResourceParam('name')"></detail-name>
           <detail-description class="description" :param="updateResourceParam('description')"></detail-description>
         </div>
         <div class="left-body">
            <div class="detail-block-header">{{$t('common.overview')}}</div>
            <detail-row :param="{
              title: 'hybridimage.platform',
              content: huaweiImage && huaweiImage.platform
            }"/>
            <detail-row :param="{
              title: 'hybridimage.format',
              content: huaweiImage && huaweiImage.format
            }"/>
            <detail-row :param="{
              title: 'hybridimage.ecsImageSize',
              content: huaweiImage && huaweiImage.ecsImageSize
            }"/>
            <detail-row :param="{
              title: 'hybridimage.type',
              content: huaweiImage && huaweiImage.type
            }"/>
            <detail-row :param="{
              title: 'common.createDate',
              content: huaweiImage && huaweiImage.createDate && formatDatetime(new Date(huaweiImage.createDate))
            }"/>
            <detail-row :param="{
              title: 'common.lastOpDate',
              content: huaweiImage && huaweiImage.lastOpDate && formatDatetime(new Date(huaweiImage.lastOpDate))
            }"/>
         </div>
         <div class="split-line"></div>
       </div>
       <div class="right">
         <div style="height: 40px"></div>
         <div class="detail-block-header">{{$t('common.moreInformation')}}</div>
         <detail-row :param="{
           title: 'common.uuid',
           content: windowData.dataUuid,
           copy: true
         }"></detail-row>
         <detail-row :param="{
           title: 'hybridimage.zstackImage',
           content: huaweiImage && huaweiImage.localImageUuid && getHuaweiImageName(windowData.dataUuid)
         }"></detail-row>
         <detail-row :param="{
           title: 'hybridimage.ecsImageId',
           content: huaweiImage && huaweiImage.ecsImageId,
           copy: true
         }"></detail-row>
          <detail-row :param="{
           title: 'hybridimage.dataCenter',
           content: huaweiImage && huaweiImage.dataCenterUuid && getDataCenterName(huaweiImage.dataCenterUuid),
         }"></detail-row>
         <div class="split-line"></div>
       </div>
    </div>
  </detail-template>
</template>

<script>
import DetailTemplate from 'src/component/DetailTemplate';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import {mapGetters} from 'vuex';
import Methods from '../Methods';

export default {
  name: 'HybridHuaweiImageDetailPage',
  mixins: [WindowBase, Methods],
  computed: {
    ...mapGetters({
      get: 'hybridHuaweiImage/get'
    }),
    huaweiImage() {
      let _this = this;
      return _this.get(_this.windowData.dataUuid);
    }
  },
  components: {
    DetailTemplate
  },
  created() {
    let _this = this, dataUuid = '';
    dataUuid = _this.$route.params.uuid ? _this.$route.params.uuid : '';
    _this.currTab = _this.$route.params.currTab ? _this.$route.params.currTab : '';
    _this.updateWindow({
       dataUuid,
       methods: {
         query: _this.detailQuery
       }
    }).then(() => {
      _this.detailQuery();
    })
  },
  data() {
    return {
      currSelectTab: 'info'
    }
  },
  methods: {
    formatDatetime,
    //查询单条数据
    detailQuery() {
      let _this = this;
     return _this.dispatchAction('hybridHuaweiImage/basicQuery', {
				q: [`uuid=${_this.windowData.dataUuid}`]
			});
    },
    //回到镜像列表
    close() {
      let _this = this;
      _this.$router.push({name: 'hybridhuaweiimage'})
    },
    //更新镜像资源
    updateResourceParam(arg) {
      let _this = this;
      return {
        	getValue: () => {
					return _this.huaweiImage && _this.huaweiImage[arg];
				},
				setValue: (newVal) => {
					if(newVal === _this.huaweiImage[arg]) return;
					let event = _this.createEvent('hybrid.action.update', _this.huaweiImage.name);
					_this.dispatchActionWithEvent('hybridHuaweiImage/update', param, null, event);
				},
				canEdit: () => {
					return _this.currTab === 'Private'
				}
      }
    },
    //删除镜像
    detailDelete() {
      let _this = this, uuidList = [];
      uuidList = [_this.windowData.dataUuid];
      _this.openDialog('ConfirmDlg', {
        uuidList,
        title: 'image.deleteImage',
        description: 'image.info.deleteConfirm',
        icon: 'image_popupico',
        checkBoxText: 'hybrid.deleteOrigin',
        isChecked: !_this.isAllSystemImage(),
        warning: !_this.isAllSystemImage() ? 'hybrid.info.deleteImage' : '',
        getName: (uuid) => {
         return _this.dbData.hybridHuaweiImage[uuid].name;
        },
        ok: (isChecked) => {
          _this.delete(uuidList, isChecked, _this.detailQuery)
            .then(() => {
              _this.close();
            })

        },
      })
    },
    //判断时候为公共镜像
    isAllSystemImage() {
      let _this = this;
      return _this.dbData.hybridHuaweiImage[_this.windowData.dataUuid].type === 'gold';
    }
  }
}
</script>

<style lang="less" scoped>

</style>
