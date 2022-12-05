/**
 * 低代码执行上下文生成工厂
 * 外部可访问方法
 * 1、create：创建低代码执行上下文，通过iframe + with + Proxy + newFunction 实现在指定上下文中执行代码字符串，且与主环境隔离
 * 2、updateCtx：更新上下文
 * 3、autoExecute：在已创建好的上下文中执行代码字符串，可选择 仅执行一次 / 在上下文更新后自动执行, 返回reaction的清理函数
 * 
 * 内部方法：
 * 1、generateCtx：基于外部传进来的config，生成上下文，并结合with + proxy，形成访问白名单
 * 2、_postMessage：基于window.postMessage进行包装，为解决单次发消息可能出现的消息丢失问题
 */
import _ from 'lodash';
import React from 'react';
import { observable, action, makeObservable, reaction, IReactionDisposer } from 'mobx'
import { createRoot } from 'react-dom/client';
import { clone } from './utils';
import globalWhitelist from './globalWhitelist';
import { IOptions, IPostMessageEvent, Ctx, IMessage } from './index.type';
import IframeComp from './iframeContent'

class LowcodeExecuteCtxFatory {
  _id!: string;
  _iframe: any;
  /**
   * _ctxConfig为可观察对象
   *  用于与在上下文更新后通知autoExecute重新执行，已rerender响应组件
   */
  _ctxConfig!: Record<string, any>;
  _timeout = 2000;

  /**
   * 监听清理器
   *  用于在当前低码执行器被删除时，进行批量清理
   */
  clearReactions: IReactionDisposer[] = []

  constructor() {
    makeObservable(this, {
      _ctxConfig: observable.ref,
      _setCtxConfig: action,
    })
  }

  _setCtxConfig(newConfig: Record<string, any>) {
    this._ctxConfig = newConfig
  }

  static _whitelist = globalWhitelist;
  
  delete() {
    // 批量清理监听
    this.clearReactions.forEach(clear => clear?.())
  }

  autoExecute(code: string, type: 'once' | 'auto', callback?: (newValue: any) => void) {
    if (!this._iframe) {
      console.warn('请先调用Context.create，创建iframe实例');
      return;
    }

    this._postMessage(
      {
        type: 'lowCode_eval',
        id: this._id,
        data: code,
      },
      callback
    )

    /**
     * 执行多次autoExecute，会导致注册多个reaction，故将清理函数返回，在组件中进行清理
     * 清理时机：
     *  1、props修改时
     *  2、组件卸载时
     *  3、当前页面被删除时
     */ 
    if (type === 'auto') {
      const disposer: IReactionDisposer= reaction(
        () => this._ctxConfig,
        () => {
          this.autoExecute(code, 'once', callback)
        },
        {
          fireImmediately: false
        }
      )

      this.clearReactions.push(disposer)

      return disposer
    }
  }

  private updateCtx = (conf: any) => {
    if (!this._iframe) {
      console.warn('请先调用Context.create，创建iframe实例');
      return;
    }
    const config = clone(conf, this._iframe.contentWindow);

    this._setCtxConfig({
      ...this._ctxConfig,
      $state: { ...this._ctxConfig.$state, ...config.$state },
    })


    _.set(
      this._iframe.contentWindow,
      ['ctx', this._id],
      _.assign(_.get(this._iframe.contentWindow, ['ctx', this._id]), this._ctxConfig)
    );
  };

  private _postMessage(arg: IMessage & { hash?: number }, callback?: (newValue: any) => void) {
    const hash = Math.random();
    arg.hash = hash;

    const finalArg = _.assign(arg, { hash });

    const onMessage = (event: IPostMessageEvent) => {
      const {
        data: { type, hash: messageHash, data, id },
      } = event;
      // 确保是同一个lowcodeCtx的消息
      if (id !== this._id) return
      if (type === 'feedback_result') {
        // 确保是相应的消息，多个消息同时收发时，仅靠id和type判断会混乱
        if (messageHash === hash) {
          clearInterval(interval);
          callback?.(data)
          window.removeEventListener('message', onMessage);
        }
      }
    };

    window.addEventListener('message', onMessage);
    const interval = setInterval(() => {
      this._iframe.contentWindow.postMessage(finalArg);
    }, 700);
  }

  generateCtx(config: any) {
    if (!this._iframe) {
      console.warn('请先调用Context.create，创建iframe实例');
      return;
    }
    const iframeWindow = this._iframe.contentWindow
    const commonCtx = new Proxy(config, {
      /**
       * 限制向上查找
       */
      has() {
        return true;
      },
      get(target, key) {
        if (key === Symbol.unscopables) {
          return undefined;
        }
        if (globalWhitelist.includes(key as string)) {
          return target[key] ?? iframeWindow[key as string];
        } else {
          console.warn(`${String(key)}该方法不允许访问`);
          return undefined;
        }
      },
    });
    return commonCtx;
  }

  create:(conf: any, options?: IOptions) => Promise<Ctx> | void = (conf: any, options?: IOptions) => {
    this._timeout = options?.timeout ?? this._timeout;
    if (this._id === undefined) {
      const id = String(Math.random());
      this._id = id;

      return new Promise((resolve) => {
        const el = document.getElementById('_lowCode_iframe_');
        if (!el) {
          const iframe = document.createElement('iframe');
          (iframe as any).style = 'display:none;';
          iframe.setAttribute('id', '_lowCode_iframe_');
          iframe.setAttribute('src', '/lowcode');
          iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
          document.body.appendChild(iframe);

          iframe.onload = () => {
            const root = iframe.contentWindow?.document.createElement('div')
            iframe.contentWindow?.document.documentElement.appendChild(root as HTMLDivElement)
            
            const reactRoot = createRoot(root as HTMLDivElement)
            reactRoot.render(React.createElement(IframeComp))
            
            const config = clone(conf, iframe.contentWindow);
            this._iframe = iframe;
            this._setCtxConfig(config)

            const commonCtx = this.generateCtx(config);
            _.set(iframe.contentWindow as Window, ['ctx', id], commonCtx);
            resolve({
              autoExecute: this.autoExecute.bind(this),
              updateCtx: this.updateCtx.bind(this),
              delete: this.delete.bind(this)
            });
          };
        } else {
          const config = clone(conf, (el as HTMLIFrameElement).contentWindow);
          this._iframe = el;

          this._setCtxConfig(config)
          const commonCtx = this.generateCtx(config);
          _.set((el as HTMLIFrameElement).contentWindow as Window, ['ctx', id], commonCtx);
          resolve({
            autoExecute: this.autoExecute.bind(this),
            updateCtx: this.updateCtx.bind(this),
            delete: this.delete.bind(this)
          });
        }
      });
    }
  };
}

export default LowcodeExecuteCtxFatory;
