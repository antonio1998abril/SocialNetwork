const mongoose=require('mongoose');
const Schema =mongoose.Schema;

const CategorySchema= new Schema({
    title:{
        type:String,
        required:true
    },  
    user:{
        type:Schema.Types.ObjectId,
        ref:'user'
    }

});


module.exports={Category: mongoose.model('category',CategorySchema)};