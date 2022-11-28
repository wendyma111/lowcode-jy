export interface SearchState {
  scope: string;
  keyword: string;
}

export interface IAction {
  type: string;
  payload: any;
}

export interface ICardInfo {
  cardType: 'check' | 'empty' | 'add' | 'edit';
  choosenData: IData | null;
}

export type CardType = 'check' | 'empty' | 'add' | 'edit'