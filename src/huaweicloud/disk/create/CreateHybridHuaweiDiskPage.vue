<template>
  <create-template>
    <div slot="header" class="create-header">
      <span class="create-title">创建华为云云盘</span>
      <span class="el-icon-back create-back" @click="close()">回到华为云云盘列表</span>
    </div>
    <div slot="body">
      <!--选择可用区-->
      <mh-input :label="$t('common.hybrididentityzone')"
                :required="true"
                type="slot"
                :show-error="emptyidentityzoneUuid"
                :error-message="rules.identityzoneUuid.message">
        <add-or-delete-input :value="dbData.hybridHuaweiyunIdentityZone[identityzoneUuid] && dbData.hybridHuaweiyunIdentityZone[identityzoneUuid].zoneName"
                             @open="openIdentityZoneSelect()"
                             @remove="removeUuid('identityzoneUuid')"
                             :class="{'is-error': emptyidentityzoneUuid}"/>
      </mh-input>
      <!--磁盘名称-->
      <mh-input :label="$t('common.name')"
                :show-error="emptyname || invalidname"
                :required="true"
                @validate="validate"
                prop="name"
                v-model="name"
                :error-message="rules.name.message"/>
      <!--描述-->
      <mh-input type="textarea"
                :label="$t('common.description')"
                v-model="description"/>
      <!--大小-->
      <mh-input :label="$t('common.size')"
                type="add"
                :show-error="emptysize || invalidsize"
                :error-message="rules.size.message"
                :required="true"
                @validate="validate"
                prop="size">
        <input v-model="size" type="number" :class="{'is-error': emptysize || invalidsize}" class="size"
               placeholder="1~32768"
               @blur="validate('size')"/>
        <span class="unit">G</span>
      </mh-input>
      <!--种类-->
      <mh-input label="云盘种类"
                type="add">
        <el-radio-group v-model="diskCategory">
          <el-radio label="SATA" style="margin-right: 20px;">{{ $t("hybridAliyunDisk.cloud_efficiency") }}</el-radio>
          <el-radio label="SAS" style="margin-right: 20px;">高性能云盘</el-radio>
          <el-radio label="SSD">{{ $t("hybridAliyunDisk.cloud_ssd") }}</el-radio>
        </el-radio-group>
      </mh-input>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm"
            :class="{'disabled': !canCreate}"
            @click="canCreate && confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
    import rpc from'src/utils/rpc';
    import WindowBase from 'src/windows/Window';
    import { genUniqueId } from 'src/utils/utils';
    import CreateTemplate from 'src/component/CreateTemplate';
    import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
    import Methods from '../Methods';

    export default {
      name: "CreateHybridHuaweiDiskPage",
      mixins: [WindowBase],
      components: {
        AddOrDeleteInput,
        CreateTemplate
      },
      data() {
        //初始化数据
        return {
          name: '',
          description: '',
          identityzoneUuid: '',
          canCreate: true,
          size: '20',
          diskCategory: 'SATA',
          emptyname: false,
          invalidname: false,
          emptyidentityzoneUuid: false,
          emptysize: false,
          invalidsize: false,
          rules: {
            name: {message: ''},
            identityzoneUuid: {message: ''},
            size: {message: ''}
          }
        }
      },
      mounted() {
        let self = this;
        //查询是否有可用区
        self.queryHuaweiForAssistant();
      },
      methods: {
        ...{
          create: Methods.methods.create
        },
        //校验表单
        validate(name) {
          let self = this, input = '';
          input = self[name];
          self[`empty${name}`] = false;
          if(/^\s*$/.test(input) || /\s/.test(input)) {
            self[`empty${name}`] = true;
            self.rules[name].message = name === 'identityzoneUuid' ? self.$t('error.emptyInput') + self.$t(`common.hybrididentityzone`) : self.$t('error.emptyInput') + self.$t(`common.${name}`)
          }
          self[`invalid${name}`] = false;
          if(name === 'size' && /[^\d]/.test(input)) {
            self[`invalid${name}`] = true;
            self.rules[name].message = self.$t('error.invalid') + self.$t(`common.${name}`)
          }
        },
        //返回到列表
        close() {
          let self = this;
          self.$router.push({name:  'hybridhuaweidisk'})
        },
        //移除uuid
        removeUuid(uuid) {
          let self = this;
          self[uuid] = '';
          self.validate(uuid);
        },
        //打开可用区选择可用区
        openIdentityZoneSelect() {
          let self = this;
          self.openDialog('HybridHuaweiIdentityZoneSingleSelect', {
            conditions: [],
            select: (uuid) => {
              self.identityzoneUuid = uuid;
              self.validate('identityzoneUuid');
            }
          })
        },
        //帮助
        queryHuaweiForAssistant () {
          let self = this
          let newAssistant = (resourceName, operation) => {
            let id = `assistant-${genUniqueId()}`
            let content = `lackOf${resourceName}`
            let hide
            let handler = () => {
              if(operation === 'add' && resourceName === "HybridHuaweiyunKeySecret") {
                this.$router.push({name: 'createHybridHuaweiDataCenter'})
              }
              self.createAssistant({
                id,
                hide: false,
                title: 'hybridDiskTitle',
                ownerId: self.windowData.id,
                content: `lackOf${resourceName}`,
                operation,
              })
            }
            rpc.query('/brid/identity-zone', {count: true}).then(resp => {
              if (resp.total === 0) {
                newAssistant('HuaweiIdentityZone', 'add')
              }
            })
          }
        },
        //创建云盘参数
        createParam() {
          return {
              name: this.name,
              description: this.description === '' ? undefined : this.description,
              identityUuid: this.identityzoneUuid,
              diskCategory: this.diskCategory,
              size: this.size,
          }
        },
        //整体校验
        validateAll() {
          let self = this, props = ['name', 'identityzoneUuid', 'size'];
          props.forEach(name => self.validate(name));
          let invalid = props.some(name => self[`empty${name}`] === true || self[`invalid${name}`] === true);
          return invalid;
        },
        //点击确定添加
        confirm() {
          let self = this;
          if(self.validateAll()) return;
          self.canCreate = false;
          self.create(self.createParam())
            .then(() => {
              self.close();
            })
            .catch(() => {
              self.canCreate = true;
            })
        }
      }
    }
</script>

<style scoped>
  .size{
    width: 60%;
    display: inline-block;
  }
  .unit{
    display: inline-block;
    width: 30%;
    height: 40px;
    line-height: 40px;
    border: 1px solid #adb0b8;
    margin-left: -1px;
    text-align: center;
  }
</style>
