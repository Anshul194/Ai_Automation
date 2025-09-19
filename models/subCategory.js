import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      required: false,
      trim: true,
    },
    MainCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      }
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model('SubCategory', subCategorySchema);
