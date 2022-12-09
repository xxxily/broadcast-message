/*!
 * @name         url.js
 * @description  用于对url进行解析的相关方法
 * @version      0.0.1
 * @author       Blaze
 * @date         27/03/2019 15:52
 * @github       https://github.com/xxxily
 */

/**
 * 参考示例：
 * https://segmentfault.com/a/1190000006215495
 * 注意：该方法必须依赖浏览器的DOM对象
 */
export interface URLParams {
  [prop: string]: any
}

export interface URLObject {
  source: string
  protocol: string
  host: string
  port: string | number
  origin: string
  search: string
  query: string
  file: string
  hash: string
  path: string
  relative: string
  params: URLParams
  [prop: string]: any
}

function parseURL(url: string) {
  var a = document.createElement('a')
  a.href = url || window.location.href
  return {
    source: url,
    protocol: a.protocol.replace(':', ''),
    host: a.hostname,
    port: a.port,
    origin: a.origin,
    search: a.search,
    query: a.search,
    file: (a.pathname.match(/\/([^/?#]+)$/i) || ['', ''])[1],
    hash: a.hash.replace('#', ''),
    path: a.pathname.replace(/^([^/])/, '/$1'),
    relative: (a.href.match(/tps?:\/\/[^/]+(.+)/) || ['', ''])[1],
    params: (function () {
      const ret: any = {}
      const seg = []
      var paramArr = a.search.replace(/^\?/, '').split('&')

      for (var i = 0; i < paramArr.length; i++) {
        var item = paramArr[i]
        if (item !== '' && item.indexOf('=')) {
          seg.push(item)
        }
      }

      for (var j = 0; j < seg.length; j++) {
        var param = seg[j]
        var idx = param.indexOf('=')
        var key = param.substring(0, idx)
        var val = param.substring(idx + 1)
        if (!key) {
          ret[val] = null
        } else {
          ret[key] = val
        }
      }
      return ret
    })(),
  }
}

/**
 * 将params对象转换成字符串模式
 * @param params {Object} - 必选 params对象
 * @returns {string}
 */
function stringifyParams(params: URLParams) {
  var strArr = []

  if (!(Object.prototype.toString.call(params) === '[object Object]')) {
    return ''
  }

  for (var key in params) {
    if (Object.hasOwnProperty.call(params, key)) {
      var val = params[key]
      var valType = Object.prototype.toString.call(val)

      if (val === '' || valType === '[object Undefined]') continue

      if (val === null) {
        strArr.push(key)
      } else if (valType === '[object Array]') {
        strArr.push(key + '=' + val.join(','))
      } else {
        val = (JSON.stringify(val) || '' + val).replace(/(^"|"$)/g, '')
        strArr.push(key + '=' + val)
      }
    }
  }
  return strArr.join('&')
}

/**
 * 将通过parseURL解析出来url对象重新还原成url地址
 * 主要用于查询参数被动态修改后，再重组url链接
 * @param obj {Object} -必选 parseURL解析出来url对象
 */
function stringifyToUrl(urlObj: URLObject) {
  var query = stringifyParams(urlObj.params) || ''
  if (query) {
    query = '?' + query
  }
  var hash = urlObj.hash ? '#' + urlObj.hash : ''
  return urlObj.origin + urlObj.path + query + hash
}

export { parseURL, stringifyParams, stringifyToUrl }
