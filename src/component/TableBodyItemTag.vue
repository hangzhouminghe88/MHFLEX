<template>
  <div ref="container" class="item-container">
    <div style="display: flex;" v-if="!isEmpty">
      <div v-for="(item, index) in itemList" v-if="index <= lastVisibleItemIndex" class="item" :style="{ 'color' : item.color, 'border' : `1px solid ${item.color}`, 'width': item.styleWidth, 'background-color': Utils.getTagBackGroundColor(item.color) }" :title="item.name">
        {{ item.name }}
      </div>
      <dropdown2 v-if="canShowDropdown()" :param="getDropdownParam()" class="tag-list-dropdown">
        <span slot="title">
          <span class="table-body-item-tag-dropdown-title">
            {{$t('about.moreManagementNode')}}
            <img class="dropdown-icon" src="~assets/btn_chevron_down.svg">
          </span>
        </span>
        <div slot="content">
          <div class="table-body-item-tag-dropdown-content" :style="getTableBodyItemTagDropdownContentStyle()">
            <span class="dropdown-item" :style="{ 'color' : item.color, 'border' : `1px solid ${item.color}`, 'background-color': Utils.getTagBackGroundColor(item.color)}" v-for="item in getHiddenItemList()">{{ item.name }}</span>
          </div>
        </div>
      </dropdown2>
    </div>
    <div style="color: #97A4B6; position: relative;" v-if="isEmpty">
      <span style="font-size: 14px;">
        {{ $t('tag.none') }}
      </span>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Root from 'src/windows/Root'
  import Utils from 'src/utils/utils'
  import Dropdown2 from 'src/component/Dropdown2'

  const minWidth = 70
  const dropdownButtonWidth = 30
  const fontSize = 12
  const verticalPadding = 4
  const verticalMargin = 4
  const borderWidth = 1
  const marginToNextColumn = 10

  export default {
    name: 'TableBodyItemTag',
    mixins: [Root],
    props: ['param'],
    components: {
      'dropdown2': Dropdown2
    },
    created: function () {
      this.itemList = this.param
      this.observer = new window.MutationObserver(this.onResize)
      let targetNode = document.querySelector('#tag-id-for-width-watching')
      if(targetNode)
      this.observer.observe(targetNode, { attributes: true, childList: true, subtree: true })
    },
    mounted: function () {
      // sometimes, this.$el will be a comment. no getBoundingClientRect(). So I use this.$el.parentElement instead.
      this.boundingClientRect = this.$el.parentElement.getBoundingClientRect()
      this.init()
    },
    destroyed: function () {
      this.observer.disconnect()
    },
    data () {
      return {
        Utils,
        itemList: [],
        observer: null,
        lastVisibleItemIndex: -1,
        boundingClientRect: null
      }
    },
    methods: {
      init () {
        this.itemList.forEach(item => {
          item.textWidth = Utils.getTextSize(item.name, `${fontSize}px`).width
          item.itemWidth = item.textWidth + verticalPadding * 2 + verticalMargin + borderWidth * 2
          // console.error(item.name, Utils.getTextSize(item.name, '14px'))
        })
        this.lastVisibleItemIndex = this.layout(this.itemList, this.boundingClientRect.width - marginToNextColumn)
      },
      getDropdownParam () {
        return {
          type: 'hover'
        }
      },
      getTableBodyItemTagDropdownContentStyle () {
        // if length is exceed 400px, use width, otherwise, use max-width
        // to let width fit content if content total width is lower than 400px
        let itemList = this.getHiddenItemList()
        let width = 20 // left-padding 20px
        itemList.forEach(item => {
          width += Utils.getTextSize(item.name, '12px').width
          width += (4 + 1 + 4 + 4 + 1 + 4) // 4 (left-margin) 1 (border) 4 (left-padding) 4 (right-padding) 1 (border) 4 (right padding)
        })
        let obj = {}
        if (width < 400) {
          obj['max-width'] = '400px'
        } else {
          obj.width = '400px'
        }
        return obj
      },
      getHiddenItemList () {
        return this.itemList.slice(this.lastVisibleItemIndex + 1)
      },
      canShowDropdown () {
        if (this.lastVisibleItemIndex === this.itemList.length - 1) {
          return false
        }
        return true
      },
      onResize () {
        this.boundingClientRect = this.$el.getBoundingClientRect()
        this.lastVisibleItemIndex = this.layout(this.itemList, this.boundingClientRect.width - marginToNextColumn)
        this.$forceUpdate()
        // console.error('resize....................')
      },
      layout (itemList, columeWidth) {
        let wholeItemWidth = 0
        let lastVisibleItemIndex = itemList.length - 1
        itemList.forEach(item => {
          wholeItemWidth += item.itemWidth
        })

        if (wholeItemWidth < columeWidth) {
          itemList.forEach(item => {
            item.styleWidth = 'auto'
          })
        } else {
          // shrink
          let shrinkWidth = this.getShrinkWidth(itemList, columeWidth)
          if (shrinkWidth >= minWidth) {
            // display all items
            this.shrinkItemList(itemList, shrinkWidth)
          } else {
            // hide tail items
            const columeWidthWithOutDropdown = columeWidth - dropdownButtonWidth
            lastVisibleItemIndex = this.getLastVisibleDisplayItemIndex(itemList, minWidth, columeWidthWithOutDropdown)
            // console.error(lastVisibleItemIndex)
            let visibleItemList = itemList.slice(0, lastVisibleItemIndex + 1)
            shrinkWidth = this.getShrinkWidth(visibleItemList, columeWidthWithOutDropdown)
            this.shrinkItemList(visibleItemList, shrinkWidth)
          }
        }
        return lastVisibleItemIndex
      },
      shrinkItemList (itemList, shrinkWidth) {
        itemList.forEach(item => {
          if (item.itemWidth > shrinkWidth) {
            let realShrinkWidth = shrinkWidth - verticalMargin
            item.styleWidth = `${realShrinkWidth}px`
          } else {
            let realShrinkWidth = item.itemWidth - verticalMargin
            item.styleWidth = `${realShrinkWidth}px`
          }
        })
      },
      getLastVisibleDisplayItemIndex (itemList, shrinkWidth, containerWidth) {
        let lastColumeDisplayItemIndex = itemList.length - 1
        let countWidth = 0
        for (let i = 0; i < itemList.length; i++) {
          let item = itemList[i]
          if (item.itemWidth > shrinkWidth) {
            countWidth += shrinkWidth
          } else {
            countWidth += item.itemWidth
          }
          if (countWidth > containerWidth) {
            lastColumeDisplayItemIndex = i - 1
            break
          }
        }
        return lastColumeDisplayItemIndex
      },
      getShrinkWidth (itemList, wholeWidth) {
        let shrinkWidth = wholeWidth / itemList.length
        let itemWidthList = itemList.map(item => item.itemWidth)
        itemWidthList = _.reverse(_.sortBy(itemWidthList))
        // should start from 1
        for (let i = 1; i < itemWidthList.length; i++) {
          let currWidth = itemWidthList[i]
          let shrinkedItemWidth = currWidth * (i + 1)
          let restWidth = 0
          for (let j = i + 1; j < itemWidthList.length; j++) {
            restWidth += itemWidthList[j]
          }
          if (shrinkedItemWidth + restWidth <= wholeWidth) {
            // keep itemList[i] width, shrink itemList items from 0 to i-1
            // currItem width don't be shrinked
            let unshrinkedItemWidth = (restWidth + currWidth)
            let shrinkedItemCount = i
            shrinkWidth = (wholeWidth - unshrinkedItemWidth) / shrinkedItemCount
            break
          }
        }
        return shrinkWidth
      }
    },
    computed: {
      isEmpty () {
        return this.itemList.length <= 0
      }
    },
    watch: {
      param (val, oldVal) {
        if (val === oldVal) return
        this.itemList = _.cloneDeep(val)
        this.init()
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .item-container {
    font-size: 0; /*for removing space between elements*/
    /*display: flex;*/
  }

  .item {
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: 12px;
    margin: 0 4px 0 0;
    height: 22px;
    line-height: 22px;
    text-align: center;
    color: #409eff;
    border-radius: 4px;
    box-sizing: border-box;
    border: 1px solid rgba(64,158,255,.2);
  }

  .tag-list-dropdown {
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 2px;
    width:  59px;
    height: 20px;
    margin-top: 1px;
  }

  .dropdown-item {
    position: relative;
    display: inline-block;
    border-radius: 2px;
    margin: 0 4px 0 4px;
    line-height: 18px;
    font-size: 12px;
    white-space: nowrap;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 4px 0 4px;
  }

  .table-body-item-tag-dropdown-title {
    display: inline-block;
    height: 30px;
    width: 30px;
    font-size: 12px;
    padding-left: 5px;
  }

  .table-body-item-tag-dropdown-content {
    font-size: 12px;
    border: 1px solid #DAE0E6;
    background-color: #fff;
    overflow: hidden;
    padding: 10px 6px 4px 6px;
    line-height: 20px;
  }

  .table-body-item-tag-dropdown-title {
    position: relative;
  }

  .dropdown-icon {
    position: absolute;
  }
</style>

