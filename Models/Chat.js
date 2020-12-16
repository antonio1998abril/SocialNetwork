const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    emitrecep: {
      type:Schema.Types.ObjectId,
      ref:'user'
    },
    recepemit: {
      type:Schema.Types.ObjectId,
      ref:'user'
    },
    username:{
      type:String,
      required:true
      },
    myusername:{
      type:String,
      required:true
       },
    idroom:{
      type:Schema.Types.ObjectId,
      ref:'chat'
  },
  comments:[{
    type:Schema.Types.ObjectId,
    ref:'privatemessage'
  }],
  },
  {
    timestamps: true
  }
);

module.exports={Chat: mongoose.model('chat',chatSchema)};