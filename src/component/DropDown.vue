<template>
  <span :class="{ 'show-dropdown': windowData.showMoreDropdown }" v-permission="permission" @click.stop="toggleMoreDropdown($event)">
    <slot name="arrow">
      <span class="arrow"></span>
    </slot>
    <slot name="title">
    </slot>
    <slot name="content" ref="content"></slot>
  </span>
</template>

<script>
  import WindowBase from 'src/windows/Window'

  export default {
    name: 'DropDown',
    mixins: [WindowBase],
    created: function () {
      window.addEventListener('click', this.onWindowClick, true)
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick, true)
    },
    props: ['enabled', 'permission'],
    data () {
      return {
        // contentStyle: {}
      }
    },
    methods: {
      toggleMoreDropdown: function ($event) {
        if (this.enabled !== undefined && this.enabled === false) {
          this.updateWindow({showMoreDropdown: false});
          return
        }
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown});
        let self = this;
        let newHeight;
        setTimeout(() => {
          self.$el.children[2].children[0].style.height = '';
          self.$el.children[2].children[0].style.overflow = '';
          let contentSize = self.$el.children[2].children[0].getBoundingClientRect();
          let contentBottom = contentSize.top + contentSize.height;
          if (window.innerHeight < contentBottom) {
            newHeight = contentSize.height - (contentBottom - window.innerHeight);
            self.$el.children[2].children[0].style.height = `${newHeight}px`;
            self.$el.children[2].children[0].style.overflow = 'auto'
          }
        }, 30)
      },
      onWindowClick: function (event) {
        var x = event.target;
        if (x.tagName === 'HTML') {
          return
        }
        var result = [];
        while (x.tagName !== 'BODY' && result.length === 0) {
          if (x.className === 'dropdown-content' || x.className === 'help-tooltip-wrapper') {
            result.push(x)
          }
          x = x.parentNode
        }
        if (result.length > 0) {
          return
        }
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      }
    }
  }
</script>
<style scoped lang="less">
  .content-container {
    position: fixed;
    z-index: 1;
  }

  .detail-dropdown .arrow, .dropdown .arrow{
    display: inline-block;
    position: relative;
    top: 6px;
    float: right;
    height: 18px;
    width: 18px;
    background-image: url('~assets/arrow_down.svg');
  }

  .detail-dropdown .show-dropdown .arrow, .dropdown .show-dropdown .arrow{
    background-image: url('~assets/arrow_up.svg');
  }
  .dropdown.disabled .arrow {
    background-image: url('~assets/arrow_down_disabled.svg');
  }

  .detail-dropdown .text{
    position: relative;
    top: 0!important;
    font-size: 14px;
    line-height: 32px;
  }
  .dropdown .text{
    top: 0!important;
    line-height: 30px;
  }
  .detail-dropdown.show-dropdown .dropdown-content, .dropdown.show-dropdown .dropdown-content {
    display: inline-block;
    transform-origin: center top 0px;
    z-index: 999;
  }
  .detail-dropdown.dropdown-content{
    display: none;
    transform-origin: center top 0px;
    animation: reverse showDropDown .5s;
  }
  .show-dropdown{
    position: relative;
  }
  @keyframes  showDropDown{
    from{
      height: 0px;
      background-position:40px 0
    }
    to{
      height: 100%;
      background-position:0px 0
    }
  }
</style>
