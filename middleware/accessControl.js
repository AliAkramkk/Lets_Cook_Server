const user_schema = require("../models/userSchema");

const userAccess = async (req, res, next) => {
  const userdata = await user_schema.findOne({ email: req.user, isAccess: true, role: 2000 })
  if (!userdata) {
    return res.sendStatus(400)
  }
  next();
};
const chefAccess = async (req, res, next) => {
  const userdata = await user_schema.findOne({ email: req.user, isAccess: true, role: 3000 })
  if (!userdata) {
    return res.sendStatus(400)
  }
  next();
};
const adminAccess = async (req, res, next) => {
  const userdata = await user_schema.findOne({ email: req.user, isAccess: true, role: 1000 })
  if (!userdata) {
    return res.sendStatus(400)
  }
  next();
};

module.exports = {
  userAccess,
  chefAccess,
  adminAccess
}