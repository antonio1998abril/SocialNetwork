const express=require('express');
const router=express.Router();
const userController=require('../controllers/userController');
//LOGIn
const {isUserAuthenticated}=require("../config/customfunction");


router.all('/*',isUserAuthenticated,(req,res,next)=>{
    req.app.locals.layouts='user';
    next();
})

router.route('/')
    .get(userController.index)
   
    
router.route('/search')

//MESSAGE
router.route('/message')
    .get(userController.menssage)

router.route('/messages/:id')
    /* .get(userController.privatemessage)   */
    .get(userController.personalmessage)  

router.route('/messages/delete/:id')
    .delete(userController.deletechat)
    
//SHOW FOLLOWERS
router.route('/followers')
    .get(userController.notification)
    .delete(userController.userunfollow)
/* 
router.route('/followers/:id')
    .delete(userController.userunfollow) */

//SEARCH FOLLOWERS
    
router.route('/contact')
    .get(userController.usergetfollowpage)

router.route('/contact/:id')
    .get(userController.userbeginpage)
    .post(userController.userfollow)   
    
    
//PERFIL CONFIGURATION 
router.route('/configuration/:id')
    .get(userController.configurationPerfil)
    .put(userController.submitconfiguration)

///POST
router.route('/posts')
    .get(userController.getPosts)
    .delete(userController.deletePost)

router.route('/post/:id')
    .get(userController.singlePost)
    .post(userController.postLikes)
    .delete(userController.deletelike)

router.route('/sharepost/:id')
    .post(userController.sharepost)

router.route('/posts/create')
    .get(userController.createpostpage)
    .post(userController.submitpost);

router.route('/posts/edit/:id')
    .get(userController.editpostpage)
    .put(userController.editPostSubmit);

//CATEGORY////////////////////////////////////////////////////
router.route('/category')
   .get(userController.getCategoriespage) 
   .post(userController.createCategories)
   .delete(userController.deletecategories);
   
router.route('/category/edit/:id')
    .get(userController.editCategoriesGetRoute)
    .put(userController.editCategoriesPostRoute);
//////////////////////EDIT MESSAGE/////////////////////////
    router.route('/activity')
    .get(userController.allUserActivity)
    .delete(userController.deleteActivity)

router.route('/message/edit/:id')
    .get(userController.alleditActivity)
    .put(userController.updateActivity)

    
   
    





module.exports=router;    

