export declare global {
  interface Window {
    // 允许window扩展未知名称的属性
    [prop: string]: any
  }
}
