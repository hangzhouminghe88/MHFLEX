<template>
 <create-template>
   <!--模板头部-->
   <div slot="header" class="create-header">
     <span class="title">创建ecs云主机</span>
     <span class="create-back" @click="close()">
       <i class="el-icon-back"></i>
       <span class="text">回到华为云云主机列表</span>
     </span>
   </div>
   <!--模板主体部分-->
   <div slot="body" class="create-body">
     <!--选择添加方式-->
     <mh-input type="slot"
               :label="$t('vm.addType')">
         <el-radio-group v-model="addType">
           <el-radio :label="true">{{$t('common.single')}}</el-radio>
           <el-radio :label="false">{{$t('common.multiple')}}</el-radio>
         </el-radio-group>
     </mh-input>
     <!--名称-->
     <mh-input :label="$t('common.name')"
               :required="true"
               :show-error="emptyname"
               v-model="name"
               :error-message="rules.name.message"
               @validate="validate"
               prop="name"></mh-input>
     <!--数量-->
     <mh-input :label="$t('common.number')"
               :required="true"
               v-model="number"
               type="number"
               :show-error="emptynumber || invalidnumber"
               :error-message="rules.number.message"
               @validate="validate"
               v-if="!addType"
               props="number"></mh-input>
     <!--简介-->
     <mh-input :label="$t('common.description')"
               type="textarea"
               v-model="description"></mh-input>
      <!--镜像-->
     <mh-input :label="$t('common.image')"
               type="slot"
               :show-error="emptyimageUuid"
               :error-message="rules.imageUuid.message"
               helperName="hybirdHuaweiImage"
               :required="true">
       <add-or-delete-input :value="dbData.hybridHuaweiImage[imageUuid] && dbData.hybridHuaweiImage[imageUuid].name"
                            @open="openImageSelect()"
                            :class="{'is-error': emptyimageUuid}"
                            @remove="removeUuid('imageUuid')"/>
     </mh-input>
      <!--安全组-->
     <mh-input :label="$t('common.securityGroup')"
               :required="true"
               :show-error="emptysecurityGroupUuid"
               :error-message="rules.securityGroupUuid.message"
               helperName="ecs_HuaweisecurityGroup"
               type="slot">
       <add-or-delete-input :value="dbData.hybridHuaweiSecurityGroup[securityGroupUuid] && dbData.hybridHuaweiSecurityGroup[securityGroupUuid].name"
                            @open="openSecurityGroupSelect()"
                            :class="{'is-error': emptysecurityGroupUuid}"
                            @remove="removeUuid('securityGroupUuid')"/>
     </mh-input>
      <!--可用区-->
     <mh-input :label="$t('common.hybrididentityzone')"
               :required="true"
               :show-error="emptyhybridIdentityZoneUuid"
               :error-message="rules.hybridIdentityZoneUuid.message"
               helperName="ecs_huaweiidentityZone"
               type="slot">
       <add-or-delete-input :value="dbData.hybridHuaweiyunIdentityZone[hybridIdentityZoneUuid] && dbData.hybridHuaweiyunIdentityZone[hybridIdentityZoneUuid].name"
                            @open="openIdentityZoneSelect()"
                            :class="{'is-error': emptyhybridIdentityZoneUuid}"
                            @remove="removeUuid('hybridIdentityZoneUuid')"/>
     </mh-input>
      <!--子网-->
     <mh-input label="子网"
               :required="true"
               :show-error="emptysubNetUuid"
               :error-message="rules.subNetUuid.message"
               helperName="ecs_huaweiSubNets"
               type="slot">
       <add-or-delete-input :value="dbData.hybridHuaweiSubnets[subNetUuid] && dbData.hybridHuaweiSubnets[subNetUuid].name"
                            @open="opensubNetUuidSelect()"
                            :class="{'is-error': emptysubNetUuid}"
                            @remove="removeUuid('subNetUuid')"/>
     </mh-input>
      <!--计算规格-->
     <mh-input :label="$t('common.instanceOffering')"
               :required="true"
               :show-error="emptyinstanceOfferingUuid"
               :error-message="rules.instanceOfferingUuid.message"
               helperName="hybirdHuaweiInstanceOffering"
               type="slot">
       <add-or-delete-input :value="dbData.hybridHuaweiInstanceOffering[instanceOfferingUuid] && dbData.hybridHuaweiInstanceOffering[instanceOfferingUuid].name"
                            @open="openInstanceOfferingSelect()"
                            :class="{'is-error': emptyinstanceOfferingUuid}"
                            @remove="removeUuid('instanceOfferingUuid')"/>
     </mh-input>
        <!--私网Ip-->
     <mh-input :label="$t('common.privateNetwork') + 'Ip'"
               v-model="privateIp"
               :required="true"
               :error-message="rules.privateIp.message"
               :show-error="emptyprivateIp || invalidprivateIp"
               @validate="validate"
               prop="privateIp"></mh-input>
     <p class="text-hint">{{ cidr ? `CIDR: ${cidr}` : '' }}</p>
      <p
        class="text-hint"
      >{{availableIpAddressCount ? `${$t(`common.ipNumber`)}: ${availableIpAddressCount}` : '' }}</p>
        <!--公网Ip-->
     <mh-input :label="$t('common.publicNetworkIP')"
               type="select"
               v-model="publicNetworkIP"
               :select-group="publicNetworkIPGroup">
     </mh-input>
        <!--带宽-->
     <mh-input style="width: 240px;display: inline-block;"
               :label="'hybridecsinstance.ecsBandWidth'"
               v-if="publicNetworkIP"
               :required="true"
               v-model="ecsBandWidth"
               type="number"
               :show-error="emptyecsBandWidth || invalidecsBandWidth"
               :error-message="rules.ecsBandWidth.message"
               prop="ecsBandWidth"
               @validate="validate"
     />
     <div class="unit" v-if="publicNetworkIP">Mbps</div>
        <!--控制台密码-->
     <mh-input
       :label="'hybridecsinstance.ecsConsolePassword'"
       :required="true"
       :type="'password'"
       v-model="consolePassword"
       :show-error="emptyconsolePassword || invalidconsolePassword"
       :error-message="rules.consolePassword.message"
       :placeholder="$t('hybridecsinstance.ecsConsolePasswordInfo')"
       prop="consolePassword"
       helperName="hybirdConsolePassword"
       @validate="validate"
     />
        <!--系统用户密码-->
     <mh-input
       :label="'hybridecsinstance.ecsRootPassword'"
       :required="true"
       type="password"
       v-model="ecsRootPassword"
       :show-error="emptyecsRootPassword || invalidecsRootPassword"
       :error-message="rules.ecsRootPassword.message"
       :placeholder="$t('hybridecsinstance.ecsRootPasswordInfofortencent')"
       helperName="hybridHuaweiRootPassword"
       prop="ecsRootPassword"
       @validate="validate"
     />
   </div>
   <!--模板尾部-->
   <div slot="footer" class="create-footer">
     <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
     <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
   </div>
 </create-template>
</template>

<script>
    //创建模板
    import { huaweiAsync } from 'src/windows/asyncData/asyncData';
    import CreateTemplate from "src/component/CreateTemplate";
    import WindowBase from 'src/windows/Window';
    import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
    import Validator from "src/utils/validator";

    export default {
      name: "CreateHybridHuaweiEcsPage",
      mixins: [WindowBase],
      components: {AddOrDeleteInput, CreateTemplate},
      data() {
        //初始化
        return {
          addType: true,
          imageUuid: '',
          description: '',
          securityGroupUuid: '',
          hybridIdentityZoneUuid: '',
          subNetUuid: '',
          instanceOfferingUuid: '',
          number: 1,
          availableIpAddressCount: '',
          publicNetworkIP: false,
          privateIp: '',
          cidr: '',
          ecsBandWidth: 1,
          consolePassword: '',
          ecsRootPassword: '',
          emptyname: false,
          emptyimageUuid: false,
          emptysecurityGroupUuid: false,
          emptyhybridIdentityZoneUuid: false,
          emptysubNetUuid: false,
          emptyinstanceOfferingUuid: false,
          emptynumber: false,
          invalidnumber: false,
          emptypublicNetworkIP: false,
          emptyecsBandWidth: false,
          invalidecsBandWidth: false,
          emptyconsolePassword: false,
          invalidconsolePassword: false,
          invalidecsRootPassword: false,
          emptyecsRootPassword: false,
          emptyprivateIp: false,
          invalidprivateIp: false,
          publicNetworkIPGroup: [
            {
              label: '不分配',
              value: false
            },
            {
              label: '分配',
              value: true
            }
          ],
          name: '',
          rules: {
            name: {message: ''},
            imageUuid: {message: ''},
            securityGroupUuid: {message: ''},
            hybridIdentityZoneUuid: {message: ''},
            subNetUuid: {message: ''},
            instanceOfferingUuid: {message: ''},
            number: {message: ''},
            publicNetworkIP: {message: ''},
            ecsBandWidth: {message: ''},
            consolePassword: {message: ''},
            ecsRootPassword: {message: ''},
            privateIp: {message: ''}
          }
        }
      },
      mounted() {
        let _this  = this;
        //帮助操作、如果没有可用区或者地域将无法操作
        huaweiAsync(_this);
      },
      methods: {
        ...Validator,
        //返回到华为云云主机列表
        close() {
          let self = this;
          self.$router.push({name: 'hybridhuaweiecs'})
        },
        //选择镜像
        openImageSelect() {
          let self = this;
          self.openDialog('HybridHuaweiImageSingleSelect', {
            conditions: [],
            ok: (uuid) => {
              let self = this;
              self.imageUuid = uuid;
              self.validate('imageUuid');
            }
          })
        },
        //移除镜像
        removeUuid(uuid) {
          let self = this;
          self[uuid] = "";
          self.validate(uuid);
        },
        //校验
        validate(name) {
          let self = this, input = '', errorMsg = '';
          input = name === 'name' ? String(self[name]).trim() : self[name];
          self[`empty${name}`] = false;
          self[`invalid${name}`] = false;
          switch (name) {
            case "imageUuid":
              errorMsg = self.$t("common.image");
              break;
            case "ecsSecurityGroupUuid":
              errorMsg = self.$t("common.securitygroup");
              break;
            case "hybridIdentityZoneUuid":
              errorMsg = self.$t("common.hybrididentityzone");
              break;
            case "instanceOfferingUuid":
              errorMsg = self.$t("common.instanceoffering");
              break;
            case "subNetUuid":
              errorMsg = "子网";
              break;
            case "name":
              errorMsg = self.$t("common.name");
              break;
            case "number":
              errorMsg = self.$t("common.number");
              break;
            case "consolePassword":
              errorMsg = self.$t("hybridecsinstance.ecsConsolePassword");
              break;
            case "ecsRootPassword":
              errorMsg = self.$t("hybridecsinstance.ecsRootPassword");
              break;
            case "ecsBandWidth":
              errorMsg = self.$t("hybridecsinstance.ecsBandWidth");
              break;
            case "privateIp":
              errorMsg = self.$t("common.privateNetwork");
              break;
          }
          if(!input) {
            self[`empty${name}`] = true;
            self.rules[name].message = self.$t('error.emptyInput') + errorMsg;
            return ;
          }
          if (name === "privateIp" && !this.isIP(input)) {
            self[`invalid${name}`] = true;
            self.rules[name].message = self.$t("error.invalid") + errorMsg;
            return;
          }
          if (name === "consolePassword" && !this.isEcsPassword(input)) {
            self[`invalid${name}`] = true;
            self.rules[name].message = self.$t("error.invalid") + errorMsg;
            return;
          }
          if (name === "ecsRootPassword" && !this.isEcsRootPassword(input)) {
            self[`invalid${name}`] = true;
            self.rules[name].message = self.$t("error.invalid") + errorMsg;
            return;
          }
          if (name === "name" && !this.isEcsInstanceName(input)) {
            self[`invalid${name}`] = true;
            self.rules[name].message = self.$t("error.invalid") + errorMsg;
            return;
          }
          let range = {
            maxValue: 200,
            minValue: 1
          };
          if (this.publicNetworkIP) {
            if (name === "ecsBandWidth") {
              if (!this.isIn(input, range)) {
                self[`invalid${name}`] = true;
                self.rules[name].message = self.$t("error.invalid") + errorMsg;
                return;
              }
            }
          }
        },
        //整体校验
        validateAll() {
          let self = this,
            props = [
              "name",
              "ecsBandWidth",
              "instanceOfferingUuid",
              "number",
              "imageUuid",
              "hybridIdentityZoneUuid",
              "securityGroupUuid",
              "privateIp",
              "subNetUuid",
              "ecsRootPassword",
              "consolePassword"
            ];
          props.forEach(name => {
            self.validate(name);
          });
          let invalid = props.some(
            name => self[`empty${name}`] === true || self[`invalid${name}`] === true
          );
          return invalid;
        },
        //选择子网
        opensubNetUuidSelect() {
           let self = this;
           self.validate('hybridIdentityZoneUuid');
           if(!self.hybridIdentityZoneUuid) return;
           //选择子网
           let hybridHuaweiSecurityGroup = _.cloneDeep(self.dbData.hybridHuaweiSecurityGroup[self.securityGroupUuid])
           self.openDialog('HybridHuaweiSubNetSelect', {
              conditions: [`ecsVpcId=${hybridHuaweiSecurityGroup.ecsVpcUuid}`],
              select: () => {
                 self.selectSubNets(uuid)
              }
           })
        },
        //选择子网初始化私网Ip
        selectSubNets(uuid) {
            let self = this
            self.subNetUuid = uuid;
            self.initPrivateIpAddress()
        },
        //初始化Ip
         initPrivateIpAddress () {
            let cidr = this.dbData.hybridHuaweiSubNets[this.subNetUuid].cidr
            let availableIpAddressCount = this.dbData.hybridHuaweiSubNets[this.subNetUuid].availableIpAddressCount
            self.cidr = cidr;
            self.availableIpAddressCount = availableIpAddressCount;
          },
        //选择计算规格
        openInstanceOfferingSelect() {
           let self = this;
           self.validate('subNetUuid');
           if(!self.subNetUuid) return;
           self.openDialog('', {
             conditions: [],
             ok: () => {

             }
           })
        },
        //选择安全组
        openSecurityGroupSelect() {
          let self = this;
          self.validate('imageUuid');
          if(!self.imageUuid) return;
          self.openDialog('HybridHuaweiSecurityGroupSingleSelect', {
            conditions: [],
            ok: (uuid) => {
              let self = this;
              self.securityGroupUuid = uuid;
              self.validate('securityGroupUuid');
            }
          })
        },
        //选择可用区
        openIdentityZoneSelect() {
          let self = this;
          self.validate('securityGroupUuid');
          if(!self.securityGroupUuid) return;
          self.openDialog('HybridHuaweiIdentityZoneSingleSelect', {
            conditions: [],
            ok: (uuid) => {
               self.hybridIdentityZoneUuid = uuid;
               self.validate('hybridIdentityZoneUuid');
            }
          })
        },
        //创建
        confirm() {
          let self = this;
          if (self.validateAll()) return;
          self.canCreate = false;
          self
            .create(self.createParam(), parseInt(self.number))
            .then(() => {
              self.close();
            })
            .catch(() => {
              self.canCreate = true;
            });
        },
      },
      destroyed() {
        let _this = this;
        _this.deleteAllAssistant();
      }
    }
</script>

<style scoped>
  .text-hint {
    line-height: 20px;
    position: relative;
    text-decoration: none;
    font-size: 12px;
    color: #5e6978;
    text-align: right;
    width: 300px;
  }
  .unit{
    display: inline-block;
    width: 60px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    border: 1px solid #dae0e6;
  }
</style>
