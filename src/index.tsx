import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './main';
import reportWebVitals from './reportWebVitals';
import { initModel } from 'model'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import PreviewComp from 'simulator/preview'

initModel()

const route = createBrowserRouter([
  {
    path: '/',
    element: <Main />
  },
  {
    path: '/preview/:pageId',
    element: <PreviewComp />
  }
])

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<RouterProvider router={route} />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
