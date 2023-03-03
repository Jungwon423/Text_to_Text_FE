/* eslint-disable prettier/prettier */
import './App.css'
import { Routes, Route } from 'react-router-dom'
import About from './pages/Record'
import Home from './pages/Home'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/home" element={<Home></Home>}></Route>
        <Route path="/" element={<About></About>}></Route>
      </Routes>
    </div>
  )
}

export default App
