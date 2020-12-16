const mongoose=require('mongoose');
const Schema =mongoose.Schema;

const UserShema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    nick:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirm:{
        type:String,
        required:true
    },
    bio:{
        type:String,
        required:false
    },
    file:{
        default:'perfil/default.jpg',
        type:String,
        required:false
    },
    education:{
        type:String,
        required:false
    },
    location:{
        type:String,
        required:false
    },
    skills:{
        type:String,
        required:false
    },
    follows:[{
        type:Schema.Types.ObjectId,
        ref:'follow'
    }],
    chatroom:[{
        type:Schema.Types.ObjectId,
        ref:'chat'
    }],
    likes:[{
        type:Schema.Types.ObjectId,
        ref:'likes'
    }]


})

module.exports={User:mongoose.model('user',UserShema)};