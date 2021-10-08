<script>
import _ from 'lodash'
import { isChildElementOf } from '../../utils/utils'
import Panel from './Panel'

export default {
  mixins: [Panel],
  data () {
    return {
      openedPanelName: ''
    }
  },
  created: function () {
    let fullPanelList = []
    if (this.dbData.common.fullPanelList) {
      fullPanelList = _.cloneDeep(this.dbData.common.fullPanelList)
    }
    fullPanelList.push(this.windowId)
    this.updateDbObject({
      name: 'common',
      data: {
        fullPanelList
      }
    })
  },
  mounted: function () {
    this.$el.addEventListener('click', this.onFullPanelWindowClick)
  },
  destroyed: function () {
    this.$el.removeEventListener('click', this.onFullPanelWindowClick)
    let fullPanelList = _.cloneDeep(this.dbData.common.fullPanelList)
    if (fullPanelList.length > 0) {
      fullPanelList.pop()
      setTimeout(() => {
        this.updateDbObject({
          name: 'common',
          data: {
            fullPanelList
          }
        })
      }, 100) // delay 100ms to let all following process finished.
    }
  },
  methods: {
    onFullPanelWindowClick: function ($event) {
      if (isChildElementOf($event.target, 'operation-body') && !isChildElementOf($event.target, 'content')) {
        if (this.windowData.dialogList && this.windowData.dialogList.length > 0) {
          this.destroyDialogs()
        }
        this.destroyChildrenPanels()
      }
    },
    setFocus: function (name) {
      this.openedPanelName = name
    },
    isFocus: function (name) {
      return this.openedPanelName === name && this.windowData.dialogList && this.windowData.dialogList.length > 0
    }
  }
}
</script>
