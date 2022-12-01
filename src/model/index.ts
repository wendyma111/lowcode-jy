import _ from 'lodash'
import Project from './project'
import ComponentMeta from './component'
import React from 'react';
import { EMPTY_SCHEMA } from 'constant'


let projectModel: Project
let componentMeta: ComponentMeta

export function initModel(
  components: Record<string, { component: React.FunctionComponent | React.ComponentClass, config: Component }>,
  schema?: IProject
) {

  const g = self as any
  componentMeta = new ComponentMeta(components)
  const componentsMap: Record<string, Component> = {}

  for (const [key, value] of componentMeta.components) {
    componentsMap[key] = _.omit(value, ['constructor']) as Component
  }
  EMPTY_SCHEMA.componentsMap = componentsMap

  projectModel = new Project(schema ?? EMPTY_SCHEMA);
  g.projectModel = projectModel
  g.componentMeta = componentMeta
}

export function getModel() {
  return { projectModel, componentMeta }
}