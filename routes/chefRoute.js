const chef_route = require('express').Router();
const chefController = require('../controller/chefController');
const userController = require('../controller/userContrller')
// const checkAccessStatus = require('../middleware/checkAccessStatus');

// chef_route.use(checkAccessStatus);

chef_route.get('/profile/:id', chefController.getStudent)
chef_route.get('/myCourse', chefController.getCourse)
chef_route.get('/currentChefCourse', chefController.currentChefCourse)
chef_route.get('/getcourse/:course_id', chefController.getVideoCourse)
chef_route.get('/checkPayment/:id', chefController.checkPayment)
chef_route.get('/categories', chefController.getCategories)
chef_route.get('/chefDetails', chefController.chefData)
chef_route.get('/paymentData', chefController.getPayments)
chef_route.get('/graph/:chefId', chefController.getGraphData);

chef_route.delete('/deleteCourse/:id', chefController.deleteCourse)

chef_route.put('/delete-chapter', chefController.deleteChapter)
chef_route.put('/handleShowCourse', chefController.handleChangeCourse)

chef_route.post('/add-chapter', chefController.addChapter)
chef_route.post('/add-course', chefController.addCourse)
chef_route.post('/sendmail', chefController.sendLiveStreamLink);

chef_route.patch('/edit-course/:id', chefController.editCourse)



module.exports = chef_route;