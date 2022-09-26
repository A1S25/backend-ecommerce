const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Errorhander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncErrors");

// Create new order
exports.newOrder = catchAsyncError(async (req, res, next) => {
    const{shippingInfo,orderItems,paymentInfo,itemsPrice,
          taxPrice,shippingPrice,totalPrice} = req.body;

const order = await Order.create({
    shippingInfo: req.body.shippingInfo,
    orderItems: req.body.orderItems,
    paymentInfo: req.body.paymentInfo,
    itemsPrice: req.body.itemsPrice,
    taxPrice: req.body.taxPrice,
    shippingPrice: req.body.shippingPrice,
    totalPrice: req.body.totalPrice,
    paidAt: Date.now(),
    user: req.body.user._id
}); 

res.status(201).json({
    success: true,
    order,
  });
});

// get all Orders -- Admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update Order Status -- Admin
exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete Order -- Admin
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});