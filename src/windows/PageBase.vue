<script>
  import WindoBase from 'src/windows/Window';

  export default {
    name: "PageBase",
    mixins: [WindoBase],
    created() {
      let mainPageWindowId;
      Object.keys(this.$store.state.windowManager.windows).forEach((_id) => {
        if (_id.indexOf('MainPage-') > -1) {
          mainPageWindowId = _id
        }
      });

      this._updateWindow({
        id: mainPageWindowId,
        currPageWindowId: this.windowId
      })
    }
  }
</script>

<style scoped>

</style>
