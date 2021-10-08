<template>
   <div class="container">
     <local-network-tab :param="param"></local-network-tab>
     <div class="split-line" style="width: 100%;"></div>
     <remote-network-tab :param="param"></remote-network-tab>
   </div>
</template>

<script>
  import RemoteNetworkTab from "./RemoteNetworkTab";
  import LocalNetworkTab from "./LocalNetworkTab";

  export default {
    name: "NetworkForIPsecTab",

    components: {RemoteNetworkTab, LocalNetworkTab},

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    }
  }
</script>

<style scoped>

</style>
