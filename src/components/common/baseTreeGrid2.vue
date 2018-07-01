<template lang="pug">
  div.kalix-article
    keep-alive
      component(
      v-bind:is="bizSearch"
      ref="bizSearchRef"
      v-if="bizSearch"
      v-on:onSearchBtnClick="onSearchClick")
    div.kalix-wrapper(v-bind:style="setWrapperStyle()" style="bottom:8px;")
      div.kalix-wrapper-hd
        i(v-bind:class="iconCls")
        | {{title}}
      div.kalix-wrapper-bd
        template(v-if="isToolBarSelf")
          kalix-tool-bar(v-if="isShowToolBar" v-bind:toolbarBtnList="toolbarBtnList" v-on:onToolBarClick="onToolBarSelfClick")
        template(v-else)
          kalix-tool-bar(v-if="isShowToolBar" v-bind:toolbarBtnList="toolbarBtnList" v-on:onToolBarClick="onToolBarClick")
        div.kalix-table-container(ref="kalixTableContainer" v-bind:style="tableContainerStyle" style="overflow-y:auto;")
          div.autoTbale(v-bind:style="{width:tableWidth}")
            table.table.table-bordered(id="hl-tree-table")
              thead
                tr
                  template(v-if="isColumnfixed")
                    th(v-for="(column,index) in cloneColumns" v-bind:style="getColumnWidth(column.width)")
                      i(v-if="column.type === 'hidden'" type="hidden" v-bind:style="{width:0}")
                      label(v-else) {{ renderHeader(column, index) }}
                        span.ivu-table-sort(v-if="column.sortable")
                          i(v-bind:class="{on: column._sortType === 'asc'}"
                          v-on:click.native="handleSort(index, 'asc')" title="上箭头")
                          i(v-bind:class="{on: column._sortType === 'desc'}"
                          v-on:click.native="handleSort(index, 'desc')" title="下箭头")
                  template(v-else)
                    th(v-for="(column,index) in cloneColumns")
                      i(v-if="column.type === 'hidden'" type="hidden" v-bind:style="{width:0}")
                      label(v-else) {{ renderHeader(column, index) }}
                        span.ivu-table-sort(v-if="column.sortable")
                          i(v-bind:class="{on: column._sortType === 'asc'}"
                          v-on:click.native="handleSort(index, 'asc')" title="上箭头")
                          i(v-bind:class="{on: column._sortType === 'desc'}"
                          v-on:click.native="handleSort(index, 'desc')" title="下箭头")
              tbody
                tr(v-for="(item,index) in initItems" v-bind:key="item.id" v-show="show(item)" v-bind:class="{'child-tr':item.parent,'active':item.id === checkId}" v-on:click="toSelect(item)")
                  td(v-for="(column,snum) in columns" v-bind:key="column.key" v-bind:style="tdStyle(column)")
                    div(v-if="column.type === 'action'")
                      template(v-for="action in column.actions")
                        template(v-if="isRowButtonSelf")
                          el-tooltip(v-bind:content="action.text" placement="top")
                            el-button.base-teble-operation(type="text" v-on:click="btnSelfClick(item,action.type)" style="width:30px" v-bind:key="action.text") {{action.text}}
                        template(v-else)
                          el-tooltip(v-if="action.toolTipTitle" v-bind:content="action.toolTipTitle" placement="top")
                            el-button.base-teble-operation(type="text" v-on:click="btnClick(item,action.type)" style="width:30px" v-bind:key="action.text") {{action.text}}
                          el-tooltip(v-else v-bind:content="action.text" placement="top")
                            el-button.base-teble-operation(type="text" v-on:click="btnClick(item,action.type)" style="width:30px" v-bind:key="action.text") {{action.text}}
                    input(v-if="column.type === 'hidden'" type="hidden" v-bind:value="renderBody(item, column)")
                    div(v-else)
                      label(v-on:click="toggle(index,item)" v-if="!column.type")
                        span.tree-icon(v-if='snum==2')
                          i(v-html='item.spaceHtml')
                          i.el-icon(v-if="item.children&&item.children.length>0"
                          v-bind:class="{'el-icon-plus':!item.expanded,'el-icon-minus':item.expanded}")
                          i(v-else class="kailx-ms-tree-space")
                        | {{renderBody(item, column)}}
      component(:is="whichBizDialog" ref="kalixDialog"
      v-bind:formModel="formModel"
      v-bind:formRules="formRules")
</template>
<script>
import ToolBar from './baseToolBar'
import Cache from '../../common/cache'
import EventBus from '../../common/eventbus'
import {ON_SEARCH_BUTTON_CLICK, ON_REFRESH_DATA} from './event.toml'

export default {
  name: 'kalix-tree-grid-1',
  props: {
    title: { // 表格组件标题名
      type: String,
      required: true
    },
    isShowToolBar: { // 是否显示工具栏
      type: Boolean,
      default: true
    },
    isToolBarSelf: { // 是否使用自定义事件的工具栏
      type: Boolean,
      default: false
    },
    toolbarBtnList: { // toolBar 中按钮数组
      type: Array,
      default: () => {
        return []
      }
    },
    bizSearch: { //  使用的搜索组件名称
      type: String
    },
    bizDialog: { //  使用的对话框组件名称
      type: Array
    },
    bizKey: { // 主鍵
      type: String
    },
    columns: Array,
    targetURL: '',
    formModel: null,
    customTableTool: { // 对table的操作按钮进行自定义的操作
      type: Function
    },
    isRowButtonSelf: { // table 行按钮自实现
      type: Boolean,
      default: false
    },
    customRender: { // 对table的数据进行自定义的修饰
      type: Function
    },
    onToolBarSelfClick: { // toolbar自定义点击事件
      type: Function
    },
    btnSelfClick: { // 表格行添加按钮自定义点击事件
      type: Function
    },
    isColumnfixed: {
      type: Boolean,
      default: false
    },
    dialogOptions: {},
    isSearchAfterHandle: {
      type: Boolean,
      default: false
    },
    isLimitLayer: {
      type: Boolean,
      default: true
    },
    jsonStr: { // 数据列表请求的查询条件
      type: String,
      default: ''
    },
    otherStr: { // 非search from下参数
      type: String,
      default: ''
    },
    appendCondition: { // search组件之外的查询条件
      type: Array
    },
    noSearchParam: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      iconCls: '',
      initItems: [], // 处理后数据数组
      cloneColumns: [], // 处理后的表头数据
      checkGroup: [], // 复选框数组
      checks: false, // 全选
      screenWidth: document.body.clientWidth, // 自适应宽
      tdsWidth: 0, // td总宽
      timer: false, // 控制监听时长
      dataLength: 0, // 树形数据长度
      items: [], // 表格数据
      whichBizDialog: '', //
      checkId: 1,
      checkedItem: null,
      searchParam: {} //  列表查询条件
    }
  },
  activated() {
    // EventBus.$off(ON_REFRESH_DATA)
    console.log(this.bizKey + '  is activated')
    EventBus.$on(ON_SEARCH_BUTTON_CLICK, this.onSearchClick)
    EventBus.$on(ON_REFRESH_DATA, this.refresh)
  },
  deactivated() {
    console.log(this.bizKey + '  is deactivated')
    EventBus.$off(ON_SEARCH_BUTTON_CLICK)
    EventBus.$off(ON_REFRESH_DATA)
  },
  computed: {
    tableWidth() {
      return this.tdsWidth > this.screenWidth && this.screenWidth > 0 ? this.screenWidth + 'px' : '100%'
    }
  },
  watch: {
    screenWidth(val) {
      if (!this.timer) {
        this.screenWidth = val
        this.timer = true
        setTimeout(() => {
          this.timer = false
        }, 400)
      }
    },
    items() {
      if (this.items) {
        this.dataLength = this.Length(this.items)
        this.initData(this.deepCopy(this.items), 1, null)
        this.checkGroup = this.renderCheck(this.items)
        if (this.checkGroup.length === this.dataLength) {
          this.checks = true
        } else {
          this.checks = false
        }
      }
    },
    columns: {
      handler() {
        this.cloneColumns = this.makeColumns()
      },
      deep: true
    },
    checkGroup(data) {
      this.checkAllGroupChange(data)
    },
    // 添加url变化时获取数据, add by yangze 2018-1-25
    targetURL() {
      this.getData()
    }
  },
  mounted() {
    this.getData()
    if (this.items) {
      this.dataLength = this.Length(this.items)
      this.initData(this.deepCopy(this.items), 1, null)
      this.cloneColumns = this.makeColumns()
      this.checkGroup = this.renderCheck(this.items)
      if (this.checkGroup.length === this.dataLength) {
        this.checks = true
      } else {
        this.checks = false
      }
    }
    // 绑定onresize事件 监听屏幕变化设置宽
    this.$nextTick(() => {
      this.screenWidth = document.body.clientWidth
    })
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth
        this.screenWidth = window.screenWidth
      })()
    }
    // 注册事件接受
    const that = this
    window.addEventListener('resize', () => {
      that._getTableHeight()
    })
    EventBus.$on(this.bizKey + '-' + 'KalixDialogClose', () => {
      this.whichBizDialog = ''
    })
    //  绑定表格 icon 图标
    const currentTreeListItem = JSON.parse(Cache.get('currentTreeListItem'))
    if (currentTreeListItem) {
      this.iconCls = currentTreeListItem.iconCls
    }
    // console.log(' ===== this.bizDialog =====', this.bizDialog)
    if (this.bizDialog) {
      setTimeout(() => {
        this.$emit('kalixDialog', this.$refs.kalixDialog)
      }, 200)
    }
  },
  methods: {
    // 获取表格数据
    getData() {
      if (!this.targetURL) {
        return
      }

      let _data = {
        jsonStr: this.jsonStr,
        otherStr: this.otherStr
      }
      console.log('_data===================0000000000000', _data)
      if (this.noSearchParam === false) {
        console.log('_data===================', _data)
        _data = Object.assign(_data, this.searchParam)
        // 添加search组件之外的查询条件，解决jsonStr key覆盖问题
        if (this.appendCondition && _data.jsonStr.length > 0) {
          _data.jsonStr = _data.jsonStr.substring(0, _data.jsonStr.length - 1) + ',' + this.appendCondition + '}'
        }
      }
      this.axios.request({
        method: 'GET',
        url: this.targetURL,
        params: _data
      }).then(res => {
        this.items = res.data.children
        if (this.customRender) { // 对table的数据进行自定义的修饰
          this.customRender(this.items)
        }
        // 查询以后清空选中
        this.clearSeleted()
        if (this.isSearchAfterHandle) {
          this.$emit('handleAfterSearch', this.items)
        }
      })

      const currentTreeListItem = JSON.parse(Cache.get('currentTreeListItem'))
      if (currentTreeListItem) {
        this.iconCls = currentTreeListItem.iconCls
      }
    },
    setWrapperStyle() {
      // console.log('bizSearch', this.bizSearch)
      if (!this.bizSearch) {
        return {'top': '8px'}
      }
      return {}
    },
    tableContainerStyle() {
      return {'top': (!this.isShowToolBar ? '56px' : '')}
    },
    _getTableHeight() {
      if (this.$refs.kalixTableContainer && this.$refs.kalixTableContainer.clientHeight) {
        this.tableHeight = this.$refs.kalixTableContainer.clientHeight
      }
    },
    onToolBarClick(btnId) {
      // baseToolBar 回调事件
      switch (btnId) {
        case 'add':
          this.onAddClick()
          break
        case 'refresh':
          this.onRefreshClick()
          break
        default:
          this.customToolBar(btnId, this)
          break
      }
    },
    onAddClick() {
      this.$emit('addClick')
    },
    // 有无多选框折叠位置优化
    iconRow() {
      for (var i = 0, len = this.columns.length; i < len; i++) {
        if (this.columns[i].type === 'selection') {
          return 1
        }
      }
      return 0
    },
    // 设置td宽度,td的align
    tdStyle(column) {
      var style = {}
      if (column.align) {
        style['text-align'] = column.align
      }
      if (column.width) {
        style['min-width'] = column.width + 'px'
      }
      return style
    },
    // 排序事件
    handleSort(index, type) {
      this.cloneColumns.forEach((col) => {
        col._sortType = 'normal'
      })
      if (this.cloneColumns[index]._sortType === type) {
        this.cloneColumns[index]._sortType = 'normal'
      } else {
        this.cloneColumns[index]._sortType = type
      }
      this.$emit('on-sort-change', this.cloneColumns[index]['key'], this.cloneColumns[index]['_sortType'])
    },
    // 选中某一行
    toSelect(item) {
      // 添加选中反选
      // if (this.checkId !== item.id) {
      this.checkId = item.id
      this.checkedItem = item
      // console.log('item', item)
      // 选中行父组件父组件获取
      this.$emit('selectedRow', item)
      // } else {
      //   this.clearSeleted()
      // }
    },
    clearSeleted() {
      this.checkId = 1
      this.checkedItem = null
      this.$emit('selectedRow', undefined)
    },
    // 点击事件 返回数据处理
    makeData(data) {
      const t = this.type(data)
      let o
      if (t === 'array') {
        o = []
      } else if (t === 'object') {
        o = {}
      } else {
        return data
      }

      if (t === 'array') {
        for (let i = 0; i < data.length; i++) {
          o.push(this.makeData(data[i]))
        }
      } else if (t === 'object') {
        for (let i in data) {
          if (i !== 'spaceHtml' && i !== 'parent' && i !== 'level' && i !== 'expanded' && i !== 'isShow' && i !==
            'load') {
            o[i] = this.makeData(data[i])
          }
        }
      }
      return o
    },
    // 处理表头数据
    makeColumns() {
      let columns = this.deepCopy(this.columns)
      this.tdsWidth = 0
      columns.forEach((column, index) => {
        column._index = index
        column._width = column.width ? column.width : ''
        column._sortType = 'normal'
        this.tdsWidth += column.width ? parseFloat(column.width) : 0
      })
      return columns
    },
    // 数据处理 增加自定义属性监听
    initData(items, level, parent) {
      this.initItems = []
      let spaceHtml = ''
      for (var i = 1; i < level; i++) {
        spaceHtml += "<i class='ms-tree-space'></i>"
      }
      items.forEach((item, index) => {
        item = Object.assign({}, item, {
          'parent': parent,
          'level': level,
          'spaceHtml': spaceHtml
        })
        if ((typeof item.expanded) === 'undefined') {
          item = Object.assign({}, item, {
            'expanded': false
          })
        }
        if ((typeof item.show) === 'undefined') {
          item = Object.assign({}, item, {
            'isShow': false
          })
        }
        item = Object.assign({}, item, {
          'load': (item.expanded ? item.expanded : false)
        })
        this.initItems.push(item)
        if (item.children && item.expanded) {
          this.initData(item.children, level + 1, item)
        }
      })
    },
    //  隐藏显示
    show(item) {
      return ((item.level === 1) || (item.parent && item.parent.expanded && item.isShow))
    },
    toggle(index, item) {
      let level = item.level + 1
      let spaceHtml = ''
      for (var i = 1; i < level; i++) {
        spaceHtml += "<i class='ms-tree-space kailx-ms-tree-space'></i>"
      }
      if (item.children) {
        if (item.expanded) {
          item.expanded = !item.expanded
          this.close(index, item)
        } else {
          item.expanded = !item.expanded
          if (item.load) {
            this.open(index, item)
          } else {
            item.load = true
            item.children.forEach((child, childIndex) => {
              this.initItems.splice((index + childIndex + 1), 0, child)
              // 设置监听属性
              this.$set(this.initItems[index + childIndex + 1], 'parent', item)
              this.$set(this.initItems[index + childIndex + 1], 'level', level)
              this.$set(this.initItems[index + childIndex + 1], 'spaceHtml', spaceHtml)
              this.$set(this.initItems[index + childIndex + 1], 'isShow', true)
              this.$set(this.initItems[index + childIndex + 1], 'expanded', false)
            })
          }
        }
      }
    },
    open(index, item) {
      if (item.children) {
        item.children.forEach((child, childIndex) => {
          child.isShow = true
          if (child.children && child.expanded) {
            this.open(index + childIndex + 1, child)
          }
        })
      }
    },
    close(index, item) {
      if (item.children) {
        item.children.forEach((child, childIndex) => {
          child.isShow = false
          child.expanded = false
          if (child.children) {
            this.close(index + childIndex + 1, child)
          }
        })
      }
    },
    checkAllGroupChange(data) {
      if (this.dataLength > 0 && data.length === this.dataLength) {
        this.checks = true
      } else {
        this.checks = false
      }
      this.$emit('on-selection-change', this.checkGroup)
    },
    All(data) {
      let arr = []
      data.forEach((item) => {
        arr.push(item.id)
        if (item.children && item.children.length > 0) {
          arr = arr.concat(this.All(item.children))
        }
      })
      return arr
    },
    // 返回树形数据长度
    Length(data) {
      let length = data.length
      data.forEach((child) => {
        if (child.children) {
          length += this.Length(child.children)
        }
      })
      return length
    },
    // 返回表头
    renderHeader(column, $index) {
      if ('renderHeader' in this.columns[$index]) {
        return this.columns[$index].renderHeader(column, $index)
      } else {
        return column.title || '#'
      }
    },
    // 返回内容
    renderBody(row, column, index) {
      return row[column.key]
    },
    // 默认选中
    renderCheck(data) {
      let arr = []
      data.forEach((item) => {
        if (item._checked) {
          arr.push(item.id)
        }
        if (item.children && item.children.length > 0) {
          arr = arr.concat(this.renderCheck(item.children))
        }
      })
      return arr
    },
    // 深度拷贝函数
    deepCopy(data) {
      var t = this.type(data),
        o, i, ni
      if (t === 'array') {
        o = []
      } else if (t === 'object') {
        o = {}
      } else {
        return data
      }
      if (t === 'array') {
        for (i = 0, ni = data.length; i < ni; i++) {
          o.push(this.deepCopy(data[i]))
        }
        return o
      } else if (t === 'object') {
        for (i in data) {
          o[i] = this.deepCopy(data[i])
        }
        return o
      }
    },
    type(obj) {
      var toString = Object.prototype.toString
      var map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
      }
      return map[toString.call(obj)]
    },
    onSearchClick(_searchParam) { // 查询按钮点击事件
      console.log('[kalix] base table search clicked', _searchParam)
      // 设置searchparam
      this.noSearchParam = false
      // 兼容多个baseTable同时使用情况，用bizKey区分具体查询
      if (_searchParam.bizKey) {
        this.searchParam = _searchParam.searchObj
        if (_searchParam.bizKey === this.bizKey) {
          this.refresh()
        }
      } else {
        this.searchParam = _searchParam
        this.refresh()
      }
    },
    formRules() {
    },
    onRefreshClick() { // 刷新按钮点击事件
      this.getData()
    },
    refresh(bizKey) {
      this.getData()
    },
    btnClick(row, btnId) { // table工具栏点击事件
      console.log(row, btnId)
      switch (btnId) {
        case 'edit': {
          this.$emit('editClick', row)
          break
        }
        case 'delete': {
          this.$emit('deleteClick', row)
          break
        }
        default: // 默认转到调用props的方法
          this.customTableTool(row, btnId, this)
          break
      }
    },
    getKalixDialog(opt, callBack) {
      let dig = this.bizDialog.filter((item) => {
        return item.id === opt
      })
      this.whichBizDialog = dig[0].dialog
      setTimeout(() => {
        callBack(this.$refs.kalixDialog)
      }, 20)
    },
    getColumnWidth(width) {
      return {width: width + 'px'}
    }
  },
  components: {
    KalixToolBar: ToolBar
  }
}
</script>
<style lang="stylus" type="text/stylus">
  .kailx-ms-tree-space {
    display inline-block
    width 1em
  }
</style>
<style scoped lang="stylus" type="text/stylus">
  @import "../../assets/stylus/baseTable.styl"
  .tree-icon
    margin-right 8px
    color #dd9e4a
    font-weight bold
    cursor pointer

  .autoTbale {
    overflow: auto;
  }

  table {
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    line-height: 23px;
  }

  .table-bordered {
    border: 0px solid #EBEBEB;
  }

  .table > tbody > tr > td,
  .table > tbody > tr > th {
    border-top: 1px solid #e7eaec;
    line-height: 1.42857;
    padding: 5px;
    vertical-align: middle;
    font-size: 14px;
    line-height: 23px;
  }

  .table > tbody > tr > td .base-teble-operation
  .operation-btn
    font-size 13px
    cursor pointer
    color #dd9e4a
    & + .operation-btn
      margin-left 8px
      .kailx-ms-tree-space {
        display inline-block
        width 1em
      }

  .table > tbody > tr .focus {
    background-color: #eee;
  }

  .table > thead > tr > td,
  .table > thead > tr > th {
    /*border-top: 1px solid #e7eaec;*/
    border: 0;
    line-height: 1.42857;
    padding: 8px;
    vertical-align: middle;
    font-family: Arial;
    color: #b18e60;
    font-size: 14px;
    line-height: 23px;
    font-family: inherit;
  }

  .table-bordered > tbody > tr > td,
  .table-bordered > tbody > tr > th,
  .table-bordered > tfoot > tr > td,
  .table-bordered > tfoot > tr > th,
  .table-bordered > thead > tr > td,
  .table-bordered > thead > tr > th {
    border-bottom: 1px solid #e7e7e7;
    border-top: 1px solid #e7e7e7;
  }

  .table > thead > tr > th {
    border-bottom: 1px solid #DDD;
  }

  .table-bordered > thead > tr > td,
  .table-bordered > thead > tr > th {
    background-color: #F5F5F6;
  }

  #hl-tree-table > tbody > tr {
    background-color: #fbfbfb;
  }

  #hl-tree-table > tbody > tr.active {
    /*background-color #ffefbb*/
    background-color rgba(255, 239, 187, 0.21)
  }

  #hl-tree-table > tbody > .child-tr {
    background-color: #fff;
  }

  label {
    margin: 0 8px;
  }

  .ms-tree-space {
    position: relative;
    top: 1px;
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    width: 14px;
    height: 14px;
  }

  .ms-tree-space::before {
    content: ""
  }

  #hl-tree-table th > label {
    margin: 0;
  }

</style>

