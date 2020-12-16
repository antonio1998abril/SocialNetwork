const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
module.exports={
  /*   mongoDburl:'mongodb://localhost:27017/SocialNetwork',
    PORT:process.env.PORT||3000, */
    mongoDburl:'mongodb+srv://antonio:12345@cluster0.1kyo9.mongodb.net/SocialNetwork?retryWrites=true',
    PORT:process.env.PORT||3000,
    globalvariables:(req,res,next)=>{
        res.locals.success_message = req.flash('success-message');
        res.locals.error_message = req.flash('error-message');
        res.locals.user = req.user || null;
        next();

    }
    
}
