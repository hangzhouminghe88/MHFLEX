<style>

</style>

<template>
  <div>
    <create-template-no-route>
      <div slot="header">
        <span>
          {{$t('common.addDns')}}
        </span>
        <span class="create-back" @click="$emit('close')"><i class="el-icon-back"></i>返回</span>
      </div>
      <div slot="body">
          <el-form :model="windowData" :rules="rules" ref="form">
            <el-form-item label="DNS" label-width="100px" prop="">
              <el-input placeholder="" style="width:300px;" v-model="windowData.DNS" />
            </el-form-item>
          </el-form>

      </div>
      <div slot="footer">
        <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
      </div>
    </create-template-no-route>
  </div>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import WindowBase from 'src/windows/Window';
  import Validator from 'src/utils/validator';
  import rpc from 'src/utils/rpc';

  export default {
    name: "AddDnsDlg",
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    mixins: [WindowBase],
    components: {CreateTemplateNoRoute},
    data(){
      return {
        rules: {

        }
      }
    },
    computed: {

    },
    created(){
      this.updateWindow({DNS: ''})
    },
    methods: {
      ...Validator,
      validateDns () {
        let obj = {
          emptyDNS: false,
          invalidDNS: false
        }
        let input = this.trimProp('DNS')
        if (!input) {
          obj.emptyDNS = true
        }
        if (!this.isIP(input)) {
          obj.invalidDNS = true
        }
        this.updateWindow(obj)
      },
      ok: function () {
        this.validateDns()
        if (this.windowData.emptyDNS || this.windowData.invalidDNS) {
          return
        }
        this.param.ok(this.windowData.DNS)
        this.$emit('close');
      }
    }
  }
</script>

