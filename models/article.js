import mongoose from 'mongoose';
import slugify from 'slugify';

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
    slug: {
      type: String,
      unique: true,
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

// ✅ Pre-save middleware for slug
articleSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('articleTitle')) {
    // જો user slug ન આપે તો articleTitle પરથી slug generate
    this.slug = slugify(this.slug || this.articleTitle, {
      lower: true,
      strict: true,
    });
  }
  next();
});

export default mongoose.model('Article', articleSchema);
