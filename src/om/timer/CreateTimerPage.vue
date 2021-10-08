<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t("timer.create") }}</span>
      <span class="create-back" @click="$router.push({name: 'timer'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">回到定时器列表</span>
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <help-trigger name="timer"/>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="inValid('name')">
        <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('timer.strategy')}}</div>
        <el-radio v-model="runType" label="repeat">{{ $t("common.repeat") }}</el-radio>
        <el-radio v-model="runType" label="count">{{ $t("common.setRepeatCount") }}</el-radio>
      </div>
			<div class="operation-row" v-if="runType === 'count'">
        <div class="title required">{{$t('common.count')}}</div>
				<input type="text" v-model="repeatCount" :class="{'is-error': emptyrepeatCount}" @blur="inValid('repeatCount')"/>
				<div class="error error-text" v-if="emptyrepeatCount">{{$t('common.repeatCount')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.systemTime')}}{{$t('common.colon')}}{{systemTime}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('timer.startTime')}}</div>
        <el-date-picker v-model="startTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t("common.cycle")}}</div>
        <input
          type="text"
          min="0"
          v-model="cycle"
          style="width: 63%"
          :class="{'is-error':emptycycle || invalidcycle}"
          @blur="inValid('cycle')"
        >
        <drop-down
          :param="{
                getOptionList: () => {return cycleUnitList},
                getIndex: () => cycleUnitList.findIndex((num) =>{
                   return num.value === cycleUnit
                 }),
                setIndex: (index) => {
                  return cycleUnit = cycleUnitList[index].value;
                },
                style: {width: '80px' , marginLeft: '-1px'}
              }"
        ></drop-down>
        <div
          class="error error-text"
          v-if="emptycycle && !invalidcycle"
        >{{$t("common.cycle")}}{{$t("error.noEmpty")}}</div>
				 <div
          class="error error-text"
          v-if="!emptycycle && invalidcycle"
        >{{$t("error.invalid")}}{{$t("common.cycle")}}</div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <div class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.ok')}}</div>
      <div class="btn-cancel" @click="$router.push({name:'timer'})">{{$t('common.cancel')}}</div>
    </div>
  </create-template>
</template>

<script>
import DropDown from "src/ecs/autoScalingGroup/component/Dropdown";
import CreateTemplate from "src/component/CreateTemplate";
import { formatDatetime } from "src/utils/utils";
import WindowBase from 'src/windows/Window';
import rpc from "src/utils/rpc";
export default {
	mixins: [WindowBase],
  components: {
    CreateTemplate,
    DropDown
  },
  data() {
    return {
      emptyname: false,
      emptycycle: false,
      invalidcycle: false,
      name: "",
      runType: "repeat",
      queryTimeId: "",
      queryStartTimeId: "",
      startTime: "",
      systemTime: "",
      start_at: "",
      end_at: "",
      description: "",
      cycleUnitList: [
        { name: "common.minute", value: "minute" },
        { name: "common.hour", value: "hour" },
        { name: "common.day", value: "day" }
      ],
      cycleUnit: "hour",
			cycle: "",
			repeatCount: "",
			emptyrepeatCount: false,
			invalid: false,
      schedulerType: 'simple',
      canCreate: true
    };
  },
  created() {
    let self = this;
    self.fetchServerTime();
  },
  methods: {
    inValid(name) {
      let self = this;
      if (arguments) {
        for (let i of arguments) {
          switch (i) {
            case"name":
              String(self[name]).trim()
                ? (self[`empty${name}`] = false)
                : (self[`empty${name}`] = true);
              if (self.emptyname) {
                return;
              } else {
                break;
							}
							case "repeatCount":
              String(self[name]).trim()
                ? (self[`empty${name}`] = false)
                : (self[`empty${name}`] = true);
              if (self.emptyrepeatCount) {
                return;
              } else {
                break;
							}
            case "cycle":
              self[name]
                ? (self[`empty${name}`] = false)
								: (self[`empty${name}`] = true);
								if (self.emptycycle) {
                return;
              }
              if (/[0-9]+[\.]/.test(self[name])) {
                self[`invalid${name}`] = true;
                return;
              } else {
                self[`invalid${name}`] = false;
                break;
              }
          }
        }
      }
    },
    fetchServerTime() {
      let self = this;
      rpc
        .put("management-nodes/actions", {
          getCurrentTime: {}
        })
        .then(resp => {
          this.serverTimeDelta = resp.currentTime.MillionSeconds;
          let serverTimeA = self.serverTimeDelta;
          let serverTimeB = self.serverTimeDelta;
          this.start_at = self.serverTimeDelta - 86400000 + 6000;
          this.end_at = self.serverTimeDelta;
          self.queryTimeId = setInterval(() => {
            serverTimeA += 1000;
            let nowServerTime = new Date(serverTimeA);
            self.systemTime = formatDatetime(nowServerTime);
          }, 1000);
          self.queryStartTimeId = setInterval(() => {
            const minute = 60 * 1000;
            serverTimeB += 1000;
            let oneMoreMiniteTime =
              formatDatetime(new Date(serverTimeB + minute)).slice(0, -3) +
              ":00";
            self.startTime = oneMoreMiniteTime;
          }, 1000);
        });
		},
		createParam(){
			let periodTime = parseInt(this.cycle)
      let schedulerInterval = 0
      if (this.cycleUnit === 'minute') {
        schedulerInterval = 60 * periodTime
      } else if (this.cycleUnit === 'hour') {
        schedulerInterval = 3600 * periodTime
      } else if (this.cycleUnit === 'day') {
        schedulerInterval = 86400 * periodTime
      }
      let startTime = Date.parse(this.startTime) / 1000
      if (this.runType === 'repeat') {
        let obj = {
          name: this.name,
          description: this.description,
          startTime,
          schedulerInterval,
          schedulerType: this.schedulerType
        }
        return obj
      }
      let obj = {
        name: this.name,
        description: this.description,
        startTime,
        repeatCount: this.repeatCount,
        schedulerInterval,
        schedulerType: this.schedulerType
      }
      return obj
		},
		validateAll(){
			let self = this, prop= ['name', 'cycle'];
			if(self.runType === 'count') prop.push('repeatCount');
			prop.forEach((name) => {
				self.inValid(name);
			})
			self.invalid = prop.some((name) => {
				return self[`empty${name}`] === true || self[`invalid${name}`] === true;
			})
		},
		confirm(){
			let self = this;
			self.validateAll();
      if(self.invalid) return;
      self.canCreate = false;
      self.create(self.createParam())
		},
			create(param){
        let self = this,
        event = self.createEvent('timer.action.create', self.name);
       return self.dispatchActionWithEvent(`timer/create`, param, null, event)
              .then(() => {
                self.$router.push({name:'timer'});
              }).cath(() => {
                self.canCreate = true;
              });
			}
  }
};
</script>

<style scoped>
</style>
