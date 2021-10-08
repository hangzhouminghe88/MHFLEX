<template>
  <div>
    <div class="operation-row" v-if="!resourceUuid">
      <div class="title" :class="{ 'required': required }">
        {{ title }}
      </div>
      <div class="wrapper">
        <div class="content" v-for="item in selectedItemList" style="margin-bottom: 10px;">
          {{ getItemName(item) }}
          <div class="delete" v-show="item" @click="remove(item, $event)"></div>
        </div>
        <div class="content" :class="{'is-error': empty}" @click="openItemList(select);">
          <div class="add"></div>
        </div>
        <div class="error error-text" v-if="empty">
          {{$t("error.unselected")+ title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WindowBase from 'src/windows/Window'
import _ from 'lodash'

export default {
  name: 'MultiSelectInput',
  mixins: [WindowBase],
  props: {
    title: String,
    disable: Boolean,
    toValidate: Boolean,
    openItemList: Function,
    getItemName: Function,
    removeSelectedItem: Function,
    getResult: Function,
    updateResult: Function,
    required: Boolean,
    resourceUuid: String
  },
  created: function () {
    if (this.resourceUuid) {
      this.select(this.resourceUuid)
    }
    if (this.toValidate) {
      if (this.selectedItemList.length === 0) {
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
      empty: false
    }
  },
  computed: {
    selectedItemList () {
      let result = this.getResult()
      return result === null || result === undefined ? [] : result
    }
  },
  methods: {
    remove: function (item, $event) {
      // let selectedItemList = _.cloneDeep(this.selectedItemList)
      // selectedItemList = selectedItemList.filter(it => it !== item)
      this.removeSelectedItem(item)
    },
    select: function (list) {
      this.empty = false
      let selectedItemList = this.selectedItemList
      let _list = _.uniq(selectedItemList.concat(list))
      // this.selectedItemList = _list
      this.updateResult(_list)
    }
  },
  watch: {
    'toValidate': function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      if (this.toValidate) {
        if (this.selectedItemList.length === 0) {
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
.content{
  width: 295px;
  padding-left: 5px;
}
</style>

