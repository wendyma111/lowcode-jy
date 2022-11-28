export default {
  name: 'test',
  version: '0.0.0',
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
      events: [
        {
          name: 'onClick',
          title: '点击',
        }
      ],
      settings: {
        onClick: {
          settingName: 'onClick',
          label: '点击',
          type: 'event',
        },
        text: {
          settingName: 'text',
          label: '文本',
          type: 'string',
          value: '文本'
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
  data: {
    string: {
      type: 'string',
      defaultValue: 'string111',
      desc: '',
      key: 'string',
      scope: 'global'
    },
    key1: {
      type: 'boolean',
      defaultValue: false,
      desc: '',
      key: 'key1',
      scope: 'global'
    },
    key2: {
      type: 'boolean',
      defaultValue: false,
      desc: '',
      key: 'key2',
      scope: 'global'
    }
  },
  methods: {
    method1: {
      key: 'method1',
      value: 'function handler(e){ console.log($state.global.string) }',
      path: '$api.custom.method1'
    },
    method2: {
      key: 'method2',
      value: 'function handler(e){ $api.dispatch("global.string", String(Math.random())) }',
      path: '$api.custom.method1'
    },
  },
  pagesMap: {
    'pageId1': {
      name: '页面一',
      css: '.div { background: "red" }',
      data: {
        key2: {
          type: 'string',
          defaultValue: 'hahahah',
          desc: '',
          key: 'key2',
          scope: 'pageId1'
        }
      },
      lifecycle: `export default {
        componentWillMount() {
          console.log('componentWillMount')
        },
        componentDidMount(){
          console.log('componentDidMount')
        }
      }`,
      methods: {
    
      },
      componentTree: {
        // 虚拟根节点
        'root': {
          parentId: null,
          children: ['compId11']
        },
        'compId15': {
          componentName: 'Text',
          parentId: 'root',
          props: {},
          children: []
        },
        'compId11': {
          componentName: 'Container',
          parentId: 'root',
          props: {},
          children: ['compId13', 'compId14']
        },
        'compId14': {
          componentName: 'Container',
          parentId: 'compId11',
          props: {
            style: {
              width: 500,
              height: 200,
            }
          },
          children: []
        },
        'compId13': {
          componentName: 'Container',
          parentId: 'compId11',
          props: {
            style: {
              width: 500,
              height: 100,
              display: 'flex',
              flexDirection: 'column-reverse'
            }
          },
          children: ['compId12']
        },
        'compId12': {
          componentName: 'Text',
          parentId: 'compId13',
          props: {
            test: {
              type: 'JSExpression',
              value: '$state.global.key1'
            },
            test1: {
              type: 'JSExpression',
              value: '$state.global.key2'
            },
            extra: 'color'
          },
          children: []
        }
      }
    },
    'pageId2': {
      name: '页面二',
      componentTree: {
        'root': {
          parentId: null,
          children: ['compId21']
        },  
        'compId21': {
          componentName: 'Container',
          parentId: 'root',
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