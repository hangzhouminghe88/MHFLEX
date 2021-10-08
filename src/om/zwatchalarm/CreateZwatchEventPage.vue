<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('zwatchAlarm.create.zwatchEventAlarm')}}</span>
      <span class="create-back" @click="$router.push({name:'zwatchalarm', params:{currTab: 'zwatchEventAlarm'}})">
       <i class="el-icon-back"></i>
       <span style="font-size: 12px">回到报警器列表</span>
     </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('zwatchAlarm.type')}}</div>
        <el-select v-model="getAlarmType" style="width: 100%;">
          <el-option v-for="(item, index) in typeList" :key="index" :value="item.value">{{item.name}}</el-option>
        </el-select>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('zwatchAlarm.item')}}</div>
        <el-select v-model="getEventType" style="width: 100%;">
          <el-option v-for="(item, index) in itemList" :key="index"
                     @click.native="updateWindow({
               eventName: itemList[index].value,
               labels: EVENTS[windowData.namespace][windowData.eventNames[index]].labelNames
             })" :value="item.name"></el-option>
        </el-select>
      </div>
      <div v-if="windowData.labels && windowData.labels.length > 0" v-for="(label, index) in getLabels" :key="index">
        <div class="operation-row">
          <div class="title required">{{genComponentTitle(label)}}</div>
          <add-or-delete-input v-if="EVENT_LABELS[label].inputType === 'selectList'"
                               @open="genSelectOpenItemList(label)" :value="genSelectGetItemName(label, hostUuid)"/>
          <el-select
            v-if="EVENT_LABELS[label].values && EVENT_LABELS[label].inputType === 'dropDown' && label=== 'OldState'"
            v-model="oldState" style="width: 100%;">
            <el-option v-for="(item, index) in dropdownItemList" :key="index"
                       @click.native="_updateResult(label, windowData.resourceSelectResult, index)"
                       :value="item.name"></el-option>
          </el-select>
          <el-select
            v-if="EVENT_LABELS[label].values && EVENT_LABELS[label].inputType === 'dropDown' && label=== 'NewState'"
            v-model="newState" style="width: 100%;">
            <el-option v-for="(item, index) in dropdownItemList" :key="index"
                       @click.native="_updateResult(label, windowData.resourceSelectResult, index)"
                       :value="item.name"></el-option>
          </el-select>
        </div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('home.endPoint')}}</div>
        <div v-for="(endpointUuid, index) in windowData.endpointUuidList">
          <add-or-delete-input :value="getEndpointName(endpointUuid)" @remove="removeUuid(endpointUuid)"/>
        </div>
        <add-or-delete-input @open="openEndPoint()"/>
      </div>
      <div class="operation-row">
        <div class="link" @click="$router.push({name: 'createZwatchEndPoint'})">
          <i class="el-icon-plus"></i>
          <div style="display: inline-block">创建接收端</div>
        </div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <div class="btn-confirm" @click="confirm();">{{$t('common.confirm')}}</div>
      <div class="btn-cancel" @click="$router.push({name:'zwatchalarm', params:{currTab: 'zwatchEventAlarm'}})">
        {{$t('common.cancel')}}
      </div>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import DropDown from "../../ecs/autoScalingGroup/component/Dropdown";
  import EVENTS from './Events.json';
  import WindowBase from 'src/windows/Window';
  import EVENT_LABELS from './EventLabels';
  import Methods from './Methods';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import ZWatchEndpointMethods from 'src/om/zwatchEndPoint/Methods';

  export default {
    name: "CreateZwatchEventPage",
    mixins: [Methods, WindowBase],
    components: {AddOrDeleteInput, DropDown, CreateTemplate},
    created() {
      let self = this;
      self.init();
    },
    data() {
      return {
        EVENTS: EVENTS,
        typeList: [],
        itemList: [],
        EVENT_LABELS: EVENT_LABELS,
        dropdownItemList: [],
        vmEventOldState: '',
        vmEventNewState: '',
        hostUuid: '',
        type: '',
        getEventType: ''
      }
    },
    computed: {
      getDropDownItem: {
        get() {
          let self = this;
          return self.dropdownItemList
        },
      },
      getLabels() {
        let tags = this.EVENTS[this.windowData.namespace][this.windowData.eventName].tags
        let noLabels = tags.some(item => item === 'noLabels')
        let labels = this.windowData.labels
        if (noLabels) {
          labels = []
        }
        return labels
      },
      getAlarmType: {
        get() {
          let self = this;
          return self.$t(`zwatchAlarm.${self.type}`)
        },
        set(val) {
          let self = this;
          self.type = self.getResourceType(val)
        }
      },
      oldState: {
        get(){
          let self = this;
          let index = self.dropdownItemList.findIndex((it) => {
            return it.value === self.$data[`vmEventOldState`];
          })
          return self.dropdownItemList[index].name;
        },
        set(){

        }
      },
      newState:{
        get(){
          let self = this;
          let index = self.dropdownItemList.findIndex((it) => {
            return it.value === self.$data[`vmEventNewState`];
          })
          return self.dropdownItemList[index].name;

        },
        set(){

        }
      }
    },
    methods: {
      ...{
        getEndpointName: ZWatchEndpointMethods.methods.getEndpointName
      },
      async init() {
        let namespaces = []
        let namespace, self = this;
        if (!this.dbData.common.isAdmin) {
          namespaces = ['ZStack/VRouter']
          namespace = 'ZStack/VRouter'
        } else {
          namespaces = Object.keys(EVENTS)
          namespace = 'ZStack/VM'
        }
        let eventNames = Object.keys(EVENTS[namespace])
        let eventName = eventNames[0]
        let labels = EVENTS[namespace][eventName].labelNames
        await this.updateWindow({
          namespaces,
          namespace,
          eventNames,
          eventName,
          topicUuidList: this.$route.params.topicUuid ? [this.$route.params.topicUuid] : [],
          endpointUuidList: [],
          labels,
          resourceSelectResult: {}
        })
        self.typeList = self.windowData.namespaces.map((item) => {
          return {
            name: self.$t(`zwatchAlarm.${this.getResourceType(item)}`),
            value: item
          }
        })
        self.itemList = self.windowData.eventNames.map(item => {
          return {
            name: self.$t(`zwatchAlarm.eventName.${item}`, {name: ''}),
            value: item
          }
        })
        self.type = this.getResourceType(self.windowData.namespace);
        self.getEventType = self.$t(`zwatchAlarm.eventName.${self.windowData.eventName}`, {name: ''});
      },
      genComponentTitle: function (label) {
        let self = this;
        return self.$t(`zwatchAlarm.${self.EVENT_LABELS[label].title}`)
      },
      _updateResult: function (label, result, num) {
        let self = this;
        self.dropdownItemList = [];
        let values = []
        if (!self.EVENT_LABELS[label]) return;
        let type = self.getResourceType(self.windowData.namespace)
        if (self.EVENT_LABELS[label].values) {
          if (self.EVENT_LABELS[label].values[type]) {
            values = self.EVENT_LABELS[label].values[type]
          } else {
            values = self.EVENT_LABELS[label].values
          }
        }
        if (type === 'vm' && self.EVENT_LABELS[label].values)
          self[`vmEvent${label}`] = self.EVENT_LABELS[label].values[type][num];
        let _result = _.cloneDeep(result);
        _result[label] = self[`vmEvent${label}`];
        self.updateWindow({
          resourceSelectResult: _result
        })
        self.dropdownItemList = values.map(item => {
          let it = {}
          it.value = item
          if (item === '') {
            it.name = ''
          } else {
            it.name = item === 'Migrating' || item === 'VolumeMigrating' ? this.$t(`state.${item}`) + '(' + this.$t(`zwatchAlarm.state.${item}`) + ')' : this.$t(`state.${item}`)
          }
          return it
        })
      },
      genSelectOpenItemList: function (label) {
        const self = this
        let route = this.getSelectListDlg(label)
        let conditions = route.conditions
        let selectListDlg = route.select
        self.openDialog(selectListDlg, {
          conditions: conditions,
          select: (uuid) => self.select(uuid)
        })
      },
      select(uuid) {
        let self = this;
        self.hostUuid = uuid;
      },
      genSelectGetItemName(label, hostUuid) {
        let self = this;
        let dbName = self.EVENT_LABELS[label].dbName
        if (hostUuid === '') return ''
        if (!this.dbData[dbName] || !this.dbData[dbName][hostUuid]) return ''
        return this.dbData[dbName][hostUuid].name
      },
      getSelectListDlg(label) {
        let routes = {
          'SourceHostUuid': {
            select: 'HostListSingleSelectList',
            conditions: ['hypervisorType!=ESX']
          },
          'DestinationHostUuid': {
            select: 'HostListSingleSelectList',
            conditions: ['hypervisorType!=ESX']
          }
        }
        return routes[label]
      },
      createParam: function () {
        return {
          namespace: EVENTS[this.windowData.namespace][this.windowData.eventName].namespace,
          eventName: this.windowData.eventName,
          name: this.windowData.name,
          description: this.windowData.description,
          actions: this.formatActions(this.windowData.endpointUuidList),
          labels: this.formatLabels(this.windowData.resourceSelectResult)
        }
      },
      formatLabels: function (resourceSelectResult) {
        if (!resourceSelectResult) return null
        let keys = Object.keys(resourceSelectResult)
        keys.forEach(key => {
          if (!resourceSelectResult[key]) {
            delete resourceSelectResult[key]
          }
        })
        return Object.keys(resourceSelectResult).map(key => {
          let obj = {
            key: key,
            op: 'Equal',
            value: resourceSelectResult[key]
          }
          return obj
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
      validate: function (name) {
        let obj = {}
        obj[`empty${name}`] = false
        let windowData = this.windowData
        let input = windowData[name]
        if (Array.isArray(input) && input.length === 0) {
          obj[`empty${name}`] = true
        }
        this.updateWindow(obj)
      },
      confirm() {
        let self = this;
        self.create(self.createParam(), 'zwatchEventAlarm')
          .then(() => {
            self.$router.push({name: 'zwatchalarm', params: {currTab: 'zwatchEventAlarm'}})
          });
      },
      openEndPoint() {
        const self = this
        let conditions = ['name!=created-by-SystemHTTPTopicAndEndpointCreator']
        if (self.windowData.endpointUuidList && self.windowData.endpointUuidList.length > 0) {
          conditions.push(`uuid!?=${self.windowData.endpointUuidList}`)
        }
        self.openDialog('ZwatchEndPointerMultiSelectListDlg', {
          conditions: conditions,
          select: (uuidList) => self.selectZWatchEndpoint(uuidList)
        })
      },
      selectZWatchEndpoint(uuidList) {
        let self = this;
        let endpointUuidList = self.windowData.endpointUuidList
        endpointUuidList = _.uniq(endpointUuidList.concat(uuidList))
        this.updateWindow({endpointUuidList})
      },
      removeUuid(endpointUuid) {
        debugger
        let self = this, uuidList = [];
        uuidList = self.windowData.endpointUuidList.filter((uuid) => endpointUuid !== uuid);
        this.updateWindow({endpointUuidList: uuidList})
      }
    },
    watch: {
      'windowData.namespace': async function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        let eventNames = Object.keys(EVENTS[newValue])
        let eventName = eventNames ? eventNames[0] : ''
        let labels = EVENTS[newValue][eventName].labelNames
        await this.updateWindow({
          eventNames,
          eventName,
          labels
        })
        this.getLabels;
        this.itemList = await this.windowData.eventNames.map(item => {
          return {
            name: this.$t(`zwatchAlarm.eventName.${item}`, {name: ''}),
            value: item
          }
        })
      },
      'windowData.labels': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        newValue.forEach(item => {
          this._updateResult(item, this.windowData.resourceSelectResult, 0)
        })
      },
    }
  }
</script>

<style scoped>

</style>
