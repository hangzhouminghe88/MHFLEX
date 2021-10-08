<template>
  <span v-permission="permission" @click="onClick($event)" @mouseenter="onMouseEnter()" @mouseleave="onMouseLeave()" style="">
    <div ref='title' style="height: 100%;">
      <slot name="title">
      </slot>
    </div>
    <div :style="getContentContainerStyle()" v-if="show">
      <div style="z-index: 1;left:-8px;" class="dropdown-content-container" :style="getContentStyle()" ref="content">
        <slot name="content">
        </slot>
      </div>
    </div>
  </span>
</template>

<script>
  import Utils from 'src/utils/utils'
  import WindowBase from 'src/windows/Window'

  export default {
    name: 'Dropdown2',
    mixins: [WindowBase],
    props: ['param', 'permission'],
    created: function () {
      window.addEventListener('click', this.onWindowClick, false)
      window.addEventListener('resize', this.onWindowResize, false)
    },
    mounted: function () {
      let componentRect = this.$el.getBoundingClientRect()
      let titleRect = this.$refs.title.getBoundingClientRect()
      this.dropDownLeft = componentRect.left - titleRect.left
      if (this.param && this.param.onChange) {
        this.onChange = this.param.onChange
      } else {
        this.onChange = () => {}
      }
      if (this.param && this.param.type) {
        this.type = this.param.type
      }
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
      window.removeEventListener('click', this.onWindowResize)
    },
    // props: ['enabled', 'permission', 'menu'],
    data () {
      return {
        dropDownLeft: 0,
        show: false,
        type: 'click',
        contentTop: null
      }
    },
    methods: {
      getContentStyle () {
        let obj = {}
        if (this.contentTop != null) {
          obj['top'] = `${this.contentTop}px`
          obj['position'] = 'fixed'
        } else {
          obj['position'] = 'absolute'
        }
        return obj
      },
      getContentContainerStyle () {
        let obj = {
          //left: `${this.dropDownLeft}px`,
          position: `fixed`,
          zIndex: 999
        }
        return obj
      },
      onMouseEnter () {
        if (this.type === 'hover') {
          this.open()
        }
      },
      onMouseLeave () {
        if (this.type === 'hover') {
          this.collapse()
          this.onChange(this.show)
        }
      },
      onClick: function ($event) {
        if (this.type === 'click') {
          if (this.show) {
            this.collapse()
          } else {
            this.open()
          }
        }
      },
      onWindowClick: function ($event) {
        let isInElement = Utils.isChildElementOfElm($event.target, this.$el)
        if (!isInElement) {
          this.collapse()
        }
      },
      open () {
        this.show = true
        this.layout()
        this.onChange(this.show)
      },
      collapse () {
        this.show = false
        this.contentTop = null
        this.onChange(this.show)
      },
      layout () {
        let self = this
        const verticalScrollHight = 25
        setTimeout(() => {
          if (!self.$refs.title) return
          let bodyRect = window.document.body.getBoundingClientRect()
          let dropDownContentContainerElm = self.$el.getElementsByClassName('dropdown-content-container')[0]
          if (dropDownContentContainerElm) {
            let contentContainerRect = dropDownContentContainerElm.getBoundingClientRect()
            if (contentContainerRect.bottom > (bodyRect.height - verticalScrollHight)) {
              // switch to fixed position
              // fixed position will get wrong contentContainerRect
              // so i use absolute by default.
              this.contentTop = bodyRect.height - contentContainerRect.height - verticalScrollHight
            } else {
              this.contentTop = null
            }
          }
        }, 10)
      },
      // layout () {
      //   let self = this
      //   const verticalScrollHight = 25
      //   setTimeout(() => {
      //     if (!self.$refs.title) return
      //     let titleRect = self.$refs.title.getBoundingClientRect()
      //     let bodyRect = window.document.body.getBoundingClientRect()
      //     let maxHeight = bodyRect.height - titleRect.bottom - verticalScrollHight
      //     let dropDownContentContainerElm = self.$el.getElementsByClassName('dropdown-content-container')[0]
      //     if (dropDownContentContainerElm) {
      //       let contentContainerRect = dropDownContentContainerElm.getBoundingClientRect()
      //       if (contentContainerRect.height > maxHeight) {
      //         dropDownContentContainerElm.children[0].style['height'] = `${maxHeight}px`
      //       } else {
      //         dropDownContentContainerElm.children[0].style['height'] = ''
      //       }
      //     }
      //   }, 0)
      // },
      onWindowResize () {
        // this.layout()
      }
    }
  }
</script>
<style scoped>
</style>
