import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

const cloudinary = require("cloudinary");

const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const cookieParser = require("cookie-parser");

const errorMiddleware = require("./middleware/error");

//Route Imports
const product = require("./routes/productRoute");
const order = require("./routes/orderRoute");
const user = require("./routes/userRoute");

//database configuration
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("Connected to mongodb");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());


//different type of main api list
app.use("/api/v1", product);
app.use("/api/v1", order);
app.use("/api/v1", user);

// Middleware for Errors
app.use(errorMiddleware);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//server start configuration
app.listen(8080, () => {
    console.log(`Now listening to port 8080`);
});
})
.catch((error) => {
    console.log({ error });
    throw new Error(error);
  });