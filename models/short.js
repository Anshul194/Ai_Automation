import mongoose from 'mongoose';

const shortSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videoImage: {
      type: String,
      required: true,
    },
    thumbnailImage: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    relatedLinks: [{
      url: {
        type: String,
        required: true,
        trim: true,
      },
      linkTitle: {
        type: String,
        trim: true,
        default: '', // Optional, defaults to empty string if not provided
      },
    }],

  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Short', shortSchema);