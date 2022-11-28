import { EditorProps, OnChange, OnValidate, OnMount } from '@monaco-editor/react'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export interface IProps extends EditorProps {
  rules?: any;
  height: number | string;
  width: number | string;
  onChange?: OnChange;
  onValidate?: OnValidate;
  onMount?: OnMount;
}

export type IMarker = monaco.editor.IMarker;

export type IEditor = monaco.editor.IStandaloneCodeEditor

export type IModel = monaco.editor.ITextModel
