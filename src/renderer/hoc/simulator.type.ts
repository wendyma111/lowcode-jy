import NodeInstance from "model/node";
import React from "react";

export interface IState {
  compProps: Record<string, any>;
  children: Array<NodeInstance>
}

export interface IProps {
  node: NodeInstance;
  engine: any;
  ref?: (ref: React.ReactInstance) => void;
}