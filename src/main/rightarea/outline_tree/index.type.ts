import NodeInstance from "model/node"
import OutlineTree from './index'

export interface IOutlineTreeState {
  currentDocument: DocumentModel | null;
}

export interface IOutlineItemProps {
  node: NodeInstance;
  engine: OutlineTree;
}

export interface IOutlineItemState {
  folded: boolean;
  children: NodeInstance[]
}