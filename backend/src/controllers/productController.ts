const Producte = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");

// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req:any, res:any, next:any) => {

  let images: string[] = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks: any[] = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "e-commerce",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;


    const {name, description, price, category} = req.body;
    const product = await Producte.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category
    });
    res.status(201).json({
        success: true,
        product,
      });
});
   
// Get All Product
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await Producte.find();
    res.status(200).json({
        success: true,
        products,
    });
});

// Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Producte.findById(req.params.id);
  
    if (!product) {
      return next(new ErrorHander("Product not found", 404));
    }
  
    res.status(200).json({
      success: true,
      product,
    });
  });

// Update Product -- Admin
exports.updateProduct = (req, res, next) => {
    Producte.findByIdAndUpdate(req.params.id, 
        {name: req.body.name,
         description: req.body.description,
         price: req.body.price,
         category: req.body.category}, (error, data) => {
        if(error){
            console.log(error)
        }else{
            res.send(data);
            console.log("Data updated!");
        }
    } );
};

// Delete Product
exports.deleteProduct = (req, res, next) => {
    Producte.findByIdAndDelete((req.params.id), (error, data) => {
        if(error){ console.log(error); }
        else{ res.send(data); console.log("Data Deleted!"); }
    });
};

// Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = { user: req.user._id, name: req.user.name, rating: Number(rating), comment, };

    const product = await Producte.findById(productId);
    const isReviewed = product.reviews.find( (rev) => rev.user.toString() === req.user._id.toString() );

    if (isReviewed) { product.reviews.forEach((rev) => {
          if (rev.user.toString() === req.user._id.toString())
            (rev.rating = rating), (rev.comment = comment);
        });
      } else { product.reviews.push(review); product.numOfReviews = product.reviews.length; }

    let avg = 0;
    product.reviews.forEach((rev) => { avg += rev.rating; });
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, });
});

// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {

    const product = await Producte.findById(req.query.id); 
    if (!product) { return next(new ErrorHander("Product not found", 404)); }
    res.status(200).json({ success: true, reviews: product.reviews, });
  });
  
// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {

   const product = await Producte.findById(req.query.productId);
   if (!product) { return next(new ErrorHander("Product not found", 404)); }
  
   const reviews = product.reviews.filter( (rev) => rev._id.toString() !== req.query.id.toString() ); 
   let avg = 0;
   reviews.forEach((rev) => { avg += rev.rating; });
  
   let ratings = 0;
   if (reviews.length === 0) { ratings = 0; } else {
     ratings = avg / reviews.length;
   }
  
   const numOfReviews = reviews.length;
     await Producte.findByIdAndUpdate( req.query.productId, { reviews, ratings, numOfReviews, }, 
       { new: true, runValidators: true, useFindAndModify: false, }
   );
  
   res.status(200).json({ success: true, });
 });