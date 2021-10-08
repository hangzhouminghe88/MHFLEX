<template>
  <billing-for-admin v-if="dbData.common.isAdmin"></billing-for-admin>
  <billing-for-account v-else></billing-for-account>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import BillingForAdmin from "./component/BillingForAdmin";
  import BillingForAccount from "./component/BillingForAccount";
  export default {
    name: "BillingPage",
    components: {BillingForAccount, BillingForAdmin},
    mixins: [WindowBase]
  }
</script>

<style scoped>

</style>
