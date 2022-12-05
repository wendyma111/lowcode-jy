export interface IOptions {
  timeout?: number;
}

export interface Ctx {
  updateCtx?: (conf: any) => void;
  autoExecute?: (code: string, type: 'once' | 'auto', callback?: (newValue: any) => void) => any;
  delete: () => void;
}

export interface IPostMessageEvent {
  data: {
    type: string;
    data: any;
    hash: number;
    id: string;
  }
}

export interface IMessage {
  type: string;
  id: string;
  data: string;
}