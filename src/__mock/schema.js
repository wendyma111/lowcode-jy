export default {
  name: 'test',
  version: '0.0.0',
  currentPage: 'pageId1',
  componentsMap: {
    Container: {
      isContainer: true,
      componentName: 'Container',
      label: '矩形',
      screenShot: '',
      category: '容器',
      priority: 1,
      npmInfo: {
        npm: '@lowcode-material/Container',
        version: '1.0.0',
      },
      settings: {
        width: {
          settingName: 'width',
          label: '宽度',
          type: 'number',
          value: 200
        },
        height: {
          settingName: 'height',
          label: '高度',
          type: 'number',
          value: 100
        },
        background: {
          settingName: 'background',
          label: '背景颜色',
          type: 'color',
          value: 'blue'
        }
      }
    },
    Text: {
      componentName: 'Text',
      label: '文本',
      screenShot: '',
      category: '元素',
      priority: 1,
      npmInfo: {
        npm: '@lowcode-material/Text',
        version: '1.0.0',
      },
      settings: {
        color: {
          settingName: 'color',
          label: '字体颜色',
          type: 'color',
          value: 'black'
        },
        fontSize: {
          settingName: 'fontSize',
          label: '字体大小',
          type: 'number',
          value: 14
        }
      }
    },
    Button: {
      componentName: 'Button',
      label: '按钮',
      screenShot: '',
      category: '元素',
      priority: 2,
      npmInfo: {
        npm: '@lowcode-material/Button',
        version: '1.0.0',
      },
      settings: {
        width: {
          settingName: 'width',
          label: '宽度',
          type: 'number',
          value: 200
        },
        height: {
          settingName: 'height',
          label: '高度',
          type: 'number',
          value: 100
        },
        background: {
          settingName: 'background',
          label: '背景颜色',
          type: 'color',
          value: 'pink'
        },
        color: {
          settingName: 'color',
          label: '字体颜色',
          type: 'color',
          value: 'black'
        },
        fontSize: {
          settingName: 'fontSize',
          label: '字体大小',
          type: 'number',
          value: 14
        }
      }
    },
    Button2: {
      componentName: 'Button',
      label: '按钮2',
      screenShot: '',
      category: '元素',
      priority: 2,
      npmInfo: {
        npm: '@lowcode-material/Button',
        version: '1.0.0',
      },
      settings: {
        width: {
          settingName: 'width',
          label: '宽度',
          type: 'number',
          value: 200
        },
        height: {
          settingName: 'height',
          label: '高度',
          type: 'number',
          value: 100
        },
        background: {
          settingName: 'background',
          label: '背景颜色',
          type: 'color',
          value: 'pink'
        },
        color: {
          settingName: 'color',
          label: '字体颜色',
          type: 'color',
          value: 'black'
        },
        fontSize: {
          settingName: 'fontSize',
          label: '字体大小',
          type: 'number',
          value: 14
        }
      }
    }
  },
  pagesMap: {
    'pageId1': {
      name: '页面一',
      css: '.div { background: "red" }',
      componentTree: {
        'compId11': {
          componentName: 'Container',
          parentId: null,
          props: {},
          children: ['compId13']
        },
        'compId13': {
          componentName: 'Container',
          parentId: 'compId11',
          props: {},
          children: ['compId12']
        },
        'compId12': {
          componentName: 'Text',
          parentId: 'compId13',
          props: {},
          children: []
        }
      }
    },
    'pageId2': {
      name: '页面二',
      css: '.div { background: "black" }',
      componentTree: {
        'compId21': {
          componentName: 'Container',
          parentId: null,
          props: {},
          children: ['compId22']
        },
        'compId22': {
          componentName: 'Button',
          parentId: 'compId21',
          props: {},
          children: []
        }
      }
    }
  }
}