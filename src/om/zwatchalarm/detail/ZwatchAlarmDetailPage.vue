<template>
  <detail-template>
    <div slot="header" class="detail-header">
      <span class="detail-title">报警器详情</span>
      <span class="detail-header-item create-back"
            @click="$router.push({name: 'zwatchalarm', params:{currTab: $route.params.currTab}})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">回到报警器列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t(`zwatchAlarm.${$route.params.currTab}`)}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px;" :class="{'disabled-text': inState('Enabled')}"
                 @click="!inState('Enabled') && pageEnable('Enabled', query)">{{$t('common.enable')}}</a>
              <a :class="{'disabled-text': inState('Disabled')}"
                 @click="!inState('Disabled') && pageEnable('Disabled', query)">{{$t('common.disable')}}</a>
              <a @click="detailAddEndpoint()">{{$t("zwatchTopic.addEndpoint")}}</a>
              <a :class="{ 'disabled-text': !canRemoveEndpoint(windowData.dataUuid, windowData.currTab) }" @click="canRemoveEndpoint(windowData.dataUuid, windowData.currTab) && detailRemoveEndPoint()">{{$t("zwatchTopic.removeEndpoint")}}</a>
              <a style="margin-bottom: 12px;" :class="{ 'disabled-text': !canDestroy([windowData.dataUuid])}"
                 @click="canDestroy([windowData.dataUuid]) && detailDestroyed()">{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </span>
      <span class="detail-tab">
        <el-tabs tab-position="bottom" v-model="currLabel">
          <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
          <el-tab-pane :label="$t('zwatchAlarm.resourceList')" v-if="!showResourceLink()"
                       name="resourceList"></el-tab-pane>
          <el-tab-pane :label="$t('common.zwatchEndpoint')" name="zwatchEndpoint"></el-tab-pane>
          <el-tab-pane :label="$t('zwatchAlarm.alarmLog')" name="alarmLog"></el-tab-pane>
          <el-tab-pane :label="$t('common.log')" name="log"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div slot="body" class="detail-body" v-if="currLabel === 'info'">
      <div class="left">
        <div class="left-header">
          <base-icon name="zwatch_alarm_ico"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" :state="model.state" v-if="model.state"/>
            <detail-info-state outer-class-name="detail-page-state"
                               v-if="windowData.currTab === 'zwatchResourceAlarm' && model.status"
                               :state="`alarm.${model.status}`"/>
          </div>
          <detail-name class="name" v-if="windowData.currTab === 'zwatchResourceAlarm'"
                       :param="updateResourceParam('name')"/>
          <detail-description class="description" v-if="windowData.currTab === 'zwatchResourceAlarm'"
                              :param="updateResourceParam('description')"/>
          <div class="name" v-if="windowData.currTab !== 'zwatchResourceAlarm'">
            <span>{{getAlarmName(windowData.dataUuid, windowData.currTab)}}</span>
          </div>
        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t('common.overview')}}
          </div>
          <detail-row
            :param="{
             title: 'zwatchAlarm.type',
             content:  model.namespace && $t(`zwatchAlarm.${getResourceType(model.namespace, windowData.dataUuid)}`)
           }"
          />
          <detail-row v-if="windowData.currTab === 'zwatchResourceAlarm'"
                      :param="{
             title: 'zwatchAlarm.item',
             content: getZWatchAlarmItem(windowData.dataUuid, windowData.currTab)
           }"
          />
          <div class="detail-row editable" v-if="windowData.currTab === 'zwatchResourceAlarm'">
            <div class="detail-title">{{$t('monitoralarm.op')}}{{$t('common.colon')}}</div>
            <div class="detail-container" v-if="!editCondition && model.comparisonOperator && model.threshold">
              <span v-if="!editCondition">{{$t(`zwatchAlarm.${model.comparisonOperator}`)}}{{unit == 'byte' ? `${sizeRoundToString(Math.abs(model.threshold))}B` : (unit === 'byte/s' ?  `${sizeRoundToString(Math.abs(model.threshold))}B/s` : (unit === 'percent' ? `${Math.abs(model.threshold)}%` : `${parseInt(model.threshold)}个`)) }}</span>
              <span class="edit-icon" v-if="!editCondition"
                    @click="editCondition=true; newOperator = model.comparisonOperator; getConditionNewThreshold()">
              <i class="el-icon-edit"></i>
            </span>
            </div>
            <div class="detail-container" v-if="editCondition" ref="conditionRef">
              <drop-down2
                :param="{
             getIndex: () => {
               return operatorList.findIndex((item) => {
                  return item.value === newOperator;
                })
             },
             setIndex(index){
              newOperator = operatorList[index].value;
             },
             getOptionList(){
               return operatorList;
             },
             style: {
               'width': '20%',
               'textAlign': 'center'
             },
           }"></drop-down2>
              <input type="text" v-model="newThreshold" style="width: 50%;margin-left: -1px;"
                     @blur="updateAlarmCondition();editCondition=false;"/>
              <div class="content-unit" style="background-color: #E3E8ED;"
                   v-if="model.namespace && model.metricName && METRICS[model.namespace][model.metricName].unit === 'percent'">
               <span class="unit-text">
                 {{ METRICS[model.namespace][model.metricName].unit === 'percent' ? '%' : '' }}
               </span>
              </div>
              <div class="content-unit" style="background-color: #E3E8ED;"
                   v-if="model.namespace && model.metricName && METRICS[model.namespace][model.metricName].unit === 'count'">
                  <span class="unit-text">
                    {{ METRICS[model.namespace][model.metricName].unit === 'count' ? '个' : '' }}
                  </span>
              </div>
              <drop-down2
                v-if="model.namespace && model.metricName && ['byte/s', 'byte'].includes(METRICS[model.namespace][model.metricName].unit)"
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
               'width': '15%',
               'marginLeft': '-1px'
              }
            }"
              ></drop-down2>

            </div>
          </div>
          <div class="detail-row editable" v-if="windowData.currTab === 'zwatchResourceAlarm'">
            <div class="detail-title">{{$t('monitoralarm.monitorPeriod')}}{{$t('common.colon')}}</div>
            <div class="detail-container" v-if="!editPeriod && model.period && model.period">
              <span v-if="!editPeriod">{{ durationConvert(model.period)}}</span>
              <span class="edit-icon" v-if="!editPeriod"
                    @click="editPeriod=true; newPeriod = ''; getPeriodUnit()">
                <i class="el-icon-edit"></i>
              </span>
            </div>
            <div class="detail-container" v-if="editPeriod" ref="periodRef">
              <input type="text" v-model="newPeriod"/>
              <drop-down2
                :param="{
                   getIndex: () => {
                return timeUnitList.findIndex((item) => {
                  return item.value === windowData.periodUnit
                })
              },
              setIndex(index){
                updateWindow({periodUnit: timeUnitList[index].value})
              },
              getOptionList(){
                return timeUnitList;
              },
              style:{
               'width': '15%',
               'marginLeft': '-1px'
              }
                }"
              />
            </div>
          </div>
          <detail-row class="editable" v-if="windowData.currTab === 'zwatchResourceAlarm'"
                      :param="{
              title: 'zwatchAlarm.strategy',
              content: model.repeatCount === -1 ? $t('zwatchAlarm.repeat') : $t('zwatchAlarm.once') ,
              editable: true,
              handler(){
                openResetStragtegy();
              }
            }"
          />
          <detail-row v-if="windowData.currTab === 'zwatchResourceAlarm'"
                      :param="{
              title: 'zwatchAlarm.repeatInterval',
              content: durationConvert(model.repeatInterval)
            }"
          />
          <detail-row
            :param="{
              title: 'common.createDate',
              content: model.createDate && formatDatetime(new Date(model.createDate))
            }"
          />
          <detail-row
            :param="{
              title: 'common.lastOpDate',
              content: model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
            }"
          />
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div class="detail-block-header">
          {{$t('common.moreInformation')}}
        </div>
        <detail-row
          :param="{
            title:  'zwatchTopic.endpointNum',
            content: getTopicNum(windowData.dataUuid, windowData.currTab)
          }"
        />
        <detail-row v-for="(item, index) in getAlarmLabelItems()" :key="index" v-if="showResourceLink()"
                    :param="{
            title: LABELS[item.key] && $t(`zwatchAlarm.${getLabelTitle(item.key)}`),
            content: isResourceLink(item.key) ? getResourceName(item.key, item.value) : getLabelValue(item),
            handler: () => {
             return isResourceLink(item.key)
            }
          }"
        />
        <detail-row
          :param="{
            title: 'UUID',
            content: model && model.uuid,
            copy: () => {
              return true;
            }
          }"
        />
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="currLabel === 'resourceList'">
      <resource-list-tab :param="{alarmUuid: windowData.dataUuid, getResourceType: getLabelTitle, refresh: query}"/>
    </div>
    <div slot="body" class="detail-body" v-if="currLabel === 'log'">
      <log-list :param="{uuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="currLabel === 'alarmLog'">
      <alarm-log-list
        :param="{alarmUuidList: [windowData.dataUuid], eventNames: dbData.zwatchEventAlarm[windowData.dataUuid] ? [dbData.zwatchEventAlarm[windowData.dataUuid].eventName] : []}"/>
    </div>
    <div slot="body" class="detail-body" v-if="currLabel === 'zwatchEndpoint'">
      <zwatch-end-point-tab :param="{conditions: `topics.uuid?=${getTopicUuidList()}`,  refresh: query, uuid: windowData.dataUuid, type: windowData.currTab}"/>
    </div>
  </detail-template>
</template>

<script>
  import DetailTemplate from "../../../component/DetailTemplate";
  import WindowBase from 'src/windows/Window';
  import EVENT_LABELS from '../EventLabels';
  import METRIC_LABELS from '../MetricLabels';
  import METRICS from '../Metrics';
  import List from '../List';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import DetailInfoState from "../../../component/DetailInfoState";
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import LogList from "../../../component/LogList";
  import ResourceListTab from "../components/ResourceListTab";
  import AlarmLogList from "../components/AlarmLogList";
  import ZwatchEndPointTab from "../components/ZwatchEndPointTab";

  export default {
    name: "ZwatchAlarmDetailPage",
    mixins: [WindowBase, List],
    components: {
      ZwatchEndPointTab,
      AlarmLogList, ResourceListTab, LogList, DetailInfoState, DetailTemplate, 'drop-down2': DropDown},
    created() {
      let self = this, dataUuid = '', currTab = '';
      if (self.$route.params) {
        dataUuid = self.$route.params.uuid;
        currTab = self.$route.params.currTab;
      }
      self.updateWindow({
        dataUuid,
        currTab
      })
        .then(() => {
          return self.query();
        })
        .then(() => {
          this.getUnitSize()
          this.getRepeatIntervalUnit()
          this.getPeriodUnit()
          this.getUnit();
        })
    },
    mounted() {
      let self = this;
      window.addEventListener('click', self.windowClick, true);
    },
    computed: {
      model: {
        get() {
          let self = this;
          return self.value;
        },
        set(value) {
          this.value = value;
        }
      },
      LABELS() {
        return this.getLabels()
      },
      selectedList() {
        let self = this;
        return [self.windowData.dataUuid]
      },
      isSelected() {
        let self = this;
        return [self.windowData.dataUuid].length >= 1;
      },
      isSingleSelected() {
        let self = this;
        return [self.windowData.dataUuid].length === 1;
      }
    },
    data() {
      let self = this;
      return {
        value: {},
        operatorList: [
          {name: "zwatchAlarm.GreaterThan", value: "GreaterThan"},
          {name: "zwatchAlarm.GreaterThanOrEqualTo", value: "GreaterThanOrEqualTo"},
          {name: "zwatchAlarm.LessThan", value: "LessThan"},
          {name: "zwatchAlarm.LessThanOrEqualTo", value: "LessThanOrEqualTo"}
        ],
        METRICS: METRICS,
        newOperator: self.model && self.model.comparisonOperator,
        newThreshold: self.model && self.model.threshold,
        sizeUnitList: [
          {name: 'KB/s', value: 'KB/s'},
          {name: 'MB/s', value: 'MB/s'},
          {name: 'GB/s', value: 'GB/s'},
          {name: 'TB/s', value: 'TB/s'}
        ],
        byteSizeUnitList: [
          {name: 'KB', value: 'KB'},
          {name: 'MB', value: 'MB'},
          {name: 'GB', value: 'GB'},
          {name: 'TB', value: 'TB'}
        ],
        editCondition: false,
        unit: '',
        editPeriod: false,
        newPeriod: '',
        timeUnitList: [
          {name: 'common.second', value: 'second'},
          {name: 'common.minute', value: 'minute'},
          {name: 'common.hour', value: 'hour'}
        ],
        currLabel: 'info'
      }
    },
    methods: {
      ...Utils,
      //判断能否停用启用
      inState() {
        let states = [], self = this;
        if (arguments) {
          for (let arg in arguments) {
            states.push(arguments[arg]);
          }
        }
        let instate = self.selectedList.every((uuid) => {
          return states.some((state) => {
            return state === self.model.state
          });
        })
        return instate;
      },
      getUnit: function () {
        if (this.windowData.currTab === 'zwatchResourceAlarm') {
          this.unit = METRICS[this.model.namespace][this.model.metricName].unit
        }
      },
      //或得告警条目列表
      getAlarmLabelItems: function () {
        let self = this;
        let labels = _.cloneDeep(self.model.labels);
        labels = _.filter(labels, (label) => label.key !== 'ALARM_EXCLUDE_RESOURCE_LABEL')
        // filter label ALARM_EXCLUDE_RESOURCE_LABE which is added by ZStack
        return this.sortLabels(labels)
      },
      //给条目排序
      sortLabels: function (labels) {
        let compare = (prev, next) => {
          let LABELS = METRIC_LABELS
          if (this.param.type === 'zwatchEventAlarm') {
            LABELS = EVENT_LABELS
          }
          let p = LABELS[prev.key].weight
          let n = LABELS[next.key].weight
          if (p > n) return 1
          if (p < n) return -1
          if (p === n) return 0
        }
        let newLabels = labels.sort(compare)
        return newLabels
      },
      //或得条目标题
      getLabelTitle: function (label) {
        let uuid = this.windowData.dataUuid
        if (this.dbData.zwatchResourceAlarmA[uuid] && this.dbData.zwatchResourceAlarmA[uuid].tag === 'VRouter' && label === 'VMUuid') {
          return 'vRouter'
        }
        return this.LABELS[label].title
      },
      //或得资源名称
      getResourceName(label, resourceUuid) {
        if (!this.LABELS[label]) return ''
        let dbName = this.LABELS[label].dbName || this.LABELS[label].title
        if (!this.dbData[dbName] || !this.dbData[dbName][resourceUuid]) return ''
        return this.dbData[dbName][resourceUuid].name
      },
      windowClick(e) {
        let self = this;
        if (self.$refs.conditionRef) {
          if (e.target.className === 'dropdown-item' || e.target.tagName === 'INPUT'
            || e.target.tagName === 'text'
            || e.target.className === 'dropdown'
            || e.target.className === 'title'
            || e.target.className.indexOf('el-icon') !== -1) {
            return;
          } else {
            self.updateAlarmCondition();
            self.editCondition = false;
          }
        }
        if (self.$refs.periodRef) {
          if (e.target.className === 'dropdown-item' || e.target.tagName === 'INPUT'
            || e.target.tagName === 'text'
            || e.target.className === 'dropdown'
            || e.target.className === 'title'
            || e.target.className.indexOf('el-icon') !== -1) {
            return;
          } else {
            this.updateAlarm('period', this.newPeriod)
            this.editPeriod = false
          }
        }
        if (self.editCondition) {
          self.updateAlarmCondition();
          self.editCondition = false;
        }
        if (self.editPeriod) {
          this.updateAlarm('period', this.newPeriod)
          this.editPeriod = false
        }
      },
      //或得条目lable值
      getLabelValue: function (item) {
        let list = ['NewState', 'OldState', 'OldStatus', 'NewStatus']
        if (list.some(it => item.key === it)) {
          //  before zstack 3.2.0 state maybe chinese
          return this.$t(`state.${item.value}`) === `state.${item.value}` ? item.value : this.$t(`state.${item.value}`)
        }
        return item.value
      },
      getLabels: function () {
        let obj = {
          'zwatchEventAlarm': EVENT_LABELS,
          'zwatchResourceAlarm': METRIC_LABELS
        }
        return obj[this.windowData.currTab]
      },
      //或得持续时间单位
      getPeriodUnit: function () {
        if (this.windowData.currTab === 'zwatchResourceAlarm') {
          let sizeStr = this.timeRoundToString(Math.abs(this.dbData[this.windowData.currTab][this.windowData.dataUuid].period))
          let periodUnit = sizeStr.substr(sizeStr.length - 1, 1)
          if (periodUnit === 'H') {
            periodUnit = 'hour'
          } else if (periodUnit === 'M') {
            periodUnit = 'minute'
          } else {
            periodUnit = 'second'
          }
          this.updateWindow({periodUnit})
        }
      },
      //或得持续时间的显示格式
      durationConvert: function (s) {
        let time = this.secToTime(s)
        let str = ''
        if (time.hour > 0) {
          str += time.hour + this.$t('common.hourShort')
        }
        if (time.min > 0) {
          str += time.min + this.$t('common.minuteShort')
        }
        if (time.sec > 0) {
          str += time.sec + this.$t('common.secondShort')
        }
        if (time.hour === 0 && time.min === 0 && time.sec === 0) {
          str = 0 + this.$t('common.secondShort')
        }
        return str
      },
      //或得时间值
      timeRoundToString: function (time) {
        const self = this
        var M = 60
        var H = M * M
        var sizeMap = {
          'M': M,
          'H': H
        }
        var suffixes = ['H', 'M']

        function round() {
          var s = suffixes.shift()
          if (!time || time < 60) {
            return time + ' S'
          }
          var q = sizeMap[s]
          var ret = time / q
          if (ret >= 1) {
            return self.toFixed(ret, 2) + ' ' + s
          } else {
            return round()
          }
        }

        return round()
      },
      //或得重复时间单位
      getRepeatIntervalUnit: function () {
        if (this.windowData.currTab === 'zwatchResourceAlarm') {
          let sizeStr = this.timeRoundToString(Math.abs(this.model.repeatInterval))
          let repeatIntervalUnit = sizeStr.substr(sizeStr.length - 1, 1)
          if (repeatIntervalUnit === 'H') {
            repeatIntervalUnit = 'hour'
          } else if (repeatIntervalUnit === 'M') {
            repeatIntervalUnit = 'minute'
          } else {
            repeatIntervalUnit = 'second'
          }
          this.updateWindow({repeatIntervalUnit})
        }
      },
      //或得资源单位如：MB
      getUnitSize: function () {
        if (this.windowData.currTab === 'zwatchResourceAlarm') {
          let sizeStr = this.sizeRoundToString(Math.abs(this.model.threshold))
          let unitSize = sizeStr.substr(sizeStr.length - 1, 1)
          if (unitSize === 'B') unitSize = ''
          this.updateWindow({unitSize})
        }
      },
      query: async function () {
        let uuid = this.windowData.dataUuid
        let path = `zwatch/alarms/${uuid}`
        let tableName = 'zwatchResourceAlarm'
        if (this.windowData.currTab === 'zwatchEventAlarm') {
          path = `zwatch/events/subscriptions/${uuid}`
          tableName = 'zwatchEventAlarm'
        }
        let resp = await rpc.query(path)
        rpc.query('user-tags', {
          q: `resourceUuid=${uuid}`
        }).then((resp) => {
          return this.updateDbRow({
            tableName: 'zwatchResourceAlarmA',
            id: uuid,
            data: resp.inventories[0]
          })
        })
        await this.updateDbRow({
          tableName: tableName,
          id: uuid,
          data: resp.inventories[0]
        })
        await this.queryResource()
      },
      queryResource: async function () {
        let labels = this.dbData[this.windowData.currTab][this.windowData.dataUuid].labels
        let tasks = []
        let self = this
        labels.forEach(item => {
          if (!self.isResourceLink(item.key)) return
          let dbName = self.LABELS[item.key].dbName || self.LABELS[item.key].title
          let _value = item.value.split('|')
          let task = rpc.queryResourceNames(self, dbName, _value)
          tasks.push(task)
        })
        await Promise.all(tasks)
          .then(() => {
            self.model = self.dbData[self.windowData.currTab][self.windowData.dataUuid];
          })
      },
      isResourceLink: function (label) {
        if (!this.LABELS[label]) return false
        let isLink = this.LABELS[label].inputType === 'selectList'
        return isLink
      },
      updateResourceParam(param) {
        let self = this;
        return {
          getValue() {
            return param === 'name' ? self.getAlarmName(self.windowData.dataUuid, self.windowData.currTab) : self.model[param];
          },
          setValue(newVal) {
            if (newVal === self.model[param]) return;
            self.update(param, newVal);
          }
        }
      },
      update(key, val) {
        this.updateResource('zwatch/alarms', 'updateAlarm', key, 'zwatchResourceAlarm', val)
          .then(() => this.query())
      },
      setOptionList() {
        let self = this, unitList = [];
        switch (self.METRICS[self.model.namespace][self.model.metricName].unit) {
          case 'byte/s':
            unitList = self.sizeUnitList;
            break;
          case 'byte':
            unitList = self.byteSizeUnitList;
            break;
        }
        return unitList;
      },
      //或得下拉选择的index;
      getUnitIndex() {
        let self = this, unitIndex;
        switch (self.METRICS[self.model.namespace][self.model.metricName].unit) {
          case 'byte/s':
            unitIndex = self.sizeUnitList.findIndex((item) => {
              return item.value === `${self.windowData.unitSize}B/s`;
            })
            break;
          case 'byte':
            unitIndex = self.byteSizeUnitList.findIndex((item) => {
              return item.value === `${self.windowData.unitSize}B`;
            })
            break;
        }
        return unitIndex;
      },
      //设置资源单位如：1B
      setUnitValue(index) {
        let self = this, unit = '';
        switch (self.METRICS[self.model.namespace][self.model.metricName].unit) {
          case 'byte/s':
            unit = self.sizeUnitList[index].value.replace(/B\/s/g, '');
            break;
          case 'byte':
            unit = self.byteSizeUnitList[index].value.replace(/B/g, '');
            break;
        }
        self.updateWindow({unitSize: unit});
      },
      getConditionNewThreshold: function () {
        let self = this;
        let newThreshold = self.model.threshold;
        if (self.METRICS[self.model.namespace][self.model.metricName].unit === 'byte' || self.METRICS[self.model.namespace][self.model.metricName].unit === 'byte/s') {
          newThreshold = parseFloat(self.bytesToSize(Math.abs(newThreshold)))
        }
        self.newThreshold = newThreshold;
        return newThreshold
      },
      updateAlarm: async function (key, value) {
        let uuid = this.windowData.dataUuid
        if (key === 'threshold' && (this.unit === 'byte' || this.unit === 'byte/s') && this.dbData[this.windowData.currTab][uuid][key] === this.parseSize(Math.abs(value) + this.windowData.unitSize)) {
          return
        }
        let param = {}
        param[key] = value
        if (key === 'comparisonOperator') {
          if (this.dbData[this.windowData.currTab][uuid][key] === value) return
          value = this.$t(`zwatchAlarm.${value}`)
        }
        if (key === 'repeatInterval' || key === 'period') {
          if (this.dbData[this.windowData.currTab][uuid][key] === value) return
          if (String(value).trim() === '') return
          param[key] = this.toSecond(value, this.windowData[key + 'Unit'])
          value = value + this.$t(`common.${this.windowData[key + 'Unit']}`)
        }
        if (key === 'threshold') {
          if (this.unit === 'byte' || this.unit === 'byte/s') {
            let _value = this.parseSize(Math.abs(value) + this.windowData.unitSize)
            if (this.dbData[this.windowData.currTab][uuid][key] === _value) return
            param[key] = _value
            value = Math.abs(value) + this.windowData.unitSize
          }
          if (this.unit === 'percent') {
            if (this.dbData[this.windowData.currTab][uuid][key] === value) return
            value = value + '%'
          }
        }
        let event = this.createEvent(`zwatchAlarm.update.${key}`, value)
        await rpc.update('zwatch/alarms', uuid, {
          updateAlarm: param
        }, event).then(() => {
          this.incEventSuccess(event)
        }, () => {
          this.incEventFail(event)
        })
        this.query()
      },
      toSecond: function (time, unit) {
        let obj = {
          'second': 1,
          'minute': 60,
          'hour': 60 * 60
        }
        return time * obj[unit]
      },
      updateAlarmCondition: async function () {
        await this.updateAlarm('comparisonOperator', this.newOperator)
        await this.updateAlarm('threshold', this.newThreshold)
      },
      //是否展示资源列表Tab
      showResourceLink() {
        let self = this;
        if (self.windowData.currTab === 'zwatchEventAlarm') return true
        let list = ['VMUuid', 'BackupStorageUuid', 'HostUuid', 'L3NetworkUuid', 'VipUUID', 'PrimaryStorageUuid']
        let labels = self.model.labels
        labels = _.filter(labels, (label) => label.key !== 'ALARM_EXCLUDE_RESOURCE_LABEL')
        if (labels.length === 0) return true
        let labelsStr = labels.map(item => item.key).toString()
        if (list.some(str => str === labelsStr)) {
          return false
        }
        return true
      },
      //删除告警器
      detailDestroyed() {
        let tableName = this.windowData.currTab;
        let key = 'name'
        let destroy = null
        let getName = null
        if (this.windowData.currTab === 'zwatchEventAlarm') {
          key = 'eventName'
          destroy = this.unSubscribeEvent
          getName = (uuid) => {
            if (!this.dbData.zwatchEventAlarm[uuid]) return ''
            let eventName = this.dbData.zwatchEventAlarm[uuid].eventName
            return this.$t(`zwatchAlarm.eventName.${eventName}`, {name: ''})
          }
        } else {
          destroy = this.destroy
        }
        let uuidList = [this.windowData.dataUuid]
        this.openDialog('ConfirmDlg', {
          title: 'zwatchAlarm.delete',
          description: 'zwatchAlarm.deleteConfirm',
          icon: 'zwatch_alarm_n',
          uuidList: uuidList,
          ok: () => {
            destroy(uuidList).then(() => this.$router.push({name: 'zwatchalarm', params:{currTab:this.$route.params.currTab}}))
          },
          getName: (uuid)=> {
            return this.getAlarmName(uuid);
          },
        })
      },
      //移除接收端
      detailRemoveEndPoint(){
        const self = this
        let alarmUuid = this.windowData.dataUuid
        if (!this.dbData[this.windowData.currTab][alarmUuid] || !this.dbData[this.windowData.currTab][alarmUuid]) return
        let topicUuidList = this.dbData[this.windowData.currTab][alarmUuid].actions.map(item => item.actionUuid)
        let removedUuidList = this.filterSystemTopic(alarmUuid)
        topicUuidList = topicUuidList.filter(uuid => !removedUuidList.some(item => item === uuid))
        self.openDialog('ZwatchEndPointerMultiSelectListDlg', {
          removeMode: true,
          conditions: [`topics.uuid?=${topicUuidList}`],
          select: (endpointUuidList) => self.removeEndpointFromAlarm(alarmUuid, endpointUuidList, this.windowData.currTab).then(() => this.query())
        })
      },
      //添加接收端
      detailAddEndpoint: async function () {
        const self = this
        let alarmUuid = this.windowData.dataUuid
        let subscribedTopicUuidList = this.dbData[this.windowData.currTab][alarmUuid].actions.map(item => item.actionUuid)
        self.openDialog('ZwatchEndPointerMultiSelectListDlg', {
          conditions: ['state=Enabled', `topics.uuid!?=${subscribedTopicUuidList}`, 'name!=created-by-SystemHTTPTopicAndEndpointCreator'],
          select: (endpointUuidList) => self.addEndpointToAlarm(alarmUuid, endpointUuidList, this.windowData.currTab).then(() => this.query())
        })
      },
      //获得接收端uuidList
      getTopicUuidList () {
        let actions = this.dbData[this.windowData.currTab][this.windowData.dataUuid].actions
        let topicUuidList = actions.map(item => item.actionUuid)
        return topicUuidList
      },
      //重设报警策略
      openResetStragtegy(){
        let self = this;
        self.openDialog('SetAlarmStrategyDlg', {
          ok: (params) => {
            self.setAlarmStrategy(params, self.windowData.dataUuid).then(() => {
              self.refresh()
              self.$forceUpdate()
            })
          }
        })
      }
    }
  }
</script>

<style scoped>
  .icon {
    display: inline-block;
    position: absolute;
    width: 60px;
    height: 60px;
    background-repeat: no-repeat;
  }

  .content-unit {
    display: inline-block;
    height: 38px;
    border: 1px solid #ddd;
    line-height: 39px;
    padding: 0px 24px;
    margin-left: -5px;
  }
</style>
