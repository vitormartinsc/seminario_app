import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import SaboresEmaus from './pages/SaboresEmaus';
import ProtectedRoute from './components/ProtectedRoute';
import CreateOrder from "./pages/CreateOrder";
import PreviousOrders from "./pages/PreviousOrders";



function Logout() {
  localStorage.clear()
  return <Navigate to='/login' />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/sabores-emaus" element={
          <ProtectedRoute>
          <SaboresEmaus />
          </ProtectedRoute>
          } />
        <Route path="/fazer-pedido" element={
          <ProtectedRoute>
          <CreateOrder />
          </ProtectedRoute>
          } />
        <Route path="/pedidos-anteriores" element={
          <ProtectedRoute>
          <PreviousOrders />
          </ProtectedRoute>
          } /> 
        <Route path="*" element={<NotFound />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
