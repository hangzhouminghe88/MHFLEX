<template>
  <div>
    <div v-for="(label, i) in labels">
      <select-input
        v-if="EVENT_LABELS[label].inputType === 'selectList'"
        :ref="`${label}-selector`"
        :required="false"
        :disable="true"
        :title="genComponentTitle(label)"
        :getItemName="genSelectGetItemName(label)"
        :openItemList="genSelectOpenItemList(label)"
        :removeSelectedItem="genSelectRemoveSelectedItem(label)"
        :updateResult="genUpdateResult(label)"
        :getResult="genGetResult(label)"
      />
      <drop-down
        v-if="EVENT_LABELS[label].inputType === 'dropDown'"
        :ref="`${label}-selector`"
        :required="false"
        :title="genComponentTitle(label)"
        :items="getDropDownItem(label)"
        :updateResult="genUpdateResult(label)"
        :getResult="genGetResult(label)"
      />
    </div>
  </div>
</template>

<script>
import WindowBase from 'src/windows/Window'
import DropDown from './DropDown'
import SelectInput from './SelectInput'
import EVENT_LABELS from '../EventLabels'
import _ from 'lodash'
import ZWatchAlarmMethods from '../Methods'
// import rpc from 'src/utils/rpc'

export default {
  name: 'EventResourceSelector',
  mixins: [WindowBase, ZWatchAlarmMethods],
  props: {
    param: Object
  },
  components: {
    'drop-down': DropDown,
    'select-input': SelectInput
  },
  created: function () {
    this.initResult()
  },
  destroyed: function () {
  },
  data () {
    return {
      EVENT_LABELS: EVENT_LABELS,
      labels: this.getLabels(),
      labelValue: []
    }
  },
  methods: {
    getLabels: function () {
      let tags = this.param.tags
      let noLabels = tags.some(item => item === 'noLabels')
      let labels = this.param.labels
      if (noLabels) {
        labels = []
      }
      return labels
    },
    initResult: function () {
      let labels = this.getLabels()
      let result = {}
      labels.forEach(item => {
        result[item] = null
      })
      this.param.updateResult(result)
      return result
    },
    _updateResult: function (label, result) {
      let _result = _.cloneDeep(this.result)
      _result[label] = result
      this.param.updateResult(_result)
    },
    genComponentTitle: function (label) {
      return this.$t(`zwatchAlarm.${EVENT_LABELS[label].title}`)
    },
    genSelectGetItemName: function (label) {
      let dbName = EVENT_LABELS[label].dbName
      return (uuid) => {
        if (uuid === '') return ''
        if (!this.dbData[dbName] || !this.dbData[dbName][uuid]) return ''
        return this.dbData[dbName][uuid].name
      }
    },
    genSelectOpenItemList: function (label) {
      return (select) => {
        const self = this
        let route = this.getSelectListDlg(label)
        let conditions = route.conditions
        let selectListDlg = route.select
        self.param.createPageOpenSidePanel(selectListDlg, {
          conditions: conditions,
          select: (uuid) => select(uuid)
        })
      }
    },
    // getSelectListDlg: function (label) {
    //   let routes = {
    //     'SourceHostUuid': 'windows/ZWatchAlarm/dialogs/HostSingleSelectList',
    //     'DestinationHostUuid': 'windows/ZWatchAlarm/dialogs/HostSingleSelectList'
    //   }
    //   return routes[label]
    // },
    getSelectListDlg: function (label) {
      let routes = {
        'SourceHostUuid': {
          select: 'windows/ZWatchAlarm/dialogs/HostSingleSelectList',
          conditions: ['hypervisorType!=ESX']
        },
        'DestinationHostUuid': {
          select: 'windows/ZWatchAlarm/dialogs/HostSingleSelectList',
          conditions: ['hypervisorType!=ESX']
        }
      }
      return routes[label]
    },
    genSelectRemoveSelectedItem: function (label) {
      return () => {
        if (!this.result[label]) return
        this._updateResult(label, null)
      }
    },
    getDropDownItem: function (label) {
      let values = []
      let type = this.getResourceType(this.param.namespace)
      if (EVENT_LABELS[label].values) {
        if (EVENT_LABELS[label].values[type]) {
          values = EVENT_LABELS[label].values[type]
        } else {
          values = EVENT_LABELS[label].values
        }
      }
      let items = values.map(item => {
        let it = {}
        it.value = item
        if (item === '') {
          it.text = ''
        } else {
          it.text = item === 'Migrating' || item === 'VolumeMigrating' ? this.$t(`state.${item}`) + '(' + this.$t(`zwatchAlarm.state.${item}`) + ')' : this.$t(`state.${item}`)
        }
        return it
      })
      return items
    },
    genUpdateResult: function (label) {
      return (result) => {
        this._updateResult(label, result)
      }
    },
    genGetResult: function (label) {
      return () => this.result && this.result[label]
    }
  },
  watch: {
    'labels': function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      newValue.forEach(item => {
        this._updateResult(item, null)
      })
    },
    'param': function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      this.labels = this.getLabels()
      this.initResult()
    }
  },
  computed: {
    result () {
      return this.param.getResult()
    }
  }
}
</script>

<style scoped>
</style>



// WEBPACK FOOTER //
// EventResourceSelector.vue?58aa66db
