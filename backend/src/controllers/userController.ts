const ErrorHandr = require("../utils/errorhander");
const catchAsyncErrorS = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

//-------------------------------------------------------------------------------------------------------------------------------------

// Register a User
exports.registerUser = catchAsyncErrorS(async (req, res, next) => {

  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const errors = validationErrors.array().map((error) => { return { msg: error.msg, }; });
    return res.json({ errors, data: null });
  }

  const { name, email, password } = req.body;
  const users = await User.findOne( {email} );

  if (users) { return res.json({ errors: [ { msg: "Email already in use", }, ], data: null, }); };

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ name: req.body.name, email: req.body.email, password: hashedPassword, });
  const token = await JWT.sign( { email: newUser.email }, process.env.JWT_SECRET as string, { expiresIn: 360000, } );

  res.status(201).json({ success: true, users: { id: newUser._id, email: newUser.email, }, token, });
}); 

//--------------------------------------------------------------------------------------------------------------------------------------

// Login User
exports.loginUser = catchAsyncErrorS(async (req, res, next) => {
  
    const { email, password } = req.body;
    // checking if user has given password and email both
    if (!email || !password) { return next(new ErrorHandr("Please Enter Email & Password", 400)); }

    const user = await User.findOne({ email }).select("+password");
    if (!user) { return next(new ErrorHandr("Invalid email or password", 401)); }
    //Check if password entered is correct
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) { return next(new ErrorHandr("Invalid email or password", 401)); }

    //const token = await JWT.sign( { email: user.email }, process.env.JWT_SECRET as string, { expiresIn: 360000, } );
    const token = await JWT.sign( { email: user.email }, process.env.JWT_SECRET as string, { expiresIn: 360000, } );
  
    //return res.cookie("access_token", token, { httpOnly: true });

    res.status(200).json({ success: true, user: { id: user._id, email: user.email, }, token });
});  

//----------------------------------------------------------------------------------------------------------------------------------------------

// Logout User
exports.logout = catchAsyncErrorS(async (req, res, next) => {
  res.clearCookie("access_token");
  res.status(200).json({ success: true, message: "Logged Out" });
});

//----------------------------------------------------------------------------------------------------------------------------------------------------

// Forgot Password
exports.forgotPassword = catchAsyncErrorS(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne( {email} );

  if (!user) { return next(new ErrorHandr("User not found", 404)); }


});

//----------------------------------------------------------------------------------------------------------------------------------------------------

// Reset Password
exports.resetPassword = catchAsyncErrorS(async (req, res, next) => {});

//----------------------------------------------------------------------------------------------------------------------------------------------------

// Get User Detail
exports.getUserDetails = catchAsyncErrorS(async (req, res, next) => {});

//----------------------------------------------------------------------------------------------------------------------------------------------------

// update User password
exports.updatePassword = catchAsyncErrorS(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user, });
});

//----------------------------------------------------------------------------------------------------------------------------------------------------

// update User Profile
exports.updateProfile = catchAsyncErrorS(async (req, res, next) => {
  const { name, email } = req.body;
  const newUserData = { name, email };

  res.status(200).json({ success: true, });
});

//----------------------------------------------------------------------------------------------------------------------------------------------------

// Get all users(admin)
exports.getAllUser = catchAsyncErrorS(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, users, });
});

//----------------------------------------------------------------------------------------------------------------------------------------------------

// Get single user (admin)
exports.getSingleUser = catchAsyncErrorS(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) { return next( new ErrorHander(`User does not exist with Id: ${req.params.id}`) ); }
  res.status(200).json({ success: true, user, });
});

//----------------------------------------------------------------------------------------------------------------------------------------------------

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrorS(async (req, res, next) => {
  const { name, email, role } = req.body;
  const newUserData =  { name: req.body.name, email: req.body.email, role: req.body.role, } ;

  res.status(200).json({ success: true, });
});

//----------------------------------------------------------------------------------------------------------------------------------------------------

// Delete User --Admin
exports.deleteUser = catchAsyncErrorS(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById( {id} );
  if (!user) { return next( new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400) ); }

  res.status(200).json({ success: true, message: "User Deleted Successfully", });
});
