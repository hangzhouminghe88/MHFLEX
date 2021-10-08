<template>
  <div class="operation-row zs-select">
    <div class="title" :class="{ 'required': required }">
      {{ title }}
    </div>
    <div v-if="items && items.length === 1" class="content" style="cursor: initial;">
      <span :title="selectedItemText">
        {{ selectedItemText }}
      </span>
    </div>
    <span v-else class="button dropdown create-dropdown" @click="!disable && toggleMoreDropdownDlg($event)">

      <span class="text">
        {{ selectedItemText }}
      </span>

      <img class="arrow" v-if="windowData.showMoreDropdown" src="~assets/arrow_up.svg" />
      <img class="arrow" v-if="!windowData.showMoreDropdown" src="~assets/arrow_down.svg" />
      <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">

        <a v-for="(item, index) in items" @click="select(index, $event); toggleMoreDropdownDlg($event);" style="padding-top: 12px;">
          {{ item.text }}
        </a>

      </div>
    </span>
  </div>
</template>

<script>
import WindowBase from 'src/windows/Window'
import _ from 'lodash'

export default {
  name: 'DropDown',
  mixins: [WindowBase],
  props: {
    title: String,
    items: Array,
    getResult: Function,
    disable: Boolean,
    required: Boolean
  },
  created: function () {
    this.select(0)
    window.addEventListener('click', this.onWindowClick, true)
  },
  destroyed: function () {
    window.removeEventListener('click', this.onWindowClick, true)
  },
  data () {
    return {
      showMoreDropdown: false,
      selectedItem: '',
      selectedItemText: ''
    }
  },
  methods: {
    toggleMoreDropdownDlg: function ($event) {
      this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
    },
    onWindowClick: function (event) {
      var x = event.target
      if (x.tagName === 'HTML') {
        return
      }
      var result = []
      while (x.tagName !== 'BODY' && result.length === 0) {
        if (x.className === 'dropdown-content') {
          result.push(x)
        }
        x = x.parentNode
      }
      if (result.length > 0) {
        return
      }
      if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
    },
    select: function (index, $event) {
      if (!Array.isArray(this.items) || !this.items[index]) return
      this.selectedItem = this.items[index].value
      this.selectedItemText = this.items[index].text
      this.getResult(this.selectedItem)
    }
  },
  watch: {
    'items': function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      if (!newValue) {
        this.selectedItem = ''
        this.selectedItemText = ''
        this.getResult(null)
      }
      if (this.disable) return
      this.select(0)
    }
  }
}
</script>

<style scoped>

.zs-select .button {
    display: inline-block;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #DAE0E6;
    border-radius: 2px;
    height: 40px;
    width: 100%;
    margin-right: 10px;
    cursor: pointer;
}

.zs-select .button .text {
    display: inline-block;
    font-size: 14px;
    line-height: 40px;
    margin: auto;
}

.zs-select .button .arrow {
    display: inline-block;
    position: absolute;
    top: 11px;
    right: 16px;
    color: #5E6978;
}

.zs-select .arrow-up {
    display: inline-block;
    position: absolute;
    top: 11px;
    right: 16px;
    color: #5E6978;
    background-image: url('~assets/arrow_up.svg');
}

.zs-select .arrow-down {
    display: inline-block;
    position: absolute;
    top: 11px;
    right: 16px;
    color: #5E6978;
    background-image: url('~assets/arrow_down.svg');
}

.zs-select .button * {
  margin: auto;
}

.zs-select .dropdown-content {
  width: 100%;
}

.show {
  display: block;
}

</style>



// WEBPACK FOOTER //
// DropDown.vue?3271250e
