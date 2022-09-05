import React, {useState} from 'react';
import './App.scss';

const App = () => {
  const [count, setCount] = useState(0);
  return (
    <div className="app">
      <header className="app-header">
        <p>Hello Vite + React!</p>
        <p onClick={() => setCount(c => c + 1)}>
          <button>count is: {count}</button>
        </p>
      </header>
    </div>
  );
};

export default App;
