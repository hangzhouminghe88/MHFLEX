<template>
  <dialog-template>
    <div slot="title">
      <span class="title">{{ $t('instanceOffering.updateallocatorStrategy') }}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div class="dialog-content">
        <div class="item">
          <label>{{$t('instanceOffering.allocatorStrategy')}}{{$t('common.colon')}}</label>
          <drop-down class="button dropdown">
            <span slot="title" />
            <span slot="title">
            <span class="text">{{$t(`instanceOffering.${allStrategy}`)}}</span>
          </span>
            <span slot="content">
            <div class="dropdown-content" style="padding-top: 12px;padding-right: 12px;width: 100%;">
              <a @click="(e) => { updateAllocatorStrategy(allocatorStrategy) }" v-for="allocatorStrategy in allocatorStrategyList">{{$t(`instanceOffering.${allocatorStrategy}`)}}</a>
            </div>
          </span>
          </drop-down>
        </div>
        <div class="item" v-if="allStrategy === 'MinimumCPUUsageHostAllocatorStrategy' || allStrategy === 'MinimumMemoryUsageHostAllocatorStrategy'">
          <label>{{$t("instanceOffering.strategyPattern")}}{{$t('common.colon')}}</label>
          <drop-down class="button dropdown">
          <span slot="title">
            <span class="text" v-if="allStrategy === 'MinimumCPUUsageHostAllocatorStrategy'">{{ minimumCPUUsageHostAllocatorStrategyMode ? $t(`instanceOffering.${minimumCPUUsageHostAllocatorStrategyMode}`) : $t('instanceOffering.soft') }}</span>
            <span class="text" v-if="allStrategy === 'MinimumMemoryUsageHostAllocatorStrategy'">{{ minimumMemoryUsageHostAllocatorStrategyMode ? $t(`instanceOffering.${minimumMemoryUsageHostAllocatorStrategyMode}`) : $t('instanceOffering.soft') }}</span>
          </span>
            <span slot="content">
            <div class="dropdown-content" style="padding-top: 12px;padding-right: 12px;width: 100%;">
              <a @click="(e) => {updateCPUOrMemoryUsageHostAllocatorStrategyMode('soft')}" style="padding-top: 12px;">{{$t('instanceOffering.soft')}}</a>
              <a @click="(e) => {updateCPUOrMemoryUsageHostAllocatorStrategyMode('hard')}" style="padding-bottom: 12px;">{{$t('instanceOffering.hard')}}</a>
            </div>
          </span>
          </drop-down>
        </div>
        <div class="item operation-row" style="width: 100%;padding-top:0;">
          <label class="title required" v-if="allStrategy === 'MaxInstancePerHostHostAllocatorStrategy'">
            {{$t("instanceOffering.maxInstancePerHost")}}
          </label>
          <input v-show="allStrategy === 'MaxInstancePerHostHostAllocatorStrategy'" type="number"  step="any" min="1"  :class="{'is-error': emptymaxInstancePerHost || invalidmaxInstancePerHost}" v-model="maxInstancePerHost" @blur="validate('maxInstancePerHost')" @keydown.enter="validate('maxInstancePerHost')"  style="width: 50%;"/>
          <div class="error error-text" v-if="(allStrategy=== 'MaxInstancePerHostHostAllocatorStrategy') && emptymaxInstancePerHost && (allStrategy === 'MaxInstancePerHostHostAllocatorStrategy')"  style="right: 125px">
            {{$t("error.emptyInput")+$t("instanceOffering.maxInstancePerHost")}}
          </div>
          <div class="error error-text" v-if="(allStrategy === 'MaxInstancePerHostHostAllocatorStrategy') && !emptymaxInstancePerHost && invalidmaxInstancePerHost && (allStrategy === 'MaxInstancePerHostHostAllocatorStrategy')" style="right: 125px">
            {{$t("error.invalid")+$t("instanceOffering.maxInstancePerHost")}}
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="el-dialog__footer dialog-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import DialogTemplate from "../DialogTemplate";
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';

  export default {
    name: "UpdateStrategyForHostDlg",
    mixins: [WindowBase],
    components: {DialogTemplate},
    data(){
      return {
        allStrategy: 'MaxInstancePerHostHostAllocatorStrategy',
        minimumCPUUsageHostAllocatorStrategyMode: '',
        minimumMemoryUsageHostAllocatorStrategyMode: '',
        allocatorStrategyList: ['LeastVmPreferredHostAllocatorStrategy', 'MinimumCPUUsageHostAllocatorStrategy', 'MinimumMemoryUsageHostAllocatorStrategy', 'MaxInstancePerHostHostAllocatorStrategy'],
        emptymaxInstancePerHost: false,
        invalidmaxInstancePerHost: false,
        maxInstancePerHost: '',
        invalidInput: false
      }
    },
    created(){
      let allocatorStrategy = 'LeastVmPreferredHostAllocatorStrategy', self = this;
      if (self.dialogData.param && self.dialogData.param.allocatorStrategy) {
        allocatorStrategy = self.dialogData.param.allocatorStrategy
      }
      let maxInstancePerHost = 10
      if (self.dialogData.param && self.dialogData.param.maxInstancePerHost) {
        maxInstancePerHost = self.dialogData.param.maxInstancePerHost
      }
      self.allStrategy = allocatorStrategy;
      self.maxInstancePerHost = maxInstancePerHost;
      if (self.dialogData.param && self.dialogData.param.minimumMemoryUsageHostAllocatorStrategyMode) {
        self.minimumMemoryUsageHostAllocatorStrategyMode = self.dialogData.param.minimumMemoryUsageHostAllocatorStrategyMode
      } else if (self.dialogData.param && self.dialogData.param.minimumCPUUsageHostAllocatorStrategyMode) {
        self.minimumCPUUsageHostAllocatorStrategyMode = self.dialogData.param.minimumCPUUsageHostAllocatorStrategyMode
      }
    },
    methods: {
      ...Validator,
      confirm(){
        this.validateAll()
        if (this.invalidInput) return
        this.dialogData.param.ok(this.createParam())
        this.closeDialog(this.windowId)
      },
      //更新参数
      createParam() {
        let obj = {
          allocatorStrategy: this.allStrategy,
          maxInstancePerHost: this.maxInstancePerHost
        }
        if (this.allStrategy === 'MinimumMemoryUsageHostAllocatorStrategy' && this.minimumMemoryUsageHostAllocatorStrategyMode) obj.minimumMemoryUsageHostAllocatorStrategyMode = this.minimumMemoryUsageHostAllocatorStrategyMode
        if (this.allStrategy === 'MinimumCPUUsageHostAllocatorStrategy' && this.minimumCPUUsageHostAllocatorStrategyMode) obj.minimumCPUUsageHostAllocatorStrategyMode = this.minimumCPUUsageHostAllocatorStrategyMode
        return obj
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      updateAllocatorStrategy(param){
         let self = this;
         self.allStrategy = param;
      },
      updateCPUOrMemoryUsageHostAllocatorStrategyMode(value){
        let self = this;
        let dataName = this.allStrategy === 'MinimumCPUUsageHostAllocatorStrategy' ? 'minimumCPUUsageHostAllocatorStrategyMode' : 'minimumMemoryUsageHostAllocatorStrategyMode'
        let obj = {
        }
        self[dataName] = value
      },
      validate (name) {
        const self = this
        let input = name === 'name' ? String(self[name]).trim() : self[name]
        self[`empty${name}`] = false
        self[`invalid${name}`] = false
        if (input === undefined || input === '' || input === null) {
          self[`empty${name}`] = true
          return
        }
        if (self.windowData.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy' && name === 'maxInstancePerHost') {
          if (!self.isNumber(input)) {
            self[`invalid${name}`] = true
          }
          if (self.isNumber(input) && parseInt(input) < 1) {
            self[`invalid${name}`] = true
          }
          return
        }
      },
      validateAll () {
        let obj = {}, self = this;
        self.invalidInput = false
        let props = ['maxInstancePerHost']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this[`empty${item}`] || this[`invalid${item}`])
        if (isInvalid) self.invalidInput = true
      },
    }
  }
</script>

<style scoped lang="less">
  .dropdown {
    width: 50%;
    border: 1px solid #dae0e6;
    display: inline-block;
    height: 40px;
    border-radius: 2px;
  }
  .item{
    margin-bottom: 20px;
    label{
      width: 120px;
      display: inline-block;
    }
  }
</style>
