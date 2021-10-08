<template>
  <div class="operation-row">
    <div class="title" :class="[required ? 'required' : '']" v-text="$t(label)"></div>
    <help-trigger :name="helperName" v-if="helperName"/>
    <input :type="type"
           v-if="['text', 'number', 'email', 'time', 'password'].includes(type)"
           ref="input"
           :value = "value"
           @input="handleInput"
           :placeholder="placeholder"
           @blur="handleBlur"
           :class="{'is-error': showError, 'disabled': disabled}"
          :disabled="disabled"/>

    <textarea :type="type" v-if="type==='textarea'"
           rows="3"
           ref="input"
           :value = "value"
           @input="handleInput"
           :placeholder="placeholder"
           @blur="handleBlur"
           :class="{'is-error': showError}"/>

    <el-select :value="value"
               style="width: 100%"
               v-if="type==='select'"
               :class="{'is-error': showError}">
      <el-option v-for="(item, index) in selectGroup"
                 :value="item.value"
                 :key="index"
                 :label="item.label"
                 @click.native="handleSelect(item)">
      </el-option>
    </el-select>

    <slot></slot>

    <div class="error error-text" v-if="showError">
      {{errorMessage}}
    </div>
  </div>
</template>

<script>
  export default {
    name: "Input",

    props: {
      value: {
        type: [String, Number, Boolean]
      },
      label: {
        type: String,
        required: true,
        default: ''
      },
      validate: {
        type: Function
      },
      required: {
        type: [Boolean, String],
        default: false
      },
      type: {
        type: String,
        default: 'text'
      },
      errorMessage: String,
      showError: Boolean,
      prop: String,
      selectGroup: Array,
      helperName: String,
      placeholder: String,
      disabled: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        isComposing: false,
      }
    },

    methods: {
      //处理@input事件做到双向绑定
      handleInput(event) {
        this.$emit('input', event.target.value);
      },
      //处理失焦事件
      handleBlur(event) {
        this.$emit('input', event.target.value);
        this.$emit('validate', this.prop);
      },
      //处理选择框事件
      handleSelect(item) {
        this.$emit('changeOption', item);
        this.$emit('input', item.value);
        this.$emit('validate', this.prop);
      }
    }
  }
</script>

<style scoped>

</style>
