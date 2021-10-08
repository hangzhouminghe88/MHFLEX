<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('hybriddatacenter.Adddatacenter')}}</span>
      <span class="create-back" @click="$router.push({name: 'hybridtencentdatacenter'})">
        <i class="el-icon-back"></i>
        <span style="font-size: 12px;">
          回到腾讯云地域
        </span>
      </span>
    </div>

    <div slot="body">
      <mh-input type="select"
                :label="'common.hybriddatacenter'"
                v-model="regionName"
                :selectGroup="regionGroup"
                :required="true"
                :show-error="emptyregionName"
                :errorMessage="rules.regionName.message"
                @changeOption="handleChangeRegionName"
                prop="regionName"/>

      <mh-input type="textarea"
                :required="true"
                :label="'common.description'"
                v-model="description"
                :show-error="emptydescription"
                :prop="'description'"
                :errorMessage="rules.description.message"
                @validate="validate"/>

    </div>

    <div slot="footer" class="create-footer">
      <div class="btn-confirm"
           @click="canCreate && confirm()"
           :class="{'disabled': !canCreate}">{{$t('common.confirm')}}</div>
      <div class="btn-cancel" @click="$router.push({name: 'hybridtencentdatacenter'})">{{$t('common.cancel')}}</div>
    </div>
  </create-template>
</template>

<script>
  import {checkAccessKey} from "src/tencent/secretkey/assitant/SecretKeyAssistant";
  import CreateTemplate from "src/component/CreateTemplate";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Methods from '../Methods';

  export default {
    name: "CreateHybridTencentDataCenterPage",

    components: {CreateTemplate},

    mixins: [WindowBase, Methods],

    data() {
      return {
        regionName: '',
        regionGroup: [],
        description: '',
        emptydescription: false,
        emptyregionName: false,
        canCreate: true,
        type: 'tencent',
        rules: {
          description:{ message: ''},
          regionName: {message: ''}
        }
      }
    },

    created() {
      let self = this;
      checkAccessKey(self);
      self.init()
    },

    methods: {
      ...{
        create: Methods.methods.create
      },
      init() {
        let self = this;
        return self.dispatchAction('hybridTencentSecretKey/basicQuery', {
          q: [`current=true`]
        }).then((resp) => {
          if (resp.total === 0) return
          rpc.query('hybrid/tencent/data-center/remote', {
            type: "tencent"
          }).then((resp) => {
            if(!!resp.inventories){
              self.regionName = resp.inventories[0].regionName;
              self.description = `SK:sk,${self.regionName}`;
              self.regionId = resp.inventories[0].regionId;
              self.regionGroup = resp.inventories.map(item => {
                return {
                  value: item.regionName,
                  label: item.regionName,
                  regionId: item.regionId
                }
              }).filter(item => {
                return !item.value.match(/金融/g)
              })
              self.handleChangeRegionName();
            }
          })
        })
      },

      handleChangeRegionName(item) {
        let self = this;
        if(item)
        self.regionId = item.regionId;
        rpc.query(`/hybrid/tencent/key`, {
          q: 'current=true'
        })
          .then((resp) => {
            self.description = `SK:${resp.inventories[0].name},${self.regionName}`;
            this.validate('description')
          })
      },

      validate(name){
        let self = this, input = '';
        input = self[name].trim();
        self[`empty${name}`] = false;
        self.rules[`${name}`].message = '';
        if(!input) {
          self.rules[`${name}`].message = self.$t('error.emptyInput') + self.$t(`common.${name}`)
          self[`empty${name}`] = true;
          return;
        }
      },

      validateAll() {
        let self = this, props = ['regionName', 'description'];
        props.forEach((name) => {
          self.validate(name);
        })
        let invalid = props.some((name) => self[`empty${name}`] === true);
        return invalid;
      },

       createParam() {
        return {
          regionName: this.regionName,
          description: this.description,
          regionId: this.regionId,
          ossBucketUuid: this.ossBucketUuid,
          type: this.type
        }
       },

        confirm() {
        let self = this;
        if(self.validateAll()) return;
        self.canCreate = false;
        self.create(self.createParam())
          .then( () => {
            self.$router.push({name: 'hybridtencentdatacenter'})
          }).catch(() => {
            self.canCreate = true;
        })
      }
    }
  }
</script>

<style scoped>

</style>
