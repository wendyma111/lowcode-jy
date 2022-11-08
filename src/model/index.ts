import _ from 'lodash'
import Project from './project'
import ComponentMeta from './component'
import mock_schema from '__mock/schema';
import mock_components from '__mock/components';
import React from 'react';


let projectModel: Project
let componentMeta: ComponentMeta
let components: Record<string, React.ClassicComponent | React.FC> = mock_components

export function initModel() {
  const g = self as any
  componentMeta = new ComponentMeta(mock_schema.componentsMap)
  projectModel = new Project(mock_schema);
  g.projectModel = projectModel
  g.componentMeta = componentMeta
}

export function getModel() {
  return { projectModel, componentMeta, components }
}