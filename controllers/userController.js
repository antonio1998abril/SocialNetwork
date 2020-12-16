const Post=require('../Models/PostModel').Post;
const Category=require('../Models/CategoryModel').Category
const {isEmpty}=require('../config/customfunction');
const User = require('../Models/UserModel').User;
const Comment=require('../Models/CommentModel').Comment;
const Follow=require('../Models/FollowModel').Follow;
const Chat=require('../Models/Chat').Chat;
const  Like=require('../Models/LikesModel').Like;

const bcrypt=require('bcrypt');

module.exports={
index:async(req,res)=>{
    try{
        const userid=req.user.id;
        const alldatauser=await User.findById(userid).lean();
        const follow=await Follow.find({userconnected:userid}).select('followingto -_id');
        const objeto= follow.map(a=>a.followingto)
        //saber quienes sigues
        objeto.push(userid)
        const user=await Post.find({user:objeto})
        
        Post.find({user:objeto}).lean()
        //hacer multiples populates los puedes meter en uno solo en uno en este  caso necesitamos
        //hacer un INNER JOIN de post con usuario pero tambien otro  INNER JOIN de comentario con user
            .populate([{path:'comments',populate:{path:'user',model:'user'}},{path:'user',model:'user'},{path:'category',model:'category'}, {path:'sharefrom',populate:{path:'user'}}])
            .then(posts=>{
                res.render('user/index',{posts:posts,comments:posts.comments,alldatauser:alldatauser,userid:userid,layout:'user.handlebars'});
            }) 
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
},
/////SHOWW ALL POST IN Dufferent pages//////////////////////////////////////////////////////
singlePost: async(req, res) => {
    try{
        const id = req.params.id;
        const userid=req.user.id;
        //suma de comentarios
        const countcomment = await  Post.findById(id).select('comments')
        let total=countcomment.comments.length;
    
        const alldatauser=await User.findById(userid).lean();
      Post.findById(id).lean()
      .populate([{path:'comments',populate:{path:'sender',model:'user'}}, {path:'user',model:'user'},{path:'category',model:'category'},{path:'sharefrom',populate:{path:'user'}} ])
        .then(post => {
            if (!post) {
                return res.status(500).render('404.handlebars');
            }
            else {  
                Like.findOne({user:userid,publication:id}).lean()
                .then(like=>{
                    Like.find({publication:id}).lean()
                    .populate({path:'user',model:'user'})
                    .then(likes=>{
                        res.render('user/single',{post:post,comments:post.comments, alldatauser:alldatauser,layout:'user.handlebars',like:like,id:id,total,likes:likes});
                    })    
                })   
            }
        })  
    }catch(err){
        return res.status(500).render('404.handlebars');
    }
},
//////////////////////////////like////////////////////
postLikes:async(req,res,next)=>{
    try{
        const session=req.user._id;
        const id=req.params.id
     
         await User.findById(session).then(like=>{ 
             Like.findOne({user:session,publication:id}).then(exists =>{
                 if(exists){
                    res.redirect(`/user`)
                 }else{
                    const newLike=new Like({
                        user:req.user._id,
                        publication:id,
                        likestate:true
                    });
                    ///el likes es el nombre del array de objetos del user
                    like.likes.push(newLike);
                    like.save().then(savedlike=>{   
                        newLike.save();
                    }) 
                 }
             })
        }) 

    }catch(err){
        return res.status(500).json({msg:err.message})
    }
 
},
deletelike:async(req,res,next)=>{
    try{
        const session=req.user._id;
        const id=req.params.id;
    
        await Like.findOneAndDelete({user:session,publication:id}).then(liekdelete=>{
          
        })
    }catch(err){
        return res.status(500).json({msg:err.message})
    }   
},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////MESSAGES only to chose chatroom of user, send to every body a message but everybody can send menssages to userleader and only
///person (userleader) can see them. resoponse: one to many and many to one
/////////////////////////////////////////////////////////////////////////////////////////////////
 menssage:async(req,res)=>{
     try{
        const id=req.user.id;
        User.findById(id).lean()
        .populate([{path:'chatroom',populate:{path:'emitrecep',model:'user'}},{path:'chatroom',populate:{path:'recepemit',model:'user'}} ])
        .then(recepter=>{
            if (!recepter){
                res.status(404).json({message:'User doesnt exist'})
            }else{
                    res.render('user/message',{recepter:recepter,chatroom:recepter.chatroom,layout:'user.handlebars'})
            }
        })

     }catch(err){
        return res.status(500).json({msg:err.message})
     }
}, 
deletechat:(req,res)=>{
    try{
        const emit= req.body.emit;
        const recep=req.body.recep
 
        Chat.findByIdAndDelete(req.params.id)
        .then(deletechatroom=>{
            res.redirect('/user/message') 
        })
        User.findByIdAndUpdate( 
            {_id: emit}, 
            { $pull: {chatroom: req.params.id } } 
          )
          .then( err => {
          console.log("deleted emit ")
          });
    
          User.findByIdAndUpdate( 
            {_id:recep}, 
            { $pull: {chatroom: req.params.id } } 
          )
          .then( err => {
          console.log("deleted recep")
          });

    }catch(err){
        return res.status(500).json({msg:err.message})
    }
},
/////NEW OPTION TO SEND MESSAGE ONLY ONE TO ONE//////////////////////////////////////////////
personalmessage:async(req,res)=>{
    try{
    const idsession=req.user.id;
    const idroom=req.params.id;
    const usersession= await User.findById(idsession).lean()

    Chat.findById(idroom).lean()
    .populate({path:'comments',populate:{path:'emiter',model:'user'}})
        .then(message=>{
            res.render('user/private/personalmessage',{message:message,comments:message.comments,layout:'user.handlebars',idsession:idsession,usersession});
        }) 

    }catch(err){
        return res.status(500).render('404.handlebars');
    }
},
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////PERFIL CONFIGURATION
/////////////////////////////////////////////////////////////////////////////////////////////
configurationPerfil:async(req,res)=>{
    try{
        const userid=req.user.id;
        const data=await User.findById(userid).lean()
    
        res.render('user/configuration',{data,layout:'user.handlebars',message: req.flash('error-message')})
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
  
},
submitconfiguration:async(req,res)=>{
    try{
        const user=req.user.id;
    const userpassword=req.user.password;
    const data=await User.findById(user).lean()

    let filename='';
    if(!req.files);
    if(!isEmpty(req.files)){
        let file=req.files.uploadedFile;
        filename=file.name;
        let uploadDir='./public/perfil/';
        file.mv(uploadDir+filename,(err)=>{
            if(err)
                throw err;
        });
    }
    let errors=[];

    if(!filename){
        User.findById(user)
        .then(userupdate=>{
            userupdate.name=req.body.name,
            userupdate.email=req.body.email,
            userupdate.nick=req.body.nick,
            userupdate.bio=req.body.bio,
            userupdate.education=req.body.education,
            userupdate.location=req.body.location,
            userupdate.skills=req.body.skills,
            userupdate.confirm=req.body.confirm,
            userupdate.password=req.body.password  
            if(userupdate.password.length>0){
     
                if( userupdate.password !== userupdate.confirm){
                    errors.push({message:'Hubo un error'})
                }if(errors.length>0){
                    res.render('user/configuration',{data,layout:'user.handlebars',errors:errors
                    })
                }else{
                    bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(userupdate.password,salt,(err,hash)=>{
                    userupdate.password=hash;
                    ///
                    userupdate.save().then(updatedata=>{   
                    res.redirect('/user');
                    })///
                })
            })
        }
        /////
            }else{
                userupdate.password=userpassword
                userupdate.save().then(updatedata=>{
                    req.flash('success-message','Datos actualizados');
                    res.redirect('/user');
                })
            }
        })

    }else{
        User.findById(user)
        .then(userupdate=>{
            userupdate.file=`perfil/${filename}`,
            userupdate.name=req.body.name,
            userupdate.email=req.body.email,
            userupdate.nick=req.body.nick,
            userupdate.bio=req.body.bio,
            userupdate.education=req.body.education,
            userupdate.location=req.body.location,
            userupdate.skills=req.body.skills,
            userupdate.confirm=req.body.confirm,
            userupdate.password=req.body.password  
            if(userupdate.password.length>0){
     
                if( userupdate.password !== userupdate.confirm){
                    errors.push({message:'Hubo un error'})
                }if(errors.length>0){
                    res.render('user/configuration',{data,layout:'user.handlebars',errors:errors
                    })
                }else{
                    bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(userupdate.password,salt,(err,hash)=>{
                    userupdate.password=hash;
                    ///
                    userupdate.save().then(updatedata=>{   
                    res.redirect('/user');
                    })///
                })
            })
        }
        /////
            }else{
                userupdate.password=userpassword
                userupdate.save().then(updatedata=>{
                    req.flash('success-message','Datos actualizados');
                    res.redirect('/user');
                })
            }
        })

    }

    }catch(err){
        return res.status(500).json({msg:err.message})
    }
},
/////////////////////////////////////POSTS///////////////////////////////////////////////////
getPosts:(req,res)=>{
  try{  
      Post.find({user:req.user.id}).lean()
  .populate([{path:'category',populate:{path:'user',model:'user'}}])
  .then(posts=>{
      res.render('user/posts/index',{posts:posts,layout:'user.handlebars',message: req.flash('error')}) 
  })
    }catch(err){
        return res.status(500).render('404.handlebars');
    }
},

createpostpage:(req,res)=>{
    try{
        Category.find().lean().then(cats=>{
            res.render('user/posts/create',{categories:cats,layout:'user.handlebars'})
        })
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
  
   
},
sharepost:async(req,res)=>{
    try{
        const original= await Post.findById(req.params.id).select('category -_id');
        var object=JSON.stringify(req.body.image)
        var select=object.includes("mp4")

        console.log(select)
  

        var type;
        if(select == true){
            type="video"
        }else{
            type="image"
        }

        const newPost=new Post({
            user:req.user.id,
            title:req.body.title,
            file:`../${req.body.image}`,
            category:original.category,
            description:req.body.description,
            allowComments:true, 
            sharefrom:req.params.id,
            share:true,
            typefile:type

        });
            newPost.save().then(post=>{
                res.redirect('/user/posts')
    });

    }catch(err){
        return res.status(500).json({msg:err.message})
    }
},
submitpost:(req,res,next)=>{
  try{
    const user=req.user.id;
    const commentsAllow=!!req.body.allowComments;    

    let filename='';
    if(!req.files);
    if(!isEmpty(req.files)){
        let file=req.files.uploadedFile;
        filename=file.name;
        let uploadDir='./public/archivos_subidos/';
        file.mv(uploadDir+filename,(err)=>{
            if(err)
                throw err;
        });
    }
        var type;
        var find=filename.includes(".mp4")
        if(find == true){
            type="video"
        }else{
            type="image"
        }

        const newPost=new Post({
            user:user,
            title:req.body.title,
            file:`archivos_subidos/${filename}`,
            status:req.body.status,
            category:req.body.category, 
            description:req.body.description,
            allowComments:commentsAllow,
            typefile:type
        });
            newPost.save().then(post=>{
                console.log(post);
    })
  }catch(err){
    return res.status(500).json({msg:err.message})
  }
},
editpostpage:async(req,res)=>{
    try{
        const id=req.params.id;

        const mongoose = require('mongoose');
        const isValid = mongoose.Types.ObjectId.isValid(id); //true
   
        if (!isValid){
            return res.status(500).json({msg:err.message})
        } else{
        Post.findById(id).lean()
        .then(post=>{
            Category.find().lean().then(category=>{
                res.render('user/posts/edit',{post:post,categories:category,layout:'user.handlebars'})
            })
        })
        }
    }catch(err){
        return res.status(500).render('404.handlebars');
    }
 
},
editPostSubmit:async(req,res)=>{
    try{
        const commentsAllow=!! req.body.allowComments;
        const id=req.params.id;

        const getobjectfile= await Post.findById(id).select('file')
        var getfile= getobjectfile.file
        var tostring= JSON.stringify(getfile)

        var find=tostring.includes(".mp4")
        
        
        let filename='';
        if(!req.files);
        if(!isEmpty(req.files)){
            let file=req.files.uploadedFile;
            filename=file.name;
            let uploadDir='./public/archivos_subidos/';
            file.mv(uploadDir+filename,(err)=>{
                if(err)
                    throw err;
            });
        }
        
        if(!filename){
            /* const original= await Post.findById(req.params.id).select('file - _id'); */
            Post.findById(id)
            .then(post=>{
                post.title=req.body.title
                post.category=req.body.category,
                post.description=req.body.description,
                post.status=req.body.status,
                post.allowComments=commentsAllow

                if(find == true){
                    post.typefile="video"
                }else{
                    post.typefile="image"
                }
    
                post.save().then(updatedata=>{
                    req.flash('success-message',`Post ${updatedata.title} has been updated` )
                    res.redirect('/user/posts')
                })
                
            })

        }else{
            Post.findById(id)
            .then(post=>{
                post.title=req.body.title
                post.category=req.body.category,
                post.description=req.body.description,
                post.file=`archivos_subidos/${filename}`,
                post.status=req.body.status,
                post.allowComments=commentsAllow

                if(find == true){
                    post.typefile="video"
                }else{
                    post.typefile="image"
                }
    
                post.save().then(updatedata=>{
                    req.flash('success-message',`Post ${updatedata.title} has been updated` )
                    res.redirect('/user/posts')
                })
                
            })
            
        }
    
       

    }catch(err){
        return res.status(500).json({msg:err.message})
    }
 
},
deletePost:(req,res)=>{
    try{
    /*  tema 4: sistemas operativos distribuidos trabajofinal_fecha_ */

        User.findByIdAndUpdate( 
            {_id: req.user.id}, 
            { $pull: {likes: {publication:req.body.idpost} } } 
          )
          .then( err => {
            res.status(200).json(err);
          });

        Post.findByIdAndDelete(req.body.idpost)
        .then(deletedPost=>{
            Comment.deleteMany({post:req.body.idpost}).lean()
              .then( err => {
                Like.deleteMany({publication:req.body.idpost}).lean()
                .then( errend => {
                //messsage
                });

              });
        })
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
},
///////////////////////////////////////////////////////////////////////////////
/////////////////////////////CATEGORIES///////////////////////////////////////
getCategoriespage:(req,res)=>{
    try{
        const user=req.user.id;
        Category.find({user:req.user.id}).lean().then(cats=>{
            res.render('user/category/index',{categories:cats,user,layout:'user.handlebars',message: req.flash('error')})
        })
    }catch(err){
        return res.status(500).json({msg:err.message})
    } 
},
createCategories:(req,res,err)=>{
    const categoryName=req.body.name;
   
    try{
        Category.findOne({title:categoryName}).then(verifycategory=>{
            if(verifycategory){
                return res.status(302).json({msg:err.message})
            }else{
                const newCategory=new Category({
                    title:categoryName,
                    user:req.user.id 
                });
                newCategory.save().then(category=>{
                    res.status(200).json(category);
                })
            }

        })
    
   }catch(err){
    return res.status(500).json({msg:err.message})
   }
},
deletecategories:(req,res)=>{
  try{
    Category.findByIdAndDelete(req.body.category)
    .then(deletedCategory=>{
        res.status(200).json(deletedCategory)
    }) 
  }catch(err){
    return res.status(500).json({msg:err.message})
  }
},
editCategoriesGetRoute:async(req,res)=>{
    try{

        const catId=req.params.id;
        const cats= await Category.find({user:req.user.id}).lean();
            Category.findById(catId).lean().then(cat=>{
                res.render('user/category/edit',{category:cat,categories:cats,layout:'user.handlebars'});
                })
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
   
},
editCategoriesPostRoute:async(req,res,err)=>{
    const updateverify= await Category.findOne({title:req.body.name}).lean();
    const catid=req.params.id;
    const newTitle=req.body.name;
;
    try{

        Category.findOne({title:req.body.name}).then(categoryexist=>{
            if(categoryexist){
                return res.status(302).json({msg:err.message})
            }else{
                Category.findById(catid).then(category=>{
                    category.title=newTitle;
        
                    category.save().then(upddated=>{
                        res.status(200).json({url:'/user/category'});
                    })
                })
            }

        })
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
 
},
////////////////////////////////////////////////////////////////////////////////////
///DELETE UPDATE CREATE AND READ COMMENTARY user to user
////////////////////////////////FOLLOWERS///////////////////////////////////////////
userfollow:async(req,res)=>{
    try{
        const idconnected=req.user.id
        /////////guardar quien sigue a quien
        const idfollow=req.body.id;    
        console.log("sigues a"+idfollow)
        //se podria enviar el true al meterse al perfil y compararlo siempre va ser false por que se elimina desde la base de datos y no
        await User.findById(idconnected).then(followers=>{
        const newfollow= new Follow({
            userconnected:req.user.id,
            followingto:req.body.id,
            namefollowerto:req.body.name,
            namesession:req.body.myname,
            unorfollow:true
        });
        followers.follows.push(newfollow);
        followers.save().then(savedfollow=>{
            newfollow.save();
            findchat();
            }); 
        });
        ///SI LOS DOS USER QUE SE SIGUEN MUTOAMENTE ANEXARLES EN UN SOLO ID PARA USARLOS COMO CHAT PRIVDO
       //////////////////////////FOLLOWERS//////////////////////////////////////
    async function findchat(){
         await Chat.findOne({$or:[{recepemit:idconnected},{emitrecep:idconnected}]}).then(user=>{
            if( user){
                console.log("Ya se creo el chat room")  
            }
        else{
             User.findById(idconnected).then(savechat=>{ 
                const newchatroom=  new Chat({
                    emitrecep:req.user.id,
                    recepemit:req.body.id,
                    username:req.body.name,
                    myusername:req.body.myname
    
                });
                savechat.chatroom.push(newchatroom);
                savechat.save().then(savechatroom=>{
                    newchatroom.save();
                    copychatroom();
                });

                async function copychatroom(){   
                await User.findById(idfollow).then(savebchat=>{ /// 
                    savebchat.chatroom.push(newchatroom);
                    savebchat.save().then(savechatroom=>{
                        newchatroom.save();
                            })
                        });////
                    }
                })
            } 
                })
        }

    }catch(err){
        return res.status(500).json({msg:err.message})
    }
   

},
userunfollow:async(req,res)=>{
    try{
        /////////guardar quien sigue a quien
        const idfollow=req.body.id;

        User.findByIdAndUpdate( 
          {_id: req.user._id}, 
          { $pull: {follows: req.body.idFollow} } 
        )
        .then( err => {
        console.log("deleted")
        });
    /*   User.deleteOne(
          {"_id":idconnected},
          {"$pull":{"follows":{"seguidor":idfollow}}},
          {safe:true,multi:true},function(err,obj)
      {
        console.log("You are not following");
      }); */
        Follow.findByIdAndDelete(req.body.idFollow).then(clear=>{        
            res.status(200).json(clear);
        })
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
},

usergetfollowpage:async(req,res)=>{
    try{
        const idconnected=req.user.id
        const idfollow=req.params.id
        const ownuser=await User.findById(idconnected).lean();

        User.find().lean()
        .populate({path:'follows',model:'follow'})
            .then(follow=>{
                if (!follow){
                    res.status(404).json({message:'User doesnt exist'})
                }else{  
                        res.render('user/contact',{follow:follow,Follower:ownuser,layout:'user.handlebars',statefollow:idconnected,follows:follow.follows});           
            }
        })
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
},
notification:(req,res)=>{
    try{
        const user=req.user.id;

    const information=User.findById(user).lean()
    User.findById(user).lean()
    /* .populate([{path:'comments',populate:{path:'sender',model:'user'}}, {path:'user',model:'user'},{path:'category',model:'category'},{path:'sharefrom',populate:{path:'user'}} ]) */
    .populate([{path:'follows',populate:{path:'followingto',model:'user'}},])
    .then(datafollow=>{
        res.render('user/followers',{datafollow:datafollow,follows:datafollow.follows,information:information,layout:'user.handlebars'})
    })

    }catch(err){
        return res.status(500).json({msg:err.message})
    }   
},
/////USER PERFIL/////////////////////////////////////////////////////////////////////
userbeginpage:async(req,res)=>{
    try{
        
        const session=await User.findById(req.user.id).lean();

        const countfollowing = await  User.findById(req.params.id).select('follows')
        let total=countfollowing.follows.length;

        const countfollowers =await Follow.find({followingto:req.params.id})
        let totalfollow=countfollowers.length;


        User.findById(req.params.id).lean()
            .then(follow=>{
                if(!follow){
                    return res.status(500).json({msg:err.message})
                }else{
                    User.findById(req.user.id).lean()
                    .populate({path:'follows',model:'follow'}).then(allfollow=>{
                        if(!allfollow){
                            return res.status(500).json({msg:err.message})
                        }else{
                            Follow.findOne({userconnected:req.user.id,followingto:req.params.id}).then(e=>{
                                if(e){
                                    console.log("you are following")

                                    Post.find({user:req.params.id}).lean()
                                    .populate([{path:'user',model:'user'},{path:'category',model:'category'}])
                                    .then(posts=>{
                                        res.render('user/perfil/perfil',{allfollow:allfollow,follow:follow,session:session,layout:'user.handlebars',posts:posts,total,totalfollow})
                                    })   
                                }
                            else{
                                console.log("you are not following")
                  
                                Post.find({user:req.params.id}).lean()
                                .populate([{path:'user',model:'user'},{path:'category',model:'category'}])
                                .then(posts=>{
                                    res.render('user/perfil/noperfil',{allfollow:allfollow,follow:follow,session:session,layout:'user.handlebars',posts:posts,total,totalfollow})
                                }) 
                            }  
                            }) 
                        }
                    })
                    
                }
            })  

    }catch(err){
        return res.status(500).render('404.handlebars');
    }

    },
/////////////////////Activity user///////////77
allUserActivity:(req,res)=>{
    try{
        const idUser=req.user.id
    
        Like.find({user:req.user.id}).lean()
        .populate({path:'publication',populate:{path:'user',model:'user'}})
      /*   .populate([{path:'user',model:'user'},{path:'publication',model:'post'}]) */
        .then(activity=>{
            Comment.find({sender:idUser}).lean()
            .populate({path:'post',model:'post'})
            .then(comments=>{
                res.render('user/private/activity',{activity:activity,comments:comments,publication:activity.publication,idUser,layout:'user.handlebars'})
            })
        })
    }catch(err){
        return res.status(500).json({msg:err.message})
    }

},
alleditActivity:async(req,res)=>{
    try{
        const catId=req.params.id;
        Like.find({user:req.user.id}).lean()
        .populate({path:'publication',populate:{path:'user',model:'user'}})
        .then(activity=>{
            Comment.find({sender:req.user.id}).lean()
            .populate({path:'post',model:'post'})
            .then(comments=>{
             
                res.render('user/private/activityedit',{activity:activity,comments:comments,publication:activity.publication,catId,layout:'user.handlebars'})
            })
        })
    }catch(err){
        return res.status(500).json({msg:err.message})
    }


},
deleteActivity:async(req,res)=>{
    try{
        const idpost= await Comment.findById(req.body.idmessage).select('post');
         Comment.findByIdAndDelete(req.body.idmessage)
        .then(deletedcommetn=>{
             Post.findByIdAndUpdate( 
                {_id: idpost.post}, 
                { $pull: {comments: req.body.idmessage } } 
              ).then(deleted => {
              res.status(200).json(deleted);
              });
               
        }) 
    }catch(err){
        return res.status(500).json({msg:err.message})
    }

},
updateActivity:(req,res)=>{
    try{
        const user=req.user.id
        const messageid=req.params.id;
        const newmessage=req.body.newmessage;
    
        if(newmessage){
            Comment.findById(messageid).then(message=>{
                message.message=newmessage;
    
                message.save().then(upddated=>{
                    res.status(200).json(upddated);
                })
            })
        }
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
},


}


