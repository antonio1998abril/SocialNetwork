const mongoose=require('mongoose');
const Schema =mongoose.Schema;

const  chatprivateSchema  =  new Schema(
    {
    message: {
    type: String
    },
    emiter: {
        type:Schema.Types.ObjectId,
        ref:'user'
        },

     name:{
         type:String
     }   
    },
  
        {
    timestamps: true
    });


module.exports={PivateComment: mongoose.model('privatemessage',chatprivateSchema)};