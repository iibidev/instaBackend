import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  miembros: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true,
    validate: [arrayLimit, 'Un chat solo puede tener 2 participantes']
  }
}, { timestamps: true });

function arrayLimit(val) {
  return val.length === 2;
}

export default mongoose.model('Chat', chatSchema);