<template>
  <div :class="stateClass">
    <span class="dot"></span>
    <span class="text">{{ $t(`state.${state}`) }}</span>
  </div>
</template>

<script>
  import Root from 'src/windows/Root';

  export default {
    name: "DetailInfoState",
    mixins: [Root],
    props: {
      state: {
        type: String,
        default: ''
      },
      outerClassName:{
        type: String,
        default: ''
      }
    },
    data(){
      return {
        stateClass: {}
      }
    },
    mounted() {
      let self = this;
      self.updateClass();
    },
    methods: {
      updateClass: function () {
        this.stateClass = {
          'running': this.state === 'Running',
          'connected': this.state === 'Connected',
          'enabled': this.state === 'Enabled',
          'ready': this.state === 'Ready',
          'stopped': this.state === 'Stopped',
          'resuming': this.state === 'Resuming',
          'checking': this.state === 'checking',
          'creating': this.state === 'Creating',
          'disconnected': this.state === 'Disconnected',
          'disabled': this.state === 'Disabled',
          'starting': this.state === 'Starting',
          'stopping': this.state === 'Stopping',
          'done': this.state === 'Done',
          'connecting': this.state === 'Connecting',
          'notinstantiated': this.state === 'NotInstantiated' || this.state === 'Unbind',
          'downloading': this.state === 'Downloading',
          'uploading': this.state === 'Uploading',
          'deleted': this.state === 'Deleted',
          'destroyed': this.state === 'Destroyed',
          'maintenance': this.state === 'Maintenance',
          'premaintenance': this.state === 'PreMaintenance',
          'unknown': this.state === 'Unknown',
          'migrating': this.state === 'Migrating',
          'volumeMigrating': this.state === 'VolumeMigrating',
          'paused': this.state === 'Paused',
          'rebooting': this.state === 'Rebooting',
          'ok': this.state === 'OK' || this.state === 'alarm.OK',
          'problem': this.state === 'Problem',
          'available': this.state === 'Available',
          'active': this.state === 'Active',
          'unprovisioned': this.state === 'Unprovisioned',
          'provisioning': this.state === 'Provisioning',
          'provisioned': this.state === 'Provisioned',
          'pxeBootFailed': this.state === 'PxeBootFailed',
          'PxeBooting': this.state === 'PxeBooting',
          'HWInfoUnknown': this.state === 'HWInfoUnknown',
          'Allocated': this.state === 'Allocated' || this.state==="Bind",
          'inUse': this.state === 'InUse',
          'got': this.state === 'Got',
          'unGot': this.state === 'UnGot',
          'gotFailed': this.state === 'GotFailed',
          'powerOn': this.state === 'PowerOn',
          'powerOff': this.state === 'PowerOff',
          'vbcEnabled': this.state === 'VbcEnabled',
          'vbcDisable': this.state === 'VbcDisable',
          'vbcDeleted': this.state === 'VbcDeleted',
          'pending': this.state === 'Pending',
          'ike-sa-not-established': this.state === 'ike_sa_not_established',
          'ike-sa-established': this.state === 'ike_sa_established',
          'ipsec-sa-not-established': this.state === 'ipsec_sa_not_established',
          'ipsec-sa-established': this.state === 'ipsec_sa_established',
          'Alarm': this.state === 'alarm.Alarm',
          'InsufficientData': this.state === 'alarm.InsufficientData',
          'Created': this.state === 'Created',
          'Rollbacked': this.state === 'Rollbacked',
          'true': this.state === 'true',
          'false': this.state === 'false',
          'Failed': this.state === 'Failed',
          'Initial': this.state === 'Initial',
          'failed': this.state === 'failed' || this.state === 'Failed',
          'success': this.state === 'success' || this.state === 'Succeeded'
        };
        if (this.outerClassName) this.stateClass[this.outerClassName] = true;
        if (this.state === 'Done' ||
          this.state === 'Connecting' ||
          this.state === 'Connected' ||
          this.state === 'Ready' ||
          this.state === 'Downloading' ||
          this.state === 'Uploading' ||
          this.state === 'Deleted' ||
          this.state === 'Disconnected') {
          this.stateClass.hole = true
        }
      }
    },
    watch:{
      'state': function (val, oldVal) {
        if (val !== oldVal) {
          this.updateClass();
          this.$forceUpdate()
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .state {
    position: relative;
    padding-left: 22px;
    line-height: 20px;
    font-size: 14px;
  }
  .dot{
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 100%;
    line-height: 30px;
    position: relative;
    top: -2px;
  }
  .text{
    display: inline-block;
    left: -10px;
    position: relative;
  }
</style>
