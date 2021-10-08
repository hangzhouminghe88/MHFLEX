<template>
  <dialog-template>
    <div slot="title" class="el-dialog_header">
      <span>{{ $t('cluster.vmCpuModel') }}</span>
      <span class="el-icon-close dialog-close" @click="cancel"></span>
    </div>
    <div slot="body">
      <div class="dialog-content">
        <div class="operation-row" style="padding: 50px 150px;position: relative;">
          <div class="title">{{$t('cluster.vmCpuModel')}}<help-trigger name="cpuModel" :style="{'position':'absolute','left': '355','top': '52px'}"/></div>
          <el-select v-model="cpuModel" placeholder="请选择">
            <el-option
              v-for="item in vmCpuModelList"
              :key="item.value"
              :label="$t(`${item.name}`)"
              :value="item.value"
              :disabled="item.disabled">
            </el-option>
          </el-select>
        </div>
      </div>
    </div>
    <div slot="footer" class="el-dialog__footer">
      <span class="btn-confirm" @click.stop="confirm">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click.stop="cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  export default {
    name: "UpdateCpuModelDlg",
    mixins: [WindowBase],
    components: {
      'drop-down': DropDown
    },
    data(){
      return {
        cpuModel: 'None',
        vmCpuModelList: [
          {name: 'common.None', value: 'None'},
          {name: 'common.Haswell-noTSX',value:'Haswell-noTSX'},
          {name: 'common.Haswell', value: 'Haswell'},
          {name: 'common.Broadwell-noTSX', value: 'Broadwell-noTSX'},
          {name: 'common.Broadwell', value:'Broadwell'},
          {name: 'common.SandyBridge', value: 'SandyBridge'},
          {name: 'common.IvyBridge', value: 'IvyBridge'},
          {name: 'common.Conroe', value: 'Conroe'},
          {name: 'common.Penryn', value: 'Penryn'},
          {name: 'common.Nehalem', value: 'Nehalem'},
          {name: 'common.Westmere', value: 'Westmere'},
          {name: 'common.host-passthrough', value: 'host-passthrough'},
          {name: 'common.Opteron_G1', value: 'Opteron_G1'},
          {name: 'common.Opteron_G2', value: 'Opteron_G2'},
          {name: 'common.Opteron_G3', value: 'Opteron_G3'},
          {name: 'common.Opteron_G4', value: 'Opteron_G4'}
        ]
      }
    },
    created(){
      let self = this;
      let dialogData = this.dialogData
      if (dialogData && dialogData.param) {
        self.cpuModel = dialogData.param.cpuModel
      }
    },
    methods: {
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm(){
        let self = this;
        if (self.cpuModel !== self.dialogData.param.cpuModel) {
          this.dialogData.param.ok(self.cpuModel)
        }
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
