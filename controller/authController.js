const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const public_controller = require('../controller/publicController')
const course_schema = require('../models/courseSchema')
const User = require('../models/userSchema');
const category_schema = require('../models/categorySchema');
const blog_schema = require('../models/blogSchema');

const signUp_post = async (req, res) => {
  try {

    const { username, email, password, phone, isChef } = req.body;

    // Validate password strength (add your own criteria)
    if (password.length < 5) {
      return res.status(400).json({ error: 'Password must be at least 5 characters long.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: true, error: 'Email already exists.' });
    } else {
      const { otp, secret } = await public_controller.genarateOTP();

      // Hash the password using bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        phone,
        OTP: secret,
        role: isChef ? 3000 : 2000,
      });
      await newUser.save();
      res.cookie("id", newUser._id, { maxAge: 500000, httpOnly: true });
      public_controller.sendemailotp(email, otp);
      res.status(201).json({ message: "enter your otp" });
    }
    // Additional security measures (optional)
    // Implement email verification, set unique constraints in the database, etc.


  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ errors: true, error: 'Internal Server Error' });
  }
};

const signIn_post = async (req, res) => {
  console.log("hiiii");
  try {

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        if (user.isVerify) {
          if (user.isAccess) {
            const accessToken = jwt.sign(
              { email: user.email },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "1d" }
            );

            const refreshToken = jwt.sign(
              { email: user.email },
              process.env.REFRESH_TOKEN_SECRET,
              { expiresIn: "2d" }
            );


            await User.updateOne(
              { _id: user._id },
              { $set: { JWT: refreshToken } }
            );

            res.cookie("jwt", refreshToken, {
              httpOnly: true,
              maxAge: 48 * 60 * 60 * 1000,
            });

            return res.status(201).json({
              message: "success",
              accessToken,
              role: user.role,
              user: user.username,
              id: user._id
            });

          } else {
            console.log(5)
            // Inside the block where user is blocked
            return res.status(400).json({ error: true, message: "You are Blocked 🙄" });

          }
        } else {
          return res.status(400).json({ message: "You are not verified" });
        }
      } else {
        return res.status(400).json({ message: "Wrong credentials" });
      }
    } else {
      return res.status(400).json({ message: "User not found" });
    }
    console.log("role", role);
    console.log("user", user);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "An error occurred during signin." });
  }
};


const signIn_google = async (req, res) => {
  try {

    console.log("hiiiiii");
    console.log("Request Body:", req.body);
    const { email, picture, name } = req.body.payload;
    const existedUser = await User.findOne({ email });

    if (!existedUser) {
      console.log("lsdfa");

      const hashPassword = await sendPassword({ username: name, email });
      console.log(hashPassword);
      const newUser = User({
        username: name,
        email,
        isGoogle: true,
        pic: { url: picture || 'default-google-profile-picture-url' },
      });

      const newUserData = await newUser.save();

      const accesstoken = jwt.sign(
        { email: newUserData.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      const refreshtoken = jwt.sign(
        { email: newUserData.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "2d" }
      );

      newUserData.refreshtoken = refreshtoken;
      await newUserData.save();

      res.cookie("jwt", refreshtoken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        role: newUserData.role,
        accesstoken,
        username: newUserData.username,
        userId: newUserData._id,
        message: "your account is verified",
      });
      return;
    }

    if (!existedUser.isAccess) {
      res.status(400).json({ message: "The account is banned" });
      return;
    }
    const accesstoken = jwt.sign(
      { email: existedUser.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const refreshtoken = jwt.sign(
      { email: existedUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "2d" }
    );


    existedUser.refreshtoken = refreshtoken;
    await existedUser.save();

    res.cookie("jwt", refreshtoken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      role: existedUser.role,
      accesstoken,
      username: existedUser.username,
      userId: existedUser._id,
      message: "your account is verified",
    });
    return;
  }
  catch (error) {
    console.log(error.message);
  }
}

const userVerifyOTP = async (req, res) => {
  try {
    const { OTP } = req.body;

    const id = req.cookies.id;


    // console.log(id)
    let user = await User.findOne({ _id: id });
    console.log(user);
    const secret = user.OTP;
    const isValid = public_controller.verifyOTP(secret, OTP);
    if (isValid == true) {
      // console.log(isValid);
      const role = user.role;

      const newUser = await User.updateOne({ _id: id }, { $set: { isVerify: true } });
      console.log("newUser", newUser);
      const accessToken = jwt.sign(
        { email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      const refreshToken = jwt.sign(
        { email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "2d" }
      );

      await User.updateOne(
        { _id: user._id },
        { $set: { JWT: refreshToken } }
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        maxAge: 48 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: "success",
        accessToken,
        role: user.role,
        user: user.username,
        id: user._id
      });

      res.clearCookie("id");

      // res.status(200).json({ message: role });
    } else {
      // console.log("not valid");
      res.status(400).json({ message: "OTP not valid." });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// ....................RESEND OTP......................................

const resendOTP = async (req, res) => {
  try {
    const id = req.cookies.id;


    // console.log(id)
    let user = await User.findOne({ _id: id });
    if (user) {
      const { otp, secret } = await public_controller.genarateOTP();
      user.OTP = secret;
      await user.save()
      public_controller.sendemailotp(user.email, otp);
      res.status(201).json({ message: "Enter Your New OTP" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" })
  }
}


// .....................FORGOT PASSWORD................................

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const newUser = await User.findOne({ email });
  if (newUser) {
    const { otp, secret } = await public_controller.genarateOTP();
    res.cookie("id", newUser._id, { maxAge: 500000, httpOnly: true });
    newUser.OTP = secret
    await newUser.save()
    public_controller.sendemailotp(email, otp);
    res.status(201).json({ message: "enter your otp" });
  } else {
    res.status(400).json({ message: 'email not exist' })
    console.log('no email');
  }
}

const forgotOtp = async (req, res) => {

  const { OTP } = req.body

  const id = req.cookies.id;

  const userData = await User.findOne({ _id: id })

  const secret = userData.OTP;
  const isValid = public_controller.verifyOTP(secret, OTP);
  if (isValid) {
    res.cookie("id", userData._id, { maxAge: 500000, httpOnly: true });

    res.status(201).json({ message: 'OTP success' })
  } else {

    res.status(400).json({ message: "Wrong OTP" })
  }

}

const resetPassword = async (req, res) => {
  const { password } = req.body

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const id = req.cookies.id;
  const userData = await User.findOne({ _id: id })

  if (userData) {
    userData.password = hashedPassword
    userData.save()
    res.status(201).json({ message: 'success the resetpassword' })
  }
  else {
    res.status(400).json({ message: 'faild the reset password' })
  }

}

const allListCourse = async (req, res) => {
  try {
    const course = await course_schema.find({ isShow: true })

    if (course) {
      res.status(201).json({ course })
    } else {
      res.status(201).json({ message: "Courses are updating it will come soon.." })
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" })
  }

}
const selectedCourse = async (req, res) => {
  try {
    const id = req.params.id;

    const course = await course_schema.findById({ _id: id }).populate("chef");;
    if (course) {
      res.status(200).json({ course })
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" })
  }
}


const homeCategory = async (req, res) => {
  try {
    const category = await category_schema.find({});

    res.status(200).json({ category })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" })
  }
}


const getBlogs = async (req, res) => {
  try {
    console.log("hii from home blog");
    const results = await blog_schema.find({}).populate('user');
    console.log(results);
    res.status(200).json({ results })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" })
  }
}
const courseReview = async (req, res) => {
  try {
    const reviews = await course_schema.find({ reviews: { $exists: true, $ne: [] } });
    console.log(reviews);
    res.status(200).json({ reviews });
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  signUp_post,
  signIn_post,
  userVerifyOTP,
  resendOTP,
  forgotPassword,
  forgotOtp,
  resetPassword,
  allListCourse,
  signIn_google,
  selectedCourse,
  homeCategory,
  getBlogs,
  courseReview
};
