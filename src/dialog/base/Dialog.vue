<script>
export default {
  props: [ 'param' ],
  created: function () {
    if (this.isTopmost()) {
      this.updateDbObject({
        name: 'common',
        data: {
          // hideSidePageLine: true,
          hideMainPageToolbar: true
        }
      })
    } else if (this.isFullMainWindowDlg()) {
      this.updateDbObject({
        name: 'common',
        data: {
          hideSidePageLine: true
          // hideMainPageToolbar: true
        }
      })
    }
  },
  destroyed: function () {
    this.updateDbObject({
      name: 'common',
      data: {
        hideSidePageLine: false,
        hideMainPageToolbar: false
      }
    })
  },
  methods: {
    isTopmost: function () {
      if (this.$options.name.indexOf('Confirm') > -1 ||
          this.$options.name.indexOf('Popup') > -1 ||
          this.$options.name.indexOf('MessageDetailDlg') > -1) {
        return true
      } else {
        return false
      }
    },
    isFullMainWindowDlg: function () {
      return this.$options.name.indexOf('Create') > -1
    },
    cancel: function () {
      if (this.dialogData && this.dialogData.param && this.dialogData.param.cancel) {
        this.dialogData.param.cancel()
      }
      this.closeDialog(this.windowId)
    }
  },
  computed: {
    dialogData: function () {
      return this.$store.state.dialogManager.windows[this.windowId]
    }
  }
}
</script>
