const express=require('express');
const router=express.Router();
const defaultController=require('../controllers/defaultController');

//LOGIN
const passport = require('passport');
const localStrategy=require('passport-local').Strategy;
const bcrypt=require('bcrypt');
const User=require('../Models/UserModel').User;


 router.all('/*',(req,res,next)=>{
        req.app.locals.layouts='default';
        next();
    })

router.route('/')
    .get(defaultController.index)
    .post(defaultController.postprueba)
    /* Implement function,search method */
  
    
  
  

//////////////////TODO ESTO ES PARA EL LOGIN NECEESITAremos el passport y el passport local para utenticarnos local mente para ca cosa  existen  passport
passport.use(new localStrategy({
        usernameField:'email',
        passReqToCallback:true
    },(req,email,password,done)=>{
       
        User.findOne({email:email}).then(user=>{
            if (!user){
              
                return done(null,false,req.flash('error-message','Email Error'));
            }
            bcrypt.compare(password,user.password,(err,passwordMatched)=>{
                if(err){
                    return err;
                }
                if(!passwordMatched){
                return done(null,false,req.flash('error-message','Usuario y Password Invalidos'));
                }
                return done(null,user,req.flash('success-message','Login was successful'));
            
            });
        })
    }));
    passport.serializeUser(function(user,done){
        done(null,user.id);
    });
    passport.deserializeUser(function(id,done){
        User.findById(id,function(err,user){
            done(err,user)
        })
    })
//registro de error login
router.route('/login')
    .get(defaultController.login)
    .post(passport.authenticate('local', {
        successRedirect: '/user',
        failureRedirect: '/login',
        failureFlash: true,
        successFlash: true,
        session: true
    }));
//salir del login
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success-message', 'Logout was successful');
    res.redirect('/');
});

//////////////////////////////////////FIN DEL LOGIN///////////////////////////////////////////////////////////
    
router.route('/register')
    .get(defaultController.regiterGet)
    .post(defaultController.registerPost);




module.exports=router;