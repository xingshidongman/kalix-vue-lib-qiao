export default {
  // 组件全局引用
  globalUseComponent(component) {
    if (typeof window !== 'undefined' && window.Vue) {
      window.Vue.use(component)
    }
  },
  // 模块添加
  moduleAdd(Vue, name, resolveArr, keyArr) {
    let moduleInfo = {
      moduleName: name,
      moduleResolveArr: resolveArr,
      moduleKeyArr: keyArr
    }

    if (Vue.prototype.modulePlugins) {
      if (Vue.prototype.modulePlugins.length) {
        let existMonitor = Vue.prototype.modulePlugins.filter((item) => {
          return item.moduleName === name
        })
        if (!existMonitor) {
          Vue.prototype.modulePlugins.push(moduleInfo)
        }
      } else {
        Vue.prototype.modulePlugins.push(moduleInfo)
      }
    }
  },
  // 异步加载组件
  loadComponentAsync(configs, relativePath) {
    let resolveArr = {}
    let keyArr = []
    if (configs && configs.length) {
      configs.forEach((item) => {
        resolveArr[item.app + '#' + item.fun] = (resolve) => {
          require([relativePath + item.app + '/' + item.fun + '/' + item.fun + '.vue'], resolve)
        }
        keyArr.push(item.app + '#' + item.fun)
      })
    }
    return {
      resolveArr: resolveArr,
      keyArr: keyArr
    }
  },
  // 全局加载组件
  loadComponentSync(Vue, components) {
    if (components && components.length) {
      components.map((component) => {
        Vue.component(component.name, component)
      })
    }
  }
}
