/* eslint-disable prettier/prettier */
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Record from './pages/Record'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Record></Record>}></Route>
      </Routes>
    </div>
  )
}

export default App
