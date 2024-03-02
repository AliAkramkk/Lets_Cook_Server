const user_schema = require('../models/userSchema');
const nodemailer = require('nodemailer');
const course_schema = require('../models/courseSchema');
const public_controller = require('./publicController');
const category_schema = require('../models/categorySchema');
const payment_schema = require('../models/paymentSchema')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// const { ObjectId } = require('mongoose').Types;
// const public_controller = require('../controller/publicController')

const getStudent = async (req, res) => {
  try {
    const id = req.params.id
    // console.log("chef id", id);
    const student = await user_schema.findOne({ _id: id });

    res.status(201).json({ student })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ errors: true, error: 'Internal Server Error' });
  }
}

// ................addCourse section....................................
const addCourse = async (req, res) => {
  try {
    const { title, category, description, price, aboutChef, blurb, user } = req.body;

    const chef = await user_schema.findOne({ _id: user });

    const uploadImageResult = await public_controller.uploadimage(req.files.coverImage);
    const uploadVideoResult = await public_controller.uploadVideo(req.files.demoVideo);

    const newCourse = new course_schema({
      title,
      category,
      description,
      coverImage: uploadImageResult,
      demoVideo: uploadVideoResult,
      price,
      blurb,
      aboutChef,
      chef: chef._id,
      chapters: [],
    });

    // Save the new course
    const savedCourse = await newCourse.save();
    // console.log("Add course", savedCourse);
    res.status(201).json({ message: "Course uploaded successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// // ...............edit course......................................
const editCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, price, aboutChef, blurb, user } = req.body;

    const updatedCourseData = req.body;

    if (req.files && req.files.coverImage) {
      const uploadImageResult = await public_controller.uploadimage(req.files.coverImage);
      updatedCourseData.coverImage = uploadImageResult;
      // console.log("image", uploadImageResult);
    }
    // Check if new demoVideo is provided
    if (req.files && req.files.demoVideo) {
      const uploadVideoResult = await public_controller.uploadVideo(req.files.demoVideo);
      updatedCourseData.demoVideo = uploadVideoResult;
    }

    // console.log("Updated Course Data:", updatedCourseData);

    const updatedCourse = await course_schema.findByIdAndUpdate(
      id,
      updatedCourseData,
      { new: true }
    );

    if (updatedCourse) {
      res.status(200).json({ message: "Course updated successfully", data: updatedCourse });
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ...........................get Categories.................................
const getCategories = async (req, res) => {
  try {
    console.log("hii from add course");
    const user = req.query;
    const chef = await user_schema.findOne({ username: user.user })
    if (chef) {
      const categoryNames = await course_schema.distinct('category');
      const categories = categoryNames.map(name => ({ name }));

      res.status(200).json({ categories });
    }


    console.log(user);
  } catch (error) {
    console.log(error.message);
  }
}

// ......................get Course.......................
const getCourse = async (req, res) => {
  try {
    const user = req.query.user;

    const chef = await user_schema.findOne({ username: user.user })

    const courses = await course_schema.find({ chef: chef._id });
    if (courses) {
      res.status(200).json({ courses });
    } else {
      res.status(400).json({ message: "Courses is empty 😥" });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" })
  }
}

const getVideoCourse = async (req, res) => {
  try {


    const course_id = req.params.course_id
    const course = await course_schema.findOne({ _id: course_id })

    if (course) {
      res.status(200).json({ course })
    } else {
      res.status(400).json({ message: "No course is there" })
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" })
  }
};
const handleChangeCourse = async (req, res) => {
  try {
    const { id } = req.body;
    console.log("id" + id);
    const course = await course_schema.findOne({ _id: id })
    // console.log("coure", course);
    await course_schema.updateOne(
      { _id: course._id },
      { $set: { isShow: !course.isShow } }
    );
    res.status(200).json({ message: "show succefully changed" })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" })
  }
}

const deleteCourse = async (req, res) => {
  try {
    console.log("hiii");
    const id = req.params.id;
    // const paymentRecord = await payment_schema.findOne({ course_id: id });
    // console.log("paymentRecord", paymentRecord);
    // if (paymentRecord) {
    //   // If there are payment records, the course has been purchased
    //   return res.status(400).json({ message: "Cannot delete purchased course." });
    // }
    const result = await course_schema.deleteOne({ _id: id });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Course deleted succefully" })
    } else {
      res.status(404).json({ message: "There is no Course" })
    }

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" })
  }
}

const deleteChapter = async (req, res) => {
  try {
    const { id, index } = req.body;
    const course = await course_schema.findOne({ _id: id })

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }
    const result = await course_schema.findOneAndUpdate({ _id: id },
      { $pull: { chapters: { id: new ObjectId(index) }, }, }, { new: true });

    if (result) {
      res.status(200).json({ message: "Chapter deleted successfully" });
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" })
  }
}

const addChapter = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { chapterNo, title, description } = req.body;
    const { id } = req.body;
    const { coverImage, demoVideo } = req.files;


    const chapterNoAsNumber = parseInt(chapterNo, 10);

    if (isNaN(chapterNoAsNumber)) {
      // Handle the case where chapterNo is not a valid number
      res.status(422).json({ message: "Invalid chapter number!" });
      return;
    }
    const existingChapter = await course_schema.findOne({
      _id: id,
      'chapters.id': new ObjectId(chapterNoAsNumber),
    });

    if (existingChapter) {
      res.status(422).json({ message: "Chapter already exists!" });
    } else {
      const uploadVideoResult = await public_controller.uploadVideo(demoVideo);
      const uploadImageResult = await public_controller.uploadimage(coverImage);

      const newChapter = {
        id: new ObjectId(), // Generate a new ObjectId
        title,
        description,
        coverImage: uploadImageResult,
        demoVideo: uploadVideoResult,
      };

      const savedChapter = await course_schema.updateOne(
        { _id: id },
        { $push: { chapters: newChapter } }
      );

      console.log("newChapter", savedChapter);
      res.status(201).json({ message: "Chapter uploaded successfully!" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


const currentChefCourse = async (req, res) => {
  try {
    const user = req.query;
    const chef = await user_schema.findOne({ _id: user.id });
    const courses = await course_schema.find({ chef: chef._id, isShow: true });

    if (courses) {
      res.status(200).json({ courses });
    } else {
      res.status(400).json({ message: "Courses is empty 😥" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" })
  }
}

const checkPayment = async (req, res) => {
  try {
    console.log('hiii');
    const courseId = req.params.id;
    const paymentRecord = await payment_schema.findOne({ course_id: courseId });
    console.log("paymentRecord", paymentRecord);

    if (paymentRecord) {
      // If there's a payment record, the course has been purchased
      return res.status(200).json({ purchased: true });
    }

    // If no payment record, the course has not been purchased
    return res.status(200).json({ purchased: false });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};



const sendLiveStreamLink = async (req, res) => {
  console.log("hiiii");
  const { liveStreamLink } = req.body;
  console.log("link", liveStreamLink);

  try {
    const students = await payment_schema.find().populate("user_id");

    console.log("students", students);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'akramkorakkottil@gmail.com',
        pass: 'zuvlydretngxazpl',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    for (const student of students) {
      console.log("Sending email to:", student.user_id ? student.user_id.email : 'N/A');


      const mailOptions = {
        from: 'akramkorakkottil@gmail.com',
        to: student.user_id.email,
        subject: 'Live Stream Link',
        html: `<p>Hello ${student.user_id.username},</p>
               <p>Here is the link to join the live stream: <a href="${liveStreamLink}">${liveStreamLink}</a></p>`,
      };

      const data = await transporter.sendMail(mailOptions);
      console.log(`Email has been sent to ${student.user_id.username} (${student.user_id.email})`, data.response);
    }

    res.status(200).json({ message: 'Emails sent successfully.' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const chefData = async (req, res) => {
  try {
    const userId = req.query.id;
    // Convert userId to ObjectId
    const userIdObjectId = new ObjectId(userId);
    const totalUnlistedCourses = await course_schema.countDocuments({
      chef: userIdObjectId,
      isShow: false
    });
    // Retrieve chef details
    const chef = await user_schema.findOne({ _id: userIdObjectId });

    // Count the number of courses the chef has
    const coursesCount = await payment_schema.countDocuments({ chef_id: userIdObjectId });


    // Sum the total income of the chef (when isDivided is true)
    const totalIncomeResult = await payment_schema.aggregate([
      { $match: { chef_id: userIdObjectId, isDivided: true } },
      { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
    ]);


    const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].totalIncome / 2 : 0;

    // Count the number of students who purchased courses from the chef
    const studentsCount = await payment_schema.distinct("user_id", { chef_id: userIdObjectId });

    // Build the response object
    const chefDetails = {
      chef,
      coursesCount,
      totalIncome: totalIncome || 0,
      studentsCount: studentsCount.length,
      totalUnlistedCourses
    };

    res.status(200).json(chefDetails);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getGraphData = async (req, res) => {
  try {
    console.log("hiii");
    const { chefId } = req.params;
    const chefIdObjectId = new ObjectId(chefId);
    console.log("chef", chefId);
    // const chefId = new mongoose.Types.ObjectId(req.userId);
    const paymentData = await payment_schema.aggregate([
      {
        $match: {
          chef_id: chefIdObjectId,
          isDivided: true,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
          },
          date: { $first: "$date" },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          date: 1,
          totalAmount: 1,
        },
      },
    ]);

    console.log("paymentData", paymentData);

    res.status(200).json({ paymentData });
  } catch (error) {
    next(error);
  }
};


const getPayments = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 4;
    let page = +req.query.page || 1;

    const AllPayments = await payment_schema
      .find({ isDivided: true })
      .populate("course_id")
      .populate("user_id", "-password");

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

module.exports = {
  getStudent,
  addCourse,
  getCategories,
  getCourse,
  getVideoCourse,
  handleChangeCourse,
  deleteCourse,
  deleteChapter,
  addChapter,
  currentChefCourse,
  editCourse,
  checkPayment,
  sendLiveStreamLink,
  chefData,
  getGraphData,
  getPayments
};
