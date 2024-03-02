const nodemailer = require('nodemailer');
const crypto = require('crypto')
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);
const cloudinary = require('cloudinary').v2;
const fs = require("fs");
const user_schema = require('../models/userSchema');
const payment_schema = require('../models/paymentSchema')
// const course_schema = require("..");


const ffmpegPath = 'C:\\ffmpeg\\bin\\ffmpeg.exe'; // Update with the correct path

cloudinary.config({
  cloud_name: "dix9tfwiz",
  api_key: "356477111366662",
  api_secret: "CYL9UeAxSeeRY3sRsIiCPgQ3cZc",
});

const uploadimage = async (onefile) => {
  try {
    const result = await cloudinary.uploader.upload(onefile.tempFilePath, {
      public_id: `${Date.now()}`,
      resource_type: "image",
      folder: "Let'sCook",
      transformation: [
        {
          width: 1280,
          height: 720,
          crop: "fill_pad",
          gravity: "auto",
          quality: 100,
        },
      ],
    });
    let image = {
      url: result.url,
      public_id: result.public_id,
    };
    return image;
  } catch (error) {
    console.log(error.message);
  }
};
const uploadVideo = async (videoFile) => {
  try {
    console.log("Video File:", videoFile);
    const outputDirectory = "./compressed_videos";
    const compressedVideoPath = `${outputDirectory}/${Date.now()}_compressed.mp4`;

    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const ffmpegCommand = `"${ffmpegPath}" -i "${videoFile.tempFilePath}" -c:v libx265 -preset medium -crf 32 -c:a aac -strict -2 "${compressedVideoPath}"`;
    await execPromise(ffmpegCommand);

    const result = await cloudinary.uploader.upload(compressedVideoPath, {
      resource_type: "video",
      public_id: `${Date.now()}`,
      folder: "Let'sCook",
      eager: [
        { width: 300, height: 300, crop: "pad", audio_codec: "none" },
        {
          width: 160,
          height: 100,
          crop: "crop",
          gravity: "south",
          audio_codec: "none",
        },
      ],
      eager_async: true,
      eager_notification_url: "https://mysite.example.com/notify_endpoint",
      max_file_size: 100000000,
    });

    fs.unlinkSync(compressedVideoPath);

    let video = {
      url: result.url,
      public_id: result.public_id,
    };

    return video;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

const deleteFromCloud = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error.message);
  }
};

const genarateOTP = async () => {
  try {
    const otps = Math.floor(1000 + Math.random() * 9000);
    console.log(otps);
    const otp = otps.toString();
    const secret = crypto.createHash("sha256").update(otp).digest("hex");

    return { otp, secret };
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOTP = (secret, otp) => {
  try {
    const userotp = crypto.createHash("sha256").update(otp).digest("hex");

    return userotp == secret;
  } catch (error) {
    console.log(error.message);
  }
};

const sendemailotp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'akramkorakkottil@gmail.com',
        pass: 'zuvlydretngxazpl',
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailoptions = {
      from: "akramkorakkottil@gmail.com",
      to: email,
      subject: "for verification mail",
      html: "<p>your otp is " + otp + "</p>",
    };

    transporter.sendMail(mailoptions, (error, data) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Email has been sent ", data.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};


// Example usage:
// const students = [
//   { name: 'Student1', email: 'student1@example.com' },
//   { name: 'Student2', email: 'student2@example.com' },
//   // Add more students as needed
// ];


// const liveStreamLink = 'https://example.com/live-stream'; // Replace with your live stream link
// sendLiveStreamLink(students, liveStreamLink);

module.exports = {
  uploadimage,
  genarateOTP,
  verifyOTP,
  sendemailotp,
  deleteFromCloud,
  uploadVideo,

}