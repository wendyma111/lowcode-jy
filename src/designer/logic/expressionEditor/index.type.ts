import React from 'react'
import { IMarker } from 'designer/logic/basicLowcodeEditor/index.type'

export interface IProps { 
  markerRef: React.MutableRefObject<IMarker[]>;
  setPath: (v: string) => void;
  path: string | null;
}