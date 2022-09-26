const expres = require("express");
const routen = expres.Router();
const { newOrder,getAllOrders,deleteOrder } = require("../controllers/orderController");

routen.route("/order/new").post(newOrder);
routen.route("/admin/orders").get(getAllOrders);
routen.route("/admin/order/:id").delete(deleteOrder);

module.exports = routen;