<template>
  <div class="table-body-item-text" @click="onBodyClick">
    <div v-for="(item, index) in _content" class="table-body-item-text-content" :title="item" :style="{ marginRight: index === _content.length - 1 ? 0 : '5px' }">
      <span class="text" :ref="`contentElm${index}`" @click="onTextClick($event)">{{ item }}</span>
      <img class="copy-icon" v-show="copy === 'true' && !! item" src="~assets/copy.svg" @click="copyText($event, index)" />
      <span class="text" v-if="index !== _content.length - 1">、</span>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';

  export default {
    name: 'TableBodyItemList',
    mixins: [Root],
    props: ['content', 'copy', 'click', 'stopevt'],
    created: function () {
    },
    mounted: function () {
    },
    destroyed: function () {
    },
    data () {
      return {
      }
    },
    methods: {
      onBodyClick: function ($event) {
        if (this.stopevt === true) {
          $event.stopPropagation()
        }
      },
      onTextClick: function ($event) {
        if (!_.isUndefined(this.click)) {
          this.click()
          $event.stopPropagation()
        }
      },
      copyText: function ($event, index) {
        Utils.copyText(this._content[index])
        $event.stopPropagation()
      },
    },
    computed: {
      _content: function () {
        return _.isArray(this.content) ? this.content : [this.content]
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .table-body-item-text {
    height: 100%;
    /*padding-left: 15px;*/
    padding-right: 20px;
    display: flex;
    position: relative;
  }

  .table-body-item-text .text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline;
  }

  .copy-icon {
    display: none;
  }

  .table-body-item-text-content:hover .copy-icon {
    display: initial;
    position: relative;
    margin-left: 10px;
    width: 14px;
    height: 16px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
  }

  .table-body-item-text .copy-icon:active {
    margin-top: 1px;
    left: 1px;
  }

  .table-body-item-text-content {
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
  }

</style>
