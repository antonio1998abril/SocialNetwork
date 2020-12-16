module.exports={
    selectOption:function(status,options){
        return options.fn(this).replace(new RegExp('value=\"'+status+'\"'), '$&selected="selected"');
    },
    stament:function(a,b,opts){
        return a==b ? opts.fn(this) : opts.inverse(this);
    },

    isEmpty:function(obj){
        for(let key in obj){
            if(obj.hasOwnProperty(key)){
                return false;
            }
        }
        return true;
    },
 isUserAuthenticated:(req,res,next)=>{
     if(req.isAuthenticated()){
         next();
     }else{
         res.redirect('/login');
     }
 }


 
};