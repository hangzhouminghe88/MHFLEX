<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('hybridAliyunDisk.create')}}</span>
      <span class="create-back" @click="close()">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px">
          回到腾讯云云盘列表
        </span>
      </span>
    </div>

    <div slot="body" class="detail-body">
      <mh-input :label="'hybrididentityzone.identityzone'"
                type="add"
                :required="true"
                prop="izoneUuid">
        <add-or-delete-input :value="dbData.hybridTencentIdentityZone[izoneUuid] && dbData.hybridTencentIdentityZone[izoneUuid].zoneName"
                             @open="openIdentityZoneSelect"
                             :class="{'is-error': emptyizoneUuid}"
                             @remove="removeUuid('izoneUuid')"/>
      </mh-input>

      <mh-input :label="$t('common.name')"
                :helper-name="'hybridVolumeName'"
                :required="true"
                type="text"
                v-model="name"
                :error-message="rules.name.message"
                :show-error="emptyname || invalidname"
                @validate="validate"
                prop="name"/>

      <mh-input :label="$t('common.description')"
                type="textarea"
                v-model="description"
                prop="description"/>

      <mh-input :label="$t('common.size')"
                type="add"
                :show-error="emptysize || invalidsize"
                :error-message="rules.size.message"
                :required="true"
                @validate="validate"
                prop="size">
        <input v-model="size" type="number" :class="{'is-error': emptysize || invalidsize}" class="size"
               placeholder="20~32768"
               @blur="validate('size')"/>
        <span class="unit">G</span>
      </mh-input>

      <mh-input :label="$t('common.size')"
                type="add">
        <el-radio-group v-model="diskCategory">
          <el-radio label="CLOUD_BASIC" style="margin-right: 20px;">{{ $t("hybridAliyunDisk.cloud_efficiency") }}</el-radio>
          <el-radio label="CLOUD_PREMIUM" style="margin-right: 20px;">高性能云盘</el-radio>
          <el-radio label="CLOUD_SSD">{{ $t("hybridAliyunDisk.cloud_ssd") }}</el-radio>
        </el-radio-group>
      </mh-input>
    </div>

    <div slot="footer" class="create-footer">
       <span class="btn-confirm"
             :class="{'disabled': !canCreate}"
             @click="canCreate && confirm()">
         {{$t('common.confirm')}}
       </span>
       <span class="btn-cancel" @click="close()">
         {{$t('common.cancel')}}
       </span>
    </div>
  </create-template>
</template>

<script>
  import AddOrDeleteInput from "src/component/AddOrDeleteInput";
  import CreateTemplate from "src/component/CreateTemplate";
  import WindowBase from 'src/windows/Window';
  import Methods from '../Methods';

  export default {
    name: "CreateHybridTencentDiskPage",

    mixins: [WindowBase],

    components: {AddOrDeleteInput, CreateTemplate},

    data() {
      return {
        name: '',
        description: '',
        emptyname: false,
        invalidname: false,
        emptysize: false,
        invalidsize: false,
        size: '',
        izoneUuid: '',
        diskCategory: 'CLOUD_BASIC',
        emptyizoneUuid: false,
        canCreate: true,
        rules: {
          name: {message: ''},
          size: {message: ''},
          izoneUuid: {message: ''}
        }
      }
    },

    methods: {
      ...{
        create:  Methods.methods.create
      },
      close() {
        this.$router.push({name: 'hybridtencentdisk'})
      },

      validate(name) {
        let self = this, input = '';
        input = name === 'name' ? String(self[name]).trim() : self[name];
        self.rules[name].message = '';
        self[`empty${name}`] = false;
        self[`invalid${name}`] = false;
        if(!input) {
          self[`empty${name}`] = true;
          self.rules[name].message = self.$t('error.emptyInput') + self.$t(`common.${name}`);
          return;
        }
        if(name=== 'name') {
          if(!/^[a-zA-Z\u4e00-\u9fa5][0-9a-zA-Z\-_\u4e00-\u9fa5]{2,128}$/.test(input) || /^((http|https):\/\/)/.test(input.toUpperCase())) {
            self.rules[name].message = self.$t('error.invalid') + self.$t(`common.${name}`);
            self[`invalid${name}`] = true;
          }
        }
      },
      //选择腾讯云可用区
      openIdentityZoneSelect() {
        let self = this;
        self.openDialog('HybridTencentIdentityZoneSelect', {
          conditions: [],
          select: (uuid) => {
            self.izoneUuid = uuid;
            self.validate('izoneUuid');
          }
        })
      },
      //移除可用区
      removeUuid(uuid) {
        this[uuid] = '';
        this.validate(uuid);
      },
      //整体校验
      validateAll() {
        let self = this, props = ['name', 'izoneUuid', 'size'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true || self[`invalid${name}`] === true);
        return invalid;
      },
      createParam() {
        return {
          identityUuid: this.izoneUuid,
          name: this.name,
          sizeWithGB: this.size,
          diskCategory: this.diskCategory
        }
      },
      //创建
      confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then(() => {
            self.$router.push({name: 'hybridtencentdisk'})
          }).catch(() => {
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
