import React from 'react';
import './global.css';
import styles from './index.module.css'
import Button from '__mock/components/Button'
import Container from '__mock/components/Container'
import Text from '__mock/components/Text'
import { getModel } from 'model'
import Renderer from 'renderer'
import TopArea from './toparea'
import LeftArea from './leftarea'
import CenterArea from './centerarea'
import RightArea from './rightarea'

function App() {
  return (
    <div className={styles.container}>
      <TopArea />
      <div className={styles.bottomArea}>
        <LeftArea />
        <CenterArea />
        <RightArea />
      </div>
    </div>
  );
}

export default App;
