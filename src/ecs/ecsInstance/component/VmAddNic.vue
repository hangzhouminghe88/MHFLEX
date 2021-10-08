<template>
  <div>
    <create-template-no-route>
      <div slot="header">
        <span>
          {{$t('vm.attachNic')}}
        </span>
        <span class="create-back" @click="$emit('close')"><i class="el-icon-back"></i>返回</span>
      </div>
      <div slot="body">
        <div class="clone-container">
          <div class="title required">
            {{ $t("common.ipAddressType") }}
          </div>
          <component :param="typeListItem.param" :is="typeListItem.ctrl"/>
          <!--展示悬着哪一个网络列表-->
          <component v-for="(item, index) in getNetWorkTypeParamList()" :key="index" :param="item.param" :is="item.ctrl"/>
        </div>
      </div>
      <div slot="footer">
        <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
      </div>
    </create-template-no-route>
      <net-work-select-list-confirm-dlg v-if="showNetWorkSelectDlg" :model="showNetWorkSelectDlg" :ipType="ipType" :message="networkSelectMessage" @setShowFlase="closeNetworkSelectDlg"></net-work-select-list-confirm-dlg>
      <add-nic-dlg v-if="showAddNicDlg" :model="showAddNicDlg" :message="addNicMessage" @close="closeAddNicDlg"/>
  </div>
</template>

<script>

    import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
    import DoubleNetWorkSelect from "./DoubleNetWorkSelect";
    import AddNicDlg from "../../../dialog/AddNicDlg";
    import L3NetWorkSinglePicker from "../../../component/singleSelect/L3NetWorkSinglePicker";
    import FullPanelTypeList from 'src/component/FullPanel/PanelTypeList';
    import FullPanelHelper from 'src/component/FullPanel/heplers';
    import NetWorkSelectListConfirmDlg from "../../../dialog/NetWorkSelectListConfirmDlg";
    import ValidateHelper from 'src/utils/ValidateHelper'
    import WindowBase from 'src/windows/Window';
    import rpc from 'src/utils/rpc';
    export default {
      name: "VmAddNic",
      mixins: [WindowBase],
      props: {
        param: {
          type: Object,
          default: {}
        }
      },
      components: {
        NetWorkSelectListConfirmDlg,
        L3NetWorkSinglePicker, FullPanelTypeList, AddNicDlg, DoubleNetWorkSelect, CreateTemplateNoRoute},
      data() {
        return{
          networkType: 'ipv4',
          ipv4NetworkUuid: "",
          ipv6NetworkUuid: "",
          ipv4NetworkUuidInDoubleStack: "",
          ipv6NetworkUuidInDoubleStack: "",
          showNetWorkSelectDlg: false,
          networkSelectMessage: {},
          addNicMessage: {},
          ipType: '',
          showAddNicDlg: false,
          typeListItem: {
            id: 'networkType',
            param: {
              getTypeList: () => this.networkTypeList,
              getIndex: () => {
                return _.findIndex(this.networkTypeList, it => it.value === this.networkType)
              },
              setIndex: (index) => {
                if (this.networkTypeList[index].value === this.networkType) return
                this.networkType = this.networkTypeList[index].value
                // this.queryForAssistant()
              },
              getDisabled: this.genGetDisabled('networkType')
            },
            ctrl: FullPanelTypeList
          },
          networkTypeList:[
            {
              typeName: 'admin',
              value: 'ipv4',
              permission: 'LICENSE_BASIC_COMMUNITY'
            },
            {
              typeName: 'other',
              value: 'ipv6',
              permission: 'LICENSE_BASIC_PAID'
            },
            {
              typeName: 'doubleIPv4AndIPv6',
              value: 'double',
              permission: 'LICENSE_BASIC_PAID'
            }
          ],
          ipv4Item: [
            {
              id: 'ipv4L3network',
              param: {
                getTitle: FullPanelHelper.genGetText('vm.ipv4L3network', this),
                open: this.selectIpv4Network,
                getValue: () => this.getL3NetworkName('ipv4NetworkUuid'),
                delete: () => {
                  this.ipv4NetworkUuid = ''
                },
                onClickNicConfig: () => this.onClickNicConfig('ipv4StaticIP', 'ipv4NetworkUuid', false),
                validator: ValidateHelper.genValidator('ipv4NetworkUuid', ['no-empty'], this),
                getDisabled: this.genGetDisabled('l3network'),
                canShowStar: () => { return true },
                showNetworkConfig: () => !!this.ipv4NetworkUuid
              },
              ctrl: L3NetWorkSinglePicker
            }
          ],
          ipv6Item: [{
            id: 'ipv6L3network',
            param: {
              getTitle: FullPanelHelper.genGetText('vm.ipv6L3network', this),
              open: this.selectIpv6Network,
              getValue: () => this.getL3NetworkName('ipv6NetworkUuid'),
              delete: () => {
                this.ipv6NetworkUuid = ''
              },
              onClickNicConfig: () => this.onClickNicConfig('ipv6StaticIP', 'ipv6NetworkUuid', true),
              validator: ValidateHelper.genValidator('ipv6NetworkUuid', ['no-empty'], this),
              getDisabled: this.genGetDisabled('l3network'),
              canShowStar: () => { return true },
              showNetworkConfig: () => {
                if (!this.ipv6NetworkUuid || !this.dbData.l3network[this.ipv6NetworkUuid]) return false
                return this.dbData.l3network[this.ipv6NetworkUuid].ipRanges.some((item) => item.addressMode === 'Stateful-DHCP')
              }
            },
            ctrl: L3NetWorkSinglePicker
          }],
          doubleStackItem: [
            {
              id: 'ipv4L3networkInDoubleStack',
              param: {
                getTitle: FullPanelHelper.genGetText('vm.ipv4L3network', this),
                open: this.selectIpv4NetworkInDoubleStack,
                getValue: () => this.getL3NetworkName('ipv4NetworkUuidInDoubleStack'),
                delete: () => {
                  this.ipv4NetworkUuidInDoubleStack = ''
                },
                onClickNicConfig: () => this.onClickNicConfig('ipv4StaticIPInDoubleStack', 'ipv4NetworkUuidInDoubleStack', false),
                validator: ValidateHelper.genValidator('ipv4NetworkUuidInDoubleStack', ['no-empty'], this),
                getDisabled: this.genGetDisabled('l3network'),
                canShowStar: () => { return true },
                showNetworkConfig: () => !!this.ipv4NetworkUuidInDoubleStack
              },
              ctrl: L3NetWorkSinglePicker
            }, {
              id: 'ipv6L3network',
              param: {
                getTitle: FullPanelHelper.genGetText('vm.ipv6L3network', this),
                open: this.selectIPv6NetworkInDoubleStack,
                getValue: () => this.getL3NetworkName('ipv6NetworkUuidInDoubleStack'),
                delete: () => {
                  this.ipv6NetworkUuidInDoubleStack = ''
                },
                onClickNicConfig: () => this.onClickNicConfig('ipv6StaticIPInDoubleStack', 'ipv6NetworkUuidInDoubleStack', true),
                validator: ValidateHelper.genValidator('ipv6NetworkUuidInDoubleStack', ['no-empty'], this),
                getDisabled: this.genGetDisabled('l3network'),
                canShowStar: () => { return true },
                showNetworkConfig: () => {
                  if (!this.ipv6NetworkUuidInDoubleStack || !this.dbData.l3network[this.ipv6NetworkUuidInDoubleStack]) return false
                  return this.dbData.l3network[this.ipv6NetworkUuidInDoubleStack].ipRanges.some((item) => item.addressMode === 'Stateful-DHCP')
                }
              },
              ctrl: L3NetWorkSinglePicker
            }
          ],
        }
      },
      created(){
        let self = this;
        self.initIpv4()
      },
      methods: {
        getNetWorkTypeParamList () {
          let self = this
          let obj = {
            ipv4: self.ipv4Item,
            ipv6: self.ipv6Item,
            double: self.doubleStackItem
          }
          return obj[self.networkType]
        },
        genGetDisabled (id) {
          return false
        },
        confirm(){
          if (!this.validateAll()) return
          if (this.windowData.invalidInput) return
          let param = {}
          if (this.networkType === 'double') {
            param = {
              networkType: this.networkType,
              ipv4NetworkUuid: this.ipv4NetworkUuidInDoubleStack,
              ipv6NetworkUuid: this.ipv6NetworkUuidInDoubleStack,
              ipv4StaticIP: this.ipv4StaticIPInDoubleStack,
              ipv6StaticIP: this.ipv6StaticIPInDoubleStack
            }
          } else {
            param = {
              networkType: this.networkType,
              l3network: this.networkType === 'ipv4' ? this.ipv4NetworkUuid : this.ipv6NetworkUuid,
              staticIp: this.networkType === 'ipv4' ? this.ipv4StaticIP : this.ipv6StaticIP
            }
          }
          console.log(param)
          this.$emit('close', param);
        },
        getL3NetworkName (l3networkUuid) {
          let uuid = this[l3networkUuid]
          return uuid && this.dbData.l3network[uuid].name
        },
        //选择ipv4网络
        selectIpv4Network(){
          let self  = this;
          let conditions = ['system=false', 'l2Network.cluster.type=zstack', `uuid?=${self.param.avaliableL3networkUuidList}`, 'ipVersion=4', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'category?=Private,Public']
          self.ipType = "IPV4"
          self.networkSelectMessage = {
            conditions: conditions,
            selectType: 'single'
          };
          self.showNetWorkSelectDlg = true;
        },
        //选择ipV6
        selectIpv6Network(){
          let self  = this;
          self.ipType = "IPV6"
          let conditions = ['system=false', 'l2Network.cluster.type=zstack', `uuid?=${self.param.avaliableL3networkUuidList}`, 'ipVersion=6', `zoneUuid=${localStorage.getItem('currZoneUuid')}`, 'category?=Private,Public']
          self.networkSelectMessage = {
            conditions: conditions,
            selectType: 'single'
          };
          self.showNetWorkSelectDlg = true;
        },
        //双栈ipv4
        selectIpv4NetworkInDoubleStack: function () {
          let self = this
          let avaliableL3networkUuidList = this.param.avaliableL3networkUuidList
          let conditions = ['system=false', 'l2Network.cluster.type=zstack', `uuid?=${avaliableL3networkUuidList}`, 'ipVersion=4', 'category?=Private,Public', `zoneUuid=${localStorage.getItem('currZoneUuid')}`]
          if (this.ipv6NetworkUuidInDoubleStack) conditions.push(`l2NetworkUuid=${this.dbData.l3network[this.ipv6NetworkUuidInDoubleStack].l2NetworkUuid}`)
          self.ipType = "IPV4";
          self.networkSelectMessage = {
            conditions: conditions,
            selectType: 'single'
          };
          self.showNetWorkSelectDlg = true;
        },
        //双栈ipv6
        selectIPv6NetworkInDoubleStack(){
          let self = this;
          let avaliableL3networkUuidList = self.param.avaliableL3networkUuidList
          let conditions = ['system=false', 'l2Network.cluster.type=zstack', `uuid?=${avaliableL3networkUuidList}`, 'ipVersion=6', 'category?=Private,Public', `zoneUuid=${localStorage.getItem('currZoneUuid')}`]
          if (this.ipv4NetworkUuidInDoubleStack) conditions.push(`l2NetworkUuid=${this.dbData.l3network[this.ipv4NetworkUuidInDoubleStack].l2NetworkUuid}`)
          self.ipType = "IPV6";
          self.networkSelectMessage = {
            conditions: conditions,
            selectType: 'single'
          };
          self.showNetWorkSelectDlg = true;
        },
        //设置网卡
        onClickNicConfig (ip, networkUuid, isIPV6) {
          let staticIP = this[ip]
          let self = this;
          self.addNicMessage = {
            staticIP: staticIP,
            uuid: this[networkUuid],
            staticIp: staticIP,
            isSingle: true,
            isUserVm: true,
            hideMac: true,
            isIPV6: isIPV6
          }
          self.showAddNicDlg = true;
        },
        closeNetworkSelectDlg(param){
          let self  = this,ctrlItem;
          if(param){
            switch (self.networkType) {
              case 'ipv4':
                this.ipv4NetworkUuid = param[0];
                ctrlItem = this.getCtrlItemById('ipv4L3network')
                //ctrlItem.param.validator.fn()
              break;
              case 'ipv6':
                this.ipv6NetworkUuid = param[0];
                ctrlItem = this.getCtrlItemById('ipv6L3network');
              break;
              case 'double':
                if(self.ipType === 'IPV4'){
                  this.ipv4NetworkUuidInDoubleStack = param[0];
                  let ctrlItem = this.getCtrlItemById('ipv4L3networkInDoubleStack')
                  //ctrlItem.param.validator.fn()
                }else if(self.ipType === 'IPV6'){
                  this.ipv6NetworkUuidInDoubleStack = param[0];
                  let ctrlItem = this.getCtrlItemById('ipv6L3networkInDoubleStack')
                  //ctrlItem.param.validator.fn()
                }
            }
          }
          self.showNetWorkSelectDlg = false;
        },
        closeAddNicDlg(param){
          let self = this;
          if(param && param.staticIP){
            switch (param.isIPv6) {
              case "IPV4":
                if(self.networkType=== 'ipv4')
                self.ipv4StaticIP = param.staticIp
                break;
              case "IPV6":
                if(self.networkType=== 'ipv6')
                self.ipv6StaticIP = param.staticIp
                break;
              default:
                if(self.networkType === 'double'){
                  if(param.isIPv6 === 'ipv4'){
                    self.ipv4StaticIPInDoubleStack = param.staticIP;
                  }
                  if(param.isIPv6 === 'ipv6'){
                    self.ipv6StaticIPInDoubleStack = param.staticIP;
                  }
                }
            }
          }
          self.showAddNicDlg = false;
        },
        getCtrlItemById(id){
          let self = this;
          let itemList = self.getNetWorkTypeParamList()
          for (let i in itemList) {
            if (itemList[i].id === id) {
              return itemList[i]
            }
          }
        },
        async initIpv4() {
          let avaliableL3networkUuidList = this.param.avaliableL3networkUuidList
          let conditions = [`uuid?=${avaliableL3networkUuidList}`, 'ipVersion=4']
          let resp = await rpc.query('l3-networks', { q: conditions })
          if (resp.inventories.length === 1) {
            await this.updateDbRow({
              tableName: 'l3network',
              id: resp.inventories[0].uuid,
              data: resp.inventories[0]
            })
            this.ipv4L3NetworkUuid = resp.inventories[0].uuid
          }
        },
        //校验添加的ip
        validateAll () {
          let itemList = this.getNetWorkTypeParamList()
          let isValid = true
          for (let i in itemList) {
            let item = itemList[i]
            if (!item.param.validator) continue
            item.param.validator.result.ignorDirty = true
            item.param.validator.fn()
            if (item.param.validator.result.isValid === false) {
              isValid = false
            }
          }
          return isValid
        },
      }
    }
</script>

<style scoped lang="less">
  .createvmWrapper {
    width: 100%;
    height: 100%;
    background: #fff;
  }

  .network {
    margin-bottom: 10px;
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

  .network-config {
    overflow: hidden;
    width: 350px;
    line-height: 2.4;
    padding: 0;
    font-size: 12px;
  }

  .network-config .text {
    color: #5e6978;
  }

  .network-config .link {
    position: relative;
    float: right;
    color: #007fdf;
    text-decoration: none;
    cursor: pointer;
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

  .double-link {
    color: #409EFF;
    margin-top: 10px;
    display: inline-block;
  }

  .operation-row input.error-input {
    border-color: #ec5960;
  }

  .operation-row input {
    height: 40px;
    font-size: 14px;
    color: #333;
    width: 42%;
    border: 1px solid #dae0e6;
    padding: 5px 10px;
    border-radius: 2px;
  }

  .error {
    font-size: 12px;
    float: right;
    color: #ec5960;
    padding-top: 5px;
  }
</style>
