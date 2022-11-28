import NodeInstance from "model/node";

export interface IProps {
  open: boolean;
  node: NodeInstance;
  targetProp: string;
  toggleOpen: (v: boolean) => void;
}