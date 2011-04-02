function MainAssistant() {};
 
MainAssistant.prototype.setup = function() {
   this.debugContainer = this.controller.get("debugOutput");
   this.logOutputNum = 0;
};
 
MainAssistant.prototype.activate = function(event) {
   var that = this;
   this.logInfo("Setup");
	//call the 3rd party service using standard Palm serviceRequest
    this.controller.serviceRequest("palm://com.palmdts.servicesample.service", {
      method: "hello",
      parameters: {"name": "World"},
      onSuccess:this.serviceSuccess.bind(this),
      onFailure:this.serviceFailure.bind(this)
    });
};

MainAssistant.prototype.serviceSuccess = function(successData){
   this.logInfo("Success Data: " + JSON.stringify(successData.reply));
}
MainAssistant.prototype.serviceFailure = function(failData){
    this.logInfo("Fail Data:" + JSON.stringify(failData));
}
 
MainAssistant.prototype.deactivate = function(event) {};
 
MainAssistant.prototype.cleanup = function(event) {};
 
MainAssistant.prototype.logInfo = function(logText) {
    this.debugContainer.innerHTML = (this.logOutputNum++) + ": " + logText + "<br />" + this.debugContainer.innerHTML;       
};    