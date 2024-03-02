const mongoose = require('mongoose');
const schema = mongoose.Schema;

const blogCommentSchema = new schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("blogComment", blogCommentSchema);