/***
 * 数据字典filter
 * @param value
 * @param appName 默认为OA
 * @param dictType
 * @returns {string}
 */
import Cache from './cache'

const getDictName = function (value, appName = 'OA', dictType) {
  const dict = JSON.parse(Cache.get(appName.toUpperCase() + '-DICT-KEY'))
  // console.log('过滤器 dict：=============', dict)
  // console.log('过滤器 appName：=============', appName.toUpperCase())
  let item = dict.find(e => {
    return e.type === dictType && e.value === value
  })
  if (item) {
    return item.label
  }
  return ''
}
export default getDictName
