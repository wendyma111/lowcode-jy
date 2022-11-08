import NodeInstance from "model/node";
import Renderer from "renderer";

export interface IState {
  compProps: Record<string, any>;
  ifActive: boolean;
  children: Array<NodeInstance>
}

export interface IProps {
  node: NodeInstance;
  engine: Renderer;
  ref: (ref: React.ReactInstance) => void;
}