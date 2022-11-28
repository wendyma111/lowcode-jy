export interface IProps {
  cardType: 'add' | 'edit' | 'empty' | 'check';
  data?: IData;
  cardInfoDispatch: (action: { type: string, payload: any }) => void;
  deleteVariable: (data: IData) => void;
  addVariable: (params: Record<string, IData>) => void;
  updateVariable: (params: Record<string, IData>) => void;
}