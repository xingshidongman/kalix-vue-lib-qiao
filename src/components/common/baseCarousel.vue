<!--
  文件预览
  桑杨
  2018年6月22日15:44:30
-->
<template lang="pug">
  el-dialog(v-bind:visible="visible" v-bind:before-close="close"
  v-bind:close-on-click-modal="false"
  v-bind:append-to-body="true"
  v-bind:top="dialogTop")
    el-carousel(indicator-position="outside" v-bind:autoplay="autoplay" v-bind:height="carouselHeight")
      el-carousel-item(v-for="item in items" v-bind:key="item")
        slot(name="itemSlot" v-bind:item="item")
          div.preview-item
            img(v-bind:src="item")
</template>

<script type="text/ecmascript-6">
  export default {
    name: 'kalix-carousel',
    props: {
      /**
       * 是否自动播放
       */
      autoplay: {
        type: Boolean,
        default: false
      },
      /**
       * 对话框顶部到窗口顶部的距离
       */
      dialogTop: {
        type: String,
        default: '10vh'
      },
      /**
       * 预览区高度
       */
      carouselHeight: {
        type: String,
        default: '65vh'
      }
    },
    data() {
      return {
        visible: false,
        bizKey: '',
        items: []
      }
    },
    methods: {
      close() {
        this.visible = false
        this._afterDialogClose()
      },
      openDialog(_items, _bizKey) {
        this.items = _items
        this.bizKey = _bizKey
        this.visible = true
      },
      _afterDialogClose() {
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .preview-item
    height 100%
    overflow auto
    text-align center
    background 50% 0 no-repeat
    background-size contain
</style>
