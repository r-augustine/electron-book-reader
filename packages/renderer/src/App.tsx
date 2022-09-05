import React from 'react';
import './App.scss';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ReadingNow from './components/ReadingNow';

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Layout />}
      >
        <Route
          index
          element={<ReadingNow />}
        />
      </Route>
    </Routes>
  );
};

export default App;
