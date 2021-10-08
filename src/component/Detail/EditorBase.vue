<script>
  import Root from 'src/windows/Root'
  import Utils from 'src/utils/utils'

  export default {
    mixins: [Root],
    props: ['param'],
    data () {
      return {
        editing: false,
        newValue: "",
        focused: false
      }
    },
    created: function () {
      window.addEventListener('click', this.onWindowClick, true)
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick, true)
    },
    methods: {
      updateValue () {
        let self = this;
        if (!self.editing) return
        if (self.newValue && self.newValue.length <= 0) return
        if (self.param.setValue) {
          self.param.setValue(this.newValue)
        }
        self.editing = false
      },
      onBlur () {
        this.updateValue()
      },
      onKeydownEnter () {
        this.updateValue()
      },
      onClickEdit () {
        if (this.param.getPermission) {
          //设置修改权限
          let getApiPermission = Utils.getApiPermission.bind(this)
          if (!getApiPermission(this.param.getPermission())) return
        }
        this.editing = true
        this.newValue = this.param.getValue();
        if(this.param.type === 'scope'){
          this.newValue = this.param.getScopeValue();
        }
        this.$nextTick(() => {
          this.$refs.input.focus()
        })
      },
      onInput ($event) {
        this.newValue = $event.target.value
      },
      onWindowClick: function (event) {
        if (this.$el.contains(event.target)) {
          this.focused = true
        } else {
          this.focused = false
        }
      }
    },
    computed: {
      permission () {
        if (!this.param.getPermission) return ''
        return this.param.getPermission()
      },
      canShowEdit () {
        if (this.editing) return false
        if (!this.param.canEdit) {
          return true
        }
        return this.param.canEdit() && !this.editing
      },
      isDisabled () {
        if (!this.param.getDisabled) return false
        return this.param.getDisabled()
      },
      isValid () {
        if (this.param.validator && this.param.validator.result) {
          if (!this.param.validator.result.ignorDirty) {
            if (!this.isDirty) {
              return true
            }
          }
          return this.param.validator.result.isValid
        } else {
          if (!this.isDirty) return true
        }
        return true
      },
      errorMsg () {
        if (this.param.validator && this.param.validator.result) {
          return this.param.validator.result.msg
        }
        return ''
      },
      classList () {
        let ret = ''
        if (this.isDisabled) {
          return 'disabled'
        } else if (!this.isValid) {
          ret = 'error'
        } else if (this.focused) {
          ret = 'focused'
        }
        return ret
      }
    },
    watch: {
    }
  }
</script>
