/* const express = require("express");
const bodyParser = require("body-parser");
const mongoDburl=require("../config/config")

const userController=require('../controllers/userController');
const Comment =require ('../Models/CommentModel').Comment; 
const router = express.Router();

 router.route("/").get((req, res, next) => {


  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
const id= req.params.id
console.log(id)
  Comment.find().lean()
  .then(db => {
  
    Comment.find().lean().then(chat => {
      res.json(chat);
    });
  });

});


   


module.exports = router;
 */