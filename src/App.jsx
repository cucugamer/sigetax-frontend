import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Taxista from './Taxista';
import RastreoPublico from './RastreoPublico';
import Admin from './Admin';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/taxista" element={<Taxista />} />
        <Route path="/rastreo/:token" element={<RastreoPublico />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;