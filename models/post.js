const mongoose = require('mongoose');
const Schema = mongoose.Schema; // mongoose mmodel
const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    creator: {
      ref: 'User',
      type: Schema.Types.ObjectId,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
