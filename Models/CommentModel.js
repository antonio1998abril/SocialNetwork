const mongoose=require('mongoose');
const Schema =mongoose.Schema;

const CommentSchema= new Schema({

    message:{
        type:String,
        required:true
    },
    sender:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    username:{
        type:String
    },
/* approveComment:{
    type:Boolean,
    default:false
    },
}, */
    post:{
        type:Schema.Types.ObjectId,
        ref:'post'
    },
    },
        {
            timestamps: true
        });


module.exports={Comment: mongoose.model('comment',CommentSchema)};


