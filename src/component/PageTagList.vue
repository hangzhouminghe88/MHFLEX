<template>
  <div style="position: relative;">
    <!-- <div class="tag-panel" :class="getClassName()" @mouseenter="onMouseEnter($event)" @mouseleave="onMouseLeave($event)"> -->
    <div class="tag-panel-test">
      <!-- <div class="tag-panel hover"> -->
      <div class="tag-item" v-for="item in itemList" :style="{'color': item.color, 'border': `1px solid ${item.color}`, 'background-color': Utils.getTagBackGroundColor(item.color)}">
        {{ item.name }}
        <span class="el-icon-close" @click="onClickDelete(item)" />
        <!-- <img class="user-tag-delete" src="~assets/tag_delete.svg" v-permission="'TAG.DELETE'" @click="!inStates('Destroyed') && deleteTag(tagItem.uuid)" v-if="!inStates('Destroyed')" /> -->
      </div>
      <span @click="onClickDeleteAll()" class="el-icon-close tag-item"
            style="cursor: pointer; margin-bottom: 6px; margin-left: 10px;" v-if="itemList.length > 0"/>
    </div>
  </div>
</template>

<script>
  import Root from 'src/windows/Root'
  import Utils from 'src/utils/utils'
  import {mapGetters} from 'vuex'
  import _ from 'lodash'

  export default {
    name: 'PageTagList',
    mixins: [Root],
    props: ['param'],
    components: {},
    data () {
      return {
        Utils,
        mouseOver: false
      }
    },
    methods: {
      onClickDeleteAll () {
        this.param.setValue([])
      },
      onMouseEnter ($event) {
        this.mouseOver = true
      },
      onMouseLeave ($event) {
        this.mouseOver = false
      },
      getClassName () {
        if (this.mouseOver) {
          return 'hover'
        } else {
          return 'normal'
        }
      },
      onClickDelete (item) {
        let uuidList = this.param.getValue()
        uuidList = _.remove(uuidList, (uuid) => uuid !== item.uuid)
        this.param.setValue(uuidList)
      }
    },
    computed: {
      ...mapGetters({
        getTag: 'tag/get'
      }),
      itemList: function () {
        let uuidList = this.param.getValue()
        return uuidList.map(uuid => this.getTag(uuid))
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .tag-panel {
    display: inline-block;
    width: 100%;
    background-color: #fff;
    border: 1px solid #fff; /*don't remove this line. otherwise, tag list will move down 1px when pointer is hovering on.*/
    white-space: nowrap;
    overflow: hidden;
  }
  .tag-panel:hover {
    position: absolute;
    z-index: 1;
    white-space: initial;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .tag-panel-test {
    display: inline-block;
    width: 100%;
    background-color: #fff;
    position: static;
    z-index: 1;
    overflow-y: hidden;
    overflow-x: hidden;
    white-space: nowrap;
    border: 1px solid #D7DCE2;
    height: 100%;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }

  .tag-panel-test:hover {
    position: relative;
    white-space: normal;
    height: auto;
  }

  /*.tag-panel.normal {
    white-space: nowrap;
    overflow: hidden;
  }

  .tag-panel.hover {
    position: absolute;
    z-index: 1;
    white-space: initial;
    overflow-y: auto;
    overflow-x: hidden;
  }*/

  .tag-item {
    position: relative;
    display: inline-block;
    border-radius: 2px;
    margin: 3px 0 0px 4px;
    line-height: 20px;
    font-size: 12px;
    white-space: nowrap;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 15px 0 4px;
  }

  .tag-delete {
    position: absolute;
    top: 8px;
    right: 4px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
