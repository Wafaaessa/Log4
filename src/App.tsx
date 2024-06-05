import React from 'react';
import LogsTable from './Component/LogsTable'; 
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Logs Viewer</h1>
      <LogsTable />
    </div>
  );
};

export default App;