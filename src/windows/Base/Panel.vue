<script>
export default {
  props: ['param'],
  data () {
    return {
    }
  },
  created: function () {
  },
  mounted: function () {
  },
  destroyed: function () {
  },
  methods: {
    cancel: function () {
      // NOTICE: (xgao) This part of code is for migrating from dialog to panel only.
      // When this migration finished, this following code should be removed
      if (this.dialogData && this.dialogData.param && this.dialogData.param.cancel) {
        this.dialogData.param.cancel()
      }
      if (this.closeDialog) {
        this.closeDialog(this.windowId)
      }
      //

      if (this.param) {
        if (this.param.cancel) {
          this.param.cancel()
        }
        if (this.param.close) {
          this.param.close()
        }
      }
      if (this.destroyPanel) {
        this.destroyPanel(this.windowId)
      }
    },
    close: function () {
      if (this.cancel) {
        this.cancel()
      }
    }
  }
}
</script>
