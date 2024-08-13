import { useEffect, useState } from 'react'
import BarcodeScanner from './camera'
import OrderDetails from './orderDetails'
import ItemList from './itemList'
import Buttons from './buttons'
import TextBox from './textbox'
import BagId from './bagId'
import '../App.css'
import { API_URL } from "../config.js";
import axios from 'axios'



function Home() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
    }
    async function checkToken() {
        try {
            const response = await axios.post(`${API_URL}/api/v1/user/checkToken`, { token });
            if (response.data.statusNum === 1) {
                console.log('Token is valid');
            } else {
                console.log('Token is invalid');
                navigate('/login');
            }
        } catch (error) {
            console.error(error);
        }
    }
    checkToken();
  }, []);

  return (
    <>
        {/* <BarcodeScanner/>  */}
        <BagId/>
        <OrderDetails/>
        <ItemList/>
        <TextBox/>  
        <Buttons/>
    </>
  )
}

export default Home
