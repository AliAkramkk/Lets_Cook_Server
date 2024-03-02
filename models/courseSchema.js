const mongoose = require('mongoose');

const course_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  coverImage: {
    type: Object,
    required: true,
  },
  demoVideo: {
    type: Object,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  aboutChef: {
    type: String,
    required: true,
  },
  blurb: {
    type: String,
    required: true,
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  chapters: {
    type: Array,
    default: []
  },
  isShow: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  reviews: {
    type: Array,
    default: []
  },
  users: {
    type: Array
  }
});

module.exports = mongoose.model("course", course_schema);  