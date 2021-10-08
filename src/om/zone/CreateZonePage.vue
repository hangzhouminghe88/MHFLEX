<template>
    <create-template>
      <div slot="header" class="create-header">
        <span>
          {{$t('zone.create')}}
        </span>
        <span class="create-back" @click="$router.push({name: 'zone'})"><i class="el-icon-back"></i>回到区域列表</span>
      </div>
      <div slot="body" class="create-body">
        <el-form label-position="left" ref="basicConfig" :model="basicConfig"
                 :rules="rules">
          <el-form-item :label="$t('common.name')" label-width="100px" prop="name">
            <el-input placeholder="请输入名称" style="width:300px;" v-model="basicConfig.name"/>
          </el-form-item>
          <el-form-item :label="$t('common.description')" label-width="100px" prop="description">
            <el-input type="textarea" style="width:300px;" :autosize="{ minRows: 3, maxRows: 4}"
                      v-model="basicConfig.description"/>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="create-footer">
        <span class="btn-confirm" @click="createZone">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="$router.push({name: 'zone'})">{{$t('common.cancel')}}</span>
      </div>
    </create-template>
</template>

<script>
    import Methods from './Methods'
    import WindowBase from 'src/windows/Window';
    import CreateTemplate from 'src/component/CreateTemplate';
    import Root from 'src/windows/Root';
    import Utils from 'src/utils/utils';

    export default {
      name: "CreateZonePage",
      mixins:[Methods,WindowBase,Root],
      components: {CreateTemplate},
      data(){
        return{
          show:true,
          basicConfig: {
            name: '',
            description: '',
          },
          rules: {
            name: [
              {required: true, message: '名称不能为空', trigger: 'blur'}
            ]
          },
        }
      },
      methods:{
        ...Utils,
        createParam: function () {
          return {
            name: this.basicConfig.name,
            description: this.basicConfig.description
          }
        },
        validateName () {
          let obj = {}
          obj.emptyname = false
          let input = this.basicConfig.name.trim()
          if (!input) obj.emptyname = true
          this.updateWindow(obj)
        },
        createZone () {
          this.validateName()
          if (this.windowData.emptyname) return
          this.create(this.createParam())
          this.$router.push({name: 'zone'});
        }
      }
    }
</script>

<style scoped>

</style>
