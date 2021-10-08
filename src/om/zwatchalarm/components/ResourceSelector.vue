<template>
  <div>
<!--     <radio
      v-if="showRadio() && !param.resourceUuid"
      :callback="radioToggle"
      :items="radioItems"
    /> -->
    <radio
      v-if="showRangeRadio()"
      :title="$t('zwatchAlarm.range')"
      :callback="rangeRadioToggle"
      :items="rangeRadioItems"
    />
    <multi-select-input
      v-if="range === 'optional' && optional === 'all' || range === 'multiple'"
      v-for="(label,i) in getMultiSelectLabel()"
      :ref="`${label}-multi-selector`"
      :resourceUuid="param.resourceUuid"
      :required="true"
      :disable="true"
      :toValidate="param.toValidate"
      :title="genComponentTitle(label)"
      :getItemName="genSelectGetItemName(label)"
      :openItemList="genMultiSelectOpenItemList(label)"
      :removeSelectedItem="genMultiSelectRemoveSelectedItem(label)"
      :updateResult="genUpdateResult(label)"
      :getResult="genGetResult(label)"
      :key="i"
    />
    <div v-for="(label, i) in Object.keys(result)" v-else>
      <select-input
        v-if="METRIC_LABELS[label].inputType === 'selectList'"
        :ref="`${label}-selector`"
        :resourceUuid="param.resourceUuid"
        :required="true"
        :disable="true"
        :toValidate="param.toValidate"
        :title="genComponentTitle(label)"
        :getItemName="genSelectGetItemName(label)"
        :openItemList="genSelectOpenItemList(label)"
        :removeSelectedItem="genSelectRemoveSelectedItem(label)"
        :updateResult="genUpdateResult(label)"
        :getResult="genGetResult(label)"
        :key="i"
      />
      <drop-down
        v-if="METRIC_LABELS[label].inputType === 'dropDown'"
        :ref="`${label}-selector`"
        :required="true"
        :disable="genDisableCondition(i, labels)"
        :title="genComponentTitle(label)"
        :items="getDropDownItem(i, label)"
        :updateResult="genUpdateResult(label)"
        :getResult="genGetResult(label)"
      />
    </div>
  </div>
</template>

<script>
import WindowBase from 'src/windows/Window'
import DropDown from './DropDown'
import Radio from './Radio'
import SelectInput from './SelectInput'
import MultiSelectInput from './MultiSelectInput'
import METRIC_LABELS from '../MetricLabels'
import _ from 'lodash'
import rpc from 'src/utils/rpc'

export default {
  name: 'ResourceSelector',
  mixins: [WindowBase],
  props: {
    param: Object,
    updateResult: Function,
    getResult: Function
  },
  components: {
    'drop-down': DropDown,
    'radio': Radio,
    'select-input': SelectInput,
    'multi-select-input': MultiSelectInput
  },
  created: function () {
    this.getLabelValue()
    this.initResult()
    // if (this.param.resourceUuid) {
    //   this.radioToggle('byResource')
    // }
  },
  destroyed: function () {
  },
  data () {
    return {
      range: this.getRange(),
      optional: 'all',
      METRIC_LABELS: METRIC_LABELS,
      labels: this.getLabels(),
      labelValue: [],
      // radioItems: [
      //   {
      //     value: 'byResource',
      //     text: this.getText('byResource')
      //   },
      //   {
      //     value: 'byType',
      //     text: this.getText('byType')
      //   }
      // ],
      rangeRadioItems: [
        {
          value: 'all',
          text: this.getText('all')
        },
        {
          value: 'single',
          text: this.getText('single')
        }
      ]
    }
  },
  methods: {
    getText: function (key) {
      return this.$t(`zwatchAlarm.${key}`)
    },
    getRange: function () {
      let tags = this.param.tags
      if (tags.length === 0) return ''
      let range = tags.filter(item => item.indexOf('range::') > -1)[0]
      return range.split('::')[1]
    },
    showRangeRadio: function () {
      let tags = this.param.tags
      if (tags.length === 0) return false
      let isOptional = tags.some(item => item === 'range::optional')
      return isOptional
    },
    rangeRadioToggle: function (value) {
      this.optional = value
      this.initResult()
    },
    showRadio: function () {
      let tags = this.param.tags
      if (tags.length === 0) return false
      return tags.some(item => item === 'or')
    },
    getLabels: function () {
      let labels = this.param.labels
      if (this.showRadio()) {
        this.param.labels.forEach(item => {
          if (item.indexOf('Uuid') > -1) {
            labels = [item]
          }
        })
      }
      return labels
    },
    initResult: function () {
      let labels = this.getMultiSelectLabel()
      if (this.range === 'optional' && this.optional === 'single') {
        labels = this.getLabels()
      }
      let result = {}
      labels.forEach(item => {
        result[item] = null
      })
      this.updateResult(result)
    },
    _updateResult: function (label, result) {
      let _result = _.cloneDeep(this.result)
      _result[label] = result
      this.updateResult(_result)
    },
    radioToggle: function (value) {
      let labels = []
      if (value === 'byType') {
        this.param.labels.forEach(item => {
          if (item.indexOf('Type') > -1) {
            labels = [item]
          }
        })
      } else {
        this.param.labels.forEach(item => {
          if (item.indexOf('Type') === -1) {
            labels.push(item)
          }
        })
      }
      this.labels = labels
    },
    getLabelValue: async function () {
      let namespace = this.param.namespace
      if (this.param.namespace === 'ZStack/VRouter') {
        namespace = 'ZStack/VM'
      }
      await rpc.query('zwatch/metrics/label-values', {
        namespace: namespace,
        metricName: this.param.metricName,
        labelNames: this.param.labels
      }).then((resp) => {
        this.labelValue = resp.labels
      })
    },
    genLabelData: function (label) {
      let currIndex = -1
      this.labels.forEach((item, i) => {
        if (item === label) {
          currIndex = i
        }
      })
      let data = this.labelValue
      if (currIndex > 0) {
        let keys = this.labels.slice(0, currIndex)
        keys.forEach(key => {
          data = data.filter(item => !this.result[key] || item[key] === this.result[key])
        })
      }
      data = data.map(item => item[label])
      data = _.uniq(data)
      return data
    },
    genDisableCondition: function (LabelIndex, labels) {
      if (labels.length === 1) return false
      if (LabelIndex === 0) return false
      let prevLabel = labels[LabelIndex - 1]
      return !this.result[prevLabel]
    },
    genComponentTitle: function (label) {
      if (this.param.namespace === 'ZStack/VRouter' && label === 'VMUuid') {
        return this.$t(`zwatchAlarm.vRouter`)
      }
      return this.$t(`zwatchAlarm.${METRIC_LABELS[label].title}`)
    },
    genSelectGetItemName: function (label) {
      let dbName = METRIC_LABELS[label].title
      return (uuid) => {
        if (uuid === '') return ''
        if (!this.dbData[dbName] || !this.dbData[dbName][uuid]) return ''
        return this.dbData[dbName][uuid].name
      }
    },
    getMultiSelectLabel: function () {
      let obj = {
        'ZStack/VM': 'VMUuid',
        'ZStack/VRouter': 'VMUuid',
        'ZStack/BackupStorage': 'BackupStorageUuid',
        'ZStack/PrimaryStorage': 'PrimaryStorageUuid',
        'ZStack/Host': 'HostUuid',
        'ZStack/VIP': 'VipUUID',
        'ZStack/L3Network': 'L3NetworkUuid'
      }
      let namespace = this.param.namespace
      let labels = []
      if (obj[namespace]) {
        labels.push(obj[namespace])
      }
      return labels
    },
    genMultiSelectOpenItemList: function (label) {
      return (select) => {
        const self = this
        let route = this.getMultiSelectListDlg(label)
        let conditions = route.conditions
        let selectListDlg = route.select
        let value = this.result[label]
        if (Array.isArray(value) && value.length > 0) {
          conditions.push(`uuid!?=${value}`)
        }
        self.openDialog(selectListDlg, {
          conditions: conditions,
          ok: (list) => {
            if (!Array.isArray(list)) return
            select(list)
            self.$forceUpdate()
          },
          select: (list) => {
            if (!Array.isArray(list)) return
            select(list)
            self.$forceUpdate()
          }
        })
      }
    },
    getMultiSelectListDlg: function (label) {
      if (this.param.namespace === 'ZStack/VRouter' && label === 'VMUuid') {
        return {
          select: 'RouterMultiSelectListDlg',
          conditions: ['hypervisorType=KVM']
        }
      }
      let routes = {
        'VMUuid': {
          select: 'VmInstanceMultiSelectListDlg',
          conditions: ['hypervisorType=KVM', 'type=UserVm', 'state!=Destroyed']
        },
        'BackupStorageUuid': {
          select: 'BackupStorageListMultiSelectListDlg',
          conditions: ['type!=vCenter', '__systemTag__!?=remote,onlybackup,aliyun,remotebackup']
        },
        'HostUuid': {
          select: 'HostListMultiSelectDlg',
          conditions: ['hypervisorType!=ESX']
        },
        'PrimaryStorageUuid': {
          select: 'PrimaryStorageListMultiSelectList',
          conditions: ['type!=vCenter']
        },
        'VipUUID': {
          select: 'VIPMultiSelectList',
          conditions: ['l3Network.l2Network.cluster.type!=vmware']
        },
        'L3NetworkUuid': {
          select: 'L3NetworkMultiSelectListDlg',
          conditions: ['l2Network.cluster.type=zstack']
        }
      }
      return routes[label]
    },
    genMultiSelectRemoveSelectedItem: function (label) {
      return (item) => {
        if (!this.result[label]) return
        let list = _.cloneDeep(this.result[label])
        list = list.filter(it => it !== item)
        this._updateResult(label, list)
        this.$forceUpdate()
      }
    },
    genSelectOpenItemList: function (label) {
      return (select) => {
        const self = this
        let route = this.getSelectListDlg(label)
        let conditions = route.conditions
        let selectListDlg = route.select
        self.openDialog(selectListDlg, {
          conditions: conditions,
          select: (uuid) => {
            select(uuid)
            self.$forceUpdate()
          }
        })
      }
    },
    getSelectListDlg: function (label) {
      if (this.param.namespace === 'ZStack/VRouter' && label === 'VMUuid') {
        return {
          select: 'RouterSingleSelectListDlg',
          conditions: ['hypervisorType=KVM']
        }
      }
      let routes = {
        'VMUuid': {
          select: 'VmSingleSelectListDlg',
          conditions: ['hypervisorType=KVM', 'type=UserVm', 'state!=Destroyed']
        },
        'BackupStorageUuid': {
          select: 'BackupStorageSingleSelectListDlg',
          conditions: ['type!=vCenter', '__systemTag__!?=remote,onlybackup,aliyun,remotebackup']
        },
        'HostUuid': {
          select: 'HostListSingleSelectList',
          conditions: ['hypervisorType!=ESX']
        },
        'PrimaryStorageUuid': {
          select: 'PrimaryStorageListSingleSelectList',
          conditions: ['type!=vCenter']
        },
        'VipUUID': {
          select: 'VipSingleSelectListDlg',
          conditions: ['l3Network.l2Network.cluster.type!=vmware']
        },
        'L3NetworkUuid': {
          select: 'L3NetworkSingleSelectListDlg',
          conditions: ['l2Network.cluster.type=zstack']
        }
      }
      return routes[label]
    },
    genSelectRemoveSelectedItem: function (label) {
      return () => {
        if (!this.result[label]) return
        this._updateResult(label, null)
        this.$forceUpdate()
        // this.removeComponentSelectedItem(label)
      }
    },
    getDropDownItem: function (i, label) {
      if (i > 0) {
        let prevLabel = this.labels[i - 1]
        if (!this.result[prevLabel]) {
          return null
        }
      }
      let values = []
      if (METRIC_LABELS[label].values) {
        values = METRIC_LABELS[label].values
      } else {
        values = this.genLabelData(label)
      }
      let items = values.map(item => {
        let it = {}
        it.value = item
        it.text = item
        return it
      })
      return _.sortBy(items, item => item.value)
    },
    compare: function (val1, val2) {
      if (val1 < val2) {
        return 1
      } else if (val1 > val2) {
        return -1
      } else {
        return 0
      }
    },
    genGetResult: function (label) {
      return () => this.result && this.result[label]
    },
    genUpdateResult: function (label) {
      return (result) => {
        // let _result = _.cloneDeep(this.result)
        // if (!_result[label]) {
        //   _result[label] = null
        // }
        this._updateResult(label, result)
      }
    }
  },
  computed: {
    result () {
      return this.getResult()
    }
  },
  watch: {
    'param.labels': async function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      await this.getLabelValue()
      // let result = _.cloneDeep(this.result)
      // this.result = {}
      // newValue.forEach(item => {
      //   this.updateResult(item, result[item])
      // })
      this.labels = this.getLabels()
      this.initResult()
    },
    'param.metricName': async function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      await this.getLabelValue()
      this.labels = this.getLabels()
      this.initResult()
    }
  }
}
</script>

<style scoped>



</style>
