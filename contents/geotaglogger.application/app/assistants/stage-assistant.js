function StageAssistant() {
};

StageAssistant.prototype.setup = function() {
    this.controller.pushScene("main");
};

StageAssistant.prototype.handleCommand = function(event) {
    if( event.type == Mojo.Event.command ) {
        switch( event.command )
        {
            case 'cmdMain':
                this.pushMyScene("main");
                break;
            case 'cmdHelp':
                this.pushMyScene("help");
                break;
        }
    }
};

StageAssistant.prototype.pushMyScene = function(sceneId, params) {

    var allScenes = this.controller.getScenes();

    // this checks if scene already exists in scene stack.
    // if yes, pop all scenes on top.

    for( var i=0; i<allScenes.length; i++ ) {
        if( allScenes[i].sceneName == sceneId ) {
            this.controller.popScenesTo(sceneId);
            return;
        }
    }

    // if scene is not in stack, push it.
    this.controller.pushScene(sceneId, params);
};
