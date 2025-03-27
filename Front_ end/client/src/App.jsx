import {BrowserRouter, Route, Routes} from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import SignUp from './pages/SignUp'
import Header from './components/Header'
import Banner from './components/Banner'
import Footer from './components/Footer'
import ForgotPassword from './pages/ForgotPassword'
import ChangePassword from './pages/ChangePassword'


export default function App() {
  return (   
    <BrowserRouter>
    <Header/>
    <Banner/>
    <Routes>
        
          <Route path='/' element={<Home/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/sign-in' element={<SignIn/>}/>
          <Route path='/sign-up' element={<SignUp/>}/>                
          
          
          
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/change-password" element={<ChangePassword/>}/>
          
                            
    </Routes>
    <Footer/>
    
   </BrowserRouter>  
  )
}
