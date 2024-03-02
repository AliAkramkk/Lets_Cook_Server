const refreshRouter = require('express').Router();
const refreshTokenController = require('../controller/refreshTokenController')

refreshRouter.get('/', refreshTokenController.handlerefreshtoken);
module.exports = refreshRouter;