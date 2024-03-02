require('dotenv').config();
const jwt = require('jsonwebtoken')
const user_schema = require('../models/userSchema')

const handlerefreshtoken = async (req, res) => {
  console.log("new hiiii");
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt) return res.status(400);
  // console.log(cookies.jwt);
  const refreshtoken = cookies.jwt;

  let user = await user_schema.findOne({ JWT: refreshtoken });
  console.log('user refresh', user);
  // console.log(user);
  if (!user) {
    return res.status(400).json({ error: 'User not found based on refresh token' });
  }

  jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET, (err, decod) => {
    if (err || user.email !== decod.email) {
      return res.status(400).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { email: decod.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    res.json({
      accessToken,
      role: user.role,
      user: user.username,
    });
  });
};

module.exports = { handlerefreshtoken };
