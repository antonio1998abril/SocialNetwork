const express=require('express');
const mongoose=require('mongoose');
const app=express();
//moongoose
const bodyParser = require("body-parser");
const{mongoDburl, PORT, globalvariables}= require('./config/config');
const path=require('path');
const {selectOption}=require('./config/customfunction')
const hbs=require('express-handlebars');
const hbshelpers=require("handlebars-helpers");
const multihelpers =hbshelpers();
//para llamar a los controladores y rutas
const Rutes=require('./routes/defaultRoute');

const fileUpload =require('express-fileupload');
//el method overide sirve para eliminar
const methodOverride=require('method-override');
//LOGIN
const flash=require('connect-flash');
const passport=require('passport');
const session=require('express-session');
//CHAT//require the http module
const http = require('http').Server(app)
// require the socket.io module
const io = require('socket.io');
const Comment =require ('./Models/CommentModel').Comment;
const Post =require ('./Models/PostModel').Post;
const PivateComment=require('./Models/PrivateMenModel').PivateComment;
const Chat=require('./Models/Chat').Chat
const userRoutes=require('./routes/userRoute');

mongoose.Promise  = require("bluebird");
mongoose.connect(mongoDburl,{useNewUrlParser:true, useUnifiedTopology: true ,useFindAndModify:false})
.then(response => {
    console.log("MongoDB Connected Successfully.");
}).catch(err => {
    console.log("Database connection failed.");
});
//USO DE LAS DIRECCIONES DE LOS ARCHIVOS
app.use(express.json());
//bodyparser middleware
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
//////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
app.use(session({
    secret: 'anysecret',
    saveUninitialized: true,
    resave: true
}));

app.use(flash());
///LOGIN
app.use(passport.initialize());
app.use(passport.session());
app.use(globalvariables);
//ELIMINACION
app.use(methodOverride('newMethod'))
//subur archivos
app.use(fileUpload());
//RUTAS


app.engine('handlebars',hbs({defaultLayout:'default',helpers:{select:selectOption,multihelpers}}));
app.set('view engine','handlebars');

app.use('/',Rutes)
app.use('/user',userRoutes)



app.use(function(req, res, next) {
 
  res.status(500).render('404.handlebars');
});


///////////////////////////////////////////////////////

///CHAT TRAIN
//set the express.static middleware
//To listen to messages
socket = io(http);
  socket.on('connection', socket=>{
    socket.on("disconnect", function() {
      
    });

    //Someone is typing
  socket.on("typing", data => {
  
    socket.broadcast.emit("notifyTyping", {
      user: data.user,
      message: data.message
    });
  });

    //when soemone stops typing
    socket.on("stopTyping", () => {
     
        socket.broadcast.emit("notifyStopTyping");
      });
        //////////////////////////////////////////////////////////////////
        socket.on("chat message",(data)=> {
         var objeto=JSON.stringify(data)

         if( objeto.message==0 ) {
          console.log(data.message.length)
       }else{
         socket.join(data.comments);
        //broadcast message to everyone in port:5000 except yourself.
         socket.broadcast.to(data.comments).emit("received", { message:data.message,id:data.sender,username:data.username,comments:data.comments,image:data.image});     
         
        Post.findById(data.comments).then(post=>{
         const chatMessage = new Comment ({message:data.message,sender:data.sender,username:data.username,post:data.comments})
         post.comments.push(chatMessage)
         post.save().then(savepost=>{
          chatMessage.save();
         });   
      });
    }

    });
         socket.on("chat privatemessage",(data)=>{
          var private=JSON.stringify(data)

          if( private.message==0 ) {
            console.log(data.message.length)
         }else{

          socket.join(data.recepter);
          console.log(private)
          socket.broadcast.to(data.recepter).emit("private",{message:data.message,emiter:data.emiter,recepter:data.recepter,name:data.name,image:data.image});
          Chat.findById(data.recepter).then(chat=>{
          const personalchat = new PivateComment({message:data.message,emiter:data.emiter,name:data.name})
          chat.comments.push(personalchat)
          chat.save().then(chatuser=>{
            personalchat.save();
          });
        });
          }
      });    
    
      
        });    
//FINAL: LIBRARY NECCESARY TO CHAT
//usar el id="message"del chat.js y del message.hanldbars para
//concatenar  donde se envia el mensaje tambien enviar el id del usuario
/////////////////////////////////////////////////////

http.listen(PORT,()=>{
    console.log('Executing')
})



