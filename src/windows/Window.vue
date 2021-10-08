<script>
  import {genUniqueId} from 'src/utils/utils';
  import Root from 'src/windows/Root';

  export default {
    props: {
      'assigned-id': String
    },
    mixins: [Root],
    data: function () {
      return {
        windowId: ''
      }
    },
    created() {
      this.createWindow()
        .then(() => {
          this.updateWindow({
            refresh: false,
            dialogList: []
          })
        })
    },
    methods: {
      createWindow: function () {
        if (this.assignedId) {
          this.windowId = this.assignedId
        } else {
          this.windowId = `${this.$options.name}-${genUniqueId()}`
        }
        // Creator already prepared the window data. Just return a dummy promise
        if (this.$store.state.windowManager.windows[this.windowId]) {
          return new Promise((resolve, reject) => { resolve() })
        }
        let mainPageWindowId;
        return this._createWindow({
          id: this.windowId
        })
      },
      updateWindow: function (newState) {
        return this._updateWindow({ id: this.windowId, ...newState })
      },
      openDialog: function (className, param) {
        //�򿪵���ʱ����action
        let maxZIndex = 999;
        //������󸡲�
        Object.keys(this.$store.state.dialogManager.windows).forEach((_id) => {
          if (this.$store.state.dialogManager.windows[_id].zIndex > maxZIndex) {
            maxZIndex = this.$store.state.dialogManager.windows[_id].zIndex
          }
        });
        let zIndex = maxZIndex + 1;
        let windowId = `${className}-${genUniqueId()}`;
        return this._openDialog({
          id: windowId,
          parentWindowId: this.windowId,
          zIndex: zIndex,
          className: className,
          param
        })
      },
      TablistAssignedInit: function () {
        let tablistAssignedUuid = {}
        if (arguments.length > 0) {
          for (var i = 0; i < arguments.length; i++) {
            tablistAssignedUuid[arguments[i]] = arguments[i] + this.genUniqueId()
          }
        }
        this.tablistAssignedUuid = tablistAssignedUuid
      },
      closeAllDialog () {
        let self = this;
        Object.keys(self.$store.state.dialogManager.windows).forEach(_id => {
          self.closeDialog(self.$store.state.dialogManager.windows[_id].id);
        })
      }
    },
    computed: {
      windowData(){
        return this.$store.state.windowManager.windows[this.windowId]
      },
      dialogData() {
        return this.$store.state.dialogManager.windows[this.windowId]
      }
    }
  }
</script>
