import BaseDialog from '../components/common/baseDialog'
import BaseToolBar from '../components/common/baseToolBar'
import BaseTable from '../components/common/baseTable'
import BaseTableTool from '../components/common/baseTableTool'
import BaseDateColumn from '../components/common/baseDateColumn'
import BaseDictSelect from '../components/common/baseDictSelect'
import BaseMapSelect from '../components/common/baseMapSelect'
import BaseSelect from '../components/common/baseSelect'
import Datepicker from '../components/common/date/datepicker'
import Datetimepicker from '../components/common/date/datetimepicker'
import DatepickerSimple from '../components/common/baseDatepicker'
import BaseSearch from '../components/common/baseSearch'
import BaseChartView from '../components/common/baseChartView'
import BaseChart from '../components/common/baseChart'
import BaseCheckbox from '../components/common/baseCheckbox'
import BaseHelp from '../components/common/baseHelp'
import BaseMenuTool from '../components/common/baseMenuTool'
import BaseNavMenu from '../components/common/baseNavMenu'
import BaseSysTemplate from '../components/common/baseSysTemplate'
import BasePopTableButton from '../components/common/basePopTableButton'
import BaseUpload from '../components/common/baseUpload'
import BaseTreeGrid from '../components/common/baseTreeGrid'
import BaseMobileFormItem from '../components/common/baseMobileFormItem'
import BasePhoneFormItem from '../components/common/basePhoneFormItem'
import BaseObjectSelect from '../components/common/baseObjectSelect'
import BaseObjectSelect2 from '../components/common/baseObjectSelect2'
import BaseAttachmentDialog from '../components/common/baseAttachmentDialog'
import BasePagedTable from '../components/common/basePagedTable'
import BaseTree from '../components/common/baseTree'
import BaseTree2 from '../components/common/baseTree2'
import EventConfig from '../components/common/event.toml'
import GlobalConfig from '../config/global.toml'
import Cache from '../common/cache'
import EventBus from '../common/eventbus'
import Message from '../common/message'
import PrettyBytes from '../common/pretty-bytes'
// import ModuleUtil from '../common/moduleUtil'
import {SearchDataMixin} from '../common/searchmixin'
import {CacheKeyObject, KeyValueObject, DictKeyValueObject} from '../common/keyValueObject'
import {strToUnicode, unicodeToStr} from '../common/unicode-convert'
import {isEmptyObject, concatArrayObject, concatObject, getNewObject} from '../common/util'
import {formatDate, GMTToStr} from '../common/typeFormat'
import getDictName from '../common/dictFilter'

const components = [
  BaseDialog,
  BaseToolBar,
  BaseTable,
  BaseTableTool,
  BaseDateColumn,
  BaseDictSelect,
  BaseMapSelect,
  BaseSelect,
  Datepicker,
  Datetimepicker,
  DatepickerSimple,
  BaseSearch,
  BaseChartView,
  BaseChart,
  BaseCheckbox,
  BaseHelp,
  BaseMenuTool,
  BaseNavMenu,
  BaseSysTemplate,
  BasePopTableButton,
  BaseUpload,
  BaseTreeGrid,
  BaseMobileFormItem,
  BasePhoneFormItem,
  BaseObjectSelect,
  BaseObjectSelect2,
  BaseAttachmentDialog,
  BasePagedTable,
  BaseTree,
  BaseTree2
]

// const filters = [
//   DictFilter
// ]

const lib = {
  install: function (Vue, opts) {
    opts = opts | {}

    // Vue组件加载
    // ModuleUtil.loadComponentSync(Vue, components)

    components.map((component) => {
      console.log('component.name=========', component.name)
      Vue.component(component.name, component)
    })
    // filters.map((filter) => {
    //   Vue.filter(filter.name, filter.filters)
    // })
    Vue.filter('getDictName', getDictName)
    // 内置对象使用
    // Vue.prototype.$Axios = Vue.axios

    // JS对象加载
    Vue.prototype.$KalixCatch = Cache
    Vue.prototype.$KalixEventBus = EventBus
    Vue.prototype.$KalixMessage = Message
    Vue.prototype.$SearchDataMixin = SearchDataMixin
    // Vue.prototype.$GlobalFilter = GlobalFilter
    // Vue.prototype.$GlobalComponent = GlobalComponent
    // Vue.prototype.$KalixModuleUtil = ModuleUtil

    // JS方法加载
    Vue.prototype.$M_CacheKeyObject = CacheKeyObject
    Vue.prototype.$M_KeyValueObject = KeyValueObject
    Vue.prototype.$M_DictKeyValueObject = DictKeyValueObject
    Vue.prototype.$M_StrToUnicode = strToUnicode
    Vue.prototype.$M_KeyValueObject = KeyValueObject
    Vue.prototype.$M_DictKeyValueObject = DictKeyValueObject
    Vue.prototype.$M_UnicodeToStr = unicodeToStr
    Vue.prototype.$M_IsEmptyObject = isEmptyObject
    Vue.prototype.$M_ConcatArrayObject = concatArrayObject
    Vue.prototype.$M_ConcatObject = concatObject
    Vue.prototype.$M_GetNewObject = getNewObject
    Vue.prototype.$M_FormatDate = formatDate
    Vue.prototype.$M_GMTToStr = GMTToStr
    Vue.prototype.$M_KalixPrettyBytes = PrettyBytes

    // Toml配置加载
    Vue.prototype.$KalixEventConfig = EventConfig
    Vue.prototype.$KalixGlobalConfig = GlobalConfig
    // ModuleUtil.moduleAdd(Vue, 'common')

    let moduleInfo = {
      moduleName: 'lib',
      moduleResolveArr: [],
      moduleKeyArr: []
    }

    Vue.prototype.$module = moduleInfo
  }
}
// ModuleUtil.globalUseComponent(common)
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(lib)
}
export default lib
