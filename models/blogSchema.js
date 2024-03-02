const mongoose = require('mongoose')
const schema = mongoose.Schema;

const blogSchema = new schema({
  title: {
    type: String,
    required: true,
  }, description: {
    type: String,
    required: true,
  },
  content: {
    type: String
  },
  coverImage: {
    public_id: {
      type: String,
      required: function () {
        return this.url != null;
      },
    },
    url: {
      type: String,
      required: function () {
        return this.public_id != null;
      },
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogReport",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogComment",
    },
  ],
  isAccess: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("blog", blogSchema);