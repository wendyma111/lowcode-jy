interface IProject {
  name: string;
  version: string;
  currentPage: string;
  componentsMap: Record<string, Component>;
  pagesMap: Record<string, IPage>
}

interface IPage {
  name: string;
  css: string;
  componentTree: Record<string, INode>
}

interface INode {
  componentName: string;
  parentId: string | null;
  props: Record<string, any>;
  children: Array<string>;
}

interface Component {
  componentName: string;
  label: string;
  screenShot: string;
  category: string;
  priority: number;
  npmInfo: INpmInfo;
  settings: Record<string, ISetting>;
  isContainer: Boolean;
}

interface INpmInfo {
  npm: string;
  version: string
}

interface ISetting {
  settingName: string;
  label: string;
  type: string;
  value: any
}