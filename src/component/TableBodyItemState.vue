<template>
  <div class="stateWrapper" :class="stateclass">
    <span class="dot"></span>
    <div class="text">{{$t(`state.${state}`)}}</div>
  </div>
</template>

<script>
  export default {
    name: "TableBodyItemState",
    props: {
      state: {
        type: String,
        default: ''
      },
      outerClassName:{
        type: String,
        default:''
      }
    },
    mounted(){
      this.getStateClass();
    },
    data(){
      return {
        stateclass: {}
      }
    },
    methods: {
      getStateClass(argument){
         this.stateclass = {
          'running': this.state === 'Running',
          'resuming': this.state === 'Resuming',
          'checking': this.state === 'checking',
          'connected': this.state === 'Connected',
          'enabled': this.state === 'Enabled' || this.state === 'Healthy' || this.state === 'Successful' || this.state === 'available',
          'ready': this.state === 'Ready' || this.state === 'System' || this.state === 'Active',
          'stopped': this.state === 'Stopped',
          'Retired': this.state === 'Retired',
          'disconnected': this.state === 'Disconnected',
          'disabled': this.state === 'Disabled',
          'starting': this.state === 'Starting',
          'stopping': this.state === 'Stopping',
          'done': this.state === 'Done',
          'migrating': this.state === 'Migrating',
          'Pausing': this.state === 'Pausing',
          'volumeMigrating': this.state === 'ColdMigrating' || this.state === 'VolumeMigrating',
          'connecting': this.state === 'Connecting',
          'notinstantiated': this.state === 'NotInstantiated' || this.state === 'Unbind',
          'downloading': this.state === 'Downloading',
          'uploading': this.state === 'Uploading',
          'deleted': this.state === 'Deleted',
          'destroyed': this.state === 'Destroyed',
          'maintenance': this.state === 'Maintenance',
          'premaintenance': this.state === 'PreMaintenance',
          'unknown': this.state === 'Unknown',
          'unconfirmed': this.state === 'unconfirmed',
          'paused': this.state === 'Paused',
          'rebooting': this.state === 'Rebooting',
          'creating': this.state === 'Creating',
          'ok': this.state === 'OK' || this.state === 'alarm.OK',
          'problem': this.state === 'Problem',
          'available': this.state === 'Available',
          'active': this.state === 'Active' || this.state === 'active',
          // 'System': this.state === 'System',
          // 'Active': this.state === 'Active',
          'Inactive': this.state === 'Inactive',
          'Attached': this.state === 'Attached' || this.state=== 'Bind',
          'unprovisioned': this.state === 'Unprovisioned',
          'provisioning': this.state === 'Provisioning',
          'provisioned': this.state === 'Provisioned',
          'pxeBootFailed': this.state === 'PxeBootFailed',
          'HWInfoUnknown': this.state === 'HWInfoUnknown',
          'Allocated': this.state === 'Allocated',
          'PxeBooting': this.state === 'PxeBooting',
          'inUse': this.state === 'InUse',
          'got': this.state === 'Got',
          'unGot': this.state === 'UnGot',
          'gotFailed': this.state === 'GotFailed',
          'vbcEnabled': this.state === 'VbcEnabled',
          'vbcDisable': this.state === 'VbcDisable',
          'vbcDeleted': this.state === 'VbcDeleted',
          'pending': this.state === 'Pending',
          'powerOn': this.state === 'PowerOn',
          'powerOff': this.state === 'PowerOff',
          'ike-sa-not-established': this.state === 'ike_sa_not_established',
          'ike-sa-established': this.state === 'ike_sa_established',
          'ipsec-sa-not-established': this.state === 'ipsec_sa_not_established',
          'ipsec-sa-established': this.state === 'ipsec_sa_established',
          'aliyun-disk-available': this.state === 'aliyun_disk_available',
          'aliyun-disk-in-use': this.state === 'aliyun_disk_in_use',
          'progressing': this.state === 'progressing',
          'accomplished': this.state === 'accomplished',
          'failed': this.state === 'failed' || this.state === 'backup-failed' || this.state === 'recovery-failed' || this.state === 'Failed',
          'success': this.state === 'backup-success' || this.state === 'recovery-success' || this.state === 'Success' || this.state === 'Succeeded',
          'waiting': this.state === 'backup-waiting' || this.state === 'recovery-waiting',
          'disaster-backup-running': this.state === 'backup-running' || this.state === 'recovery-running',
          'Alarm': this.state === 'alarm.Alarm',
          'noAction': this.state === 'NoAction',
          'Created': this.state === 'Created',
          'Rollbacked': this.state === 'Rollbacked',
          'Start': this.state === 'Start',
          'Finish': this.state === 'Finish',
          'true': this.state === 'true',
          'false': this.state === 'false',
          'Initial': this.state === 'Initial',
          'RollbackStart': this.state === 'RollbackStart',
          'RollbackFinish': this.state === 'RollbackFinish',
          'RollbackFailed': this.state === 'RollbackFailed',
          'down': this.state === 'down',
          'up': this.state === 'up',
          'Valid': this.state === 'Valid',
          'Invalid': this.state === 'Invalid',
          'Ticket_RequestCompleted': this.state === 'Ticket_RequestCompleted',
          'Ticket_RequestUpdated': this.state === 'Ticket_RequestUpdated',
          'Ticket_Pending': this.state === 'Ticket_Pending',
          'Ticket_Rejected': this.state === 'Ticket_Rejected',
          'Ticket_Cancelled': this.state === 'Ticket_Cancelled',
          'Ticket_IntermediateApproved': this.state === 'Ticket_IntermediateApproved',
          'Ticket_FinalApproved': this.state === 'Ticket_FinalApproved'
        }
        if (this.state === 'Done' ||
          this.state === 'Connecting' ||
          this.state === 'Connected' ||
          this.state === 'Ready' ||
          this.state === 'Downloading' ||
          this.state === 'Deleted' ||
          this.state === 'Disconnected') {
          this.stateclass.hole = true
        }
      }
    },
    watch:{
      state(newVal, oldVal){
        if(newVal !== oldVal){
          this.getStateClass();
          this.$forceUpdate()
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
