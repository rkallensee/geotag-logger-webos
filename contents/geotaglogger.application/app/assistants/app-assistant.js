function AppAssistant(appController) {
}

AppAssistant.prototype.handleLaunch = function(params) {
    //console.log("Entered handleLaunch! "+JSON.stringify(params));

    if( !params || (params["action"] == undefined) ) {
        return; // non-wakeup call, so quit and leave it to someone else
    }

    switch(params.action) {
        case 'bgtrack':
            //console.log("G'Morning! I'm awake!");
            Mojo.Controller.stageController.sendEventToCommanders(
                {'type': Mojo.Event.command, 'command': 'bgtrack'}
            );
            break;
    }

};
