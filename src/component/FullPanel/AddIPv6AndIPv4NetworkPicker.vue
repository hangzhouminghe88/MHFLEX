<template>
  <div>
    <div class="full-panel-item-title">
      {{ $t(param.getTitle()) }}
      <span v-if="canShowStar()">*</span>
      <!--<help-trigger style="top: 1px;" v-if="param.doc" :name="param.doc"></help-trigger>-->
    </div>
    <div class="full-panel-item-body" v-for="(item, index) in param.getValue()">
      <div class="list-content">
        <div class="item-block">
          <span class="icon-container" v-if="!isDisabled" @click="setDefaultItem($event, index)">
            <img class="radio" v-if="index === param.getDefaultItemIndex()" src="~assets/radio_selected.svg" />
            <img class="radio" v-else src="~assets/radio_normal.svg" />
          </span>
          <span class="item-text"> {{ $t("common.nicInfo") }}</span>
          <div class="delete" v-if="!isDisabled" @click="deleteItem($event, index)"></div>
        </div>
        <div class="item-block">
          <span class="item-title">
            {{ $t("vm.vmNicMAC") }}:
          </span>
          <span class="item-text"> {{ item.mac }} </span>
        </div>
        <div class="item-block">
          <span class="item-title">
            {{ $t("common.network") }}:
          </span>
          <span class="item-sub-block">
            <div>
              <span class="item-text">{{ getNetworkName(item.ipv4NetworkUuid) }}</span>
              <span class="item-ip">({{ item.ipv4StaticIP ? item.ipv4StaticIP : $t("vm.autoAssign") }})</span>
            </div>
            <div>
              <span class="item-text">{{ getNetworkName(item.ipv6NetworkUuid) }}</span>
              <span class="item-ip">({{ item.ipv6StaticIP ? item.ipv6StaticIP : $t("vm.autoAssign") }})</span>
            </div>
          </span>
        </div>
      </div>
    </div>
    <div style="margin-top: 20px;">
      <span @click="param.open()" class="add-botton">+{{$t("vm.addVMNic")}}</span>
    </div>
    <span class="error-msg" v-if="!isValid">{{ errorMsg }}</span>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';

  export default {
    name: 'FullPanelL3NetworkPicker',
    mixins: [WindowBase],
    props: ['param'],
    data () {
      return {
      }
    },
    created: function () {
      window.addEventListener('click', this.onWindowClick, true)
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick, true)
    },
    methods: {
      getNetworkName (uuid) {
        return this.dbData.l3network[uuid].name
      },
      canShowStar () {
        if (this.param.canShowStar) {
          return this.param.canShowStar()
        }
        return false
      },
      setDefaultItem ($event, index) {
        $event.stopPropagation()
        this.param.setDefaultItemIndex(index)
      },
      deleteItem ($event, index) {
        $event.stopPropagation()
        this.param.delete(index)
      },
      onWindowClick: function (event) {
      }
    },
    computed: {
      classList () {
        let ret = ''
        if (!this.isValid) {
          ret = 'error'
        }
        return ret
      },
      isValid () {
        try {
          return this.param.validator.result.isValid
        } catch (e) {
          return true
        }
      },
      errorMsg () {
        if (this.param.validator && this.param.validator.result) {
          return this.param.validator.result.msg
        }
        return ''
      },
      isDisabled () {
        if (!this.param.getDisabled) return false
        return this.param.getDisabled()
      }
    }
  }
</script>
<style scoped>
  .full-panel-item-title {
    position: relative;
    font-size: 14px;
    color: #5e6978;
    margin-bottom: 10px;
  }

  .list-content {
    font-size: 14px;
    color: #333;
    width: 100%;
    border: 1px solid #dae0e6;
    padding: 7px;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 10px;
  }

  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    height: 23px;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .content.focused .add {
    background-image: url('~assets/add_highlight.svg');
    background-repeat: no-repeat;
  }

  .add:hover {
    background-image: url('~assets/add_highlight.svg');
    background-repeat: no-repeat;
    cursor: pointer;
  }

  .add.disable {
    background-image: url('~assets/add_disable.svg');
    background-repeat: no-repeat;
    cursor: initial;
  }

  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    background-repeat: no-repeat;
    height: 22px;
    width: 22px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .delete:hover {
    background-image: url('~assets/delete_highlight.svg');
    background-repeat: no-repeat;
    cursor: pointer;
  }

  .network-config {
    overflow: hidden;
    line-height: 28px;
    padding: 0 12px 0 40px;
    font-size: 12px;
  }

  .network-config .text {
    color: #5E6978;
  }

  .network-config .link {
    position: relative;
    float: right;
    color: #007FDF;
    text-decoration: none;
    cursor: pointer;
  }

  .error {
    border-color: #ec5960;
  }

  .error-msg {
    font-size: 12px;
    color: #EC5960;
    padding-top: 5px;
  }

  .icon-container {
    width: 30px;
  }

  .item-text {
    line-height: 28px;
  }

  .full-panel-item-body {
    margin-bottom: 10px;
  }

  .item-block {
    width: 100%;
    position: relative;
    margin-bottom: 4px;
  }

  .item-title {
    display: inline-block;
    vertical-align: top;
    line-height: 28px;
  }

  .item-sub-block {
    display: inline-block;
  }

  .radio {
    position: relative;
    top: 8px;
  }

  .add-botton {
    color: #3C73B9;
    cursor: pointer;
    opacity: 1;
    font-size: 12px;
  }
</style>

