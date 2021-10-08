<template>
   <dialog-template>
      <div slot="title">
        <span class="dialog-confirm-title">修改控制台密码</span>
        <span class="dialog-close" @click="close()"></span>
      </div>
     <div slot="body">

     </div>
     <div slot="footer"></div>
   </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  export default {
    mixins: [WindowBase],
    name: "UpdateHuaweiEcsRootPasswordDlg"
  }
</script>

<style scoped>

</style>
