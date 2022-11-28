export interface IProps {
  onChange: (prop: string, v: any) => void;
  key?: number;
  nodeProps: Record<string, any>;
}