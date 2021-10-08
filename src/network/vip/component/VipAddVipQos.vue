<template>
  <create-template-no-route>
    <div slot="header">
      <span>{{$t('vip.addQos')}}</span>
      <span class="create-back el-icon-back" @click="$emit('close')">返回</span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row" v-if="windowData.params.length > 1">
        <div class="title">
          <el-checkbox v-model="windowData.useSameInboundBandwidth">使用相同下行带宽</el-checkbox>
        </div>
      </div>
      <div class="operation-row" v-if="windowData.params.length > 1">
        <div class="title">
          <el-checkbox v-model="windowData.useSameOutboundBandwidth">使用相同上行带宽</el-checkbox>
        </div>
      </div>
      <div v-for="(item, index) in windowData.params">
        <div class="operation-row">
          <div class="title required">{{$t('common.port')}}</div>
          <input v-model="windowData.params[index].port" :class="{'is-error': windowData[`invalidport-${index}`] || windowData[`duplicateport-${index}`] || windowData[`multipleAllport-${index}`]}" @blur="validate('port', index)" @keydown.enter="validate('port', index)" :placeholder="`${$t('vip.allPorts')}`"/>
          <base-icon name="delete" v-if="index !== 0" style="top: 60px;right: 0px;position: absolute; width: 18px;" @click.native="deleteQosParam(index, $event)"/>
          <div class="error error-text" v-if="!windowData[`emptyport-${index}`] && windowData[`invalidport-${index}`]">
            {{$t("error.invalid")+$t("common.port")}}
          </div>
          <div class="error error-text" v-if="windowData[`duplicateport-${index}`]">
            {{$t("vip.duplicatePort")}}
          </div>
          <div class="error error-text" v-if="windowData[`multipleAllport-${index}`]">
            {{$t("vip.multipleAllPort")}}
          </div>
        </div>
        <div class="operation-row" v-if="index === 0 || !windowData.useSameOutboundBandwidth">
          <div class="title required">{{$t('common.networkOutboundBandwidth')}}</div>
          <input type="text" :class="{'is-error': windowData[`invalidoutboundBandwidth-${index}`] || windowData[`emptyInOutBoundBandwidth-${index}`]}" v-model="windowData.params[index].outboundBandwidth" @blur="validate('outboundBandwidth', index)" @keydown.enter="validate('outboundBandwidth', index)"  :placeholder="`${$t('common.none')}`" style="width: 80%"/><div class="unit_content">Mbps</div>
          <div class="error error-text" v-if="!windowData[`emptyoutboundBandwidth-${index}`] && windowData[`invalidoutboundBandwidth-${index}`]">
            {{$t("error.invalid")+$t("common.networkOutboundBandwidth")}}
          </div>
          <div class="error error-text" v-if="windowData[`emptyInOutBoundBandwidth-${index}`] && (index === 0 || !windowData.useSameOutboundBandwidth)">
            {{$t("vip.emptyInOutBoundBandwidth")}}
          </div>
        </div>
        <div class="operation-row" v-if="index === 0 || !windowData.useSameInboundBandwidth">
          <div class="title required">{{$t('common.networkInboundBandwidth')}}</div>
          <input type="text" :class="{'is-error': windowData[`invalidinboundBandwidth-${index}`] || windowData[`emptyInOutBoundBandwidth-${index}`]}" v-model="windowData.params[index].inboundBandwidth"  @blur="validate('inboundBandwidth', index)" @keydown.enter="validate('inboundBandwidth', index)"  :placeholder="`${$t('common.none')}`"style="width: 80%"/><div class="unit_content">Mbps</div>
          <div class="error error-text" v-if="!windowData[`emptyinboundBandwidth-${index}`] && windowData[`invalidinboundBandwidth-${index}`]">
            {{$t("error.invalid")+$t("common.networkInboundBandwidth")}}
          </div>
          <div class="error error-text" v-if="windowData[`emptyInOutBoundBandwidth-${index}`] && (index === 0 || !windowData.useSameInboundBandwidth)">
            {{$t("vip.emptyInOutBoundBandwidth")}}
          </div>
        </div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('vip.addMoreQos')}}</div>
        <add-or-delete-input @open="addMoreQos"/>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="ok">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
    import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
    import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
    import WindowBase from 'src/windows/Window';
    import Validator from 'src/utils/validator';
    export default {
      name: "VipAddVipQos",
      mixins: [WindowBase],
      components: {AddOrDeleteInput, CreateTemplateNoRoute},
      props: {
        param: {
          type: Object,
          default:() => {
            return {}
          }
        }
      },
      data(){
        return {

        }
      },

      created(){
        let unAvailablePort = {}
        if (this.param && this.param.unAvailablePort) {
          unAvailablePort = this.param.unAvailablePort
        }
        let params = [{
          port: '',
          inboundBandwidth: '',
          outboundBandwidth: ''
        }]
        this.updateWindow({
          unAvailablePort,
          params,
          useSameInboundBandwidth: true,
          useSameOutboundBandwidth: true
        })
      },

      methods: {
        ...Validator,
        addMoreQos() {
          let params = this.windowData.params
          params.push({
            port: '',
            inboundBandwidth: this.windowData.useSameInboundBandwidth ? params[0].inboundBandwidth : '',
            outboundBandwidth: this.windowData.useSameOutboundBandwidth ? params[0].outboundBandwidth : ''
          })
          this.updateWindow({ params })
        },

        validate (name, index) {
          let params = _.cloneDeep(this.windowData.params)
          let obj = {}
          obj[`invalid${name}-${index}`] = false
          let input = this.windowData.params[index][name]
          if (name === 'inboundBandwidth' || name === 'outboundBandwidth') {
            obj[`emptyInOutBoundBandwidth-${index}`] = false
            if (!this.isUint(input, 'M') && input !== '') {
              obj[`invalid${name}-${index}`] = true
              return this.updateWindow(obj)
            }
            if (this.windowData.params[index].inboundBandwidth === '' && this.windowData.params[index].outboundBandwidth === '') {
              obj[`emptyInOutBoundBandwidth-${index}`] = true
              return this.updateWindow(obj)
            }
            for (let j = params.length - 1; j >= 0; j--) {
              if (!(params[j].inboundBandwidth === '' && params[j].outboundBandwidth === '')) {
                obj[`emptyInOutBoundBandwidth-${j}`] = false
              }
            }
          }
          let portRange = {
            maxValue: 65535,
            minValue: 1
          }
          if (name.indexOf('port') > -1) {
            obj[`duplicate${name}-${index}`] = false
            obj[`multipleAll${name}-${index}`] = false
            if ((!Number.isInteger(Number(input)) || !this.isIn(input, portRange)) && input !== '') {
              obj[`invalid${name}-${index}`] = true
              return this.updateWindow(obj)
            }
            if ((input === '' || input === undefined || input === null) && this.windowData.unAvailablePort['0']) {
              obj[`multipleAll${name}-${index}`] = true
              return this.updateWindow(obj)
            }
            if (params.length > 0) {
              let paramsPort = {}
              for (let i = params.length - 1; i >= 0; i--) {
                obj[`duplicate${name}-${i}`] = false
                obj[`multipleAll${name}-${i}`] = false
                if (paramsPort[params[i].port] === undefined) {
                  paramsPort[params[i].port] = i
                } else {
                  if (params[i].port === '') {
                    obj[`multipleAll${name}-${paramsPort[params[i].port]}`] = true
                    obj[`multipleAll${name}-${i}`] = true
                  }
                  if (params[i].port !== '') {
                    obj[`duplicate${name}-${paramsPort[params[i].port]}`] = true
                    obj[`duplicate${name}-${i}`] = true
                  }
                }
              }
            }
            if (this.windowData.unAvailablePort[input]) {
              obj[`duplicate${name}-${index}`] = true
              return this.updateWindow(obj)
            }
          }
          return this.updateWindow(obj)
        },

        deleteQosParam(index, $event) {
          let params = _.cloneDeep(this.windowData.params)
          params.splice(index, 1)
          this.updateWindow({ params });
          $event.stopPropagation();
        },

        createParam () {
          let data = this.windowData
          let params = data.params
          let modelParam = params.shift()
          let qosParams = []
          qosParams.push(modelParam)
          data.params.forEach((param, index) => {
            let obj = {}
            obj.port = param.port
            obj.inboundBandwidth = data.useSameInboundBandwidth ? modelParam.inboundBandwidth : param.inboundBandwidth
            obj.outboundBandwidth = data.useSameOutboundBandwidth ? modelParam.outboundBandwidth : param.outboundBandwidth
            qosParams.push(obj)
          })
          let avaiableParams = qosParams.filter(item => item.port || item.inboundBandwidth || item.outboundBandwidth)
          return avaiableParams
        },

        updateQosParams: function (index, key, value) {
          let params = this.windowData.params
          params[index][key] = value
          if ((this.windowData.useSameInboundBandwidth && key === 'inboundBandwidth') || (this.windowData.useSameOutboundBandwidth && key === 'outboundBandwidth')) {
            params.forEach(function (item) {
              ((item) => {
                item[key] = value
              })(item)
            })
          }
          this.updateWindow({ params })
        },

        validateAll () {
          let obj = {}
          obj.invalidInput = false
          let props = ['port', 'inboundBandwidth', 'outboundBandwidth']
          let inboundBandwidth = this.windowData.params[0].inboundBandwidth
          let outboundBandwidth = this.windowData.params[0].outboundBandwidth
          this.windowData.params.forEach((item, index) => {
            if (this.windowData.useSameInboundBandwidth) {
              item.inboundBandwidth = inboundBandwidth
              obj[`emptyInOutBoundBandwidth-${index}`] = false
            }
            if (this.windowData.useSameOutboundBandwidth) {
              item.outboundBandwidth = outboundBandwidth
              obj[`emptyInOutBoundBandwidth-${index}`] = false
            }
            if (item.inboundBandwidth === '' && item.outboundBandwidth === '') {
              obj[`emptyInOutBoundBandwidth-${index}`] = true
              obj.invalidInput = true
            }
            props.forEach(prop => this.validate(prop, index))
            let isInvalid = props.some(prop => this.windowData[`invalid${prop}-${index}`] || this.windowData[`duplicateport-${index}`] || this.windowData[`multipleAllport-${index}`])
            if (isInvalid) obj.invalidInput = true
            this.updateWindow(obj)
          })
        },

        ok () {
          this.validateAll()
          if (this.windowData.invalidInput) {
            return
          }
          this.param.ok(this.createParam())
          this.$emit('close')
        },

      }
    }
</script>

<style scoped>
 .unit_content{
   display: inline-block;
   text-align: center;
   border: 1px solid #e1e4e5;
   border-radius: 2px;
   height: 39px;
   line-height: 39px;
   width: 20%;
   margin-left: -2px;
 }
</style>
