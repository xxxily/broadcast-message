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
    [prop: string]: any;
}
export interface URLObject {
    source: string;
    protocol: string;
    host: string;
    port: string | number;
    origin: string;
    search: string;
    query: string;
    file: string;
    hash: string;
    path: string;
    relative: string;
    params: URLParams;
    [prop: string]: any;
}
declare function parseURL(url: string): {
    source: string;
    protocol: string;
    host: string;
    port: string;
    origin: string;
    search: string;
    query: string;
    file: string;
    hash: string;
    path: string;
    relative: string;
    params: any;
};
/**
 * 将params对象转换成字符串模式
 * @param params {Object} - 必选 params对象
 * @returns {string}
 */
declare function stringifyParams(params: URLParams): string;
/**
 * 将通过parseURL解析出来url对象重新还原成url地址
 * 主要用于查询参数被动态修改后，再重组url链接
 * @param obj {Object} -必选 parseURL解析出来url对象
 */
declare function stringifyToUrl(urlObj: URLObject): string;
export { parseURL, stringifyParams, stringifyToUrl };
