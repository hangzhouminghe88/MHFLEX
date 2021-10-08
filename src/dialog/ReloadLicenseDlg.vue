<template>
  <el-dialog :visible.async="visibled" @close="close">
    <div slot="title">{{ $t('about.reloadLicense') }}</div>
    <div class="container">
      <div v-if="message.length>0" v-for="(uuid, index) in message" :key="index">
        <div class="content">
          <div style="margin-bottom:10px;">
            {{ `${$t("consoleProxy.managementIp")}: ${dbData.managementNode[uuid].hostName}` }}
          </div>
          <div class="drop-file-body"
               :style="{'background-color': !windowData.licenseList[uuid] ? '#FAFDFF' : '#FFFFFF'}">
            <input type="file" @change="filesChange(uuid, $event)"/>
            <i v-if="!windowData.licenseList[uuid]" class="el-icon-upload icon"></i>
            <i v-else class="el-icon-circle-check icon-success"></i>
            <span class="text" style="display: block;">{{ !windowData.licenseList[uuid] ? $t("about.loadLicense") : windowData.licenseList[uuid].name }}</span>
          </div>
          <span class="error error-text" v-show="windowData.invalidFile" style="display: inline-block;text-align: center">{{ $t("about.fileInvalid") }}</span>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';
  export default {
    name: "ReloadLicenseDlg",
    mixins: [WindowBase],
    props: {
      model: {
        type: Boolean,
        default: false
      },
      message: {
        type: Array,
        default: []
      },
      param: {
        type: Object,
        default:{}
      }
    },
    data() {
      return {
        visibled: false
      }
    },
    mounted() {
      let self = this
    },
    methods: {
      getInitData(param) {
        let obj = {
          account: '',
          password: '',
          licenseList: {},
          uuidList: [],
          invalidFile: false
        }
        // if (param && param.param && param.param.managementNodesUuidList) {
        let uuidList = this.message;
        if (uuidList) {
          obj.uuidList = uuidList
        }
        return obj
      },
      close() {
        let self = this;
        self.visibled = false;
        self.$emit('setDisVisiable');
      },
      filesChange: function (uuid, $event) {
        let self = this
        let reader = new window.FileReader()
        let licenseList = _.cloneDeep(this.windowData.licenseList)
        let fileName = $event.target.files[0].name;
        let size = $event.target.files[0].size
        if (size / 1024 > 35) {
          self.updateWindow({ invalidFile: true })
        } else if (this.windowData.invalidFile) {
          self.updateWindow({ invalidFile: false })
        }
        reader.onload = function (e) {
          licenseList[uuid] = {
            text: e.target.result,
            name: fileName,
            uuid: uuid
          }
          self.updateWindow({ licenseList })
        }
        reader.readAsText($event.target.files[0], 'utf-8')
      },
      confirm(){
        let self = this;
        if (this.windowData.invalidFile) return
        let licenseList = []
        _.mapValues(this.windowData.licenseList, (item) => {
          licenseList.push(item)
        })
        self.reloadLicense(licenseList).then(() => {
          self.param.queryList()
          window.fetch(`${Utils.getServerUrl()}/apiCall/refreshLicense`)
        });
        self.$emit('setDisVisiable');
      },
      reloadLicense: function (licenseList) {
        let self = this
        let event = self.createEvent('about.action.upload', null, licenseList.length)
        let tasks = []
        licenseList.forEach((item) => {
          ((item) => {
            let p = rpc.put(`licenses/mn/${item.uuid}/actions`, {
              'updateLicense': {
                license: window.btoa(unescape(encodeURIComponent(item.text)))
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(item)
        })
        return Promise.all(tasks)
      },
  },
  watch: {
    model(newVal, oldVal)
    {
      if (newVal !== oldVal) {
        this.visibled = newVal;
      }
    }
  ,
    message(newVal, oldVal)
    {
      let obj = {};
      if (newVal !== oldVal) {
        obj = this.getInitData(newVal);
      }
      this.updateWindow(obj);
    }
  }
  }
</script>

<style scoped lang="less">
  .container {
    overflow: hidden;
    height: 408px;

    .content {
      height: 200px;
      margin: 100px 150px 110px;

      .drop-file-body {
        background: rgb(250, 253, 255);
        height: 100%;
        position: relative;
        text-align: center;
        border: 1px dashed #409EFF;

        .icon {
          margin-top: 60px;
          font-size: 50px;
        }
        .icon-success{
          margin-top: 60px;
          font-size: 50px;
         color: #409EFF;
        }
      }

      input[type='file'] {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        cursor: pointer;
      }
    }
  }
</style>
