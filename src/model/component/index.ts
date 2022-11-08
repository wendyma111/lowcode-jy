import _ from "lodash"
import { getModel } from 'model'

class ComponentMeta implements ComponentMetaModel {
  constructor(componentsMap: Record<string, Partial<ComponentMetaInfo>>) {
    const { components } = getModel()
    _.forEach(componentsMap, (componentInfo, componentName) => {
      return this._components.set(
        componentName,
        {
          ...componentInfo,
          constructor: components[componentName]
        }
      )
    })
  }

  _components: Map<string, Partial<ComponentMetaInfo>> = new Map()

  _categorys!: Map<string, Array<Partial<ComponentMetaInfo>>>

  get components() {
    return this._components
  }

  get categorys() {
    if (!this._categorys) {
      this._categorys = new Map()
      for(const [_, value] of this.components) {
        const { category = '基础元素' } = value
        const content = this._categorys.get(category)
        if (content) {
          content.push(value)
        } else {
          this._categorys.set(category, [value])
        }
      }
    }
    return this._categorys
  }

  getComponentInfoByName(componentName: string) {
    return this._components.get(componentName) ?? null
  }
}

export default ComponentMeta