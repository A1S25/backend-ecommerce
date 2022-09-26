const ErrorHand = require("../utils/errorhander");
const catchAsyncErr = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErr(async (req, res, next) => {
    
    let token = req.cookies.access_token;

    if (!token) { return next(new ErrorHander("Please Login to access this resource", 401)); }
    token = token.split(" ")[1];
    
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();

});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
          return next( new ErrorHander( `Role: ${req.user.role} is not allowed to access this resouce `, 403 ) );
        }
        next();
      };
};