const bcrypt=require('bcrypt');
const Post=require('../Models/PostModel').Post;
const User=require('../Models/UserModel').User;
const Category=require('../Models/CategoryModel').Category

module.exports={
    index:async(req,res)=>{
 
        const category=await Category.find().lean();
        await Post.find().lean().populate({path:'user',model:'user'}).then(post=>{
        res.render('default/index',{post:post,category})
    }) 
      
    },
    regiterGet:(req,res)=>{
        res.render('default/register');
        
    },
    login:(req,res)=>{
        res.render('default/login',{message: req.flash('error')})
    }, 
  postprueba:(req,res)=>{
    const search=req.body.search
    Post.find({ $or:[{title:{$regex:search,$options:'i'}},{description:{$regex:search,$options:'i'}}]})
        .lean()
        .populate({path:'user',model:'user'}).then((post,userpost)=>{
        if(!post || 0 === post.length){
            User.find({ $or:[{name:{$regex:search,$options:'i'}},{nick:{$regex:search,$options:'i'}},{email:{$regex:search,$options:'i'}},{bio:{$regex:search,$options:'i'}},{skills:{$regex:search,$options:'i'}}]})
                .lean()
                .then(post=>{
                if(!post || 0 === post.length){
                    req.flash('error-message','No se econtro un elemento');
                    res.redirect('/')
                }else{
                    res.render('default/person',{post:post,search:search})
                }
            })      
        }else{  
            res.render('default/postfind',{post:post,userpost:userpost,search:search}) 
        }
    }) 
  },
///obtener datos del registro
    registerPost:(req,res)=>{
        let errors=[];
        if(!req.body.name){
            errors.push({message:'Nombre Obligatorio'})
           
        }
        if(!req.body.email){
            errors.push({message:'Email Obligatorio'})
        }
        if(!req.body.nick){
            errors.push({message:'User name Obligatorio'})
        }
        if(!req.body.password){
            errors.push({message:'Password Obligatorio'})
        }
        if(req.body.password !== req.body.confirm){
            errors.push({message:'Password tiene que coincidir'})
        }
        if (errors.length>0){
            res.render('default/register',{
                errors: errors,
                name:req.body.name,
                email:req.body.email,
                nick:req.body.nick,
            })
        }else{
            User.findOne({email:req.body.email}).then(user=>{
                if(user){
                    req.flash('error-message','Email ya existe','intentalo de nuevo');
                    res.redirect('/login');
                }else{
                    const newUser =new User(req.body);
                    bcrypt.genSalt(10,(err,salt)=>{
                        bcrypt.hash(newUser.password,salt,(err,hash)=>{
                            newUser.password=hash;
                            newUser.save().then(user=>{
                                req.flash('success-message','Estas registrado','Bienvenido');
                                res.redirect('/login');
                            })
                        })
                    })

                }
            })
        }

    },
}