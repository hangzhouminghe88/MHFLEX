<template>
  <div class="detail-row editable">
    <div class="detail-title" v-permission="data.permission">
      {{ data.getTitle() }}{{$t("common.colon")}}
      <help-trigger
        v-if="data.doc"
        :name="data.doc"
        style="
          position: relative;
          top: 0;
          display: inline-block;
          vertical-align: middle;
          left: 0;"
      />
    </div>
    <span class="detail-content" v-if="!editing && data.isPassword">******</span>
    <span class="detail-content" v-if="!editing && !data.isPassword">{{ data.getValue() }}</span>
    <span v-if="showEditingIcon" class="edit-icon el-icon-edit" @click="clickHandler" />
    <input
      class="editor"
      v-if="editing"
      :type="data.isPassword ? 'password' : 'text'"
      :value="newValue"
      ref="editor"
      @keydown.enter="update"
      @blur="update"
      @keydown.esc="editing = false"
    />
  </div>
</template>
<script>
  import Root from 'src/windows/Root'
  export default {
    name: 'InputEditorInDetail',
    mixins: [Root],
    props: ['data'],
    data () {
      return {
        editing: false,
        newValue: this.data.getValue()
      }
    },
    methods: {
      update (e) {
        e.stopPropagation()
        this.newValue = e.target.value
        this.data.setValue(this.newValue)
        this.editing = false
      },
      clickHandler (e) {
        e.stopPropagation()
        this.editing = true
        this.newValue = this.data.getValue()
        this.$nextTick(() => { this.$refs.editor.focus() })
      }
    },
    computed: {
      showEditingIcon () {
        let editing = this.editing
        let showIcon = this.data.showIcon
        if (showIcon !== undefined) return !editing && showIcon
        return !editing
      },
      dbData () {
        return this.$store.state.db
      }
    }
  }
</script>
