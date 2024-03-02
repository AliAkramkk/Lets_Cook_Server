const express = require('express');
const router = express.Router();
const authController = require('../controller/authController')
const usercontroller = require('../controller/userContrller')


router.get('/courses', authController.allListCourse)
router.get('/selectedCourse/:id', authController.selectedCourse);
router.get('/categories', authController.homeCategory)
router.get('/successpayment', usercontroller.handleSuccessPayment);
router.get('/blogs', authController.getBlogs)
router.get('/reviews', authController.courseReview)

router.post('/signup', authController.signUp_post)
router.post('/signin', authController.signIn_post)
router.post('/signin/google', authController.signIn_google)
router.post('/verifyotp', authController.userVerifyOTP)
router.get('/resend-otp', authController.resendOTP)
router.post('/forgotPassword', authController.forgotPassword)
router.post('/forgot-otp', authController.forgotOtp)
router.post('/reset-password', authController.resetPassword)

module.exports = router