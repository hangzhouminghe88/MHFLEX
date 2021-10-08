<script>
  import Utils from 'src/utils/utils'
  import WindowBase from 'src/windows/Window'
  import _ from 'lodash'

  export default {
    name: 'GlobalTimerManager',
    mixins: [WindowBase],
    created: function () {
      this.init()
    },
    data: function () {
      return {
        timerId: null,
        timerIndex: 0,
        currTaskList: []
      }
    },
    methods: {
      init: function () {
        const self = this
        self.$data.timerId = setInterval(function () {
          self.$data.timerIndex++
          self.$data.timerIndex %= 100 * 365 * 24 * 60 * 60 * 1000
          let taskList = self.getTaskList()
          self.$data.currTaskList = taskList.filter(task => self.$data.timerIndex % task.interval === 0)
          if (self.$data.currTaskList.length > 0) {
            self.$data.currTaskList.forEach(task => {
              if (task.stopFlag && task.stopFlag()) {
                self.removeTask(task.id)
                return
              }
              task.method()
            })
          }
        }, 1000)
      },
      getTaskList: function () {
        return _.values(this.$store.state.timerManager.tasks)
      },
      removeTask: function (id) {
        delete this.$store.state.timerManager.tasks[id]
      },
      ...Utils
    },
    computed: {
    },
    watch: {
    }
  }
</script>

<style scoped>
</style>
