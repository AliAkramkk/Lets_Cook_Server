const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
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
})

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;