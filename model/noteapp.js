
 import mongoose, { Schema } from "mongoose";


 const NoteAppSchema = new mongoose.Schema({
    title: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.String,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    modifiedDate: {
      type: Date,
    },
  });
  
  const NoteAppModel = mongoose.model("Noteapp", NoteAppSchema);
  
  export default NoteAppModel;