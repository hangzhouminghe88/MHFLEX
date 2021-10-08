<template>
  <div class="el-pagination">
    <div class="el-pagination__total">共 {{`${total}`}} 条</div>
    <el-select v-model="internalPageSize" @change="handleSizeChange" style="height: 30px;" ref="select">
      <el-option v-for="(item, index) in pageSizes"
                 :value="item"
                 :key="index"></el-option>
    </el-select>
    <button type="button"  class="btn-prev" @click="prev()" :disabled="internalCurrentPage <= 1">
      <i class="el-icon el-icon-arrow-left"></i>
    </button>
    <div class="current-page" v-text="`${internalCurrentPage} / ${(Math.ceil(total / internalPageSize))}`"></div>
    <button type="button" class="btn-next"  @click="next()" :disabled="total <= internalCurrentPage * internalPageSize ">
      <i class="el-icon el-icon-arrow-right"></i>
    </button>
    <!--<div class="pagination__jump">-->
      <!--前往&nbsp&nbsp<input v-model="jump" class="jump__input" @blur="jumpPage" :disabled="!canJump"/>&nbsp&nbsp页-->
    <!--</div>-->
  </div>
</template>

<script>
  export default {
    name: "OperationPagination",
    props: {
      total: {
        type: Number,
        default: 0
      },
      pageSizes:{
        type: Array,
        default: [],
      },
      pageSize: {
        type: Number,
        default: 0
      },
      currPage: {
        type: Number,
      },
      sizeChange: {
        type: Function
      },
      currentChange: {
        type: Function
      }
    },
    data(){
      return {
        internalCurrentPage: 1,
        internalPageSize: 0,
        jump: 1
      }
    },
    methods: {
      handleSizeChange(pageSize){
        let self = this;
        if(pageSize === self.pageSize) return;
        self.$emit('size-change', pageSize)
      },
      prev(){
        let self = this;
        if(self.internalCurrentPage !== 1)
        self.$emit('current-change', --self.internalCurrentPage);
      },
      next(){
        let self = this;
        if(self.total >= self.internalCurrentPage * self.internalPageSize)
          self.$emit('current-change', ++self.internalCurrentPage);
      },
      jumpPage(){
        let self = this;
        if(self.internalCurrentPage !== Number(self.jump) && this.canJump){
          self.$emit('current-change', Number(self.jump));
        }
      }
    },
    computed: {
      canJump(){
        let self = this;
        return Math.ceil(self.total / self.internalPageSize) - self.jump >= 0;
      }
    },
    watch:{
      currPage: {
        immediate: true,
        handler(val) {
          debugger
          this.internalCurrentPage = val;
          this.jump = val;
        }
      },

      pageSize: {
        immediate: true,
        handler(val) {
          this.internalPageSize = isNaN(val) ? 10 : val;
        }
      },
    },

    mounted () {
      let self = this;
      self.$refs.select.$el.firstElementChild.children[0].style.display = 'inline-block';
      self.$refs.select.$el.firstElementChild.children[0].style.height = '30px'
    }
  }
</script>

<style scoped>
 .el-pagination__total, .btn-prev, .btn-next, .current-page{
   display: inline-block;
 }
 .btn-prev, .btn-next{
   height: 30px;
 }
  .pagination__jump{
    display: inline-block;
    font-size: 13px;
    min-width: 35.5px;
    height: 28px;
    line-height: 28px;
    vertical-align: top;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    font-weight: 400;
    color: #606266;
  }
  .jump__input{
    width: 50px;
    text-align: center;
  }
 textarea:disabled, input:not([type]):disabled{
   background: #dae0e6;
 }
 input.el-input__inner{
   height: 30px!important;
 }
</style>
