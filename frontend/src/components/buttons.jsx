import { useRecoilValue,useRecoilState } from "recoil";
import { bagId, itemNo,orderDetails,prepaidReq, from,to , scanningProduct , bagIdReq} from "../store/atoms/barcode";
import axios from 'axios';
import { API_URL } from "../config";
import { useEffect, useState } from "react";
import Loader from "react-js-loader";

const Buttons = () => {
    const totalItems = useRecoilValue(itemNo).total;
    const completedItems = useRecoilValue(itemNo).completed;
    const [orderDetailsData, setOrderDetailsData] = useRecoilState(orderDetails);
    const orderId = orderDetailsData.orderId;
    const [bagIdValue , setBagValue] = useRecoilState(bagId);
    const [scanningProducts, setScanningProduct] = useRecoilState(scanningProduct);
    const [isOpen, setIsOpen] = useState(false);
    const [isSkipOpen, setIsSkipOpen] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [bagIdReqValue , setBagIdReqValue] = useRecoilState(bagIdReq);
    const [isLoading , setIsLoading] = useState(false);

    const reset = () => {
        setBagValue('');
        setScanningProduct(true)
    }

    const dataFetch = async () => {
        const orderType = localStorage.getItem("selectedOption");
        let fromL = localStorage.getItem("from");
        const orderTypeL = localStorage.getItem("selectedOption");
        if (orderTypeL === "skipped"){
            fromL = orderDetailsData.orderId + 1

        }
        const toL = localStorage.getItem("to");
        console.log('dataFetch');
        const token = localStorage.getItem("token");
        console.log(token);
        
        setIsLoading(true);

        const response = await axios.post(
            `${API_URL}/api/v1/order/order`,
            { orderType , from: fromL || 0, to: toL || 99999999 , yesterday : localStorage.getItem('yesterdayCheck')},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        console.log(response.data);
        setIsLoading(false);        
        if(response.data.messageStatus == 0){
            console.log("sfefsf:,",response.data.messageStatus)
            setOrderDetailsData({orderId : "No Order",paymentStatus : "No Order",products : []})
          }else{
                // for (const product of response.data.products){
                //     product.completionStatus = 0;
                // }
                setOrderDetailsData(response.data);
          }
    }

    const skip = async (e) => {
        e.preventDefault();
        setIsSkipOpen(true);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (totalItems === completedItems) {
            if (bagIdReqValue === true && bagIdValue.length !== 9) {
                setIsOpen(true);
                return;
            }
            console.log('submit');
            const endpoint = API_URL+"/api/v1/order/submit"
            console.log(endpoint);
            
            const respone = await axios.post(endpoint , {
                orderId : orderId,
                status : 'completed',
                bagId : bagIdValue,
                products : orderDetailsData.products
            },
            {headers : {Authorization : `Bearer ${localStorage.getItem('token')}`}}
        )
            console.log(respone);
            if (respone.data.status == 1){            
                reset ()
                dataFetch()
            }
        }else{
            setIsOpen(true)
        }
    };
    const togglePopup = () => {
        setIsOpen(!isOpen);
      };

    const handleSubmit = async () => {
        setIsSkipOpen(false);
        console.log(API_URL);
        console.log(orderId);
        
        const respone = await axios({method : 'post', url : `${API_URL}/api/v1/order/submit`,data: {
            orderId : orderId,
            status : 'skipped',
            comment : selectedAnswer,
            bagId : bagIdValue,
            products : orderDetailsData.products
        },
        headers : {Authorization : `Bearer ${localStorage.getItem('token')}`}
    })

        if (respone.data.status == 1){
            reset()
            dataFetch()
        }
    };
    const handleAnswerChange = (event) => {
        setSelectedAnswer(event.target.value);
      };

    // const handelDebug = () => {
    //     console.log(orderDetailsData);
    // }
    const forceComplete = async () => {
        const respone = await axios({method : 'post', url : `${API_URL}/api/v1/order/submit`,data: {
            orderId : orderId,
            status : 'manualComplete',
            bagId : bagIdValue,
            products : orderDetailsData.products
        },
        headers : {Authorization : `Bearer ${localStorage.getItem('token')}`}
    })

    if (respone.data.status == 1){
        reset()
        dataFetch()
        setIsOpen(!isOpen);
    }
    }
    return (
        <>
        {
            isLoading ?
            <div className="fixed inset-0 flex items-center justify-center p-4 bg-bgDefault z-50">
                <Loader type="spinner-cub" bgColor="white" size={100} />   
            </div>: 
            <div className="flex justify-around my-5">
                <button onClick={skip}>Skip</button>
                <button onClick={submit}>Submit</button>
            </div> 
        }
        {isSkipOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4 text-white2">Choose an Option</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <label className="block mb-2 text-white2">
                        <input
                        type="radio"
                        value="Item missing"
                        checked={selectedAnswer === 'Item missing'}
                        onChange={handleAnswerChange}
                        className="mr-2"
                        />
                        Item missing
                    </label>
                    <label className="block mb-2 text-white2">
                        <input
                        type="radio"
                        value="Cancelled manually"
                        checked={selectedAnswer === 'Cancelled manually'}
                        onChange={handleAnswerChange}
                        className="mr-2"
                        />
                        Cancelled manually
                    </label>
                    <label className="block mb-2 text-white2">
                        <input
                        type="radio"
                        value="Already packed"
                        checked={selectedAnswer === 'Already packed'}
                        onChange={handleAnswerChange}
                        className="mr-2"
                        />
                        Already packed
                    </label>
                    <button
                        type="submit"
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none text-white2"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none text-white2"
                        onClick={() => setIsSkipOpen(false)}
                    >
                        Cancel
                    </button>
                    </form>
                </div>
                </div>
            )}

        {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-2 text-white2">Can Not Submit</h2>
                    <p className="text-gray-700 mb-4 text-white2">All the Items Have Not Been Picked Yet</p>
                    <p className="text-gray-700 mb-4 text-white2">OR bag Id not yet entered</p>
                    <button 
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                    onClick={togglePopup}
                    >
                    Close
                    </button>
                </div>
                <button onClick={forceComplete} className="absolute top-5 right-3 p-1">
                        Force Complete
                </button>
                </div>
            )}
        </>
    );
};

export default Buttons;
