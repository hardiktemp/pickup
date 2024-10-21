import { useRecoilState, useSetRecoilState } from "recoil";
import { prepaidReq, from, to ,bagIdReq , completeOrderNo } from "../store/atoms/barcode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { API_URL } from "../config.js";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SelectV2() {
    const [selectedOption, setSelectedOption] = useState('');
    const navigate = useNavigate();
    const [fromValue, setFrom] = useRecoilState(from);
    const [toValue, setTo] = useRecoilState(to);
    const [isChecked, setIsChecked] = useRecoilState(bagIdReq);
    const [upadteLoading, setUpadteLoading] = useState(false)
    const [updateing, setUpdateing] = useState(false)
    const [updateFrom , setUpdateFrom] = useState()
    const [yesterdayCheck , setYesterdayCheck] = useState(false)
    const [exportScreen, setExportScreen] = useState(false)
    const [searchOrder, setSearchOrder] = useState('')
    const [searchScreen , setSearchScreen] = useState(false)
    const [searchComplete , setSearchComplete] = useRecoilState(completeOrderNo)
    const [data, setData] = useState(null);

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
    
    
    const handleExport = () => {
        setExportScreen(true)
    };
    const exportData = async () => {
        const respose = await axios.post(`${API_URL}/api/v1/sheets/update`)
        console.log(respose.data.status)
        if(respose.data.status == 200){
            
            setExportScreen(false)
        }
    }
    
    const handleYesterdayCheck = () => {
        setYesterdayCheck(!yesterdayCheck);
        localStorage.setItem('yesterdayCheck', !yesterdayCheck);
    };
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        console.log(isChecked);
    };

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };
    const validateAndNavigate = (isPrepaidOption) => {
        let fromVal = parseInt(fromValue, 10);
        let toVal = parseInt(toValue, 10);
        localStorage.setItem('from', fromVal);
        localStorage.setItem('to', toVal);
        if (isNaN(fromVal)) {
            fromVal = 0;
            setFrom(0); 
            localStorage.setItem('from', 0); 
        }
        if (isNaN(toVal) || toVal === 0) {
            toVal = 99999999;
            setTo(99999999); // Update the 'to' state with the default value
            localStorage.setItem('to', 99999999); // Store the 'to' value in local storage
        }
        if (toVal >= fromVal) {
            navigate('/home');
        } else {
            alert('The "to" value must be greater than the "from" value.');
        }
    };
    const update = async () => {
        setUpdateing(true)
        const response = await axios.post(`${API_URL}/api/v1/order/updateOrders2` , {from : updateFrom});
        setUpadteLoading(false)
        setUpdateing(false)
    }

    const toOnChange = (value) => {
        setTo(value);
        localStorage.setItem('to', value);
    }
    const fromOnChange = (value) => {
        setFrom(value);
        localStorage.setItem('from', value);
    }

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
        localStorage.setItem('selectedOption', event.target.value);
      };
    
    const find = () => {
        validateAndNavigate()
    }

    useEffect(() => {
        const yesterday = localStorage.getItem("yesterdayCheck");
        setYesterdayCheck(yesterday == 'true' ? true : false);
        const orderType = localStorage.getItem('selectedOption');
        setSelectedOption(orderType);
    }, [selectedOption]);

    const search = async () => {
        const response = await axios.post(`${API_URL}/api/v1/order/search` , {orderNo : searchOrder});
        console.log(response.data)
        
        if(response.data.code == 0){
            console.log('error')
            toast.error('order not found')
            return
        }
        if (response.data.pending == true){
            // fromOnChange(searchOrder)
            localStorage.setItem('from', searchOrder);
            localStorage.setItem('to', searchOrder);
            // toOnChange(searchOrder)
            if (response.data.skipped == false){
                setSelectedOption('Both')
                localStorage.setItem('selectedOption', 'Both');
            }
            else{
                setSelectedOption('Skipped')
                localStorage.setItem('selectedOption', 'Skipped');
            }
            setYesterdayCheck(false)
            localStorage.setItem('yesterdayCheck', false)
            
            setSearchScreen(false)
            navigate('/home')
        }
        else{
            setSearchComplete(response.data.orderNo)
            navigate('/completed')
        }
    }
    const exportDataSkipped = async () => {
        const respose = await axios.post(`${API_URL}/api/v1/sheets/updateSkipped`)
        console.log(respose.data.status)
        if(respose.data.status == 200){
            setExportScreen(false)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
          
        const response = await axios.post(`${API_URL}/api/v1/order/data`, {},{headers : { Authorization: `Bearer ${localStorage.getItem('token')}`}});
        // console.log(response.data);
        setData(response.data);
        setUpdateFrom(response.data.defaultOrder)
        
        };
        fetchData();
    }, []);

    return (
        <div>
        <nav className="flex justify-between sm:justify-end h-16 items-center p-2">
            {data != null ? <div className="sm:m-2">{data.phone}</div> : <div></div>}
            <button onClick={logout} className="sm:m-2">Logout</button>
            <button onClick={handleExport} className="sm:m-2">Export</button>
            <button onClick={()=> setSearchScreen(true)} className="sm:m-2">Search</button>
        </nav>
        {exportScreen && 
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <button onClick={exportData} className="m-3">Export Labels</button>
                <button onClick={exportDataSkipped} className="m-3">Export skipped</button>
                <button onClick={() => setExportScreen(false)} className="m-3">Exit</button>
                </div>
                </div>
        }
        {searchScreen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
                    <div>
                    <p className="m-5">Search Order</p>
                    <input type="text" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} />
                    <button onClick={search} className="m-2 p-3">Search</button>
                    <button onClick={()=> setSearchScreen(false)} className="m-2 p-3">Close</button>
                    </div>
                 

                </div>
                </div>
            )}
            <div className="mt-20">
                
                
            </div>
            
            {/* <div className="flex items-center space-x-2 justify-center mt-20">
            <label htmlFor="simpleCheckbox" className="text-gray-700 select-none ">
                Bag Id required?
            </label>
            <input
                type="checkbox"
                id="simpleCheckbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
            />

            </div> */}

        <div className="flex flex-col h-[60vh] justify-around">
        <div className="flex flex-col p-4 space-y-4">
            <label htmlFor="fromInput" className="block text-sm font-medium text-gray-700">
                From
                <input
                    id="fromInput"
                    type="text"
                    placeholder="from"
                    onChange={(e) => fromOnChange(e.target.value)}

                    value={fromValue}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </label>
            <label htmlFor="toInput" className="block text-sm font-medium text-gray-700">
                To
                <input
                    id="toInput"
                    type="text"
                    placeholder="to"
                    onChange={(e) => toOnChange(e.target.value)}
                    value={toValue}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </label>
        </div>
                <div>
                    <label>
                    <input
                        type="radio"
                        value="Postpaid"
                        checked={selectedOption === 'Postpaid'}
                        onChange={handleOptionChange}
                    />
                    COD
                    </label>
                </div>
                <div>
                    <label>
                    <input
                        type="radio"
                        value="Prepaid"
                        checked={selectedOption === 'Prepaid'}
                        onChange={handleOptionChange}
                    />
                    Prepaid
                    </label>
                </div>
                <div>
                    <label>
                    <input
                        type="radio"
                        value="Both"
                        checked={selectedOption === 'Both'}
                        onChange={handleOptionChange}
                    />
                    Prepaid and COD
                    </label>
                </div>
                <div>
                    <label>
                    <input
                        type="radio"
                        value="Skipped"
                        checked={selectedOption === 'Skipped'}
                        onChange={handleOptionChange}
                    />
                    Skipped
                    </label>
                </div>
            
            
            <div className="flex items-center space-x-2 justify-center mt-5">
            <label htmlFor="simple" className="text-gray-700 select-none ">
                Pack till yesterday
            </label>
            <input
                type="checkbox"
                id="simple"
                checked={yesterdayCheck}
                onChange={handleYesterdayCheck}
                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
            />

            </div>
            <div>
                
                <button onClick={find} className="m-3">Find</button>
                <button onClick={()=>setUpadteLoading(true)} className="m-3">Refresh Orders</button>
                {upadteLoading && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    {
                        !updateing ?
                        <div>
                        <p className="m-5">Update from</p>
                        <input type="text" value={updateFrom} onChange={(e) => setUpdateFrom(e.target.value)} />
                        <button onClick={update} className="m-5">Update</button>
                        <button onClick={()=>setUpadteLoading(false)} className="m-5">Close</button>
                        {data != null ? (
                            <div>
                                <p>Last Refreshed : {data.lastRefreshed}</p>
                                <p>Updated Till : {data.maxOrder}</p>
                            </div>
                        ) : (
                            <p>No data available</p>
                        )}
                        </div>
                        : 
                        <h2 className="text-2xl font-bold mb-2 text-white2">Refreshing</h2>
                    }

                </div>
                </div>
                )}
            </div>
        </div>
        {data != null ? (
        <p>Remaining orders: {data.len}</p>
      ) : (
        <p>No data available</p>
      )}
        </div>
    );
}

export default SelectV2;
