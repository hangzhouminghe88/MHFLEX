<template>
  <div class="page-toolbar-tag">
    <dropdown2 class="dropdown-container" :class="getDropdownClass()" :menu="false" style="z-index: 1">
      <span slot="title">
        <span class="dropdown-title" v-permission="'LICENSE_BASIC_PAID'" @click="onClickTagButton()" style="padding-left: 20px; padding-right: 5px;">
          <img style="position: absolute; top: 7px; left: 0;" src="~assets/btn_filter_tag.svg" />
          {{ $t("common.tag") }}
        </span>
      </span>
      <div slot="content" class="tag-dropdown-search-content" @click.stop="">
        <div class="search-box-container">
          <input class="search-box" :placeholder="$t('tag.pleaseInputSearchString')" @input="onTagSearchInput($event)" />
          <i class="el-icon-search"></i>
        </div>
        <div class="search-result-container">
          <div class="search-result-item" v-for="tagUuid in tagUuidList" @click="onClickTagItem(tagUuid)" :style="getDropdownItemStyle(tagUuid)">
            <span class="search-result-item-label" :style="getDropdownItemLabelStyle(tagUuid)">
              {{ getTag(tagUuid).name }}
            </span>
            <span class="search-result-item-number" :style="getDropdownTextStyle(tagUuid)">{{ getTagResourceNumber(tagUuid) }}</span>
          </div>
        </div>
        <div class="search-footer">
          <span class="search-footer-button" style="border: 1px dashed #97A4B6; padding: 4px; border-radius: 2px;" @click="onCreateTag()">{{ $t('tag.create') }}</span>
          <span class="search-footer-button" style="float: right;" @click="goTagList()">{{ $t('tag.management') }}</span>
        </div>
      </div>
    </dropdown2>
    <span class="tag-list-container" v-if="canShowTagList()">
      <page-tag-list class="tag-list" :param="getTagListParam()"></page-tag-list>
    </span>
    <help-trigger name="VmInstanceVolumeTagsAdminProjectManagement" v-show="hasProjectManagementLicense() && isAdmin" :style="{ position: 'relative', 'margin-left': '10px', display: 'inline-block', top: '9px' }" />
    <help-trigger name="VmInstanceVolumeTagsAdminNotProjectManagement" v-show="!hasProjectManagementLicense() && isAdmin" :style="{ position: 'relative', 'margin-left': '10px', display: 'inline-block', top: '9px' }" />
    <help-trigger name="VmInstanceVolumeTagsNormalAccountProjectManagement" v-show="hasProjectManagementLicense() && !isAdmin" :style="{ position: 'relative', 'margin-left': '10px', display: 'inline-block', top: '9px' }" />
    <help-trigger name="VmInstanceVolumeTagsNormalAccountNotProjectManagement" v-show="!hasProjectManagementLicense() && !isAdmin" :style="{ position: 'relative', 'margin-left': '10px', display: 'inline-block', top: '9px' }" />
  </div>
</template>

<script>
  import _ from 'lodash'
  import Window from 'src/windows/Window'
  import Dropdown2 from 'src/component/Dropdown2'
  // import PageTagList from 'src/components/PageTable/PageTagList'
  import {mapGetters} from 'vuex'
  import Utils from 'src/utils/utils'
  import PageTagList from "./PageTagList";

  export default {
    name: 'PageToolbarTag',
    mixins: [Window],
    props: ['param'],
    components: {
      PageTagList,
      'dropdown2': Dropdown2,
      // 'page-tag-list': PageTagList
    },
    data () {
      return {
        tagUuidList: [],
        selectedTagUuidList: [],
        leftDropdownIconClass: 'down'
      }
    },
    computed: {
      ...mapGetters({
        getTag: 'tag/get'
      }),
      isAdmin () {
        return this.dbData.common.isAdmin
      }
    },
    mounted: function () {
    },
    watch: {
      'param.tagType' (val, oldVal) {
        if (val === oldVal) return
        this.selectedTagUuidList = []
      }
    },
    methods: {
      getDropdownItemLabelStyle (tagUuid) {
        let tag = this.getTag(tagUuid)
        let obj = {
          'color': tag.color,
          'border': `1px solid ${tag.color}`,
          'background-color': Utils.getTagBackGroundColor(tag.color)
        }
        return obj
      },
      getDropdownItemStyle (tagUuid) {
        let obj = {}
        if (this.isSelected(tagUuid)) {
          obj.opacity = 0.3
        }
        return obj
      },
      hasProjectManagementLicense () {
        return Utils.getLicensePermission('LICENSE_EXTRA_COMPANY', this) || false
      },
      getDropdownClass () {
        if (this.canShowTagList()) {
          return 'show-tag-list'
        }
        return ''
      },
      getDropdownColorStyle (uuid) {
        let obj = {
          'background-color': this.getTag(uuid).color
        }
        if (this.isSelected(uuid)) {
          obj.opacity = 0.3
        }
        return obj
      },
      getDropdownTextStyle (uuid) {
        return {
          color: this.isSelected(uuid) ? '#97A4B6' : '#1A2736'
        }
      },
      isSelected (uuid) {
        return _.includes(this.selectedTagUuidList, uuid)
      },
      goTagList () {
        this.$router.push({name: 'tag'})
      },
      onCreateTag () {
        this.openDialog('CreateTagDlg', {
          ok: (name, color, cb) => {
            this.dispatchActionWithEvent('tag/create', {
              name,
              color
            }).then(() => {
              this.queryTag()
              cb(true)
            }, (error) => {
              cb(error)
            })
          }
        })
      },
      onTagChange () {
        this.param.onTagChange(this.selectedTagUuidList)
      },
      canShowTagList () {
        if (this.selectedTagUuidList && this.selectedTagUuidList.length > 0) {
          return true
        }
        return false
      },
      onTagSearchInput ($event) {
        this.tagSearchStr = $event.target.value
        this.queryTag(this.tagSearchStr)
      },
      getTagListParam () {
        let self = this
        return {
          getValue: function () {
            return self.selectedTagUuidList
          },
          setValue: function (uuidList) {
            self.selectedTagUuidList = uuidList
            self.onTagChange()
          }
        }
      },
      onClickTagItem (uuid) {
        if (!this.isSelected(uuid)) {
          this.addTagToFilter(uuid)
        } else {
          this.removeTagFromFilter(uuid)
        }
      },
      addTagToFilter (uuid) {
        this.selectedTagUuidList.push(uuid)
        this.onTagChange()
      },
      removeTagFromFilter (uuid) {
        this.selectedTagUuidList = _.filter(this.selectedTagUuidList, tagUuid => tagUuid !== uuid)
        this.onTagChange()
      },
      onClickTagButton () {
        this.queryTag()
      },
      getTagResourceNumber (uuid) {
        let item = this.getTag(uuid)
        if (!item.resourceCount) {
          return 0
        }
        return item.resourceCount
      },
      queryTag (name) {
        if (this.isAdmin) {
          // let loginType = window.localStorage.getItem('loginType')
          let accountUuid = window.localStorage.getItem('accountUuid')
          // let accountUuid
          // if (loginType === 'account') {
          //   accountUuid = window.localStorage.getItem('accountUuid')
          // }

          let param = {
            type: this.param.tagType,
            sortBy: 'createDate',
            sortDirection: '-',
            accountUuid
          }

          if (name) {
            let escapedName = Utils.escapeQueryString(name)
            param.q = [`name~=%${escapedName}%`]
          }

          this.dispatchAction('tag/queryByAccount', param)
            .then(result => {
              this.tagUuidList = result.uuidList
              this.dispatchAction('tag/queryResourceCount', this.tagUuidList)
            })
        } else {
          let param = {
            replayWithCount: true
          }
          if (name) {
            let escapedName = Utils.escapeQueryString(name)
            param.q = [`name~=%25${escapedName}%25`]
          }
          this.dispatchAction('tag/query', param)
            .then(result => {
              this.tagUuidList = result.uuidList
              this.dispatchAction('tag/queryResourceCount', this.tagUuidList)
            })
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .page-toolbar-tag {
    display: inline-flex;
    padding-left: 12px;
    width: 100%;
  }

  .dropdown-container {
    display: inline-block;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #D7DCE2;
    border-radius: 2px;
    height: 34px;
    padding-left: 7px;
    padding-right: 7px;
    cursor: pointer;
    font-size: 14px;
    flex-shrink: 0;
  }

  .dropdown-container.show-tag-list {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  .dropdown-title {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
    font-size: 14px;
    line-height: 32px;
    /*border: 1px solid */
    color: #3C73B9;
  }

  .dropdown-title-icon {
    position: absolute;
  }

  .tag-list-container {
    display: inline-block;
    height: 34px;
    min-width: 0;
    position: relative;
    padding: 0 12px 0 0;
  }

  .tag-list {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .tag-list-item {
    margin: 0 5px 0 5px;
    /*border: 1px solid #000;*/
    font-size: 14px;
    white-space: nowrap;
  }

  .tag-wrapper {
    display: inline-block;
  }

  .tag-dropdown-content {
    display: inline-block;
    min-width: 0px;
    font-size: 14px;
    color: #3C73B9;
    padding: 7px;
    background-color: #fff;
    border: 1px solid #E6EBEE;
  }

  .tag-dropdown-search-content {
    display: inline-block;
    font-size: 12px;
    background-color: #fff;
    border: 1px solid #E6EBEE;
    box-shadow:0px 0px 6px 0px rgba(230,235,238,1);
    width: 260px;
    height: 400px;
    padding: 58px 0 42px 0;
  }

  .tag-dropdown-search-content .search-box-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 90%;
    padding: 12px;
    border-bottom: 1px solid #E6EBEE;
  }

  .tag-dropdown-search-content .search-box-container .search-box {
    display: inline-block;
    width: 96%;
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    border: 1px solid #E6EBEE;
    padding: 6px 0px 6px 10px;
  }

  .tag-dropdown-search-content .search-box-container .search-icon {
    right: 20px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .dropdown-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .dropdown-icon.up {
    transform: rotate(180deg) translateY(50%);
  }

  .search-result-container {
    height: 100%;
    padding: 20px 16px 8px 16px;
    overflow-y: auto;
  }

  .search-result-item {
    display: flex;
    line-height: 28px;
    color: #1A2736;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: space-between;
    align-items: baseline;
  }

  .search-result-item-dot-container {
    display: inline-block;
    flex: 0 0 22px;
    justify-content: space-between;
    /*padding-top: 10px;*/
  }

  .search-result-item-label {
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 2px;
    height: 20px;
    line-height: 20px;
    margin-right: 10px;
    padding: 0 6px 0 4px;
  }

  .search-result-item-dot {
    display: inline-block;
    height: 10px;
    width: 10px;
  }

  .search-result-item-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .search-result-item-number {
    justify-content: flex-end;
    color: #5E6978;
  }

  .search-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 42px;
    border-top: 1px solid #E6EBEE;
    color: #5E6978;
    font-size: 12px;
    background: #fff;
  }

  .search-footer-button {
    line-height: 42px;
    margin-right: 16px;
    margin-left: 16px;
  }
  .el-icon-search{
    right: 20px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
