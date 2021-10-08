<script>
let typeStrategies = {
  'String' (key, rule) {
    const self = this
    self.$data.validator._cache[key].push(val => {
      let ruleArr = rule.split(':')
      let fnName = ruleArr.shift()
      ruleArr.unshift(val)
      return fns[fnName].apply(self, ruleArr)
    })
  },
  'Object' (key, rule) {
    const self = this
    self.$data.validator._cache[key].push(val => {
      let ruleArr = rule.fn.split(':')
      let errMsg = rule.msg
      let fnName = ruleArr.shift()
      ruleArr.unshift(val)
      ruleArr.push(errMsg)
      return fns[fnName].apply(self, ruleArr)
    })
  },
  'Function' (key, rule) {
    const self = this
    self.$data.validator._cache[key].push(val => rule(val))
  }
}
import fns from './functions'
import _ from 'lodash'

export default {
  data () {
    return {
      validator: {
        batchAdd: this._batchAdd_,
        add: this._add_,
        checkKeys: this._checkKeys_,
        getValidationResult: this._getValidationResult_,
        batchRemove: this._batchRemove_,
        check: this._check_,
        _result: {},
        _cache: {},
        _unWatch: {}
      }
    }
  },
  methods: {
    _batchRemove_ (keys) {
      keys.forEach(it => {
        this._remove_(it)
        this[it] = null
      })
    },
    _remove_ (key) {
      const self = this
      let unWatch = self.$data.validator._unWatch[key]
      if (typeof unWatch === 'function') unWatch()
      if (self.$data.validator._cache[key]) {
        delete self.$data.validator._cache[key]
      }
      if (self.$data.validator._result[key]) {
        delete self.$data.validator._result[key]
      }
    },
    _batchAdd_ (param) {
      let keys = _.keys(param)
      keys.forEach(key => { this._add_(key, param[key]) })
    },
    _add_ (key, rules) {
      const self = this
      self.$data.validator._cache[key] = self.$data.validator._cache[key] || []
      rules = _.isArray(rules) ? rules : [rules]
      rules.forEach(rule => {
        let type = Object.prototype.toString.call(rule).slice(8, -1)
        typeStrategies[type].call(self, key, rule)
      })
      let unWatch = self.$watch(key, (newVal, oldVal) => {
        if (newVal === undefined) {
          self._remove_(key)
          return
        }
        self._check_(key, newVal)
      }, {deep: true})
      self.$set(self.$data.validator._result, key, { isSuccess: true })
      self.$data.validator._unWatch[key] = unWatch
    },
    _check_ (key, val) {
      if (val === undefined) val = this[key]
      let cache = this.$data.validator._cache[key] || []
      let errInfo = {}
      let validation = { isValid: true }
      for (let i = 0; i < cache.length; i++) {
        validation = cache[i](val)
        if (!validation.isValid) break
      }
      errInfo.isSuccess = validation.isValid
      errInfo.msg = validation.errMsg
      this.$set(this.$data.validator._result, key, errInfo)
      return errInfo.isSuccess
    },
    _getValidationResult_ (key) {
      return this.$data.validator._result[key]
    },
    _checkKeys_ (keys) {
      keys.forEach(it => this._check_(it))
      return keys.every(key => this.$data.validator._result[key].isSuccess)
    }
  }
}
</script>



// WEBPACK FOOTER //
// Vm.vue?76f41595