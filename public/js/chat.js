 var  socket  =  io();
 var messages = document.getElementById("messages");
(function(){
  var id= $(".iduser").val()
  var name= $("#name").val()
  var post=$("#post").val()
  var message = $("#message")
  var image =$("#imagesend").attr("src")
 
 
    $("form").submit(function (e){
      e.preventDefault(); // prevents page reloading
if( message.val().length== 0){
  console.log("error")
}else{
  socket.emit("chat message", {message:message.val(),sender:id,username:name,comments:post,image:image});
      var img = document.createElement('img');
      img.style.cssText="margin-top:-10px;";
      img.className=("img-circle img-bordered-sm"); 
      img.src =$("#imagesend").attr("src");
      messages.appendChild(img).append(img.src);

      let ul = document.createElement("ul");
      ul.style.cssText="margin-left:10px;";
      ul.className=("chat-messages")
      messages.appendChild(ul).append(message.val());
      
      /* messages.appendChild(li).append($("#message").val()); */
      let span = document.createElement("span");
      span.style.cssText="margin-top:-15px;font-size: 13px;"
      span.className=("username");
      messages.appendChild(span).append("by " + name + ": " + "just now");

      document.getElementById('message').value = "";
}
         
    });

    socket.on("received", data => {
      var messages = document.getElementById("messages");

      var img = document.createElement('img');
      img.style.cssText="margin-top:-10px;"
      img.className=("img-circle img-bordered-sm")
      img.src =data.image

      let ul = document.createElement("ul");
      ul.style.cssText="margin-left:10px;";
      ul.className=("chat-messages")

      let span = document.createElement("span");
      span.style.cssText="margin-top:-15px;font-size: 13px;"
      span.className=("username");

      
      messages.appendChild(img).append(img.src);
      messages.appendChild(ul).append(data.message);
      messages.appendChild(span).append("by" + data.username + ": " + "just now");

    });


})();

// fetching initial chat messages from the database
/*  (function() {
    fetch("/chats")
      .then(data => {
        return data.json();
      })
      .then(json => {
        json.map(data => {
          let li = document.createElement("li");
          let span = document.createElement("span");
          messages.appendChild(li).append(data.message);
          messages
            .appendChild(span)
            .append("by " + data.username + ": " + formatTimeAgo(data.createdAt));
        });
      });
  })();  
 */



//is typing...

let messageInput = document.getElementById("message");
let typing = document.getElementById("typing");

//isTyping event
messageInput.addEventListener("keypress", () => {
  socket.emit("typing", { user: "Someone", message: "is typing..." });
});

socket.on("notifyTyping", data => {
  typing.innerText = data.user + " " + data.message;
  console.log(data.user + data.message);
});

//stop typing
messageInput.addEventListener("keyup", () => {
  socket.emit("stopTyping", "");
});

socket.on("notifyStopTyping", () => {
  typing.innerText = "";
});


