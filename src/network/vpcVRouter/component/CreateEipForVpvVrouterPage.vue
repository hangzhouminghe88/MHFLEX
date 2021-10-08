<template>
  <div>
    <create-template-no-route>
      <div slot="header">
        <span> {{$t("common.createEip")}}</span>
        <span class="create-back" @click="$emit('close')">
          <i class="el-icon-back"></i>
          <span style="font-size: 12px;">返回</span>
        </span>
      </div>

      <div slot="body" class="create-body">
        <div v-show="step === 0">
          <div class="operation-row">
            <div class="title required">{{$t('common.name')}}</div>
            <input type="text" maxlength="255" v-model="name"
                   :class="{'is-error': emptyname || invalidname}"
                   @blur="validate('name')"/>
            <div class="error error-text" v-if="emptyname && !invalidname">
              {{$t('error.emptyInput') + $t('common.name')}}
            </div>
            <div class="error error-text" v-if="!emptyname && invalidname">
              {{$t('error.invalid') + $t('common.name')}}
            </div>
          </div>
          <div class="operation-row">
            <div class="title">{{$t('common.description')}}</div>
            <textarea v-model="description" rows="3"/>
          </div>
          <div class="operation-row"></div>
          <div class="operation-row">
            <div class="title">{{$t("portforwarding.selectVip")}}</div>
          </div>
          <hr style="border: 0.5px solid #dae0e6;width: 300px;display: inline-block;"/>
          <div class="operation-row">
            <div class="title">{{$t("portforwarding.vipMethod")}}</div>
            <el-radio-group v-model="createType">
              <el-radio :label="true">{{ $t("portforwarding.createNewVip") }}</el-radio>
              <el-radio :label="false">{{ $t("portforwarding.useExistingVip") }}</el-radio>
            </el-radio-group>
          </div>
          <div class="operation-row" v-if="createType">
            <div class="title required">
              {{$t('common.network')}}
            </div>
            <add-or-delete-input :value="dbData.l3network[l3networkUuid] && dbData.l3network[l3networkUuid].name"
                                 @open="openL3NetworkSelect" @remove="removeUuid('l3networkUuid')"
                                 :class="{'is-error': emptyl3networkUuid}"/>
            <div class="error error-text" v-if="emptyl3networkUuid">
              {{$t('error.unselected') + $t('common.network')}}
            </div>
          </div>
          <div class="operation-row" v-if="createType">
            <div class="title">{{$t("vip.requiredIP")}}</div>
            <input type="text" v-model="ip" :class="{'is-error': invalidip}"
                   @blur="validate('ip')"
                   list="windowData.requiredIPList"/>
            <datalist id="windowData.requiredIPList">
              <option v-for="requiredIp in windowData.requiredIPList" :value="requiredIp">
                {{requiredIp}}
              </option>
            </datalist>
            <div class="error error-text" v-if="createType && ip && invalidip">
              {{$t('error.invalid')+$t('vip.requiredIP')}}
            </div>
          </div>
          <div class="operation-row" v-if="!createType">
            <div class="title required"> {{ $t("common.vip") }}</div>
            <add-or-delete-input :value="dbData.vip[vipUuid] && dbData.vip[vipUuid].name" @open="openVipSelect"
                                 @remove="removeUuid('vipUuid')"
                                 :class="{'is-error': emptyvipUuid}"/>
            <div class="error error-text" v-show="emptyvipUuid">{{$t('error.unselected') + $t("common.vip")}}</div>
          </div>
        </div>
        <div v-show="step === 1">
          <div class="operation-row">
            <div class="title required">
              {{$t('common.vm')}}
            </div>
            <add-or-delete-input :value="getVMNicName()"
                                 :class="{'is-error':emptyvmUuid}"
                                 @remove="removeUuid('vmUuid')"
                                 @open="openVmNicSelect"/>
            <div class="error error-text" v-if="emptyvmUuid">
              {{$t('error.unselected') + $t('common.vm')}}
            </div>
          </div>
        </div>
      </div>


      <div slot="footer" class="create-footer">
        <span class="btn-confirm" v-if="step === 0" @click="canCreate && next()"
              :class="{'disabled': !canCreate}">{{$t('common.nextStep')}}</span>
        <span class="btn-confirm" v-if="step === 1">{{$t('common.prevStep')}}</span>
        <span class="btn-confirm"  v-if="step === 1" @click="canCreate && confirm()"
              :class="{'disabled': !canCreate}">{{$t('common.confirm')}}</span>
        <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
      </div>
    </create-template-no-route>
    <div style="position: absolute;
    width: calc(100% - 370px);
    top: 0px;
    height: 100%;
    left: 370px;
    "  v-if="showAttachNic">
      <eip-attachable-vm-nics-single-select-list style="box-shadow: -1px 1px #eee;" v-if="showAttachNic" :param="attachEiptoVmParam" @close="showAttachNic = false"></eip-attachable-vm-nics-single-select-list>
    </div>
  </div>
</template>

<script>
    import CreateTemplateNoRoute from "src/component/CreateTemplateNoRoute";
    import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
    import { getApiPermission } from "src/utils/utils";
    import WindowBase from 'src/windows/Window';
    import Validator from 'src/utils/validator';
    import rpc from 'src/utils/rpc';
    import EipAttachableVmNicsSingleSelectList from "../../eip/component/EipAttachableVmNicsSingleSelectList";

    export default {

      name: "CreateEipForVpvVrouterPage",

      components: {
        EipAttachableVmNicsSingleSelectList,
        AddOrDeleteInput, CreateTemplateNoRoute
      },

      props: {
        param: {
          type: Object,
          default: () => {
            return {}
          }
        }
      },

      mixins: [WindowBase],

      data() {
        return {
          canCreate: true,
          name: '',
          emptyname: false,
          invalidname: false,
          description: '',
          l3networkUuid: '',
          emptyl3networkUuid: false,
          createType: true,
          ip: '',
          invalidip: false,
          requiredIPList: [],
          vipUuid: '',
          emptyvipUuid: false,
          step: 0,
          emptyvmUuid: false,
          vmUuid: '',
          showAttachNic: false,
          attachEiptoVmParam: {},
          nicIpUuid: '',
          eipUuid: ''
        }
      },

      created() {
        if (!getApiPermission('VIP.CREATE', this)) {
          this.createType = false
        }
        this.updateWindow({
          zoneUuid: window.localStorage.getItem('currZoneUuid')
        }).then(() => {
          //this.queryForAssistant()
          this.queryL3network()
          this.queryVip()
        })
      },

      methods: {
        ...Validator,
        //确定添加
        confirm() {
          let self = this;
          self.validate('vmUuid')
          if (!this.nicIpUuid) {
            return
          }
          self.canCreate = false;
          this.attachEip(this.eipUuid, this.nicIpUuid, this.vmUuid)
            .then(() => {
              this.$emit('close')
            }).catch(() => {
              self.canCreate = true;
          })
        },
        //绑定Eip
        attachEip: function (uuid, vmNicIPUuid, vmNicUuid) {
          const self = this
          let event = self.createEvent('eip.action.attach', self.dbData.eip[uuid].name)
          return rpc.post(`eips/${uuid}/vm-instances/nics/${vmNicUuid}`, {
            params: {
              usedIpUuid: vmNicIPUuid
            }
          }, event)
            .then((resp) => {
              let eip = resp.inventory
              rpc.query('vm-instances', {
                q: `vmNics.uuid?=${vmNicUuid}`
              }).then((result) => {
                if (result.inventories.length > 0) {
                  eip.vmInstanceUuid = result.inventories[0].uuid
                  eip.vmInstanceName = result.inventories[0].name
                }
                self.updateDbRow({
                  tableName: 'eip',
                  id: uuid,
                  data: eip
                })
              })
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
        },

        //单个校验表单
        validate(name) {
          let self = this, input = '';
          input = name === 'name' ? String(self[name]).trim() : self[name];
          self[`empty${name}`] = false;
          self[`invalid${name}`] = false;
          if(!input) {
            self[`empty${name}`] = true;
            return;
          }
          if(name === 'name') {
            if(!/^[a-zA-z]/.test(input)) {
              self[`invalid${name}`] = true;
              return;
            }
          }
          if(name === 'ip' && self.ip) {
            if(!this.isIP(input)) {
              self[`invalid${name}`] = true;
              return;
            }
          }
        },
        //删除添加uuid
        removeUuid(uuid) {
          let self = this;
          self[uuid] = '';
          self.validate(uuid);
        },
        //选择网络
        openL3NetworkSelect() {
          const self = this
          let l3networkUuidList = []
          let taskList = []
          let vpcVRouterUuid = this.param.vpcVRouterUuid
          let p = rpc.query('l3-networks', {
            q: ['l2Network.cluster.type!=vmware', 'category=Public', `vmNic.vmInstanceUuid=${vpcVRouterUuid}`]
          }).then((resp) => {
            l3networkUuidList = l3networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)

          p = rpc.query('l3-networks', {
            q: ['networkServices.serviceProvider.type=Flat', 'system=false', 'networkServices.networkServiceType=Eip', 'category=Private', `vmNic.vmInstanceUuid=${vpcVRouterUuid}`]
          }).then((resp) => {
            l3networkUuidList = l3networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)
          Promise.all(taskList).then(() => {
            self.openDialog('L3NetworkSingleSelectListDlg', {
              conditions: [`uuid?=${l3networkUuidList.join()}`],
              select: (uuid) => self.selectNetwork(uuid)
            })
          })
        },
        //选择三层网络
        selectNetwork(uuid) {
          let self = this;
          self.l3networkUuid = uuid;
          self.getfreeIp(uuid);
          self.validate('l3networkUuid');
        },
        //初始化查询三层网络
        queryL3network: function () {
          rpc.query('l3-networks', {
            q: [`zoneUuid=${this.windowData.zoneUuid}`, 'category=Public']
          }).then((resp) => {
            this.updateDbTable({
              tableName: 'l3network',
              list: resp.inventories
            })
            if (resp.inventories.length === 1) {
              this.l3networkUuid = resp.inventories[0].uuid;
              this.getfreeIp(resp.inventories[0].uuid)
            }
          })
        },
        //查询虚拟网络
        queryVip: function () {
          rpc.query('vips')
            .then((resp) => {
              this.updateDbTable({
                tableName: 'vip',
                list: resp.inventories
              })
              let vipUuidList = []
              resp.inventories.forEach((item) => {
                if (item.useFor === undefined) {
                  vipUuidList.push(item)
                }
              })
              if (vipUuidList.length === 1) {
                this.updateWindow({ vipUuid: vipUuidList[0].uuid })
              }
            })
        },
        //获得ip
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
              this.updateWindow({ requiredIPList })
            })
        },

        openVipSelect() {
          let self = this;
          self.openDialog('VipSingleSelectListDlg', {
            conditions: ['useFor%20is%20null'],
            selectedByEip: true,
            select: (uuid) => self.selectVip(uuid)
          })
        },

        selectVip(uuid) {
          let self = this;
          self.vipUuid = uuid;
          self.validate('vipUuid');
        },

        //整体校验
        validateAll() {
          let self = this, props = ['name'];
          if(self.createType) {
            props.push('l3networkUuid');
            if(self.ip) {
              props.push('ip');
            }
          }else{
            props.push('vpcUuid');
          }
          props.forEach((name) => self.validate(name));
          let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
          return invalid;
        },
        //添加Eip条件
        createParam() {
          let self = this;
          return {
            name: self.name,
            description: self.description,
            vipUuid: self.vipUuid,
            requiredIp: self.ip,
            l3NetworkUuid: self.l3networkUuid,
            ipMode: self.createType
          }
        },

        next() {
          let self = this;
          if (self.validateAll()) return
          self.param.ok(self.createParam())
            .then((uuid) => {
              self.eipUuid = uuid;
              if (uuid) {
                self.step ++;
              }
            })
        },

        openVmNicSelect() {
          let self = this;
          self.attachEiptoVmParam = {
            eipUuid: self.eipUuid,
            ok: (nicIpUuid, vmUuid) => {
              self.selectedVmNic(nicIpUuid, vmUuid)
            }
          }
          self.showAttachNic = true;
        },

        selectedVmNic(nicIpUuid, vmUuid) {
          let self = this;
          self.vmUuid = vmUuid;
          self.nicIpUuid = nicIpUuid;
          self.validate('vmUuid')
        },

        getVMNicName: function () {
          if (this.nicIpUuid && this.vmUuid) {
            return `${this.dbData.vmNicRefs[this.vmUuid].internalName}(${this.dbData.ip[this.nicIpUuid].ip})`
          } else return ''
        },
      }
    }
</script>

<style scoped>

</style>
