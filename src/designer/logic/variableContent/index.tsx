import React, { useCallback, useEffect, useReducer } from 'react'
import { Input, Dropdown, Menu, Space, message } from 'antd'
import { DownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import styles from './index.module.css'
import { getModel } from 'model'
import { SearchState, IAction, ICardInfo, CardType } from './index.type'
import Empty from './empty'
import DataCard from './dataCard'
import { observer } from 'mobx-react'
import _ from 'lodash'

const searchReducer = (preState: SearchState, action: IAction) => {
  let state = Object.assign({}, preState)
  switch(action.type) {
    case 'scope': {
      state =  {
        ...preState,
        scope: action.payload
      }
      break
    }
    case 'keyword': {
      state = {
        ...preState,
        keyword: action.payload
      }
      break
    }
    default: {
      break 
    }
  }

  return state
}

const cardInfoReducer = (preState: ICardInfo, action: IAction) => {
  let state = Object.assign({}, preState)
  switch(action.type) {
    case 'cardType': {
      state = {
        ...preState,
        cardType: action.payload
      }
      break
    }
    case 'choosenData': {
      state = {
        ...preState,
        choosenData: action.payload
      }
      break
    }
    default: break
  }

  return state
}

function VariableContent(props: { setPath?: (v: string) => void }) {
  const { projectModel } = getModel()
  const [searchState, searchDispatch] = useReducer<(preState: SearchState, action: IAction) => SearchState>(searchReducer, { scope: 'global', keyword: '' })
  const [cardInfo, cardInfoDispatch] = useReducer<(preState: ICardInfo, action: IAction) => ICardInfo>(cardInfoReducer, { cardType: 'empty', choosenData: null })

  useEffect(() => { 
    if (!cardInfo.choosenData) return
    const { setPath } = props
    setPath?.(cardInfo.choosenData.path ?? `$state.${cardInfo.choosenData.scope}.${cardInfo.choosenData.key}`)
  }, [cardInfo.choosenData, props.setPath])

  const getScopeName = (scope: string) => {
    return scope === 'global' ? '全局' : projectModel.documents.get(scope)?.name
  }

  const addVariable = (params: Record<string, IData>) => {
    projectModel.designer.logic.setVariable(params)
    message.success('添加变量成功')
  }

  const updateVariable = (params: Record<string, IData>) => {
    projectModel.designer.logic.setVariable(params)
    message.success('更新变量成功')
  }

  // 仅可绑定当前页面域 / 全局域下的变量
  const scopes: Array<string> = ['global'].concat(
    (
      props.setPath
      ? [(projectModel.currentDocument as DocumentModel)?.id]
      : Array.from(projectModel.documents.keys())
    ).filter((item) => !_.isNil(item))
  ) as Array<string>

  const SearchInputPrefix = (
    <Dropdown
      overlay={
        <Menu
          activeKey={searchState.scope}
          items={
            scopes.map((pageId) => {
              return {
                key: pageId,
                label: <div onClick={() => searchDispatch({ type: 'scope', payload: pageId  })}>
                  {getScopeName(pageId)}
                </div>
              }
            })
          }
        />
      }
      placement="bottomRight"
    >
      <a onClick={(e) => e.preventDefault()} style={{ color: 'rgba(0,0,0,0.5)' }}>
        <Space>
          {getScopeName(searchState.scope)}
          <DownOutlined color="rgba(0,0,0,0.5)" />
        </Space>
      </a>
    </Dropdown>
  )

  const SearchInputSuffix = (
    <PlusOutlined onClick={() => cardInfoDispatch({ type: 'cardType', payload: 'add' })} />
  )

  const onSearch = _.throttle((e) => {
    searchDispatch({ type: 'keyword', payload: e.target.value })
  }, 100)

  const deleteVariable = (data: IData) => {
    const { projectModel } = getModel()
    projectModel.designer.logic.deleteVariable({ [data.key]: data })
  }

  const setCardType = useCallback((payload: CardType) => cardInfoDispatch({ type: 'cardType', payload }), [])
  
  const chooseVariable = (data: IData) => {
    cardInfoDispatch({ type: 'cardType', payload: 'check' })
    cardInfoDispatch({ type: 'choosenData', payload: data })
  }

  const getDataByScope = useCallback(() => {
    let data: Record<string, IData> = {}
    if (searchState.scope === 'global') {
      if (searchState.keyword === '') {
        data = projectModel.data
      } else {
        _.map(projectModel.data, (value, key) => {
          if (value.key.startsWith(searchState.keyword)) {
            data[key] = value
          }
        })
      }
    } else {
      if (searchState.keyword === '') {
        data = projectModel.getDocument(searchState.scope)?.data as Record<string, IData>
      } else {
        _.map(projectModel.getDocument(searchState.scope)?.data, (value, key) => {
          if (value.key.startsWith(searchState.keyword)) {
            data[key] = value
          }
        })
      }
    }

    return data
  }, [searchState])

  return (
    <div className={styles.container}>
      <div className={styles['left-area']}>
        {/* 变量搜索框 */}
        <Input
          style={{ width: '100%' }}
          placeholder={'请输入变量标识'}
          prefix={SearchInputPrefix}
          suffix={SearchInputSuffix}
          allowClear
          onChange={onSearch}
        />
        <div className={styles['variable-container']}>
          {Object.values(getDataByScope() ?? {}).map(data => {
            return (
              <div
                onClick={() => chooseVariable(data)}
                className={styles['variable-item']}
                key={data.key}
                style={cardInfo.choosenData?.key === data.key ? { background: 'rgba(0,0,0,0.05)' } : {}}
              >
                <span>{data.key}</span>
                <DeleteOutlined
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteVariable(data)
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
      <div className={styles['right-area']}>
        <div className={styles['card-container']}>
          {
            cardInfo.cardType === 'empty' || (cardInfo.cardType !== 'add' && !cardInfo.choosenData) ? (
              <Empty setCardType={setCardType} />
            ) : (
              <DataCard
                cardType={cardInfo.cardType}
                data={cardInfo.choosenData as IData}
                cardInfoDispatch={cardInfoDispatch}
                deleteVariable={deleteVariable}
                addVariable={addVariable}
                updateVariable={updateVariable}
              />
            )
          }
        </div>
      </div>
    </div>
  )
}

export default observer(VariableContent)