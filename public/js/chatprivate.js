var  socket  =  io();


(function(){
    var emiter= $("#emiter").val()
    var recepter= $("#recepter").val()
    var name=$("#name").val()
    var image =$("#imagesend").attr("src")

    var messageprivate = $("#messageuser")
    $("form").submit(function (e){
      e.preventDefault(); // prevents page reloading

     
      if( messageprivate.val().length== 0){
        console.log("error")
      }else{
        socket.emit("chat privatemessage", {message:messageprivate.val(),emiter:emiter,recepter:recepter,name:name,image:image});
        let messages = document.getElementById("messages");
        
        let son = document.createElement('div')
        son.className="direct-chat-msg";
        messages.appendChild(son)

        let img = document.createElement('img');
        img.style.cssText="margin-left:15px;" 
        img.className="direct-chat-img";
        img.src=$("#imagesend").attr("src");
        son.appendChild(img).append(img.src);

        let div = document.createElement("div");
        div.style.cssText="margin-top:40px; margin-right:20px; margin-left:70px;"
        div.className="direct-chat-text"
        son.appendChild(div).append(messageprivate.val());

        let span = document.createElement("span");
        span.className="direct-chat-timestamp float-right";
        span.style.cssText="margin-right:25px;"
        son.appendChild(span).append("by  me" + ": " + "just now"); 

        document.getElementById('messageuser').value = "";

      }
    });
    socket.on("private", data => {
      let messages = document.getElementById('messages');

      let son2 = document.createElement('div')
      son2.className="direct-chat-msg right";
      messages.appendChild(son2)

      let img = document.createElement('img');
      img.style.cssText="margin-right:15px;"
      img.className="direct-chat-img";
      img.src=data.image;
      son2.appendChild(img).append(img.src); 

      let div = document.createElement("div");
      div.style.cssText="margin-top:40px; margin-right:70px; margin-left:20px;" 
      div.className = "direct-chat-text"; 
      son2.appendChild(div).append(data.message);

      let span = document.createElement("span");
      span.className="direct-chat-timestamp  float-left"; 
      span.style.cssText="margin-left:25px;"
      son2.appendChild(span).append("by " + data.name + ": " + "just now");
    });


})();
