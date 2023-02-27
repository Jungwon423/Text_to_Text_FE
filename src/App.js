import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import About from './pages/About'
import Home from './pages/Home'

function App() {
  return (
    <div className="App">
      <br />
      <Link to="/">HOME</Link>
      <br />
      <Link to="/about">ABOUT</Link>
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/about" element={<About></About>}></Route>
      </Routes>
    </div>
  )
}

export default App
