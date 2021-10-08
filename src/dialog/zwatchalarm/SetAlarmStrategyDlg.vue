<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('zwatchAlarm.resetStrategy')}}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" style="margin:50px 250px;">
        <div class="operation-row">
          <div class="title">{{$t('zwatchAlarm.strategy')}}</div>
          <el-radio v-model="strategy" label="repeat">{{$t('zwatchAlarm.repeat')}}</el-radio>
          <el-radio v-model="strategy" label="once">{{$t('zwatchAlarm.once')}}</el-radio>
        </div>
        <div class="operation-row" v-if="strategy === 'repeat'">
          <div class="title required">{{$t('zwatchAlarm.repeatInterval')}}</div>
          <input v-model="time" style="width: 55%" :class="{'is-error': invalidtime}"/>
          <drop-down
            :param="{
              getIndex(){
                return optionList.findIndex((item) => {
                  return unit === item.value;
                })
              },
              setIndex(index){
                unit = optionList[index].value
              },
              getOptionList(){
                return optionList;
              },
              style: {
                'width':'19%',
                'margin-left': '-2px'
              }
            }"></drop-down>
          <div class="error error-text" v-if="invalidtime">{{$t('error.invalid')}}{{$t('zwatchAlarm.repeatInterval')}}</div>
        </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "SetAlarmStrategyDlg",
    mixins: [WindowBase],
    components: {DropDown},
    methods: {
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      toSecond (time, unit) {
        let obj = {
          'second': 1,
          'minute': 60,
          'hour': 60 * 60
        }
        return time * obj[unit]
      },
      validateAll () {
        let self = this;
        self.invalidtime = false;
        if(self.strategy === 'repeat'){
          if(self.time === '' || !/\d/.test(self.time)){
            self.invalidtime = true;
          }
        }
      },
      createParam(){
        let param = {
          strategy: this.strategy,
          repeatInterval: this.strategy === 'repeat' ? this._repeatInterval : -1,
          repeatCount: this.strategy === 'repeat' ? -1 : 1
        }
        return param
      },
      confirm(){
        let self = this;
        self.validateAll();
        if( self.invalidtime) return;
        self.dialogData.param.ok(this.createParam());
        self.cancel();
      }
    },
    computed: {
      _repeatInterval () {
        if (!this.time) return ''
        return this.toSecond(this.time, this.unit)
      }
    },
    data(){
      return {
        strategy: 'repeat',
        optionList: [
          {name: 'common.second', value: 'second'},
          {name: 'common.minute', value: 'minute'},
          {name: 'common.hour', value: 'hour'}
        ],
        unit: 'minute',
        time: '',
        invalidtime: false
      }
    },
  }
</script>

<style scoped>

</style>
