const mongoose = require("mongoose");
const schema = mongoose.Schema;

const blogReportSchema = schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "blog",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("blogReport", blogReportSchema);