<style scoped lang="less">
@import "../style/login.less";
.login {
  background-attachment: fixed;
  overflow: hidden;
}

.spinner {
  position: relative;
  margin: auto;
  width: 50px;
  height: 50px;
  transition: all 0.2s ease 0s;
}
.spinner-circular {
  transform-origin: center center;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  margin: auto;
}
.spinner-path {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: dash .3s ease forwards 0.5s;
  opacity: 0;
  stroke-linecap: round;
  stroke: blueviolet;
  animation-play-state: running;
}
@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    opacity: 0;
  }
  50% {
    stroke-dasharray: 40, 200;
    opacity: 1;
  }
  100% {
    stroke-dasharray: 125, 200;
    opacity: 1;
  }
}
.form-loader {
  display: flex;
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  z-index: -4;
  transition: all 0.5s ease;
}
.form-cover {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: -4;
  border-radius: 7px;
  overflow: hidden;
  transition: all 0.3s ease 0.8s;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
}
.form-cover:after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: #4d317a;
  z-index: -4;
  border-radius: 50%;
  transition: all .3s ease 0.3s;
  transform: scale(0);
}
.form-cover:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: #ffffff;
  z-index: -5;
  border-radius: 50%;
  transition: all 0.3s ease;
  transform: scale(0);
}
.on-start .form-cover:before {
  transform: scale(0.15);
}
.document-loaded .form-loader {
  transform: scale(0);
  opacity: 0;
  visibility: hidden;
}
.document-loaded .form-cover {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}
.document-loaded .form-cover:after {
  transform: scale(2);
}
.document-loaded .form-cover:before {
  -webkit-transition: opacity 0.3s ease 0.8s, -webkit-transform 2s ease;
  transition: opacity 0.3s ease 0.8s, -webkit-transform 2s ease;
  transition: transform 2s ease, opactiy 0.3s ease 0.8s;
  transition: transform 2s ease, opactiy 0.3s ease 0.8s,
    -webkit-transform 2s ease;
  transform: scale(2);
  opacity: 0;
}
.document-loaded .login-content {
  opacity: 1;
  transform: none;
}

.document-loaded .login-logo {
  opacity: 1;
  transform: none;
}

.login-logo {
  opacity: 0;
  position: relative;
  transform: translateY(10px);
  transition: all 0.3s ease 0.7s;
}

.login-content {
  opacity: 0;
  position: relative;
  transform: translateY(10px);
  transition: all 0.3s ease 0.7s;
}

@keyframes rotate {
            0% {
                transform: perspective(400px) rotateZ(20deg) rotateX(-40deg) rotateY(0);
            }
            100% {
                transform: perspective(400px) rotateZ(20deg) rotateX(-40deg) rotateY(-360deg);
            }
        }

        .stars {
            transform: perspective(500px);
            transform-style: preserve-3d;
            position: absolute;
            bottom: 0;
            perspective-origin: 50% 100%;
            left: 50%;
            animation: rotate 90s infinite linear;
        }

        .star {
            width: 2px;
            height: 2px;
            background: #F7F7B6;
            position: absolute;
            top: 0;
            left: 0;
            transform-origin: 0 0 -300px;
            transform: translate3d(0, 0, -300px);
            backface-visibility: hidden;
        }
</style>
<template>
  <div :class="prefixCls" ref="login">
    <div class="stars">
      <div class="star" ref="star" v-for="(item,index) in starsCount" :key="index"></div>
      <!-- 在这里写入你的内容 -->
    </div>
    <div :class="[`${prefixCls}-container`]">
       <div class="form-cover"></div>
      <div class="form-loader">
        <div class="spinner">
          <svg class="spinner-circular" viewBox="25 25 50 50">
            <circle
              class="spinner-path"
              cx="50"
              cy="50"
              r="20"
              fill="none"
              stroke-width="4"
              stroke-miterlimit="10"
            />
          </svg>
        </div>
      </div>
      <div :class="[`${prefixCls}-logo`]"></div>
      <div :class="[`${prefixCls}-content`]">
        <el-tabs
          v-model="activeName"
          ref="loginConfig"
          @tab-click="setActiveName"
          tab-position="top"
        >
          <el-tab-pane label="账户登录" name="accountLogin">
            <transition name="login" type="transition">
              <el-form :model="loginConfig.account" status-icon ref="account" :rules="rules.account">
                <el-form-item prop="accountName">
                  <el-input
                    prefix-icon="iconfont icon-user"
                    placeholder="请输入账户名"
                    type="text"
                    v-model="loginConfig.account.accountName"
                    @keydown.enter.native="submitLogin"
                  />
                </el-form-item>
                <el-form-item prop="accountPassword">
                  <el-input
                    prefix-icon="iconfont icon-password"
                    placeholder="请输入账户密码"
                    type="password"
                    v-model="loginConfig.account.accountPassword"
                    @keydown.enter.native="submitLogin"
                    autocomplete="off"
                  />
                </el-form-item>
                <el-form-item v-if="hasAccountCaptcha">
                  <el-input
                    v-model="verifyCode"
                    placeholder="请输入验证码"
                    style="display: inline-block;
                            width: 30%;"
                    :class="[`${prefixCls}-verifyCode`]"
                    @keydown.enter.native="submitLogin"
                  />
                  <div style="display: inline-block; width: 68%;">
                    <img
                      :class="[`${prefixCls}-captcha-img`]"
                      :src="require('../assets/sys_login_verification_code_grey.svg')"
                      @click="refreshCaptcha()"
                    />
                    <img
                      :class="[`${prefixCls}-icon`]"
                      :src="require('../assets/sys_login_verification_code_grey.svg')"
                    />
                  </div>
                </el-form-item>
              </el-form>
            </transition>
          </el-tab-pane>
          <el-tab-pane label="用户登录" name="userLogin">
            <transition name="login" type="transition">
              <el-form :model="loginConfig.user" status-icon ref="user" :rules="rules.user">
                <el-form-item prop="accountName">
                  <el-input
                    prefix-icon="iconfont icon-user"
                    placeholder="请输入账户名"
                    type="text"
                    v-model="loginConfig.user.accountName"
                    @keydown.enter.native="submitLogin"
                  />
                </el-form-item>
                <el-form-item prop="userName">
                  <el-input
                    prefix-icon="iconfont icon-user"
                    placeholder="请输入用户名"
                    type="text"
                    v-model="loginConfig.user.userName"
                    @keydown.enter.native="submitLogin"
                  />
                </el-form-item>
                <el-form-item prop="userPassword">
                  <el-input
                    prefix-icon="iconfont icon-password"
                    placeholder="请输入用户密码"
                    type="password"
                    v-model="loginConfig.user.userPassword"
                    @keydown.enter.native="submitLogin"
                    autocomplete="off"
                    status-icon
                  />
                </el-form-item>
              </el-form>
            </transition>
          </el-tab-pane>
          <!--<el-tab-pane label="AD/LDAP 登录" name="adLogin">-->
          <!--<transition name="login" type="transition">-->
          <!--<el-form :model="loginConfig.adLdap" :rules="rules.adLdap">-->
          <!--<el-form-item prop="adLdapName">-->
          <!--<el-input prefix-icon="el-icon-setting" placeholder="请输入登录属性名"-->
          <!--type="text"-->
          <!--v-model="loginConfig.adLdap.adLdapName" required/>-->
          <!--</el-form-item>-->
          <!--<el-form-item prop="adLdapPassword">-->
          <!--<el-input prefix-icon="el-icon-setting" placeholder="请输入登录密码"-->
          <!--type="text" v-model="loginConfig.adLdap.adLdapPassword"/>-->
          <!--</el-form-item>-->
          <!--<el-form-item v-if="hasLdapCaptcha">-->
          <!--<el-input v-model="verifyCode"-->
          <!--placeholder="请输入验证码"-->
          <!--style="display: inline-block;-->
          <!--width: 30%;" :class="[`${prefixCls}-verifyCode`]"/>-->
          <!--<div style="display: inline-block; width: 68%;" >-->
          <!--<img :class="[`${prefixCls}-captcha-img`]" :src="`data:image/png;base64,${captchaImg}`" @click="refreshCaptcha()">-->
          <!--<img :class="[`${prefixCls}-icon`]" :src="require('../assets/sys_login_verification_code_grey.svg')" />-->
          <!--</div>-->
          <!--</el-form-item>-->
          <!--</el-form>-->
          <!--</transition>-->
          <!--</el-tab-pane>-->
        </el-tabs>
        <div style="width: 100%; height: 50px;">
          <el-button size="medium" :class="[`${prefixCls}-sbtn`]" @click="submitLogin">
            登录
            <i v-if="loading" class="el-icon-loading"></i>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CryptoJS from "crypto-js";
import { getServerUrl, requireAll2Obj } from "../utils/utils";
import LoginRequest from './loginRequest';
import { mapActions } from "vuex";

const secret = "7S8Jk8FcXP!@M4D3";
const key = CryptoJS.enc.Utf8.parse(secret);
const prefixCls = "login";
export default {
  name: "Login",
  mixins: [LoginRequest],
  data() {
    return {
      prefixCls: prefixCls,
      activeName: "accountLogin",
      verifyCode: "",
      twoFaAuthState: null,
      isCommunity: false,
      captchaImg: "",
      captchaUuid: "",
      hasAccountCaptcha: false,
      hasLdapCaptcha: false,
      loginConfig: {
        account: {
          accountName: "",
          accountPassword: ""
        },
        user: {
          userName: "",
          userPassword: "",
          accountName: ""
        },
        adLdap: {
          adLdapName: "",
          adLdapPassword: ""
        }
      },
      starsCount: 800,
      distance: 800,
      //校验规则
      rules: {
        account: {
          accountName: [
            { required: true, message: "账户名称不能为空", trigger: "blur" }
          ],
          accountPassword: [
            { required: true, message: "账户密码不能为空", trigger: "blur" }
          ]
        },
        user: {
          accountName: [
            { required: true, message: "账户名称不能为空", trigger: "blur" }
          ],
          userName: [
            { required: true, message: "用户名不能为空", trigger: "blur" }
          ],
          userPassword: [
            { required: true, message: "用户密码不能为空", trigger: "blur" }
          ]
        },
        adLdap: {
          adLdapName: [
            { required: true, message: "登录属性名不能为空", trigger: "blur" }
          ],
          adLdapPassword: [
            { required: true, message: "ad密码不能为空", trigger: "blur" }
          ]
        }
      },
      loading: false
    };
  },
  methods: {
    //触发异步dispatch
    ...mapActions(["updateDbObject"]),
    //切换tab页
    setActiveName(e) {
      let self = this;
      self.activeName = e.name;
      if (self.activeName === "userLogin") {
        localStorage.setItem("loginType", "user");
      }
      if (self.activeName === "accountLogin") {
        localStorage.setItem("loginType", "account");
      }
    },
    //提交表单
    submitLogin() {
      let self = this;
      //账户登录
      if (self.$refs.loginConfig.value === "accountLogin") {
        self.loginAccount();
      } else if (self.$refs.loginConfig.value === "userLogin") {
        //用户登录
        self.loginUser();
      } else if (self.$refs.loginConfig.value === "adLogin") {
        //ad用户登录
        self.loginAdLdap();
      }
    },
    //获得产品信息
    getProductInfo: function() {
      const self = this;
      return window.fetch(`${getServerUrl()}/productInfo`).then(response => {
        var link =
          document.querySelector("link[rel*='icon']") ||
          document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        link.href = `${getServerUrl()}/favicon?rev${new Date().getTime()}`;
        document.getElementsByTagName("head")[0].appendChild(link);

        return response.json().then(reply => {
          //响应存在
          if (reply) {
            document.title = reply.title;
            //保存产品信息
            return self.updateDbObject({
              name: "productInfo",
              data: reply
            });
          } else {
            return new Promise((resolve, reject) => {
              reject();
            });
          }
        });
      });
    },
    //获得注册licenses
    getAddonLicenses: function() {
      let _this = this;
      return _this.getLicenseAddons().then(addonResp => {
        let addonLicenses = addonResp.addons;
        return _this.updateDbObject({
          name: "common",
          data: {
            addonLicenses: addonLicenses
          }
        });
      });
    },
   //刷新验证码
    refreshCaptcha: function() {
      const self = this;
      fetch(
        `${getServerUrl()}/apiCall/refreshCaptcha?uuid=${self.captchaUuid}`
      ).then(response => {
        return response.json().then(reply => {
          if (reply.success) {
            self.captchaImg = reply.captcha;
            self.captchaUuid = reply.captchaUuid;
          } else {
            self.cannotConnectToServer = true;
          }
        });
      });
    }
  },
  mounted() {
    let _this = this;
    setTimeout(() => {
      document.body.classList.add('on-start')
    }, 100)
    setTimeout(() => {
      document.body.classList.add('document-loaded')
    }, 1000)
    // 原生js
    let _starList = document.getElementsByClassName("star");
    let starArr = Array.prototype.slice.call(_starList);
    // vue
    let starList = this.$refs.star;
    // 遍历添加样式
    starArr.forEach(item => {
      var s = 0.2 + Math.random() * 1;
      var thisDistance = _this.distance + Math.random() * 300;
      item.style.transformOrigin = `0 0 ${thisDistance}px`;
      item.style.transform = `translate3d(0,0,-${thisDistance}px) rotateY(${Math.random() *
        360}deg) rotateX(${Math.random() * -50}deg) scale(${s},${s})`;
    });
    let self = this;
    self.getTwoFaAuthState().then(result => {
      self.twoFaAuthState = result;
    });
    fetch(`${getServerUrl()}/apiCall/getLicenseInfo`)
      .then(response => {
        return response.json().then(reply => {
          if (reply.inventory.licenseType === "Community") {
            self.isCommunity = true;
          }
          return this.updateDbObject({
            name: "common",
            data: {
              license: reply.inventory
            }
          });
        });
      })
      .then(() => {
        return this.getProductInfo();
      })
      .then(() => {
        // get Addon licenses
        return this.getAddonLicenses();
      })
      .then(() => {
        //强制更新
        this.$forceUpdate();
      });
  },
  computed: {},
  //销毁时删除class documnet-loaded;
  destroyed() {
     document.body.classList.remove('document-loaded')
  }
};
</script>
