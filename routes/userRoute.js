const express = require('express');
const user_router = express.Router();
const userController = require('../controller/userContrller');
const blogController = require('../controller/blogController')
// const checkAccess = require('../middleware/checkAccessStatus')


user_router.get('/profile/:id', userController.getStudent)
user_router.get('/my-learning', userController.myLernings)
user_router.get('/getCurrentCourse/:id', userController.getCurrentCourse)
user_router.get("/blogs", blogController.getAllBlogs);
user_router.get("/blog/:id", blogController.getBlog);
user_router.get("/myBlog", blogController.getAllMyBlogs);

user_router.patch('/editprofile', userController.editProfile)

user_router.put("/myBlog/:id", blogController.editBlog);
user_router.put("/myBlogImage/:id", blogController.changeBlogImage);

user_router.post('/makePayment', userController.paymentHandle)
user_router.post("/myBlog", blogController.addBlog);
user_router.post("/blogLike", blogController.handleLike);
user_router.post("/blogReport", blogController.handleReport);
user_router.post("/blogComment", blogController.handleComment);
user_router.post('/addReview', userController.addReview)

user_router.delete("/myBlog/:id", blogController.deleteBlog);

module.exports = user_router;