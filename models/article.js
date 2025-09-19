import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    coloredHeading: {
      type: String,
      required: true,
      trim: true,
    },
    restHeading: {
      type: String,
      required: true,
      trim: true,
    },
    articleTitle: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    featuredImage: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Article', articleSchema);