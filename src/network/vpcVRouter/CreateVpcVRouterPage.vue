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
    max-width: 400px;
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
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("vpcVRouter.create")}}
        </span>
      <span class="create-back" @click="$router.push('vpcvrouter')"><i class="el-icon-back"></i>回到VPC路由器列表</span>
    </div>
    <div slot="body" class="create-body">
      <el-form label-position="left" ref="form" :model="windowData" :rules="formRules">
        <el-form-item :label="$t('common.name')" label-width="100px" prop="name">
          <el-input placeholder="请输入名称" style="width:300px;" v-model="windowData.name"/>
        </el-form-item>
        <el-form-item :label="$t('common.introduction')" label-width="100px" prop="introduction">
          <el-input type="textarea" style="width:300px;" :autosize="{ minRows: 3, maxRows: 4}"
                    v-model="windowData.description"/>
        </el-form-item>

        <div class="operation-row" style="width: 403px">
          <el-form-item :label="$t('common.virtualRouterOffering')" label-width="100px" prop="virtualRouterOfferingUuid">
            <div v-if="windowData.virtualRouterOfferingUuid.length > 0">
              <add-or-delete-input
                :value="dbData.instanceOffering[windowData.virtualRouterOfferingUuid] && dbData.instanceOffering[windowData.virtualRouterOfferingUuid].name"
                @remove="removeVirtualRouterOffering()"></add-or-delete-input>
            </div>
            <div class="content" @click="openVirtualRouterOfferingSelect();"
                 v-if="windowData.virtualRouterOfferingUuid=== ''">
              <div class="add"></div>
            </div>
          </el-form-item>
        </div>

        <el-form-item label="DNS" label-width="100px" prop="dns">
          <el-input placeholder="223.5.5.5" style="width:300px;" v-model="windowData.dns"/>
        </el-form-item>

      </el-form>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('vpcvrouter')">{{$t('common.cancel')}}</span>
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
    name: "CreateVpcVRouterPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddOrDeleteInput,
      CreateTemplate
    },
    data() {
      let validateDns = (rules, val, callback) => {
        if(val) {
          if(!this.isIP(val)) {
            callback('格式错误')
          }else {
            callback()
          }
        }else {
          callback()
        }
      }
      return {
        canCreate: true,
        formRules: {
          name: [
            {required: true, message: '名称不能为空', trigger: 'blur'}
          ],
          dns: [{message: '格式错误', trigger: 'blur', validator: validateDns}]
        }
      }
    },
    computed: {},
    created() {
      this.deleteAllAssistant()
      this.updateWindow({
        name: '',
        dns: '',
        description: '',
        virtualRouterOfferingUuid: '',
        zoneUuid: window.localStorage.getItem('currZoneUuid')
      })
      this.initVirtualRouterInstanceOffering()
      this.queryForAssistant()
    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Validator,
      removeVirtualRouterOffering() {
        this.updateWindow({
          virtualRouterOfferingUuid: ''
        })
      },
      queryForAssistant() {
        let self = this
        let zoneUuid = `zone.uuid=${localStorage.getItem('currZoneUuid')}`
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          let hide
          let content = `lackOf${resourceName}`
          if (!self.dbData.common.isAdmin) {
            hide = true
            content = 'lackOfVirtualRouterOfferingContactAdmin'
          }
          self.createAssistant({
            id,
            hide,
            operation,
            title: 'vpcRouterTitle',
            ownerId: self.windowData.id,
            content,
            handler: () => {
              this.$router.push({name: 'createvirtualrouteroffering'})
            }
          })
        }
        rpc.query('instance-offerings/virtual-routers', {count: true, q: [zoneUuid]})
          .then(resp => {
            if (resp.total === 0) newAssistant('VirtualRouterOffering', 'create')
          })
      },
      ...Validator,
      createParam: function () {
        return {
          name: this.windowData.name,
          description: this.windowData.description,
          dns: this.windowData.dns,
          virtualRouterOfferingUuid: this.windowData.virtualRouterOfferingUuid
        }
      },
      validate(name) {
        let obj = {}
        obj[`empty${name}`] = false
        let windowData = this.windowData
        let propToBeTrimed = ['name', 'virtualRouterOfferingUuid']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        if (name === 'dns' && !this.isIP(input)) {
          obj[`invalid${name}`] = true
        }
        if (name === 'name' && !this.isValidName(input)) {
          obj[`invalid${name}`] = true
        }
        this.updateWindow(obj)
      },
      initVirtualRouterInstanceOffering: function () {
        const self = this
        let instanceOfferingInventories
        rpc.query('instance-offerings/virtual-routers', {
          q: ['state=Enabled', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'image.format!=vmtx']
        }).then((resp) => {
          instanceOfferingInventories = resp.inventories
          return self.updateDbTable({
            tableName: 'instanceOffering',
            list: resp.inventories
          })
        }).then(() => {
          if (instanceOfferingInventories.length === 1) {
            self.updateWindow({virtualRouterOfferingUuid: instanceOfferingInventories[0].uuid})
          }
        })
      },
      openVirtualRouterOfferingSelect: function () {
        const self = this

        this.openDialog('VirtualRouterInstanceOfferingListSingleSelectDlg', {
          conditions: ['state=Enabled', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'image.format!=vmtx'],
          ok: (uuid) => {
            self.selectVRO(uuid)
          }
        })

      },
      selectVRO: function (uuid) {
        return this.updateWindow({virtualRouterOfferingUuid: uuid})
          .then(() => this.validate('virtualRouterOfferingUuid'))
      },
      removeVirtualRouterOffering: function () {
        this.updateWindow({virtualRouterOfferingUuid: ''})
      },
      ok: function () {
        this.$refs.form.validate((valid) => {
          debugger
          if (!valid) return
          this.canCreate = false;
          this.create(this.createParam())
            .then( () => {
              this.$router.push({name: 'vpcvrouter'})
            }).catch(() => {
            this.canCreate = true;
          })
        })
      }
    }
  }
</script>
