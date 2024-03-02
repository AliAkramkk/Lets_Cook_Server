const admin_route = require('express').Router()
const adminController = require('../controller/adminController')


admin_route.get('/students', adminController.getStudents)
admin_route.get('/chefs', adminController.getChefs)
admin_route.get('/category', adminController.getAllCategory)
admin_route.get('/adminTable', adminController.adminTable)
admin_route.get('/dashboard', adminController.getDashboardData)
admin_route.get('/graph', adminController.getGraphData)
admin_route.get('/graph', adminController.getGraphData)
admin_route.get("/paymentData", adminController.getPayments);

admin_route.put('/updateUserStatus', adminController.updateAccessStatus)
admin_route.put('/changeName/:id', adminController.editCategoryName)
admin_route.put('/updatePayment/:paymentId', adminController.updatePayment)

admin_route.patch('/updateChefStatus', adminController.updateChefStatus)

admin_route.post('/category', adminController.createCategory);
admin_route.post('/changeImage', adminController.changeCategoryImage);
admin_route.post('/payment', adminController.handleTeacherPay);

module.exports = admin_route;