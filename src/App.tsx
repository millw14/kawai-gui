import React, { useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Desktop from './components/Desktop';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return <Desktop />;
}

export default App;
