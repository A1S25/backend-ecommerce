const express = require("express");
const router = express.Router();
const { getAllProducts,createProduct,updateProduct,
        deleteProduct, getProductDetails } = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/product/new").post(createProduct);
router.route("/products").get(getAllProducts);
router.route("/product/:id").post(updateProduct);
router.route("/products/:id").post(deleteProduct);
router.route("/produc/:id").post(getProductDetails);
router.route
router.route
router.route
router.route
router.route

module.exports = router;