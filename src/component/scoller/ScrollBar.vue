<script>
  export default {
    mounted: function () {
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
          window.removeEventListener('resize', this.computeScroll)
        }
        let stopInterval = setInterval(() => {
          let self = this;
          if (!self.$el) return
          this.scrollElement = self.$el.querySelector(self.scrollElementSelector)
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
          if(self.scrollContainer){
            self.scrollContainerObserver.observe(self.scrollContainer, { childList: true, subtree: true })
            setTimeout(self.computeScroll, 1)
          }
          window.addEventListener('resize', self.computeScroll)
        }, 0)
      },
      onScroll: function ($event) {
        this.scrollLength = $event.target.parentElement.clientHeight * $event.target.parentElement.clientHeight / $event.target.scrollHeight
        this.scrollTop = $event.target.scrollTop / $event.target.scrollHeight * $event.target.parentElement.clientHeight
      },
      computeScroll: function () {
        let self = this;
        if (self.startDrag) return
        self.showScrollbar = (self.scrollElement.scrollHeight - self.scrollContainer.clientHeight) > 1
        self.scrollLength = self.scrollContainer.clientHeight * self.scrollContainer.clientHeight / self.scrollElement.scrollHeight
        self.scrollTop = self.scrollElement.scrollTop / self.scrollElement.scrollHeight * self.scrollContainer.clientHeight
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
        this.scrollElement.scrollTop = this.scrollTop / this.scrollContainer.clientHeight * this.scrollElement.scrollHeight
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
