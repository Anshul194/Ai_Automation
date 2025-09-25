import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    pageNumber: {
      type: Number,
      required: true,
    },
    fileUrl: {
      type: String, // uploaded file path or S3 url
      required: true,
    },
  },
  { _id: false }
);

const ePaperSchema = new mongoose.Schema(
  {
    publicationName: {
      type: String,
      required: true,
      trim: true,
    },
    publicationDate: {
      type: Date,
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
      default: "English",
    },
    totalPages: {
      type: Number,
      required: true,
      min: 1,
    },
    pages: {
      type: [pageSchema], // array of page uploads
      validate: {
        validator: function (arr) {
          return arr.length === this.totalPages;
        },
        message: "Uploaded pages count must match totalPages",
      },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EPaper", ePaperSchema);
