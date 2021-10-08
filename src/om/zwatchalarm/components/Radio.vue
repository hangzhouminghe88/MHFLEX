<template>
   <div class="operation-row">
    <div class="title required">
      {{ title }}
      <help-trigger name="AlarmRange"></help-trigger>
    </div>
    <div class="options">
      <el-radio v-for="(item,i) in items" v-model="selectedItem" :key="i" :label="item.value" @change="toggle(item.value)">{{item.text}}</el-radio>
    </div>
  </div>
</template>

<script>
import WindowBase from 'src/windows/Window'

export default {
  name: 'Radio',
  mixins: [WindowBase],
  props: {
    title: String,
    items: Array,
    callback: Function,
    disable: Boolean,
    callBack: Function
  },
  created: function () {
    let self = this;
    self.selectedItem = this.items[0].value;
  },
  destroyed: function () {
  },
  data () {
    return {
      selectedItem: ''
    }
  },
  methods: {
    toggle: function (value) {
      this.selectedItem = value
      this.callback(value)
    }
  }
}
</script>

<style scoped>

.options {
  overflow: hidden;
  width: 420px;
  height: 20px;
}

.option {
  float: left;
  cursor: pointer;
  margin-right: 82px;
}

.option span img {
  vertical-align: middle;
}

</style>
