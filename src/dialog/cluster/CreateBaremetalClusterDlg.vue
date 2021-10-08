<template>
  <dialog-template width="600px" :drag="false">
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">创建裸金属集群</span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>

    <div slot="body">
      <div style="padding: 50px 150px;">
        <div class="operation-row">
          <div class="title required">{{$t('common.name')}}</div>
          <input type="text" v-model="name"
                 :class="{'is-error': emptyname}"
                 @blur="validate('name')"/>
          <div class="error error-text" v-show="emptyname">
            {{$t('error.emptyInput') + $t('common.name')}}
          </div>
        </div>

        <div class="operation-row">
          <div class="title">{{$t('common.name')}}</div>
          <textarea rows="3" v-model="description"/>
        </div>

      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';

  export default {

    name: "CreateBaremetalClusterDlg",

    mixins: [WindowBase],

    data() {
      return {
        name: '',
        emptyname: false,
        description: '',
        zoneUuid: ''
      }
    },

    methods: {
      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },

      createParam() {
        this.zoneUuid = window.localStorage.getItem('currZoneUuid')
        if (this.dialogData.param.data && this.dialogData.param.zoneUuid) {
          this.zoneUuid = this.dialogData.param.zoneUuid
        }
        return {
          name: this.name.trim(),
          description: this.description,
          zoneUuid: this.zoneUuid,
          hypervisorType: 'baremetal',
          type: 'baremetal'
        }
      },

      confirm() {
        let self = this;
        if(self.emptyname) return;
        self.dialogData.param.ok(self.createParam());
        self.close();
      },

      validate(name) {
        let self = this, input = '';
        input = String(self[name]).trim();
        self[`empty${name}`] = false;
        if(/^\s*$/.test(input)) {
          self[`empty${name}`] = true;
          return;
        }
      }
    }
  }
</script>

<style scoped>

</style>
