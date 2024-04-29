import HumanVerifier from "./pages/HumanVerifier"
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <>
    <Router>
      <Routes>
          <Route path="/" element={<HumanVerifier />}/>
        </Routes>  
    </Router>
    </>
  )
}

export default App
