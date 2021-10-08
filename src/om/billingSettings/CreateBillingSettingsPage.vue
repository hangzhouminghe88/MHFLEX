<template>
 <div style="height: 100%; background: #fff;">
   <component :is="ctrl"></component>
 </div>
</template>

<script>
  import CreateCpuBillingSettings from 'src/om/billingSettings/components/CreateCpuBillingSettings';
  import CreateMemoryBillingSettings from 'src/om/billingSettings/components/CreateMemoryBillingSettings';
  import CreateGpuDeviceBillingSettings from 'src/om/billingSettings/components/CreateGpuDeviceBillingSettings';
  import CreateRootVolumeBillingSettings from 'src/om/billingSettings/components/CreateRootVolumeBillingSettings';
  import CreateDataVolumeBillingSettings from 'src/om/billingSettings/components/CreateDataVolumeBillingSettings';
  import CreatePublicNetWorkBillingSettings from 'src/om/billingSettings/components/CreatePublicNetWorkBillingSettings';
  export default {
    name: "CreateBillingSettingsPage",
    components: {
      CreateCpuBillingSettings,
      CreateMemoryBillingSettings,
      CreateRootVolumeBillingSettings,
      CreateDataVolumeBillingSettings,
      CreateGpuDeviceBillingSettings,
      CreatePublicNetWorkBillingSettings,
    },
    data(){
      return {
        type: 'cpu'
      }
    },
    computed: {
      ctrl(){
        let self = this, ctrl;
        switch (self.$route.params.type) {
          case 'cpu':
            ctrl =  CreateCpuBillingSettings;
            break;
          case 'memory':
            ctrl = CreateMemoryBillingSettings;
            break;
          case 'rootVolume':
            ctrl = CreateRootVolumeBillingSettings;
            break;
          case 'dataVolume':
            ctrl = CreateDataVolumeBillingSettings;
            break;
          case 'gpu':
            ctrl = CreateGpuDeviceBillingSettings;
            break;
          case 'publicNetworkIP':
            ctrl = CreatePublicNetWorkBillingSettings;
            break;
        }
        return ctrl;
      }
    },
    methods: {

    }
  }
</script>

<style scoped>

</style>
