import Express from "express";
import { User , Order} from "../db";
import { appendToSheet, readFirstRow } from "../sheetFunctions";
import dotenv from 'dotenv';
dotenv.config();

const router = Express.Router();

router.post('/update', async (req, res) => {
    const orders = await Order.find({ labelPrinted: false, status: { $in: ["completed", "manualComplete"] } });
    // console.log(orders);
    // const orders = [];
    // for (let i = 0 ; i<1000 ; i++){
    //     let order= {
    //         orderNo : i
    //     }
    //     orders.push(order)
    // }
    let data = [];
    let count = 1;
    let str = ""
    orders.forEach((order) => {
        count++ 
        str += order.orderNo + ','
        if (count == 500){
            str = str.slice(0, -1);
            console.log(str);
            data.push([str,count-1]);
            str = ""
            count = 1;
        }
    });
    str = str.slice(0, -1);
    data.push([str,count-1]);
    const result = await appendToSheet("16GeK7HF6FatEAhsyUCKCZdxyROdpyCF6LbWbllLuMTk", "AppLabels!A1", data);
    if (result){
        await Order.updateMany({ labelPrinted: false, status: { $in: ["completed", "manualComplete"] } }, { labelPrinted: true })
    }
    

    res.status(200).json({ status : 200 , message: "Data updated successfully" });


});

router.post("/updateSkipped", async (req, res) => {
    const orders = await Order.find({ status : "skipped" , skipExported : false });

    let data = [];

    const firstRow = await readFirstRow("16GeK7HF6FatEAhsyUCKCZdxyROdpyCF6LbWbllLuMTk", "AppSkipped!A1:K1");
       
    orders.forEach((order) => {
        let orderData = firstRow.map((header) => {
            switch (header) {
                case "Push Time":
                    return new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
    
                case "Order ID":
                    return order.orderNo;
    
                case "Items Missing":
                    let missingItems = order.productStatus
                        .filter(item => item.quantity > item.completionStatus)
                        .map(item => item.sku)
                        .join(",");
                    return missingItems;
    
                case "SkipReason":
                    return order.skipReason;
                
                case "Phone Number":
                    return order.customerPhoneNumber || " ";
                
                default:
                    return ""; 
            }
        });
    
        console.log(orderData);
        data.push(orderData);
    });
    console.log(data);
    try {
        const result = await appendToSheet("16GeK7HF6FatEAhsyUCKCZdxyROdpyCF6LbWbllLuMTk", "AppSkipped!A1", data);
        console.log("res",res);
        if(result){
            await Order.updateMany({ status: "skipped", skipExported: false }, { skipExported: true, labelPrinted: true, status: "manualComplete" });
        }
    } catch (error) {
        console.error("Error occurred:", error);
    }
    

    res.status(200).json({ status : 200 , message: "Data updated successfully" });

    });


export default router;



