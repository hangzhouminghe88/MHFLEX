<template>
  <div class="operation-row">
    <div class="title">
      {{$t("vm.cdRom.configured")}}
    </div>
    <div style="margin-bottom:10px;" v-for="(item, index) in itemList">
      <div class="ipmi-body">
        <div class="ipmi-content">
          {{$t("common.name")}}{{$t("common.colon")}} {{item.cdRom}}
          <div class="delete" :class="{disable: !canDelete(item)}" @click="canDelete(item) && param.remove(index)" style="position:relative; float:right; margin-top:10px;"></div>
        </div>
        <div class="ipmi-content" style="height:auto; max-height:80px; padding-bottom:0px;">
          {{'ISO'}}{{$t("common.colon")}} {{item.isoUuid && dbData.image[item.isoUuid].name }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import _ from 'lodash'

  export default {
    name: 'CardOfCDRom',
    props: ['param'],
    methods: {
      canDelete (item) {
        if (!_.isUndefined(item.deleteable)) return item.deleteable
        else return true
      }
    },
    computed: {
      itemList () {
        return this.param.getItemList() || []
      },
      dbData () {
        return this.$store.state.db
      }
    }
  }
</script>
<style scoped>
  .ipmi-content {
    height: 30px;
    font-size: 14px;
    color: #333333;
    width: 300px;
    padding: 10px;
    border-radius: 2px;
  }

  .ipmi-body {
    width: 300px;
    border: 1px solid #DAE0E6;
    border-radius: 2px;
    padding-bottom: 10px;
  }

  .ipmi-content .disable {
    cursor: not-allowed;
    color: #97A4B6;
  }
  .ipmi-content .disable:hover {
    cursor: not-allowed;
    color: #97A4B6;
  }
  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right:20px;;
  }
</style>
