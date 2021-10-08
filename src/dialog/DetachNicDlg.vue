<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t(`action.vmNicRefs.${$data.type}`)}}</div>
    <div class="dialog-content operation-row" style="width: auto;">
      <div class="title" style="margin: 0px 20px;" v-if="$data.type === 'detach'">
        {{ $t("vm.detechVmNic", {length: uuidList.length}) }}
      </div>
      <div class="title" style="margin: 0px 20px" v-if="$data.type==='detachNicQos'">
        {{ $t("vm.info.cancelVmNicQoSConfirm", {length: uuidList.length}) }}
      </div>
      <div style="margin: 20px; border: 1px solid rgb(220, 236, 255); background-color: rgb(242, 250, 255); padding: 15px 28px;">
        <div v-for="(uuid, index) in uuidList" style="width: 50%; display: inline-block;white-space: nowrap;text-overflow: ellipsis; overflow: hidden">
          <div class="icon"></div>
          <div class="confirm-dialog-item-name" v-if="$data.type === 'deleteStaticIp'">{{getL3NetworkName(dbData.ip[uuid].l3NetworkUuid)}}</div>
           <div class="confirm-dialog-item-name" v-else>{{dbData.vmNicRefs[uuid].internalName}}</div>
        </div>
      </div>
    </div>
    <div class="confirm-dialog-warning" v-if="$data.type==='detach'">
      {{ $t("vm.info.detachVmNicWarning") }}
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';

  export default {
    name: "DetachNicDlg",
    mixins: [WindowBase],
    props: {
      model: {
        type: Boolean,
        default: false
      },
      message: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        visiabled: false,
        uuidList: [],
        type: ''
      }
    },
    mounted() {
      let self = this;
      self.visiabled = self.model;    
      self.$data.type = self.message.type ? self.message.type : '';
      self.uuidList = self.message.uuidList ?  self.message.uuidList : [];
    },
    methods: {
      ...Utils,

      close() {
        let self = this;
        self.visiabled = false;
        self.$emit('close')
      },
      confirm() {
        let self = this;
        self.visiabled = false;
        self.$emit('close', {uuidList: self.uuidList, type: self.$data.type});
      },

      getL3NetworkName(uuid) {
        let value = '';
        try {
          value = this.dbData.l3network[uuid].name
        } catch (e) {
          this.queryResourceByUuid('l3-networks', [uuid], 'l3network', this)
        }
        return value
      },
    },
    watch: {
      model(newVal, oldVal) {
        let self = this;
        if (newVal !== oldVal) {
          self.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>
  .icon{
    background-image: url("~assets/physical_interface_popupico.svg");
    background-repeat: no-repeat;
    width:32px;
    height: 32px;
    display: inline-block;
  }
</style>
