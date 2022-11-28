import NodeInstance from "model/node";

export interface IProps {
  open: boolean;
  toggleOpen: (v: boolean) => void;
  node: NodeInstance;
  methodInfo?: IMethodInfo
}

export interface IMethodInfo {
  // 已绑定事件
  event?: string;
  // 已绑定事件处理函数 如：$api.dispatch
  path?: string;
  // 内置事件的入参
  extra?: IExtraDispatch | IExtraNavigate
}

export type IExtraDispatch = {
  variablePath: string;
  value: any;
}

export type IExtraNavigate = {
  targetPageId: string
}

export interface IAction { type: string; payload?: any }