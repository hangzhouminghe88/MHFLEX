<script>
// import { __printCallStack } from 'src/utils/utils'
/* global MutationObserver:false */

export default {
  created: function () {
    this.initScrollbar()
  },
  destroyed: function () {
    if (this.scrollContainerObserver) {
      this.scrollContainerObserver.disconnect()
      this.scrollContainerObserver = null
    } else {
    }
    window.removeEventListener('resize', this.computeScroll)
  },
  data () {
    return {
      scrollTop: 0,
      scrollLength: 0,
      // scrollContainerObserver: undefined,
      showScrollbar: false,
      startDrag: false,
      oldScreenY: 0,
      oldScrollTop: 0,
      scrollElement: null,
      scrollContainer: null,
      scrollContainerObserver: null
    }
  },
  methods: {
    initScrollbar: function () {
      if (this.scrollContainerObserver) {
        this.scrollContainerObserver.disconnect()
        this.scrollContainerObserver = null
        // NOTICE: remove listener to avoid redundency. if not will cause exception
        window.removeEventListener('resize', this.computeScroll)
      }
      let self = this
//      let stopInterval = setInterval(function () {
//        if (!self.$store.state.windowManager.windows[dialogUuid]) return
//        clearInterval(stopInterval)
//        next()
//      }, 0)
      let stopInterval = setInterval(() => {
        if (!self.$el) return
        self.scrollElement = self.$el.querySelector(self.scrollElementSelector)
        if (!self.scrollElement) return
        clearInterval(stopInterval)
        if (self.$el.className === 'container') {
          self.scrollContainer = self.$el
        } else {
          self.scrollContainer = self.$el.querySelector(self.scrollContainerSelector)
        }
        self.scrollContainerObserver = new MutationObserver(function (mutations) {
          self.computeScroll()
        })
        // pass in the target node, as well as the observer options
        self.scrollContainerObserver.observe(self.scrollContainer, { childList: true, subtree: true })
        // self.computeScroll()
        // late 1 ms to compute scroll. Several windows don't ready at this time.
        setTimeout(self.computeScroll, 1)
        window.addEventListener('resize', this.computeScroll)
      }, 0)
    },
    onScroll: function ($event) {
      this.scrollLength = $event.target.parentElement.clientHeight * $event.target.parentElement.clientHeight / $event.target.scrollHeight
      this.scrollTop = $event.target.scrollTop / $event.target.scrollHeight * $event.target.parentElement.clientHeight
    },
    computeScroll: function () {
      if (this.startDrag) return
      // NOTICE: fix high dpi issue.
      this.showScrollbar = (this.scrollElement.scrollHeight - this.scrollContainer.clientHeight) > 1
      this.scrollLength = this.scrollContainer.clientHeight * this.scrollContainer.clientHeight / this.scrollElement.scrollHeight
      this.scrollTop = this.scrollElement.scrollTop / this.scrollElement.scrollHeight * this.scrollContainer.clientHeight
      // console.log('------------------------------------------')
      // console.log(this.scrollElement.scrollTop)
      // console.log(this.scrollElement.scrollHeight)
      // console.log(this.scrollTop)
    },
    onScrollBarMouseDown: function ($event) {
      document.addEventListener('mousemove', this.onScrollBarMouseMove, false)
      document.addEventListener('mouseup', this.onScrollBarMouseUp, false)
      this.startDrag = true
      this.oldScreenY = $event.screenY
      this.oldScrollTop = this.scrollTop
      $event.preventDefault()
      $event.stopPropagation()
    },
    onScrollBarMouseMove: function ($event) {
      const deltaY = $event.screenY - this.oldScreenY
      this.scrollTop = this.oldScrollTop + deltaY
      if (this.scrollTop < 0) this.scrollTop = 0
      if (this.scrollTop + this.scrollLength > this.scrollContainer.clientHeight) {
        this.scrollTop = this.scrollContainer.clientHeight - this.scrollLength
      }
      // const top = this.scrollTop / this.scrollContainer.clientHeight * this.scrollElement.clientHeight
      // this.scrollElement.style.top = top + 'px'
      this.scrollElement.scrollTop = this.scrollTop / this.scrollContainer.clientHeight * this.scrollElement.scrollHeight
      // console.log('--------------------------------------------')
      // console.log(`${this.scrollTop} / ${this.scrollContainer.clientHeight} * ${this.scrollElement.clientHeight}`)
      // console.log(this.scrollElement.scrollTop)
      $event.preventDefault()
      $event.stopPropagation()
    },
    onScrollBarMouseUp: function ($event) {
      this.startDrag = false
      document.removeEventListener('mousemove', this.onScrollBarMouseMove, false)
      document.removeEventListener('mouseup', this.onScrollBarMouseUp, false)
    }
  }
}
</script>



// WEBPACK FOOTER //
// ScrollBar.vue?46ad2134
