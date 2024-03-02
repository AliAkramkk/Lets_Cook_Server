const User = require('../models/userSchema');
const mongoose = require('mongoose');
const categoryModel = require('../models/categorySchema');
const public_controller = require('./publicController');
const payment_schema = require('../models/paymentSchema');
const user_schema = require('../models/userSchema');
const course = require('../models/courseSchema')

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: req.query.role });
    res.json({ students })
  } catch (error) {
    console.log(error.message);
  }
}

const updateAccessStatus = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    await User.updateOne(
      { email: email },
      { $set: { isAccess: !user.isAccess, JWT: "" } }
    );

    res.status(200).json({ message: "access changed success fully" });
  } catch (error) {
    console.log(error.message);
  }
};

const getChefs = async (req, res) => {
  try {
    const chefs = await User.find({ role: req.query.role });
    res.status(201).json({ message: 'succesfully get all data', chefs })

  } catch (error) {

  }
}
const updateChefStatus = async (req, res) => {
  try {
    const { email } = req.body;
    const chef = await User.findOne({ email: email });
    await User.updateOne(
      { email: email },
      { $set: { isAccess: !chef.isAccess, JWT: "" } }
    );

    res.status(200).json({ message: "access changed success fully" });
  } catch (error) {
    console.log(error);
  }
}

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.files.image;

    const existedCategory = await categoryModel.findOne({
      name: { $regex: new RegExp(`^${name}`, "i") },
    });

    if (existedCategory) {
      res.status(409).json({ message: "Category already existed" });
      return;
    }

    const uploadedImage = await public_controller.uploadimage(image);

    const newCategory = new categoryModel({
      name,
      image: uploadedImage,
    });

    await newCategory.save();
    res.status(200).json({ message: `${name} category created` });
  } catch (error) {
    console.log(error.message);
  }
}
const changeCategoryImage = async (req, res) => {
  try {
    const { id } = req.body;
    const image = req.files?.image;

    if (!image) {
      res.status(400).json({ error: true });
      return;
    }

    const profileImage = await public_controller.uploadimage(image);
    await categoryModel.findByIdAndUpdate(id, { image: profileImage });
    res.status(200).json({ message: "image uploaded" });
  } catch (error) {
    console.log(error.message);
  }
}
const editCategoryName = async (req, res) => {
  try {
    console.log("hiii");
    const { id } = req.params;
    const { name } = req.body;
    console.log("edit category", name);
    const existedCategory = await categoryModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existedCategory) {
      res.status(409).json({ message: "Category already existed" });
      return;
    }

    await categoryModel.findByIdAndUpdate(id, { name });
    res.status(200).json({ message: "category name updated" });
  } catch (error) {
    console.log(error);
  }
};

const getAllCategory = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 5;
    let page = +req.query.page || 1;
    let search = "";
    if (req.query.search !== "undefined") {
      search = req.query.search;
      page = 1;
    }

    const query = {
      $or: [{ name: { $regex: new RegExp(`^${search}`, "i") } }],
    };

    const allCategories = await categoryModel.find(query);

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const lastIndex = page * ITEMS_PER_PAGE;

    const results = {};
    results.totalCategories = allCategories.length;
    results.pageCount = Math.ceil(allCategories.length / ITEMS_PER_PAGE);


    if (lastIndex < allCategories.length) {
      results.next = {
        page: page + 1,
      };
    }

    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
      };
    }

    results.page = page - 1;
    results.categories = allCategories.slice(startIndex, lastIndex);

    console.log("results", results);

    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
  }
};

const adminTable = async (req, res) => {
  try {
    const payment = await payment_schema.find().populate({
      path: 'user_id',
      model: User,
      select: 'username',
    })
      .populate({
        path: 'chef_id',
        model: User,
        select: 'username',
      })
      .populate({
        path: 'course_id',
        model: course,
        select: 'title'
      });
    // console.log("aminTable", payment);
    res.status(200).json({ payment });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Check if paymentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid paymentId" });
    }


    const payment = await payment_schema.findByIdAndUpdate(
      { _id: paymentId },
      { $set: { isDivided: true } },
      { new: true }
    );


    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }


    res.status(200).json({ message: "Payment updated successfully", payment });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getDashboardData = async (req, res) => {
  try {
    console.log("hiii");
    const studentsData = await user_schema.find({ role: 2000 });
    const teachersData = await user_schema.find({ role: 3000 });
    const allCourses = await course.find({ isShow: true });
    const paymentData = await payment_schema.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const data = {
      students: studentsData.length,
      teachers: teachersData.length,
      allCourses: allCourses.length,
      totalAmount: paymentData[0].total,
    };

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
};

const getGraphData = async (req, res, next) => {
  try {
    const student = await user_schema.aggregate([
      { $match: { role: 2000 } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
          },
          date: { $first: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          date: 1,
          count: 1,
        },
      },
    ]);

    const teacher = await user_schema.aggregate([
      { $match: { role: 3000 } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
          },
          date: { $first: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          date: 1,
          count: 1,
        },
      },
    ]);

    res.status(200).json({ student, teacher });
  } catch (error) {
    next(error);
  }
};
// ........................get the teachers payment.................
const getPayments = async (req, res, next) => {
  // console.log("hii from get payments");
  try {
    const ITEMS_PER_PAGE = 4;
    let page = +req.query.page || 1;

    const AllPayments = await payment_schema
      .find()
      .populate("course_id")
      .populate("chef_id", "-password");

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const lastIndex = page * ITEMS_PER_PAGE;

    const results = {};
    results.totalPayments = AllPayments.length;
    results.pageCount = Math.ceil(AllPayments.length / ITEMS_PER_PAGE);

    if (lastIndex < AllPayments.length) {
      results.next = {
        page: page + 1,
      };
    }

    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
      };
    }

    results.page = page - 1;
    results.payments = AllPayments.slice(startIndex, lastIndex);

    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

const handleTeacherPay = async (req, res, next) => {
  console.log("hii from handleTeacherPay");
  try {
    const { paymentId } = req.body;
    const existPayment = await payment_schema.findById(paymentId);

    console.log(existPayment);

    if (!existPayment) {
      return res.status(404).json({ message: "payment not found" });
    }

    if (existPayment.isDivided) {
      return res.status(400).json({ message: "already done payment" });
    }

    existPayment.isDivided = true;
    await existPayment.save();

    res.status(200).json({ message: "Payment Success!" });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getStudents,
  updateAccessStatus,
  getChefs,
  updateChefStatus,
  createCategory,
  changeCategoryImage,
  editCategoryName,
  getAllCategory,
  adminTable,
  updatePayment,
  getDashboardData,
  getGraphData,
  handleTeacherPay,
  getPayments
}