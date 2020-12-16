const mongoose=require('mongoose');
const Schema =mongoose.Schema;

const LikesSchema= new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    publication:{
        type:Schema.Types.ObjectId,
        ref:'post'
    },
    likestate:{
        type:Boolean,
        default:false
    }

});


module.exports={Like: mongoose.model('likes',LikesSchema)};