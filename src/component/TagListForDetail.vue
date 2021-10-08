<template>
  <div id="common-myTag" style="display: flex;">
    <div class="title" v-if="param.getTitle()">
      <!--<base-icon class="title-icon" :name="param.getIconName()" />-->
      {{ param.getTitle() }}
    </div>
    <div style="display: inline-block; padding: 4px 60px 0 0;">
      <span style="display: inline-block; word-break: break-all;" v-for="item in itemList" :style="{'color': item.color, 'border': `1px solid ${item.color}`, 'background-color': Utils.getTagBackGroundColor(item.color)}" class="tag-item">{{ item.name }}
        <img v-permission="'LICENSE_BASIC_PAID'" class="tag-delete" src="~assets/btn_tag_delete.svg" @click="onClickDelete(item)" v-if="!param.isRemoveDeleteButton()"/>
      </span>
      <span v-if="showAttach" v-permission="'LICENSE_BASIC_PAID'" class="attach-button" @click="onClickAttach()">
        <span class="add-icon"></span>{{ $t('tag.attach') }}
      </span>
    </div>
  </div>
</template>

<script>
  import Utils from 'src/utils/utils'
  import Window from 'src/windows/Window'
  import { mapGetters } from 'vuex'

  export default {
    name: 'TagListForDetail',
    mixins: [Window],
    props: ['param'],
    created: function () {
    },
    destroyed: function () {
    },
    data () {
      return {
        Utils
      }
    },
    computed: {
      ...mapGetters({
        getTag: 'tag/get'
      }),
      itemList () {
        let uuidList = this.param.getTagUuidList()
        return this.getTag(uuidList)
      },
      showAttach () {
        if (this.param.canShowAttach) {
          return this.param.canShowAttach()
        }
        return true
      }
    },
    methods: {
      onClickDelete (item) {
        return this.openDialog('ConfirmDlg', {
          title: 'tag.detach',
          description: 'tag.detachDescription',
          uuidList: [item.uuid],
          icon: 'tag_n',
          getName: () => {
            return item.name
          },
          ok: () => {
            this.param.detachTagUuidList([item.uuid])
          }
        })
      },
      onClickAttach () {
        this.param.onAttach()
      }
    },
    watch: {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .title {
    display: inline-block;
    white-space: nowrap;
    font-size: 12px;
    color: #5E6978;
    position: relative;
    line-height: 30px;
    min-width: 70px;
  }
  .title-icon {
    position: absolute;
    top: 8px;
    left: 0;
    height: 16px;
    width: 16px;
  }

  .tag-item {
    display: inline-block;
    position: relative;
    font-size: 12px;
    padding: 0 15px 0 4px;
    margin: 0 4px 4px 0;
    border-radius: 2px;
    line-height: 20px;
  }

  .tag-delete {
    position: absolute;
    top: 8px;
    right: 4px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
  }

  .attach-button {
    position: relative;
    display: inline-block;
    border: 1px dotted #97A4B6;
    cursor: pointer;
    padding: 0 4px 0 4px;
    font-size: 12px;
    height: 22px;
    line-height: 20px;
    border-radius: 2px;
  }

  .attach-button:hover {
    color: #3C73B9;
    border: 1px dotted #3C73B9;
  }

  .add-icon {
    display: inline-block;
    position: relative;
    top: 2px;
    height: 12px;
    width: 12px;
    background-image: url("~assets/btn_tag_create_n.svg");
  }

  .attach-button:hover .add-icon {
    background-image: url("~assets/btn_tag_create_h.svg");
  }
</style>
