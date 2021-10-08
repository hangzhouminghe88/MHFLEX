<template>
  <create-template-no-route>
    <div slot="header">
      <span class="create-title">创建华为云云盘快照</span>
      <span class="create-back el-icon-back" @click="$emit('close')">
        返回到列表页面
      </span>
    </div>
    <div slot="body">
      <mh-input :label="$t('common.name')"
                :required="true"
                :show-error="emptyname"
                :error-message="rules.name.message"
                prop="name"
                @validate="validate"
                v-model="name"></mh-input>
      <mh-input :label="$t('common.description')"
                type="textarea"
                :placeholder="'请输入简介'"
                v-model="description"/>
    </div>
    <div slot="footer">
      <span class="btn-confirm"
            :class="{'disabled': !canCreate}"
            @click="canCreate && confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel"
            @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
    import CreateTemplateNoRoute from "src/component/CreateTemplateNoRoute";
    import WindowBase from 'src/windows/Window';
    export default {
      name: "CreateHuaweiShap",
      mixins: [WindowBase],
      components: {CreateTemplateNoRoute},
      props: {
        param: {
          type: Object,
          default: () => {
            return {}
          }
        }
      },
      created() {
        debugger
        if (this.param) {
          if (this.param.diskUuid) {
            this.diskUuid = this.param.diskUuid
          }
        }
      },
      data() {
        return {
          name: '',
          description: '',
          rules: {
            name: {message: ''}
          },
          emptyname: false,
          canCreate: true,
          diskUuid: ''
        }
      },
      methods: {
        validate(name) {
          let self = this, input = '';
          input= name === 'name' ? String(self[name]).trim() : self[name];
          self[`empty${name}`] = false;
          if(/^\s*$/.test(input) || /\s/.test(input)) {
            self[`empty${name}`] = true;
            self.rules[name].message = self.$t('error.emptyInput') + self.$t(`common.${name}`);
          }
        },
        validateAll() {
          let self = this;
          self.validate('name');
          return self.emptyname;
        },
        confirm() {
          let self = this;
          if(self.validateAll()) return;
          self.canCreate = false
          self.param.ok(self.createParam())
            .then(() => {
              self.$emit('close')
            })
            .catch(() => {
              self.canCreate = true;
            })
        },
        createParam() {
          let self =  this;
          return {
            name: self.name,
            description: self.description,
            diskUuid: self.diskUuid
          }
        }
      }
    }
</script>

<style scoped>

</style>
