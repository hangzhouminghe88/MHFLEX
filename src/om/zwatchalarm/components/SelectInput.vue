<template>
  <div>
    <div class="operation-row" v-if="!resourceUuid">
      <div class="title" :class="{ 'required': required }">
        {{ title }}
      </div>
      <div class="wrapper">
<!--         <div v-if="resourceUuid" class="content" style="border: 0;">
          <span :title="getItemName(resourceUuid)" style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;display: inline;">
            {{ getItemName(resourceUuid) }}
          </span>
        </div> -->
        <div class="content" :class="{'is-error': empty}" @click="openItemList(select);">
          {{ getItemName(selectedItem) }}
          <div class="add" v-show="!selectedItem"></div>
          <div class="delete" v-show="selectedItem" @click="remove(); $event.stopPropagation();"></div>
        </div>
      </div>
      <div class="error error-text" v-if="empty">
        {{$t("error.unselected")+ title }}
      </div>
    </div>
  </div>
</template>

<script>
import WindowBase from 'src/windows/Window'
import _ from 'lodash'
// import FullPanel from 'src/windows/Base/FullPanel'

export default {
  name: 'SelectInput',
  mixins: [WindowBase],
  props: {
    title: String,
    disable: Boolean,
    toValidate: Boolean,
    openItemList: Function,
    getItemName: Function,
    removeSelectedItem: Function,
    updateResult: Function,
    getResult: Function,
    required: Boolean,
    resourceUuid: String
  },
  created: function () {
    if (this.resourceUuid) {
      this.select(this.resourceUuid)
    }
    if (this.toValidate) {
      if (this.selectedItem === '') {
        this.empty = true
      } else {
        this.empty = false
      }
    }
  },
  destroyed: function () {
  },
  data () {
    return {
      // selectedItem: '',
      empty: false
    }
  },
  computed: {
    selectedItem () {
      let result = this.getResult()
      return result === null ? '' : result
    }
  },
  methods: {
    remove: function () {
      this.removeSelectedItem()
      this.empty = true
    },
    select: function (item) {
      this.empty = false
      this.updateResult(item)
    }
  },
  watch: {
    'toValidate': function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      if (this.toValidate) {
        if (this.selectedItem === '') {
          this.empty = true
        } else {
          this.empty = false
        }
      }
    }
  }
}
</script>

<style scoped>



</style>



// WEBPACK FOOTER //
// SelectInput.vue?06c6554b
