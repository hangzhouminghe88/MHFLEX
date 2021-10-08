<template>
  <div class="long-content-container" @mouseover="showImage=true" @mouseout="showImage=false">
    <div class="long-content-content" ref="valueElm" :title="value">{{ value }}</div>
    <img :class="showImage || show === 'true' ? 'icon-show' : 'icon'" src="~assets/copy.svg" @click="copy($event)" />
  </div>
</template>

<script>
  import Root from 'src/windows/Root'
  import Utils from 'src/utils/utils'

  export default {
    name: 'DetailLongContent',
    mixins: [Root],
    props: ['value', 'show'],
    created: function () {
    },
    destroyed: function () {
    },
    data () {
      return {
        showImage: false
      }
    },
    methods: {
      copy: function ($event) {
        Utils.copyText(this.value)
        $event.stopPropagation()
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this components only -->
<style scoped>

  .long-content-container {
    display: flex;
    /*margin-right: 30px;*/
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .long-content-container .long-content-content {
    overflow: hidden;
    text-overflow: ellipsis;
    /*flex: 1;*/
  }

  .long-content-container .icon {
    display: none;
    width: 14px;
  }

  .long-content-container .icon-show {
    position: relative;
    top: 3px;
    display: initial;
    margin-left: 10px;
    margin-right: 1px;
    width: 14px;
    height: 16px;
  }

  .long-content-container:hover> img {
    position: relative;
    top: 3px;
    display: initial;
    margin-left: 10px;
    margin-right: 1px;
    width: 14px;
    height: 16px;
    cursor: pointer;
  }

  .long-content-container .icon-show:active {
    top: 4px;
    left: 1px;
  }

  .long-content-container .icon:active {
    top: 4px;
    left: 1px;
  }

</style>


