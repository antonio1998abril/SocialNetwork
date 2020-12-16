const mongoose=require('mongoose');
const Schema =mongoose.Schema;

const FollowSchema= new Schema({
    userconnected:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    followingto:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    namefollowerto:{
        type:String,
        required:true
       
    },
    namesession:{
        type:String,
        required:true 
    },  
    unorfollow:{
        type:String,
        default:false
    },


});


module.exports={Follow: mongoose.model('follow',FollowSchema)};