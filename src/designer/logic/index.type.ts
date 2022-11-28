export interface IFile {
  /**
   * 文件名称
   */
  name: string;
  /**
   * 文件路径，以/开头
   */
  path: string;
  /**
   * 文件类型：目录 / 文件
   */
  type: 'catalogue' | 'file';
  /**
   * 仅文件有该字段，指定文件语言
   */
  language?: string;
  /**
   * 仅文件有该字段，指文件内容
   */
  value?: string;
}