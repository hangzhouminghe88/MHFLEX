<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">
      {{$t('vm.vmNicConfig')}}
      <help-trigger name="nicConfig" :style="{'position': 'absolute', 'left': '85px'}"/>
    </div>
    <div class="body">
      <div class="input-container">
        <div class="title">{{$t('vm.staticIp')}}</div>
        <div class="input-content">
            <el-autocomplete style="width: 100%" :class="{'is-error': invalidstaticIp}"
              popper-class="my-autocomplete"
              v-model="staticIp"
              :fetch-suggestions="querySearch"
              :placeholder="isIPv6==='IPV6' ? 'CDCD:910A:2222:5498:8475:1111:3900:2020' : '192.168.1.1'"
              @select="handleSelect">
              <i
                class="up-down"
                slot="suffix">
              </i>
          </el-autocomplete>
          <div class="error error-text" v-if="invalidstaticIp">{{$t('error.invalid') + $t('vm.staticIp')}}</div>
        </div>

        <el-form>
          <el-form-item v-if="!hideMac" :label="$t('vm.vmNicMAC')">
            <el-input v-model="mac" placeholder="08:00:20:0A:8C:6D"/>
            <div class="error error-text" v-if="invalidmac">{{$t('error.invalid') + $t('vm.staticIp')}}</div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import Validator from 'src/utils/validator';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash'
  export default {
    name: "AddNicDlg",
    props: {
      message: {
        type: Object,
        default: {}
      },
      model: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        visiabled: false,
        staticIp: '',
        mac: '',
        invalidstaticIp: false,
        invalidmac: false,
        staticIpList: [],
        hideMac: false,
        showIpList: false,
        invalidInput: false,
        isIPv6: false,
        placeholder: '192.168.1.1',
        uuid: ''
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
      let uuid = this.message.uuid
      rpc.query(`l3-networks/${uuid}/ip/free`).then(resp => {
        let ipList = resp.inventories.map((item) => {
          return {
           value: item.ip
          }
         })
        if (ipList.length > 5) {
          this.staticIpList = _.chunk(ipList, 5)[0]
        } else this.staticIpList = ipList
      })
      this.staticIp = this.message.staticIp ? this.message.staticIp : ''
      this.mac = this.message.mac ? this.message.mac : '';
      this.hideMac = this.message.hideMac;
      this.isIPv6 = this.message.isIPv6 === true ? 'IPV6' : 'IPV4';
      this.uuid = uuid;
    },
    methods:{
      close(){
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.validateAll()
        if (self.invalidInput) return
        self.$emit('close', this.createParam());
      },
      ...Validator,
      getfreeIp: function (l3NetworkUuid) {
        rpc.query(`l3-networks/${l3NetworkUuid}/ip/free`)
          .then((resp) => {
            let ipList = resp.inventories.map((item) => item.ip)
            if (ipList.length > 5) {
              this.updateWindow({ ipList: _.chunk(ipList, 5)[0] })
            } else this.updateWindow({ ipList: ipList })
          })
      },
      cancel: function () {
        this.closeDialog(this.windowId)
      },
      validate (name) {
        let input = this.$data[name].trim()
        this.$data[name] = input
        if (!input) {
          this[`invalid${name}`] = false
          return
        }
        if (name === 'staticIp') {
          if (this.isIPv6 !== 'IPV6' && !this.isIP(input)) this['invalidstaticIp'] = true;
          else if(this.isIPv6 === 'IPV6' && !this.isIPV6IP(input)) this['invalidstaticIp'] = true;
          else this['invalidstaticIp'] = false
        }
        if (name === 'mac') {
          if (!this.isMAC(input)) this['invalidmac'] = true
          else this['invalidmac'] = false
        }
      },
      validateAll () {
        let props = ['staticIp', 'mac'], self = this;
        props.forEach((prop) => {
          self.validate(prop)
        })
        this.invalidInput = props.some(prop => this.$data[`invalid${prop}`])
      },
      createParam () {
        let obj = {}
        if (this.staticIp) {
          obj.staticIp = this.staticIp
        }
        if (this.mac) {
          obj.mac = this.mac
        }
        obj.isIPv6 =  this.isIPv6;
        obj.uuid = this.uuid;
        return obj
      },

       querySearch(queryString, cb) {
         debugger
        var restaurants = this.staticIpList;
        var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      createFilter(queryString) {
        return (staticIp) => {
          return (staticIp.value.indexOf(queryString) === 0);
        };
      },
       handleSelect(item) {
        console.log(item);
      }
    },
    watch: {
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .body{
    padding: 50px 40px;
    min-height: 200px;
    .input-container{
      width: 420px;
      margin: 0 auto;
      height: 80px;
      margin-bottom: 20px;
      text-align: left;
    }
    .input-item{
       width: 100%;
       height: 40px;
       line-height: 40px;
       margin-bottom: 20px;
       position: relative;
       border: 1px solid #DCDFE6;
       border-radius: 2px;
     }
    .input-content{
      width: 100%;
      height: 40px;
      line-height: 40px;
      margin-bottom: 20px;
      position: relative;
    }
    .ip-list{
      z-index: 3333;
      width: 418px;
      position: absolute;
      box-shadow: 1px 1px 1px #eef3f7, -1px -1px 1px #eef3f7;
      color: #222;
      border-radius: 2px;
      border: 1px solid #ccc;
      margin-top: -20px;
      li{
        height: 40px;
        line-height: 40px;
        background: #fff;
        cursor: pointer;
        &:hover{
          background: #409EFF;
          color: #fff;
        }
       a{
         &:active{
           background: #409EFF;
         }
       }
      }
    }
    .up-down{
      position: absolute;
      right: 15px;
      top: 12px;
    }
  }
   .error {
      height: 10px;
      line-height: 10px;
      font-size: 12px;
      text-align: left;
      position: absolute;
      right: 0;
      -webkit-animation: error403 animation 0.2s ease-in;
      animation: error403 animation 0.2s ease-in;
      margin-top: 2px;
      width: 100%;
    }
</style>
