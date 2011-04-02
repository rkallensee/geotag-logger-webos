var HelloCommandAssistant = function(){
}
  
HelloCommandAssistant.prototype.run = function(future) {  
   console.log("**************************hello***********************************");
   future.result = { reply: "Hello " + this.controller.args.name + '!' };
}