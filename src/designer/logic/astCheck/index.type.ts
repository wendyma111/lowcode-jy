import { Node } from 'acorn'
import { IMarker } from '../basicLowcodeEditor/index.type'

export class AstCheckType {
  rules: any;
  marks!: Array<Partial<IMarker>>;
  code!: string;
  parse!: (code: string) => void;
  subscribeMarks!: (handler: (marks: Array<Partial<IMarker>>) => void) => void;
}

export type INode = Node

export interface IRoot {
  type: string;
  body: Node[];
  sourceType: 'module' | 'script';
  start: number;
  end: number
}
