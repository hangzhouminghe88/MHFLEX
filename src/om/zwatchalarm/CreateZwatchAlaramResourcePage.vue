<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('zwatchAlarm.create.zwatchResourceAlarm')}}</span>
      <span class="create-back" @click="$router.push({name: 'zwatchalarm'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到报警器列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div v-if="step === 1">
        <div class="operation-row">
          <div class="title required">{{$t('common.name')}}</div>
          <input type="text" v-model="windowData.name" @blur="validate('name')"
                 :class="{'is-error': windowData.emptyname}"/>
          <div class="error error-text" v-if="windowData.emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title">{{$t('common.description')}}</div>
          <textarea v-model="windowData.description" rows="3"/>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('zwatchAlarm.type')}}</div>
          <div v-if="$route.params.type">
            {{ $t(`zwatchAlarm.${getResourceType(type2namespace[$route.params.type])}`) }}
          </div>
          <el-select v-else v-model="getResource" style="width: 100%;">
            <el-option v-for="(item, index) in windowData.namespaces" :key="index" @click.native="selectNamespaceItem(item)" :value="item">{{ $t(`zwatchAlarm.${getResourceType(item)}`)}}</el-option>
          </el-select>
        </div>
        <div v-if="$route.params.type" class="operation-row">
          <div class="title required">
            {{$t(`zwatchAlarm.${$route.params.type}`)}}
          </div>
          <div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;display: inline;">
            {{ getCurrResourceName() }}
          </div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t("zwatchAlarm.item")}}</div>
          <add-or-delete-input @open="openMetricsList()"
                               :value="windowData.metricName ? $t(`zwatchAlarm.metricName.${getResourceType(windowData.namespace)}.${windowData.metricName}`, {name: ''}) : ''"
                               @remove="removeMetric" :class="{'is-error': windowData.emptymetricName}"/>
          <div class="error error-text" v-if="windowData.emptymetricName">
            {{$t("zwatchAlarm.item")}}{{$t('error.noEmpty')}}
          </div>
        </div>
        <resource-selector
          v-if="windowData.labels && windowData.labels.length > 0"
          :updateResult="updateResourceResult"
          :getResult="getResourceResult"
          :param="{
              resourceUuid: $route.params.resourceUuid,
              toValidate: windowData.toValidateResource,
              namespace: windowData.namespace,
              metricName: windowData.metricName,
              labels: windowData.labels,
              tags: METRICS[windowData.namespace][windowData.metricName].tags
            }"
        />
      </div>
      <div v-if="step === 2">
        <div class="operation-row">
          <div class="title required">
            {{$t("zwatchAlarm.condition")}}
          </div>
          <drop-down2
            :param="{
             getIndex: () => {
               return operatorList.findIndex((item) => {
                  return item.value === windowData.operator;
                })
             },
             setIndex(index){
               updateWindow({operator: operatorList[index].value})
             },
             getOptionList(){
               return operatorList;
             },
             style: {
               'width': '25%',
               'textAlign': 'center'
             },
           }"></drop-down2>
          <input type="text" v-model="windowData.threshold" style="width: 43%;margin-left: -1px;" :class="{'is-error': windowData.emptythreshold || windowData.invalidthreshold}" @blur="validate('threshold')"/>
          <div class="content-unit" style="background-color: #E3E8ED;"
            v-if="windowData.namespace && windowData.metricName && METRICS[windowData.namespace][windowData.metricName].unit === 'percent'">
               <span class="unit-text">
                 {{ METRICS[windowData.namespace][windowData.metricName].unit === 'percent' ? '%' : '' }}
               </span>
          </div>
          <div class="content-unit" style="background-color: #E3E8ED;" v-if="windowData.namespace && windowData.metricName && METRICS[windowData.namespace][windowData.metricName].unit === 'count'">
                  <span class="unit-text">
                    {{ METRICS[windowData.namespace][windowData.metricName].unit === 'count' ? '个' : '' }}
                  </span>
          </div>
          <drop-down2 v-if="windowData.namespace && windowData.metricName && ['byte/s', 'byte'].includes(METRICS[windowData.namespace][windowData.metricName].unit)"
            :param="{
              getIndex: () => {
                return getUnitIndex()
              },
              setIndex(index){
                setUnitValue(index)
              },
              getOptionList(){
                return setOptionList()
              },
              style:{
               'width': '24%',
               'marginLeft': '-1px'
              }
            }"
          ></drop-down2>
          <div class="error error-text" v-if="windowData.emptythreshold && !windowData.invalidthreshold">{{$t("zwatchAlarm.condition")}}{{$t('error.noEmpty')}}</div>
          <div class="error error-text" v-if="!windowData.emptythreshold && windowData.invalidthreshold">{{$t("zwatchAlarm.condition")}}{{$t('error.invalid')}}</div>
        </div>
        <div class="operation-row">
          <div class="title required">{{$t('zwatchAlarm.period')}}</div>
          <input type="text" v-model="windowData.period" style="width: 70%;"  @blur="validate('period')" :class="{'is-error': windowData.emptyperiod ||  windowData.invalidperiod}"/>
          <drop-down2
            :param="{
              getIndex(){
                return timeUnitList.findIndex((item) => {
                  return item.value === windowData.periodUnitSize;
                })
              },
              setIndex(index){
                updateWindow({periodUnitSize: timeUnitList[index].value})
              },
              getOptionList() {
                return timeUnitList;
              },
              style: {
                'width': '22%',
                'marginLeft': '-1px'
              }
            }"></drop-down2>
          <div class="error error-text" v-if="windowData.emptyperiod && !windowData.invalidperiod">{{$t('zwatchAlarm.period')}}{{$t('error.noEmpty')}}</div>
          <div class="error error-text" v-if="!windowData.emptyperiod && windowData.invalidperiod">{{$t('error.invalid')+$t('zwatchAlarm.period')}}</div>
        </div>
        <div class="operation-row">
          <div class="title">{{$t('zwatchAlarm.strategy')}}</div>
          <el-radio v-model="strategy"  label="repeat">{{$t('zwatchAlarm.repeat')}}</el-radio>
          <el-radio v-model="strategy"  label="once">{{$t('zwatchAlarm.once')}}</el-radio>
        </div>
        <div class="operation-row" v-if="strategy!=='once'">
          <div class="title">{{$t('zwatchAlarm.repeatInterval')}}</div>
          <input type="text" v-model="windowData.repeatInterval" style="width: 70%;" @blur="validate('repeatInterval')"/>
          <drop-down2
            :param="{
              getIndex(){
                return timeUnitList.findIndex((item) => {
                  return item.value === windowData.repeatIntervalUnitSize;
                })
              },
              setIndex(index){
                updateWindow({repeatIntervalUnitSize: timeUnitList[index].value})
              },
              getOptionList() {
                return timeUnitList;
              },
              style: {
                'width': '22%',
                'marginLeft': '-1px'
              }
            }"></drop-down2>
          <div>{{`(${$t('zwatchAlarm.repeatIntervalDefaultValue')})`}}</div>
          <div class="error error-text" v-if="strategy === 'repeat' && !windowData.emptyrepeatInterval && windowData.invalidrepeatInterval">{{$t('error.invalid')+$t('zwatchAlarm.repeatInterval')}}</div>
          <div class="error error-text" v-if="strategy === 'repeat' && !windowData.emptyrepeatInterval && !windowData.invalidrepeatInterval && windowData.tooSmallrepeatInterval">{{$t('error.greaterThan', { number: 9 })}}</div>
        </div>
        <div class="operation-row">
          <div class="title">{{$t('home.endPoint')}}</div>
          <add-or-delete-input v-if="windowData.endpointUuidList.length > 0 " v-for="(uuid, index) in windowData.endpointUuidList"
          :value="dbData.zwatchEndpoint[uuid] && getEndpointName(uuid) " :key="index" @remove="removZWatchEndpoint($event, uuid)"/>

          <add-or-delete-input @open="openZWatchEndpoint"/>
        </div>
        <div class="operation-row">
          <div class="link">
            <i class="el-icon-plus"></i>
            <div style="display: inline-block" @click="$router.push({name: 'zwatchendpoint'})">{{$t('zwatchEndpoint.create')}}</div>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <div class="step-item" v-if="step === 1" @click="next()">{{$t('common.nextStep')}}</div>
      <div class="step-item" v-if="step === 2" @click="prev()">{{$t('common.prevStep')}}</div>
      <div class="step-item btn-confirm" v-if="step === 2" @click="confirm();">{{$t('common.confirm')}}</div>
      <div class="step-item btn-cancel" @click="$router.push({name: 'zwatchalarm'})">{{$t('common.cancel')}}</div>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import WindowBase from 'src/windows/Window';
  import METRICS from './Metrics';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import ResourceSelector from "./components/ResourceSelector";
  import validator from 'src/utils/validator';
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import Methods from './Methods';

  export default {
    name: "CreateZwatchAlaramResourcePage",
    mixins: [WindowBase, Methods],
    components: {
      ResourceSelector, AddOrDeleteInput, CreateTemplate,
      'drop-down2': DropDown
    },
    data() {
      return {
        type2namespace: {
          'vRouter': 'ZStack/VRouter',
          'vm': 'ZStack/VM',
          'host': 'ZStack/Host',
          'backupStorage': 'ZStack/BackupStorage',
          'vip': 'ZStack/VIP',
          'l3network': 'ZStack/L3Network',
          'primaryStorage': 'ZStack/PrimaryStorage'
        },
        METRICS: METRICS,
        step: 1,
        operatorList: [
          {name: "zwatchAlarm.GreaterThan", value: "GreaterThan"},
          {name: "zwatchAlarm.GreaterThanOrEqualTo", vlaue: "GreaterThanOrEqualTo"},
          {name: "zwatchAlarm.LessThan", value: "LessThan"},
          {name: "zwatchAlarm.LessThanOrEqualTo", value: "LessThanOrEqualTo"}
        ],
        sizeUnitList: [
          {name:'KB/s', value: 'KB/s'},
          {name:'MB/s', value: 'MB/s'},
          {name: 'GB/s', value: 'GB/s'},
          {name: 'TB/s', value: 'TB/s'}
        ],
        byteSizeUnitList: [
          {name:'KB', value: 'KB'},
          {name:'MB', value: 'MB'},
          {name: 'GB', value: 'GB'},
          {name: 'TB', value: 'TB'}
        ],
        timeUnitList: [
          {name: 'common.second', value:'second'},
          {name: 'common.minute', value: 'minute'},
          {name: 'common.hour', value: 'hour'}
        ],
        strategy: 'repeat'
      }
    },
    computed: {
      getResource:{
        get(){
          let self = this;
          return self.$t(`zwatchAlarm.${self.getResourceType(self.windowData.namespace)}`);
        },
        set(val){
          let self = this;
          self.getResourceType(val);
        }
      }
    },
    created() {
      this.init()
    },
    methods: {
      ...validator,
      next() {
        let self = this;
        self.validateStepOne()
        if (this.windowData.stepOneInvalidInput) return
        let unitSize = METRICS[this.windowData.namespace][this.windowData.metricName].unit === 'byte/s' ? 'MB/s' : 'MB'
        this.updateWindow({unitSize}).then(() => {
          self.step++;
        })
      },
      prev() {
        let self = this;
        self.step--;
      },
      validateStepOne() {
        this.updateWindow({
          toValidateResource: true
        })
        let obj = {}
        obj.stepOneInvalidInput = false
        let props = ['metricName', 'name']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this.windowData[`empty${item}`] || this.windowData[`invalid${item}`])
        let isResourceSelectEmpty = (this.windowData.labels.length > 0 && !this.windowData.resourceSelectResult) || this.windowData.resourceSelectResult && Object.keys(this.windowData.resourceSelectResult).some(key => {
          if (Array.isArray(this.windowData.resourceSelectResult[key])) return this.windowData.resourceSelectResult[key].length === 0
          else return !this.windowData.resourceSelectResult[key]
        })
        if (isInvalid || isResourceSelectEmpty) obj.stepOneInvalidInput = true
        this.updateWindow(obj)
      },
      getResourceType: function (namespace, uuid) {
        let key = namespace
        if (this.dbData.zwatchResourceAlarmA && this.dbData.zwatchResourceAlarmA[uuid] && this.dbData.zwatchResourceAlarmA[uuid].tag === 'VRouter') {
          key = 'ZStack/VRouter'
        }
        let types = {
          'ZStack/Image': 'image',
          'ZStack/VM': 'vm',
          'ZStack/BackupStorage': 'backupStorage',
          'ZStack/System': 'system',
          'ZStack/Volume': 'volume',
          'ZStack/Host': 'host',
          'ZStack/PrimaryStorage': 'primaryStorage',
          'ZStack/VIP': 'vip',
          'ZStack/L3Network': 'l3network',
          'ZStack/VRouter': 'vRouter',
          'ZStack/VCenter': 'vCenter',
          'ZStack/MN': 'mn',
          'ZStack/AliyunNasHost': 'primaryStorage',
          "ZStack/LoadBalancer": 'loadBalancerListener'
        }
        let type = types[key]
        return type
      },
      init: async function () {
        let namespaces = []
        if (!this.dbData.common.isAdmin) {
          namespaces = ['ZStack/VM', 'ZStack/Image', 'ZStack/L3Network', 'ZStack/VIP']
        } else {
          namespaces = Object.keys(METRICS)
        }
        await this.updateWindow({
          repeatIntervalUnitSize: 'minute',
          periodUnitSize: 'minute',
          unitSize: 'MB',
          namespaces,
          namespace: (this.$route.params && this.$route.params.type) ? this.type2namespace[this.$route.params.type] : 'ZStack/VM',
          metricName: '',
          name: '',
          description: '',
          periodUnit: 'S',
          period: '',
          threshold: '',
          repeatInterval: '',
          repeatIntervalUnit: 'S',
          operator: 'GreaterThan',
          topicUuidList: (this.$route.params && this.$route.params.topicUuid) ? [this.$route.params.topicUuid] : [],
          endpointUuidList: [],
          labels: [],
          resourceSelectResult: {},
          toValidateResource: false
        })
      },
      selectNamespaceItem: function (namespace) {
        this.strategy = 'repeat'
        this.updateWindow({
          threshold: '',
          period: '',
          labels: [],
          repeatInterval: '',
          endpointUuidList: [],
          namespace,
          metricName: ''
        })
      },
      getCurrResourceName: function () {
        let type =this.$route.params.type
        let obj = {
          'image': 'image',
          'vRouter': 'vm',
          'vm': 'vm',
          'backupStorage': 'backupstorage',
          'volume': 'volume',
          'host': 'host',
          'primaryStorage': 'primarystorage',
          'vip': 'vip',
          'l3network': 'l3network'
        }
        let dbName = obj[type]
        let uuid = this.$route.params.resourceUuid
        if (!this.dbData[dbName] || !this.dbData[dbName][uuid]) return ''
        return this.dbData[dbName][uuid].name
      },
      openMetricsList: function () {
        let self = this;
        let namespace = self.windowData.namespace
        let resource = ''
        if (self.$route.params.type) {
          namespace = self.type2namespace[self.$route.params.type]
          resource = self.$route.params.type
        }
        this.openDialog('MetricListsDlg', {
          namespace: namespace,
          resource: resource,
          ok: (metricName) => self.selectMetric(metricName)
        })
        this.validate('metricName');
      },
      selectMetric(metricName) {
        let self = this;
        self.strategy = 'repeat'
        self.updateWindow({
          period: '',
          threshold: '',
          repeatInterval: '',
          endpointUuidList: []
        })
        if (!metricName || !METRICS[self.windowData.namespace][metricName]) return
        let labelNames = METRICS[self.windowData.namespace][metricName].labelNames
        self.updateWindow({
          metricName: metricName,
          labels: labelNames
        })
        self.validate('metricName')
      },
      removeMetric($event) {
        this.updateWindow({
          metricName: '',
          labels: []
        })
        $event.stopPropagation()
      },
      updateResourceResult: function (result) {
        this.updateWindow({resourceSelectResult: result})
      },
      getResourceResult: function () {
        return this.windowData.resourceSelectResult
      },
      confirm() {
        let self = this;
        self.validateAll();
        if(self.windowData.invalidInput) return;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'zwatchalarm'})
          });
      },
      validateAll () {
         let obj = {}
        obj.invalidInput = false
        let props = ['period', 'threshold', 'repeatInterval']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => {
          if (item === 'repeatInterval') return this.windowData.invalidrepeatInterval
          else return this.windowData[`empty${item}`] || this.windowData[`invalid${item}`]
        })
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      validate(name) {
        let obj = {}
        obj[`empty${name}`] = false
        let windowData = this.windowData
        let propToBeTrimed = ['metricName', 'name', 'period', 'threshold', 'repeatInterval']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : windowData[name]
        if (Array.isArray(input) && input.length === 0) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false

        let validationObj = this.genValidationObj()
        if (validationObj[name] && validationObj[name].length > 0) {
          obj[`invalid${name}`] = validationObj[name].some(item => !item(input))
        }

        if (name === 'threshold') {
          this.validateThreshold()
          return
        }
        if (name === 'repeatInterval' && this.strategy === 'repeat') {
          obj.tooSmallrepeatInterval = false
          if (this.toSecond(this.windowData.repeatInterval, this.windowData.repeatIntervalUnitSize) < 10) obj.tooSmallrepeatInterval = true
        }

        this.updateWindow(obj)
      },
      genValidationObj: function () {
        let validationObj = {
          metricName: [],
          name: [this.isValidName],
          period: [this.isUint],
          threshold: [this.isNumber],
          repeatInterval: [this.isUint],
          topicUuidList: []
        }
        return validationObj
      },
      toSecond(time, unit){
        let s = 60;
        let obj ={
          'second': 1,
          'minute': s,
          'hour': s * s
        }
        return time*obj[unit];
      },
      validateThreshold: function () {
        let windowData = this.windowData
        let emptythreshold = false
        let invalidthreshold = true
        if (!this.isNumber(windowData.threshold)) {
          this.updateWindow({invalidthreshold, emptythreshold})
          return
        }
        if (windowData.namespace && windowData.metricName && METRICS[windowData.namespace][windowData.metricName].unit !== 'count') {
          if (METRICS[windowData.namespace][windowData.metricName].unit === 'percent') {
            if (windowData.threshold >= 0) invalidthreshold = false
          } else if (METRICS[windowData.namespace][windowData.metricName].unit.indexOf('byte') > -1) {
            if (windowData.threshold >= 0) invalidthreshold = false
          }
        } else {
          if (parseFloat(windowData.threshold) === 0 || this.isUint(windowData.threshold)) invalidthreshold = false
        }
        this.updateWindow({invalidthreshold, emptythreshold})
      },
      getUnitIndex() {
        let self = this, unitIndex;
        switch (self.METRICS[self.windowData.namespace][self.windowData.metricName].unit) {
          case 'byte/s':
            unitIndex = self.sizeUnitList.findIndex((item) => {
              return item.value === self.windowData.unitSize;
            })
            break;
          case 'byte':
            unitIndex = self.byteSizeUnitList.findIndex((item) => {
              return item.value === self.windowData.unitSize;
            })
           break;
        }
        return unitIndex;
      },
      setUnitValue(index) {
        let self = this, unit ='';
        switch (self.METRICS[self.windowData.namespace][self.windowData.metricName].unit) {
          case 'byte/s':
             unit = self.sizeUnitList[index].value;
            break;
          case 'byte':
            unit = self.byteSizeUnitList[index].value;
            break;
        }
        self.updateWindow({unitSize: unit});
      },
      setOptionList() {
        let self = this, unitList= [];
        switch (self.METRICS[self.windowData.namespace][self.windowData.metricName].unit) {
          case 'byte/s':
            unitList = self.sizeUnitList;
            break;
          case 'byte':
            unitList = self.byteSizeUnitList;
            break;
        }
        return unitList;
      },
      createParam: function () {
        let threshold = this.windowData.threshold
        if (this.windowData.namespace && this.windowData.metricName && METRICS[this.windowData.namespace][this.windowData.metricName].unit.indexOf('byte') > -1) {
          threshold = this.parseSize(Math.abs(threshold) + this.windowData.unitSize)
        }
        let param = {
          namespace: this.windowData.namespace,
          metricName: this.windowData.metricName,
          name: this.windowData.name,
          description: this.windowData.description,
          period: this.toSecond(this.windowData.period, this.windowData.periodUnitSize),
          threshold: threshold,
          comparisonOperator: this.windowData.operator,
          actions: this.formatActions(this.windowData.endpointUuidList),
          labels: this.formatLabels(this.windowData.resourceSelectResult)
        }
        if (this.strategy === 'repeat') {
          param = {
            repeatCount: -1,
            repeatInterval: this.windowData.repeatInterval === '' ? null : this.toSecond(this.windowData.repeatInterval, this.windowData.repeatIntervalUnitSize),
            ...param
          }
        } else param.repeatCount = 1
        return param
      },
      formatLabels: function (resourceSelectResult) {
        if (!resourceSelectResult) return []
        return Object.keys(resourceSelectResult).map(key => {
          if (Array.isArray(resourceSelectResult[key]) && resourceSelectResult[key].length > 1) {
            return {
              key: key,
              op: 'Regex',
              value: resourceSelectResult[key].join('|')
            }
          }
          return {
            key: key,
            op: 'Equal',
            value: resourceSelectResult[key].toString()
          }
        })
      },
      formatActions: function (endpointUuidList) {
        let topicUuidList = endpointUuidList.map(uuid => {
          return this.dbData.zwatchTopic[uuid].uuid
        })
        return topicUuidList.map(uuid => {
          return {
            actionType: 'sns',
            actionUuid: uuid
          }
        })
      },

      openZWatchEndpoint: function () {
        const self = this
        let conditions = ['name!=created-by-SystemHTTPTopicAndEndpointCreator']
        if (self.windowData.endpointUuidList && self.windowData.endpointUuidList.length > 0) {
          conditions.push(`uuid!?=${self.windowData.endpointUuidList}`)
        }
        self.openDialog('ZWatchEndPointSelect', {
          conditions: conditions,
          select: (uuidList) => self.selectZWatchEndpoint(uuidList)
        })
      },

      selectZWatchEndpoint: function (uuidList) {
        let endpointUuidList = this.windowData.endpointUuidList
        endpointUuidList = _.uniq(endpointUuidList.concat(uuidList))
        this.updateWindow({ endpointUuidList })
        // this.validate('endpointUuidList')
      },

      removZWatchEndpoint: function ($event, uuid) {
        let endpointUuidList = this.windowData.endpointUuidList
        endpointUuidList = endpointUuidList.filter(item => item !== uuid)
        this.updateWindow({ endpointUuidList })
        // this.validate('endpointUuidList')
      },
    }
  }
</script>

<style scoped>
  .step-item {
    display: inline-block;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 2px;
    right: 20px;
    margin: 16px 10px;
    padding: 5px 30px;
    cursor: pointer;
    position: relative;
  }

  .step-item:hover {
    transition: all 0.5s;
    background: #39f;
    border: 1px solid #39f;
    color: #fff;
  }

  .content-unit{
    display: inline-block;
    height: 40px;
    border: 1px solid #ddd;
    line-height: 40px;
    padding: 0px 24px;
    margin-left: -5px;
  }
</style>
