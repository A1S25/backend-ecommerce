const expess = require("express");
const { registerUser,loginUser,logout,forgotPassword,resetPassword,getUserDetails,
    updatePassword,updateProfile,getAllUser,getSingleUser,updateUserRole,deleteUser, } = require("../controllers/userController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const routr = expess.Router();
import { body } from "express-validator";


routr.route("/register").post( 
body("email").isEmail().withMessage("The email is invalid"),
body("password").isLength({ min: 5 }).withMessage("The password is invalid"), registerUser);

routr.route("/login").post(loginUser);

routr.route("/password/forgot").post(forgotPassword);

routr.route("/password/reset/:token").put(resetPassword);

routr.route("/logout").get(logout);

routr.route("/me").get(isAuthenticatedUser, getUserDetails);

routr.route("/password/update").put(isAuthenticatedUser, updatePassword);

routr.route("/me/update").put(isAuthenticatedUser, updateProfile);

routr.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

routr.route("/admin/user/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser);

routr.route("/admin/user/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole);

routr.route("/admin/user/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);


module.exports = routr;