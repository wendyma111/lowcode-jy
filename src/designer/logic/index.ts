/**
 * 逻辑模块
 *   自定义变量
 *   自定义方法
 *   生命周期
 */
import _ from 'lodash'
import { autorun, makeObservable, observable, action, reaction, toJS, runInAction } from 'mobx'
import { getModel } from 'model'
import Document from 'model/document'
import { PAGE_LIFECYCLE_DEFAULT_VALUE } from 'constant'
import LowcodeExecuteCtxFatory from './lowcodeExecute'
import { Ctx } from './lowcodeExecute/index.type'
import Project from "model/project"
import { IFile } from './index.type'

class Logic {

  constructor(projectModel: Project) {
    /**
     * 监听全部变量的修改，更新设计模式下低代码执行的上下文
     */
    makeObservable(this, {
      ctxDesignMode: observable.ref,
      _addCtxDesignMode: action,
      lifeCycleFiles: observable.ref,
      initLifecycle: action,
    })

    this.initLifecycle(projectModel)

    // 监听自定义方法文件的改动
    autorun(() => {
      const methods: Record<string, IMethod> = {}
      const handlers = this.lifeCycleFiles.filter(file => file.path.startsWith('/global/handlers/'))
      _.map(handlers, handler => {
        const { value, name } = handler
        const key = name.replace('.ts', '')
        methods[key] = {
          key,
          value: value as string,
          path: `$api.custom.${key}`
        }
      })

      projectModel.methods = methods
    })

    // 监听数据源的修改
    autorun(() => {
      const newState: any = {}
      _.forEach(projectModel?.data ?? {}, (value, key) => {
        _.set(newState, `global.${key}`, value.defaultValue)
      })
      for(const [_key, doc] of projectModel.documents) {
        _.forEach(doc?.data ?? {}, (value, key) => {
          _.set(newState, `${_key}.${key}`, value.defaultValue)
        })
      }

      /**
       * 遍历页面，生成不同页面的低代码执行器
       */
      for (const [pageId, doc] of projectModel.documents) {
        const newStateByScope = { global: newState.global, [pageId]: newState[pageId] }

        if (this.ctxDesignMode[pageId]) {
          const curStateByScope = { global: this.$state.global, [pageId]: this.$state[pageId] }
          
          if (!_.isEqual(newStateByScope, curStateByScope)) {
            this.ctxDesignMode[pageId].updateCtx?.({ $state: newStateByScope ?? {} })
          }

        } else {
          (new LowcodeExecuteCtxFatory().create({ $state: newStateByScope ?? {} }) as Promise<Ctx>)
            .then((ctx: Ctx) => {
              this._addCtxDesignMode(pageId, ctx)
            })
        }
      }

      this.$state = newState
    })

    /**
     *  更新model中的lifecycle
     */ 
    autorun(() => {
      _.forEach(this.lifeCycleFiles, (file) => {
        const pathList = file.path.split('/').filter(item => item.length)

        if (pathList.includes('lifecycle.ts')) {
          const [_pages, pageId, _filename] = pathList
          const doc = projectModel.getDocument(pageId)
          if(doc) doc.lifecycle = file.value as string
        }
      })
    })
  }

  lifeCycleFiles: IFile[] = []

  initLifecycle = (projectModel: Project) => {
    const pageFiles: IFile[] = this._generatePageLifecycle(projectModel)

    const handlerFiles = _.values(projectModel.methods).map(method => {
      return {
        name: `${method.key}.ts`,
        type: 'file',
        path: `/global/handlers/${method.key}.ts`,
        language: 'typescript',
        value: method.value
      }
    })
    
    this.lifeCycleFiles = [
      {
        name: '全局',
        path: '/global',
        type: 'catalogue',
      },
      {
        name: 'handlers',
        path: '/global/handlers',
        type: 'catalogue',
      },
    ].concat(pageFiles, handlerFiles) as IFile[]

    /**
     * 监听页面的增减 与 页面名称的修改，重新生成lifeCycleFiles
     */
    reaction(
      () => {
        const newPages = []
        for(const [, doc] of projectModel.documents) {
          newPages.push({
            document: doc,
            name: doc.name,
          })
        }

        return newPages
      },
      () => {
        const newPageFiles = this._generatePageLifecycle(projectModel)
        const globalFiles = this.lifeCycleFiles.filter((item) => !item.path.startsWith('/pages'))
        this.lifeCycleFiles = globalFiles.concat(newPageFiles)
      }
    )
  }

  _generatePageLifecycle(projectModel: Project): IFile[] {
    const pageFiles: any = []
    for (const [_, doc] of projectModel.documents) {
      const pageLifecycle = this.lifeCycleFiles.find((item) => {
        return item.path === `/pages/${doc.id}/lifecycle.ts`
      })
      pageFiles.push([
        {
          name: doc?.name,
          path: `/pages/${doc.id}`,
          type: 'catalogue',
        },
        {
          name: 'lifecycle.ts',
          path: `/pages/${doc.id}/lifecycle.ts`,
          type: 'file',
          language: 'typescript',
          value: pageLifecycle?.value ?? doc?.lifecycle ?? PAGE_LIFECYCLE_DEFAULT_VALUE,
        },
      ])
    }

    pageFiles.unshift({
      name: '页面',
      path: '/pages',
      type: 'catalogue',
    })

    return _.flatten(pageFiles)
  }

  $state: Record<string, any> = {}

  _addCtxDesignMode = (pageId: PageId, ctx: Ctx) => {
    this.ctxDesignMode = { ...this.ctxDesignMode,  [pageId]: ctx }
  }

  _deleteCtxDesignMode = (pageId: PageId) => {
    if (this.ctxDesignMode[pageId]) {
      this.ctxDesignMode[pageId].delete()
      this.ctxDesignMode = _.omit(this.ctxDesignMode, [pageId])
    }
  }

  // 设计模式下 低代码执行上下文
  ctxDesignMode: Record<PageId, Ctx> = {}

  getAllVariable = () => {
    const { projectModel } = getModel()
    const variables: Record<string, any> = {}
    variables['global'] = toJS(projectModel.data)
    for (const [key, doc] of projectModel.documents) {
      variables[key] = toJS(doc.data)
    }
    return variables
  }

  getVaribleByPath = (path: string) => {
    const { projectModel } = getModel()
    if (typeof path !== 'string') {
      return null
    }
    const [,scope,key] = path.split('.')
    if (scope === 'global') {
      return projectModel.data[key]
    } else {
      return projectModel.getDocument(scope)?.data?.[key]
    }
  }

  setVariable(data: Record<string, IData>) {
    const { projectModel } = getModel()
    _.forEach(data, (value) => {
      const { scope } = value
      if (scope === 'global') {
        projectModel.setData({ [value.key]: {...projectModel.data[value.key] ?? {}, ...value} })
      } else {
        const targetDocument = projectModel.getDocument(scope) as Document
        targetDocument.setData({ [value.key]: { ...targetDocument.data[value.key], ...value } })
      }
    })
  }

  deleteVariable(data: Record<string, IData>) {
    const { projectModel } = getModel()
    _.forEach(data, (value) => {
      const { scope } = value
      if (scope === 'global') {
        projectModel.deleteData(value)
      } else {
        const targetDocument = projectModel.getDocument(scope) as Document
        targetDocument.deleteData(value)
      }
    })
  }
}

export default Logic