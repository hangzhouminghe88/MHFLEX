<style scoped>
  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 40px;
    box-sizing: border-box;
    width: 303px
  }

  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    height: 23px;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .rule-body {
    width: 100%;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    padding-bottom: 20px;
  }

  .rule-content {
    height: 30px;
    font-size: 14px;
    color: #333;
    width: 100%;
    padding: 10px;
    border-radius: 2px;
    position: relative;
    box-sizing: border-box;
  }

  .operation-block-header {
    border-bottom: 1px solid #adb0b8;
    padding-bottom: 8px;
    margin-bottom: 15px;
    color: #1a2736;
    font-size: 16px;
    cursor: pointer;
    max-width: 300px;
  }

  .el-radio-group {
    line-height: 40px;
    padding-top: 5px
  }

  .content-size {
    width: 300px;
  }

  .content-size input {
    width: calc(100% - 70px);
    position: relative;
  }

  .content-size .text {
    display: inline-block;
    left: 18px;
    line-height: 40px;
    position: relative;
  }

  .content-size .arrow {
    top: 3px;
    position: relative;
    left: 12px;
  }

  .content-size .size {
    float: right;
    height: 40px;
    width: 60px;
    position: relative;
    border: 1px solid #adb0b8;
    border-radius: 0 2px 2px 0;
    box-sizing: border-box;
  }

  .content-size .drop-size {
    position: relative;
    font-size: 0;
    top: -41px;
    right: 1px;
    width: 60px;
    z-index: 3000;
    background: #fff;
    border-radius: 0 2px 2px 2px;
    border: 1px solid #adb0b8;
    padding: 9px 0;
  }

  .content-size .drop-size a {
    padding: 5px 20px;
    text-decoration: none;
    display: block;
    font-size: 14px;
    color: #1a2736;
    letter-spacing: 0;
    line-height: 20px;
    text-align: center;
  }

  .band-width .content-unit {
    display: inline-block;
    width: calc(30% - 2px);
    height: 39px;
    line-height: 37px;
    border-radius: 2px;
    text-align: center;
    margin-left: -2px;
  }

  .band-width .content-unit .unit-text {
    font-size: 14px;
    display: inline-block;
    line-height: 40px;
    position: relative;
  }

  .input-wrapper{
    position: relative;
  }
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("common.createVip")}}
        </span>
      <span class="create-back" @click="$router.push('vip')"><i class="el-icon-back"></i>回到虚拟IP列表</span>
    </div>
    <div slot="body" class="create-body">
      <div id="common-name" class="operation-row">
        <div class="title required">
          {{$t("common.name")}}
        </div>
        <help-trigger name="vip"/>
        <input v-model="windowData.name" :class="{'is-error': windowData.emptyname}"
               @input="(e) => { updateWindow({ 'name': e.target.value }) }" @blur="validate('name')"
               @keydown.enter="validate('name')"/>
        <div class="error error-text" v-if="windowData.emptyname">
          {{$t('error.emptyInput')+$t('common.name')}}
        </div>
      </div>
      <div id="common-introduction" class="operation-row">
        <div class="title">
          {{$t("common.introduction")}}
        </div>
        <textarea rows="3" v-model="windowData.description"
                  @input="(e) => { updateWindow({ 'description': e.target.value }) }"/>
      </div>
      <div id="common-network" class="operation-row">
        <div class="title required">
          {{$t("common.network")}}
        </div>
        <div v-if="windowData.l3NetworkUuid.length > 0">
          <add-or-delete-input
            :value="dbData.l3network[windowData.l3NetworkUuid] && dbData.l3network[windowData.l3NetworkUuid].name"
            @remove="removeNetwork()"></add-or-delete-input>
        </div>
        <div class="content" @click="openSelectL3NetworkDlg();" v-if="windowData.l3NetworkUuid === ''">
          <div class="add"></div>
        </div>
        <div class="error error-text" v-if="windowData.emptyl3NetworkUuid">
          {{$t('error.unselected')+$t('common.network')}}
        </div>
      </div>

      <div id="vip-requiredIP" class="operation-row">
        <div class="title">
          {{ $t("vip.requiredIP") }}
        </div>
        <input v-model="windowData.requiredIp"
               :class="{'is-error': windowData.requiredIp && windowData.invalidrequiredIp}"
               @blur="validate('requiredIp')" @keydown.enter="validate('requiredIp')"
               @input="(e) => { updateWindow({ 'requiredIp': e.target.value }) }" list="windowData.requiredIPList"/>
        <datalist id="windowData.requiredIPList">
          <option v-for="requiredIp in windowData.requiredIPList" :value="requiredIp">
            {{requiredIp}}
          </option>
        </datalist>
        <div class="error error-text" v-if="windowData.requiredIp && windowData.invalidrequiredIp">
          {{$t('error.invalid')+$t('vip.requiredIP')}}
        </div>
      </div>

      <div id="vip-addQos" v-permission="'LICENSE_BASIC_PAID'" class="operation-block-header" style="margin-top: 40px;"
           v-if="canCreateQos()">
        {{ $t("vip.addQos") }}
      </div>
      <div v-if="!dbData.common.isOpensource && canCreateQos()">
        <div class="operation-row" v-if="windowData.params.length > 1">
          <div class="options">
            <el-checkbox v-model="windowData.useSameInboundBandwidth" @change="useSameInboundBandwidth">
              {{$t("vip.useSameInboundBandwidth")}}
            </el-checkbox>
            <el-checkbox v-model="windowData.useSameOutboundBandwidth" @change="useSameOutboundBandwidth">
              {{$t("vip.useSameOutboundBandwidth")}}
            </el-checkbox>
          </div>
        </div>
        <div class="more-qos-wrapper" v-for="(item, index) in windowData.params">
          <div id="common-port" class="operation-row">
            <div class="title">
              {{$t("common.port")}}
            </div>
            <div class="input-wrapper">
              <input v-model="windowData.params[index].port"
                     :class="{'is-error': windowData[`invalidport-${index}`] || windowData[`duplicateport-${index}`] || windowData[`multipleAllport-${index}`]}"
                     @input="(e) => { updateQosParams(index, 'port', e.target.value) }"
                     @blur="validateForQos('port', index)" @keydown.enter="validateForQos('port', index)"/>
              <div class="delete-param delete" v-if="index !== 0" @click="deleteQosParam(index, $event)"></div>
            </div>
            <div class="error error-text"
                 v-if="!windowData[`emptyport-${index}`] && windowData[`invalidport-${index}`]">
              {{$t("error.invalid")+$t("common.port")}}
            </div>
            <div id="duplicatePort" class="error error-text" v-if="windowData[`duplicateport-${index}`]">
              {{$t("vip.duplicatePort")}}
            </div>
            <div id="multipleAllPort" class="error error-text" v-if="windowData[`multipleAllport-${index}`]">
              {{$t("vip.multipleAllPort")}}
            </div>
          </div>

          <div id="common-networkOutboundBandwidth" class="operation-row band-width"
               v-if="index === 0 || !windowData.useSameOutboundBandwidth">
            <div class="title">
              {{$t("common.networkOutboundBandwidth")}}
            </div>
            <input v-model="windowData.params[index].outboundBandwidth"
                   :class="{'is-error': windowData[`invalidoutboundBandwidth-${index}`] || windowData[`emptyInOutBoundBandwidth-${index}`]}"
                   @input="(e) => { updateQosParams(index, 'outboundBandwidth', e.target.value) }"
                   @blur="validateForQos('outboundBandwidth', index)"
                   @keydown.enter="validateForQos('outboundBandwidth', index)"
                   style="width: 64%;" :ref="`row${index}`"/>
            <div class="content-unit">
              <el-select v-model="outboundBandwidthUnit">
                <el-option value="Kbps" label="Kbps"></el-option>
                <el-option value="Mbps" label="Mbps"></el-option>
                <el-option value="Gbps" label="Gbps"></el-option>
              </el-select>
            </div>
            <div class="error error-text"
                 v-if="!windowData[`emptyoutboundBandwidth-${index}`] && windowData[`invalidoutboundBandwidth-${index}`]">
              {{$t("error.invalid")+$t("common.networkOutboundBandwidth")}}
            </div>
            <div class="error error-text"
                 v-if="windowData[`emptyInOutBoundBandwidth-${index}`] && (index === 0 || !windowData.useSameOutboundBandwidth)">
              {{$t("vip.emptyInOutBoundBandwidth")}}
            </div>
          </div>


          <div id="common-networkInboundBandwidth" class="operation-row band-width"
               v-if="index === 0 || !windowData.useSameInboundBandwidth">
            <div class="title">
              {{$t("common.networkInboundBandwidth")}}
            </div>
            <input v-model="windowData.params[index].inboundBandwidth"
                   :class="{'is-error': windowData[`invalidinboundBandwidth-${index}`] || windowData[`emptyInOutBoundBandwidth-${index}`]}"
                   @input="(e) => { updateQosParams(index, 'inboundBandwidth', e.target.value) }"
                   @blur="validateForQos('inboundBandwidth', index)"
                   @keydown.enter="validateForQos('inboundBandwidth', index)"
                   style="width: 64%;"/>
            <div class="content-unit">
              <el-select v-model="inboundBandwidthUnit">
                <el-option value="Kbps" label="Kbps"></el-option>
                <el-option value="Mbps" label="Mbps"></el-option>
                <el-option value="Gbps" label="Gbps"></el-option>
              </el-select>
            </div>
            <div id="common-inboundBandwidth" class="error error-text"
                 v-if="!windowData[`emptyinboundBandwidth-${index}`] && windowData[`invalidinboundBandwidth-${index}`]">
              {{$t("error.invalid")+$t("common.networkInboundBandwidth")}}
            </div>
            <div id="emptyInOutBoundBandwidth" class="error error-text"
                 v-if="windowData[`emptyInOutBoundBandwidth-${index}`] && (index === 0 || !windowData.useSameInboundBandwidth)">
              {{$t("vip.emptyInOutBoundBandwidth")}}
            </div>
          </div>


        </div>
        <div id="vip-addMoreQos" class="operation-row">
          <div class="title">
            {{$t("vip.addMoreQos")}}
          </div>
          <div class="content" @click="addMoreQos()">
            <div class="add"></div>
          </div>
        </div>
      </div>


    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('vip')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import Validator from 'src/utils/validator';
  import CreateTemplate from 'src/component/CreateTemplate';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";

  export default {
    name: "CreateVipPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddOrDeleteInput,
      CreateTemplate
    },
    data() {
      return {
        canCreate: true,
        inboundBandwidthUnit: 'Mbps',
        outboundBandwidthUnit: 'Mbps',
        formRules: {
          name: [
            {required: true, message: '名称不能为空', trigger: 'blur'}
          ]
        },
        instanceOfferingConditions: [{
          name: 'state',
          op: '=',
          value: 'Enabled'
        }]
      }
    },
    computed: {},
    created() {
      this.deleteAllAssistant()
      let params = [{
        port: '',
        inboundBandwidth: '',
        outboundBandwidth: ''
      }]
      this.updateWindow({
        name: '',
        description: '',
        l3NetworkUuid: '',
        requiredIp: '',
        zoneUuid: window.localStorage.getItem('currZoneUuid'),
        params,
        useSameInboundBandwidth: true,
        useSameOutboundBandwidth: true
      }).then(() => {
        this.queryL3network()
      })
    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Validator,
      removeNetwork() {
        this.updateWindow({
          l3NetworkUuid: ''
        })
      },
      queryForAssistant() {
        let self = this
        let zoneUuid = `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          let hide
          let content
          if (!this.dbData.common.isAdmin && resourceName === 'PublicNetwork') {
            content = 'lackOfPublicNetworlInAccount'
            hide = true
          } else {
            hide = false
            content = `lackOf${resourceName}`
          }
          self.createAssistant({
            id,
            hide,
            operation,
            title: 'vipTitle',
            ownerId: self.windowData.id,
            content,
            handler: () => {
              self.openFullMainWindow(`Create${resourceName}Dlg`,
                {
                  ok: (param) => {
                    self[`create${resourceName}`](param)
                      .then(() => {
                        self.deleteAssistant(id)
                      })
                  },
                  cancel: () => {
                    self.queryForAssistant()
                  }
                }
              )
            }
          })
        }
        let conditions = [zoneUuid, 'category=Public']
        rpc.query('l3-networks', {count: true, q: conditions}).then(resp => {
          if (resp.total === 0) newAssistant('PublicNetwork', 'create')
        })
      },
      queryL3network: function () {
        let conditions = [`zoneUuid=${this.windowData.zoneUuid}`, 'category=Public']
        rpc.query('l3-networks', {
          // q: [`zoneUuid=${this.windowData.zoneUuid}`, 'category=Public', 'l2Network.cluster.type!=vmware']
          q: conditions
        }).then((resp) => {
          this.updateDbTable({
            tableName: 'l3network',
            list: resp.inventories
          })
          this.queryForAssistant()
          if (resp.inventories.length === 1) {
            this.updateWindow({l3NetworkUuid: resp.inventories[0].uuid})
            this.getfreeIp(resp.inventories[0].uuid)
          }
        })
      },
      selectSize: function (size, unitName, dropName, $event) {
        let obj = {}
        let target = {}
        obj[unitName] = size
        target[dropName] = !this.windowData[dropName]
        this.updateWindow(obj)
        this.updateWindow(target)
      },
      closeAllSelect: function () {
        if (this.windowData.showMoreInboundBandwidth) this.updateWindow({showMoreInboundBandwidth: false})
        if (this.windowData.showMoreSize) this.updateWindow({showMoreSize: false})
        if (this.windowData.showMoreOutboundBandwidth) this.updateWindow({showMoreOutboundBandwidth: false})
      },
      getfreeIp: function (l3NetworkUuid) {
        let requiredIPList = []
        rpc.query(`l3-networks/${l3NetworkUuid}/ip/free`)
          .then((resp) => {
            for (let i = 0; i < resp.inventories.length; ++i) {
              requiredIPList.push(resp.inventories[i].ip)
              if (i === 3) {
                break
              }
            }
            this.updateWindow({requiredIPList})
          })
      },
      addMoreQos: function () {
        let params = this.windowData.params
        params.push({
          port: '',
          inboundBandwidth: this.windowData.useSameInboundBandwidth ? this.setSizeToByte(params[0].inboundBandwidth, this.inboundBandwidthUnit) : '',
          outboundBandwidth: this.windowData.useSameOutboundBandwidth ? this.setSizeToByte(params[0].outboundBandwidth, this.outboundBandwidthUnit) : ''
        })
        this.updateWindow({params})
      },
      useSameInboundBandwidth: function () {
        /*this.updateWindow({ useSameInboundBandwidth: !this.windowData.useSameInboundBandwidth })
          .then(() => this.validateAllQos())*/
        this.validateAllQos()
      },
      useSameOutboundBandwidth: function () {
        /*this.updateWindow({ useSameOutboundBandwidth: !this.windowData.useSameOutboundBandwidth })
          .then(() => this.validateAllQos())*/
        this.validateAllQos()
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
        this.updateWindow({params})
      },
      createParam: function () {
        let data = this.windowData
        let params = data.params
        let modelParam = params.shift()
        let qosParams = [], qosObj = {}, self = this;;
        qosObj =  {
          port: modelParam.port,
          inboundBandwidth: self.setSizeToByte(modelParam.inboundBandwidth, self.inboundBandwidthUnit),
          outboundBandwidth: self.setSizeToByte(modelParam.outboundBandwidth, self.outboundBandwidthUnit)
        }
        qosParams.push(qosObj)
        data.params.forEach((param, index) => {
          let obj = {}
          obj.port = param.port
          obj.inboundBandwidth = data.useSameInboundBandwidth ? self.setSizeToByte(modelParam.inboundBandwidth, self.inboundBandwidthUnit) : self.setSizeToByte(param.inboundBandwidth, self.inboundBandwidthUnit)
          obj.outboundBandwidth = data.useSameOutboundBandwidth ? self.setSizeToByte(modelParam.outboundBandwidth, self.outboundBandwidthUnit) : self.setSizeToByte(param.outboundBandwidth,  self.outboundBandwidthUnit)
          qosParams.push(obj)
        })
        return {
          name: this.windowData.name,
          description: this.windowData.description,
          l3NetworkUuid: this.windowData.l3NetworkUuid,
          requiredIp: this.windowData.requiredIp === '' ? undefined : this.windowData.requiredIp,
          qosParams: this.canCreateQos() ? qosParams : undefined

        }
      },

      setSizeToByte(number, unit) {
        let K = 1024, size = 0;
        let obj = {
          M:  K * K,
          G: K * K * K,
          K: K
        }
        if(unit)
         size = Number(number) * obj[unit.charAt(0)];
        else size = Number(number) * obj['M'];
        return size;
      },

      deleteQosParam: function (index, $e) {
        let params = _.cloneDeep(this.windowData.params)
        params.splice(index, 1)
        this.updateWindow({params})
      },
      validate(name) {
        let obj = {}
        obj[`empty${name}`] = false
        let windowData = this.windowData
        let propToBeTrimed = ['name', 'requiredIp']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        if (name === 'requiredIp') {
          if (!this.isIP(input)) {
            obj[`invalid${name}`] = true
          }
        }
        this.updateWindow(obj)
      },
      validateAll() {
        let obj = {}
        obj.invalidInput = false
        let props = ['name', 'l3NetworkUuid']
        let pushInIfExist = ['requiredIp', 'inboundBandwidthUnit', 'outboundBandwidth']
        for (let item of pushInIfExist) {
          if (this.windowData[item]) {
            props.push(item)
          }
        }
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this.windowData[`empty${item}`])
        if (isInvalid) obj.invalidInput = true

        this.updateWindow(obj)
      },
      validateForQos(name, index) {
        let params = _.cloneDeep(this.windowData.params)
        let obj = {}
        obj[`invalid${name}-${index}`] = false
        if (this.windowData.params.length === 1 && this.windowData.params[0].port === '' && this.windowData.params[0].inboundBandwidth === '' && this.windowData.params[0].outboundBandwidth === '') {
          obj[`emptyInOutBoundBandwidth-0`] = false
          obj[`multipleAllport-0`] = false
          this.updateWindow(obj)
          return
        }
        let input = this.windowData.params[index][name]
        if (name === 'inboundBandwidth' || name === 'outboundBandwidth') {
          obj[`emptyInOutBoundBandwidth-${index}`] = false
          if (!this.isUint(input, 'M') && input !== '') {
            obj[`invalid${name}-${index}`] = true
            this.updateWindow(obj)
            return
          }
          if (this.windowData.params[index].inboundBandwidth === '' && this.windowData.params[index].outboundBandwidth === '') {
            obj[`emptyInOutBoundBandwidth-${index}`] = true
            this.updateWindow(obj)
            return
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
            this.updateWindow(obj)
            return
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

        }
        this.updateWindow(obj)
      },
      validateAllQos() {
        let obj = {}
        obj.invalidInputQos = false
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
          if ((item.inboundBandwidth === '' && item.outboundBandwidth === '' && this.windowData.params.length > 1) || (item.inboundBandwidth === '' && item.outboundBandwidth === '' && item.port !== '' && this.windowData.params.length === 1)) {
            obj[`emptyInOutBoundBandwidth-${index}`] = true
            obj.invalidInputQos = true
          }
          props.forEach(prop => this.validateForQos(prop, index))
          let isInvalid = props.some(prop => this.windowData[`invalid${prop}-${index}`] || this.windowData[`duplicateport-${index}`] || this.windowData[`multipleAllport-${index}`])
          if (isInvalid) obj.invalidInputQos = true
          this.updateWindow(obj)
        })
      },
      openSelectL3NetworkDlg: function () {
        const self = this
        let conditions = ['category=Public']
        self.openDialog('L3NetworkSingleSelectListDlg', {
          conditions: conditions,
          select: (uuid) => {
            self.selectNetwork(uuid)
          }
        })
      },
      checkL3Network: function (l3NetworkUuid) {
        const self = this
        let p = null
        let tasks = []
        p = rpc.query('hosts', {
          q: `cluster.l2Network.l3Network.uuid=${l3NetworkUuid}`,
          limit: 1,
          fields: 'hypervisorType'
        }).then((l3host) => {
          if (l3host.inventories.length === 0) l3host.inventories = [{'hypervisorType': ''}]
          return self.forceUpdateDbRow({
            tableName: 'l3NetworkOfHost',
            id: l3NetworkUuid,
            data: l3host.inventories
          })
        })
        tasks.push(p)
        return Promise.all(tasks)
      },
      canCreateQos: function () {
        let permission = this.getApiPermission('VIP_QOS.SET')
        if (!permission) return false
        const self = this
        let value = true
        if (self.windowData.l3NetworkUuid && self.dbData.l3NetworkOfHost[self.windowData.l3NetworkUuid] && (self.dbData.l3NetworkOfHost[self.windowData.l3NetworkUuid].length > 0) && self.dbData.l3NetworkOfHost[self.windowData.l3NetworkUuid][0].hypervisorType === 'ESX') {
          value = false
        }
        return value
      },
      selectNetwork: function (uuid) {
        this.updateWindow({l3NetworkUuid: uuid}).then(() => {
          this.validate('l3NetworkUuid')
        })
        this.checkL3Network(uuid)
        this.getfreeIp(uuid)
      },
      ok: function () {
        this.validateAll()
        this.validateAllQos()
        if (this.windowData.invalidInput || this.windowData.invalidInputQos) {
          return
        }
        this.canCreate = false;
        this.create(this.createParam())
          .then( () => {
            this.$router.push({name: 'vip'})
          }).catch(() => {
            this.canCreate = true;
        })

      }
    }
  }
</script>
