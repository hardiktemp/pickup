import mongoose from "mongoose";
import { number, string } from "zod";
import dotenv from "dotenv";

dotenv.config();
const MONGODB_URI : string = process.env.MONGODB_URI as string;

const connectDB = async () => {
  try {
    await mongoose.connect(
      MONGODB_URI
    );
    console.log("MongoDB connection SUCCESS");
  } catch (error) {
    console.error("MongoDB connection FAIL", error);
    process.exit(1);
  }
};
connectDB();

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const ordersSchema = new mongoose.Schema({
  id : {
    type : String,
    required : true,
    unique : true
  },
  orderNo: {
    type: Number,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    required: true,
  },
  paymentStatus : {
    type : String
  },
  prepaid:{
    type: Boolean
  },
  bagId: {
    type: String,
  },
  skipReason: {
    type: String
  },
  productStatus: {
    type: Array
  },
  fulfilledOn : {
    type : String,
    required : true
  },
  fulfilledBy : {
    type : String
  },
  fulfillmentTime: {  
    type : Date
  },
  orderedAt: {
    type : Date,
    // required : true
  },
  labelPrinted : {
    type : Boolean
  },
  skipExported : {
    type : Boolean
  },
  assignedTo : {
    type : String
  },
  customerPhoneNumber : {
    type : Number
  }
  
});
const variableSchema = new mongoose.Schema({
  startId : {
    type : Number  
  },
  lastRefreshed : {
    type : String
  }
});

const productShema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    requied: true,
  },
  sku: {
    type: String,
  },
  location: {
    type: String,
  },
  image : {
    type : String
  }
});

const ProductOrderedSchema = new mongoose.Schema({
  orderId : {
    type: Number,
  },
  productId : {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  completionStatus: {
    type: Number,
    required: true,
  }
});

const orderDetailSchema = new mongoose.Schema({
  orderId:{
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    unique:true
  },
  items:[{
    itemId : {
      type : String,
      required : true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  orderDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['prepaid', 'COD'], 
    required: true
  },
  fulfillmentStatus: {
    type: String,
    enum: ['fulfilled', 'pending', 'shipped', 'cancelled'],
    required: true
  },
  discount:{
    code: {
      type: String
    },
    amount: {
      type: Number
    }
  },
  return:{
    type: {
      type: String, 
      enum: ['RTO', 'return'],
    },
    reason: {
      type: String,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'rejected'],
    }
  }
})

export const User = mongoose.model("User", UserSchema);
export const UpdateOrder = mongoose.model("UpdateOrder", orderDetailSchema);
export const Order = mongoose.model("Order", ordersSchema);
export const ProductOrdered = mongoose.model("ProductOrdered" , ProductOrderedSchema);
export const Product = mongoose.model("Product", productShema);
export const Variable = mongoose.model("Variable", variableSchema);

Order.init().catch(err => console.error('Index creation error:', err));