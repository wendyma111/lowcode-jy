export type { IFile } from '../index.type'

export interface IProps {
  isModalVisible: boolean
  closeModal: () => void
}

export interface IChoosenFile {
  changed: boolean;

}

export interface ICatalogueInfo {
  name: string;
  path: string;
  pathList: string[];
  type: 'catalogue' | 'file';
  content: ICatalogueInfo[]
}