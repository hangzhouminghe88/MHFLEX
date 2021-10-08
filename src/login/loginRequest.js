import 'whatwg-fetch';
import sha512 from 'crypto-js/sha512';
import { getServerUrl } from '../utils/utils';
import rpc from '../utils/rpc'
import axios from 'axios';

export default {
  name: 'LoginRequest',
  methods: {
    //账户登录
    async loginAccount() {
      const _this = this;
      //校验表单输入
      let validateResult = await _this.loginValidate(_this.loginConfig.account.accountName, _this.loginConfig.account.accountPassword, _this.verifyCode, 'Account');
      //断开websocket
      rpc.disconnect();
      //整体校验提交表单
      _this.$refs.account.validate((valid) => {
        _this.loading = true;
        if (valid && validateResult) {
          let accountName = _this.loginConfig.account.accountName.toLowerCase().trim()
          if (_this.isCommunity && accountName !== 'admin') {
            _this.accountShowCommunityError = true
            return
          }
          if (_this.twoFaAuthState === true) {
            // if (accountName === '' || self.accountPassword.trim() === '') {
            //   self.accountLoginError = true
            //   this.stopLoading()
            //   return
            // }
            //密码用sha512加密
            let encodePassword = sha512(_this.loginConfig.account.accountPassword).toString()
            _this.getSecret(accountName, encodePassword, 'account', _this.captchaUuid, _this.verifyCode)
              .then((resp) => {
                _this.hasAccountCaptcha = false
                _this.openDialog('TwoFactorDlg', {
                  param: {
                    type: 'account',
                    name: accountName,
                    password: encodePassword,
                    captchaUuid: _this.captchaUuid,
                    verifyCode: _this.verifyCode,
                    secret: resp.value.inventory.secret
                  },
                  ok: (response) => {
                    _this.afterLoginByAccount(response, accountName)
                  }
                })
              })
              .catch((e) => {
                if (_this.hasAccountCaptcha && e.error && e.error.details && JSON.parse(e.error.details).error.code === 'SYS.1006') {
                  _this.errorAccountCaptcha = true
                  _this.verifyCode = ''
                  //检查验证码
                  this.checkForCaptcha(accountName, 'Account')
                } else {
                  _this.accountLoginError = true
                  _this.verifyCode = ''
                  //检查验证码
                  _this.checkForCaptcha(accountName, 'Account')
                }
                _this.loading = false;
              })
          } else {
            //超时处理
            let timeoutHandle = setTimeout(function () {
              _this.cannotConnectToServer = true
            }, 10 * 1000)
            //账户登录
            _this.loginByAccount(accountName, sha512(_this.loginConfig.account.accountPassword).toString(), _this.captchaUuid, _this.verifyCode)
              .then((response) => {
                clearTimeout(timeoutHandle)
                //登录后处理
                _this.afterLoginByAccount(response, accountName)
              })
              .catch((reply) => {
                _this.loading = false;
                clearTimeout(timeoutHandle)
                if (reply.status === 500) {
                  _this.$message.error('不能连接服务器，请联系管理员');
                } else if (_this.hasAccountCaptcha && JSON.parse(reply.error.details).error.code === 'SYS.1006') {
                  _this.$message.error('验证码错误');
                  _this.verifyCode = ''
                  _this.checkForCaptcha(accountName, 'Account')
                } else {
                  _this.$message.error({ message: '账户名或密码错误' });
                  _this.verifyCode = ''
                  _this.checkForCaptcha(accountName, 'Account')
                }
              })
          }
        }
      })
    },

    //用户登录
    async loginUser() {
      const _this = this;
      //校验用户登录
      let validateResult = await _this.loginValidate('', '', _this.verifyCode, 'User');
      //验证没通过怎直接返回
      if (!validateResult) {
        return
      }
      //断开websocket
      rpc.disconnect();
      //如果是社区用户
      if (_this.isCommunity) {
        _this.$message.error('用户名或密码错误');
        return
      }
      //超时处理
      let timeoutHandle = setTimeout(function () {
        _this.$message('无法连接到服务器');
      }, 10 * 1000)
      //校验并登录
      _this.$refs.user.validate(valid => {
        _this.loading = true;
        if (valid && validateResult) {
          fetch(`${getServerUrl()}/apiCall/loginUser?accountName=${_this.loginConfig.user.accountName.toLowerCase().trim()}&userName=${_this.loginConfig.user.userName.toLowerCase().trim()}&password=${sha512(_this.loginConfig.user.userPassword).toString()}`)
            .then(function (response) {
              response.json().then((reply) => {
                clearTimeout(timeoutHandle)
                if (reply.value) {
                  if (_this.loginConfig.user.accountName === 'admin') {
                    localStorage.setItem('isAdmin', 'true')
                  } else {
                    localStorage.setItem('isAdmin', 'false')
                  }
                  localStorage.setItem('isPlatformAdmin', 'false')
                  localStorage.setItem('isProjectLogin', 'false')
                  localStorage.setItem('isLoginFromProject', 'false')
                  localStorage.setItem('isUser', 'true')
                  localStorage.setItem('isNormalAccount', 'false')
                  localStorage.setItem('loginType', 'user')
                  localStorage.setItem('sessionUuid', reply.value.inventory.uuid)
                  localStorage.setItem('accountUuid', reply.value.inventory.accountUuid)
                  localStorage.setItem('userUuid', reply.value.inventory.userUuid)
                  localStorage.setItem('accountName', _this.loginConfig.user.accountName)
                  localStorage.setItem('userName', _this.loginConfig.user.userName)
                  _this.updateDbObject({
                    name: 'identity',
                    data: {
                      name: _this.userName
                    }
                  })
                  // rpc.connect(() => {
                  //   self.$router.push(self.goToPath)
                  // })
                  _this.loading = false;
                  //登录后处理
                  _this.afterLoginByUser(reply)
                } else {
                  _this.loading = false;
                  if (reply.status === 500) {
                    _this.$message('无法连接到服务器，请联系管理员');
                  } else {
                    _this.$message('用户登录失败');
                  }
                }
              })
            }, (error) => {
              _this.loading = false;
            })
        }
      })
    },
    //用户登录后设置session创建时间以及过期时间
    afterLoginByUser(reply) {
      let _this = this
      rpc.connect(() => {
        _this.getGoToPath()
          .then(() => {
            return rpc.put('management-nodes/actions', {
              'getCurrentTime': {}
            })
              .then((resp) => {
                localStorage.setItem('sessionCreateDate', reply.value.inventory.createDate)
                localStorage.setItem('sessionExpiredDate', reply.value.inventory.expiredDate)
                localStorage.setItem('expiredTime', resp.currentTime.MillionSeconds + (new Date(reply.value.inventory.expiredDate)).getTime() - (new Date(reply.value.inventory.createDate)).getTime())
                //跳转到首页
                _this.$router.push('/main/ecs/home')
              })
          })
      })
    },
    //登录后localStorage存储的账户信息如果sessionUuid不存在则证明登录一过期需重新登录
    afterLoginByAccount(reply, accountName) {
      let _this = this
      if (reply.value) {
        if (accountName === 'admin') {
          localStorage.setItem('isAdmin', 'true')
          localStorage.setItem('isNormalAccount', 'false')
        } else {
          localStorage.setItem('isAdmin', 'false')
          localStorage.setItem('isNormalAccount', 'true')
        }
        localStorage.setItem('isPlatformAdmin', 'false')
        localStorage.setItem('isProjectLogin', 'false')
        localStorage.setItem('isLoginFromProject', 'false')
        localStorage.setItem('isUser', 'false')
        localStorage.setItem('loginType', 'account')
        localStorage.setItem('sessionUuid', reply.value.inventory.uuid)
        localStorage.setItem('accountUuid', reply.value.inventory.accountUuid)
        localStorage.setItem('accountName', accountName)
        _this.updateDbObject({
          name: 'identity',
          data: {
            name: accountName
          }
        })
        rpc.disconnect()
        rpc.connect(() => {
          _this.getGoToPath()
            .then(() => {
              return _this.getCurrentTime()
                .then((resp) => {
                  //设置过期时间
                  localStorage.setItem('sessionCreateDate', reply.value.inventory.createDate)
                  localStorage.setItem('sessionExpiredDate', reply.value.inventory.expiredDate)
                  localStorage.setItem('expiredTime', resp.currentTime.MillionSeconds + ((new Date(reply.value.inventory.expiredDate)).getTime() - (new Date(reply.value.inventory.createDate)).getTime()))
                  _this.$router.push({ path: _this.goToPath ? _this.goToPath : '/main/ecs/home', name: _this.goToPath.split('/')[_this.goToPath.split('/').length - 1] });
                  _this.loading = false;
                })
                .catch((error) => {
                  console.log(error)
                })
            })
        })
      } else {
        if (reply.status === 500) {
          _this.cannotConnectToServer = true
        } else if (_this.hasAccountCaptcha && JSON.parse(reply.error.details).error.code === 'SYS.1006') {
          _this.errorAccountCaptcha = true
          _this.verifyCode = ''
          _this.checkForCaptcha(accountName, 'Account')
        } else {
          _this.accountLoginError = true
          _this.verifyCode = ''
          _this.checkForCaptcha(accountName, 'Account')
        }
        _this.accountShowCommunityError = false
      }
    },
    //设置登录后跳转
    getGoToPath() {
      let _this = this;
      //获得用户信息根据用户信息跳转
      return new Promise((resolve, reject) => {
        fetch(`${getServerUrl()}/apiCall/getLicenseInfo`)
        .then(response => {
          response.json().then(licenseResp => {
            if (licenseResp.inventory.expired && localStorage.getItem('isAdmin') === 'true') {
              _this.goToPath = '/main/about';
            } else {
              _this.goToPath = '/main/ecs/home';
            }
            resolve(_this.goToPath);
          })
        }, (e) => {
           throw Error(reject(e))
        })
      })
    },
    //获得当前时间
    getCurrentTime() {
      let config = {
        method: 'get',
        baseURL: getServerUrl(),
        url: 'apiCall/getCurrentTime'
      }
      return axios(config).then((response) => {
        if (response.data.error) {
          return Promise.reject(response.data.error)
        }
        return Promise.resolve(response.data)
      }, (e) => {
        return Promise.reject(e)
      })
    },

    loginAdLdap() {
      console.log(this);
    },

    async loginValidate(name, password, verifyCode, type) {
      const _this = this;
      let captchaResult = await _this.checkForCaptcha(name.toLowerCase().trim(), type)
      if (captchaResult === false) {
        _this.$message({ type: 'error', message: '错误' })
        return false
      }
      if (_this[`has${type}Captcha`] && verifyCode.trim() === '') {
        _this.$message({ type: 'error', message: '验证码不正确或为空' })
        return false
      }
      return true
    },

    async checkForCaptcha(name, type) {
      const _this = this;
      let typeName = ''
      if (type === 'Account') {
        if (_this.twoFaAuthState === true) typeName = 'twoFactorAccount'
        else typeName = 'account'
      } else if (type === 'VirtualID') {
        if (_this.twoFaAuthState === true) typeName = 'twoFactorIAM2'
        else typeName = 'IAM2'
      } else {
        typeName = 'ldap'
      }
      let response
      try {
        response = await fetch(`${getServerUrl()}/apiCall/GetLoginCaptcha?resourceName=${name}&loginType=${typeName}&captchaUuid=${_this.captchaUuid}`)
      } catch (e) {
        return false
      }
      return response.json().then(reply => {
        if (reply.captcha) {
          _this[`has${type}Captcha`] = true
          _this.captchaImg = reply.captcha
          _this.captchaUuid = reply.captchaUuid
        } else {
          _this[`has${type}Captcha`] = false
          _this.captchaUuid = ''
        }
        return new Promise((resolve, reject) => { resolve() })
      })
    },

    getTwoFaAuthState() {
      let config = {
        method: 'get',
        baseURL: getServerUrl(),
        url: 'apiCall/twofactorauthentication/state'
      }
      return axios(config).then((response) => {
        if (response.data.error) {
          return Promise.reject(response.data)
        }
        return Promise.resolve(response.data)
      }, (e) => {
        return Promise.reject(e)
      })
    },

    getLicenseAddons() {
      let config = {
        method: 'get',
        baseURL: getServerUrl(),
        url: 'apiCall/licenses/addons'
      }
      return axios(config).then((response) => {
        if (response.data.error) {
          return Promise.reject(response.data.error)
        }
        return Promise.resolve(response.data)
      }, (e) => {
        return Promise.reject(e)
      })
    },

    getSecret(name, password, type, captchaUuid, verifyCode) {
      let config = {
        method: 'get',
        baseURL: getServerUrl(),
        url: 'apiCall/twofactorauthentication/secret',
        params: {
          name,
          password,
          type,
          captchaUuid,
          verifyCode
        }
      }
      if (captchaUuid === '' && verifyCode === '') {
        config.params = {
          name,
          password,
          type
        }
      }
      return axios(config).then((response) => {
        if (response.data.error) {
          return Promise.reject(response.data)
        }
        return Promise.resolve(response.data)
      }, (e) => {
        return Promise.reject(e)
      })
    },

    loginByAccount(accountName, password, captchaUuid, verifyCode, twofatoken) {
      let params = {
        accountName,
        password,
        captchaUuid,
        verifyCode
      }
      if (captchaUuid === '' && verifyCode === '') {
        params = {
          accountName,
          password
        }
      }
      if (twofatoken) {
        params.authCode = twofatoken
      }
      let config = {
        method: 'get',
        baseURL: getServerUrl(),
        url: 'apiCall/loginAccount',
        params: params
      }
      return axios(config).then((response) => {
        if (response.data.error) {
          return Promise.reject(response.data)
        }
        return Promise.resolve(response.data)
      }, (e) => {
        return Promise.reject(e)
      })
    }
  }
}
