<template>
  <div class="container">
    <div class="page-toolbar-container">
      <div class="page-toolbar-left" style="position: relative;">
        <span>{{$t('common.volume') + $t('common.colon')}}</span>
        <help-trigger name="volume" :style="{'position': 'absolute', left: '37px', top: '5px'}"/>
        <drop-down class="detail-dropdown" style="margin-left: 30px;">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
             <a v-permission="'VOLUME.CREATE'" style="padding-top: 12px;" @click="!isSelected && !inStates('Paused') && vmCreateVolume()" :class="{ 'disabled-text': isSelected || inStates('Paused') }">{{ $t("common.create") }}</a>
             <a v-permission="'VOLUME_VM.ATTACH'" @click="!isSelected && !inStates('Paused') && !isRootVolume() && attach()" :class="{ 'disabled-text': !(!isSelected && !inStates('Paused') && !isRootVolume()) }">{{ $t("common.attach") }}</a>
             <a v-permission="'VOLUME_VM.DETACH'" @click="isSelected && !inStates('Paused') && !isRootVolume() && detach()" :class="{ 'disabled-text': !isSelected || isRootVolume() || inStates('Paused') }">{{ $t("common.detach") }}</a>
             <a style="padding-bottom:12px;" v-permission="'VOLUME.DELETE'" @click="isSelected && !inStates('Paused') && !isRootVolume() && pageDelete()" :class="{ 'disabled-text': !isSelected || isRootVolume() || inStates('Paused') }">{{ $t("common.destroy") }}</a>
            </div>
          </span>
        </drop-down>
      </div>
    </div>

    <div class="page-table">
      <mh-table :data-source="dataSource"></mh-table>
    </div>
  </div>
</template>

<script>
  import VolumeTabList from './VolumeTabListService';
  export default VolumeTabList;
</script>

<style scoped>

</style>
