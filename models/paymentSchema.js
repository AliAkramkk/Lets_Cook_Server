const mongoose = require('mongoose')

const payment_schema = new mongoose.Schema({
  strip_id: {
    type: String,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  chef_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'course',
    required: true,
  },
  amount: {
    type: Number,
    required: true
  },
  isDivided: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('payments', payment_schema)