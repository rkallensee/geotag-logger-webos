function MainAssistant() {};

MainAssistant.prototype.setup = function() {
    // Lawnchair bucket
    this.bucket = new Lawnchair({table: 'waypoints', adaptor: 'webkit', onError: this.handleDbError.bind(this)});

    this.trackingContinuously = false;

    /* setup widgets here */

    this.controller.setupWidget(
        Mojo.Menu.appMenu,
        { omitDefaultItems: true },
        {
            visible: true,
            items: [
                Mojo.Menu.editItem,
                { label: $L('Export GPX'), command: 'cmdExport' },
                { label: $L('Clear database'), command: 'cmdClear' },
                { label: $L('Help / About'), command: 'cmdHelp' }
            ]
        }
    );

    this.recordButtonModel = {
        buttonLabel: $L("Record single trackpoint"),
        buttonClass: "",
        disabled: false
    };
    this.controller.setupWidget(
        "RecordButton",
        {type: Mojo.Widget.activityButton},
        this.recordButtonModel
    );
    this.recordButton = this.controller.get('RecordButton');

    this.recordContinuousButtonModel = {
        buttonLabel: $L("Record continuous"),
        buttonClass: "",
        disabled: false
    };
    this.controller.setupWidget(
        "RecordContinuousButton",
        {type: Mojo.Widget.activityButton},
        this.recordContinuousButtonModel
    );
    this.recordContinuousButton = this.controller.get('RecordContinuousButton');

    /* add event handlers to listen to events from widgets */
};

MainAssistant.prototype.activate = function(event) {
    this.handleRecordButtonPressCallback = this.handleRecordButtonPress.bind(this);
    this.handleRecordContinuousButtonPressCallback = this.handleRecordContinuousButtonPress.bind(this);

    Mojo.Event.listen(this.recordButton, Mojo.Event.tap, this.handleRecordButtonPressCallback);
    Mojo.Event.listen(this.recordContinuousButton, Mojo.Event.tap, this.handleRecordContinuousButtonPressCallback);
    this.updateTrackingRecordCounter();
};

MainAssistant.prototype.deactivate = function(event) {
    Mojo.Event.stopListening(this.recordButton, Mojo.Event.tap, this.handleRecordButtonPressCallback);
    Mojo.Event.stopListening(this.recordContinuousButton, Mojo.Event.tap, this.handleRecordContinuousButtonPressCallback);
};

MainAssistant.prototype.cleanup = function(event) {
    this.deleteWakeupCall();
};

MainAssistant.prototype.handleDbError = function(transaction, error) {
    // console.log(error.message); console.log(error.code);

    if( error.code == 1 && error.message.indexOf('no such table') > -1 ) {
        // This means the database table is unavailable. The only reason could be
        // that there never was a table - so it's the first application start.
        return;
    }
};

MainAssistant.prototype.handleRecordButtonPress = function(event){
    this.recordButton.mojo.activate();
    this.trackCurrentPosition();
};

MainAssistant.prototype.trackCurrentPosition = function(event){
    this.controller.serviceRequest('palm://com.palm.location', {
        method: "getCurrentPosition",
        parameters: {
            accuracy: 2, // 1 = high, 2 = medium, 3 = low
            maximumAge: 60, // seconds
            responseTime: 2 // 1 = <5s, 2 = 5-20s, 3 = >20s
        },
        onSuccess: this.saveResultAsTrackpoint.bind(this),
        onFailure: this.singleRecordLocationFailure.bind(this)
    });
};

MainAssistant.prototype.singleRecordLocationFailure = function() {
    this.recordButton.mojo.deactivate();
    Mojo.Controller.errorDialog(
        $L('Can\'t obtain your location. Have you enabled location services?')
    );
};

MainAssistant.prototype.saveResultAsTrackpoint = function( result ) {
    if( result.errorCode === 0 ) {
        this.saveTrackpoint(result);
    } else {
        this.singleRecordLocationFailure();
    }
};

MainAssistant.prototype.saveTrackpoint = function( item ) {
    console.log("saving track point...");

    this.bucket.save( item );

    this.recordButton.mojo.deactivate();
    Mojo.Controller.getAppController().showBanner(
        $L("Tracked current position."),
        { source: 'notification' }
    );

    this.updateTrackingRecordCounter();
};

MainAssistant.prototype.updateTrackingRecordCounter = function() {
    this.bucket.all( this.updateTrackingRecordCounterCallback.bind(this) );
};

MainAssistant.prototype.updateTrackingRecordCounterCallback = function( r ) {
    this.controller.get("recordCount").innerHTML = r.length;
};

MainAssistant.prototype.exportGPX = function() {
    // load all waypoints from Lawnchair bucket
    this.bucket.all( this.handleExportGPX.bind(this) );
};

MainAssistant.prototype.handleExportGPX = function( r ) {
    console.log("exporting gpx...");

    // calling the geotag-service to build and write the GPX file
    var req = new Mojo.Service.Request(
        "palm://net.webpresso.geotaglogger.service",
        {
            method: "save",
            parameters: {"data": r},
            onSuccess: this.serviceSaveSuccess.bind(this),
            onFailure: this.serviceSaveFailure.bind(this)
        }
    );
};

MainAssistant.prototype.serviceSaveSuccess = function(data) {
    this.controller.showAlertDialog({
        onChoose: function(){},
        title: $L("Successfully exported GPX"),
        message: $L("Successfully saved GPX file to your USB partition! You can find it in \"geotag-logger\" directory."),
        choices:[
             {label:$L('OK'), value:"ok", type:'primary'}
        ]
    });
};

MainAssistant.prototype.serviceSaveFailure = function(error) {
    Mojo.Controller.errorDialog(
        $L('An error occured when saving the GPX file! >> ' + JSON.stringify(error))
    );
};

MainAssistant.prototype.clearData = function(event) {
    this.controller.showAlertDialog({
        onChoose: this.clearDataHandleChoice.bind(this),
        title: $L("Clear saved track data"),
        message: $L("Do you really want to clear the track database? Your exported GPX files will remain on the USB partition."),
        choices:[
             {label:$L('Clear database'), value:"nuke", type:'negative'},
             {label:$L("Cancel"), value:"cancel", type:'secondary'}
        ]
    });
};

MainAssistant.prototype.clearDataHandleChoice = function(value) {
    if( value == 'nuke' ) {
        this.bucket.nuke();
        Mojo.Controller.getAppController().showBanner(
            $L("Cleared track database."),
            { source: 'notification' }
        );
        this.updateTrackingRecordCounter();
    }
};

MainAssistant.prototype.handleRecordContinuousButtonPress = function(event){
    if( this.trackingContinuously === false ) {
        this.recordContinuousButton.mojo.activate();
        this.trackCurrentPosition(); // immediately record the first trackpoint
        this.setWakeupCall();
        Mojo.Controller.getAppController().showBanner(
            $L("Continuous tracking activated."),
            { source: 'notification' }
        );
    } else {
        this.recordContinuousButton.mojo.deactivate();
        this.deleteWakeupCall();
        Mojo.Controller.getAppController().showBanner(
            $L("Continuous tracking deactivated."),
            { source: 'notification' }
        );
    }
};

MainAssistant.prototype.setWakeupCall = function(){
    this.wakeupRequest = new Mojo.Service.Request('palm://com.palm.power/timeout', {
        method: 'set',
        parameters: {
            'key': 'net.webpresso.geotaglogger.bgtrack',
            'in': '00:05:00',
            'wakeup': true,
            'uri': 'palm://com.palm.applicationManager/open',
            'params': {
                'id': Mojo.appInfo.id,
                'params': {
                    'action': 'bgtrack'
                }
            }
        },
        onSuccess: this.handleContinuousWakeupSuccess.bind(this),
        onFailure: this.handleContinuousWakeupFailure.bind(this)
    });
};

MainAssistant.prototype.deleteWakeupCall = function(){
    this.wakeupRequest = new Mojo.Service.Request('palm://com.palm.power/timeout', {
        method: 'clear',
        parameters: {
            'key': 'net.webpresso.geotaglogger.bgtrack'
        },
        onSuccess: function(response) {
            Mojo.Log.info("Alarm Clear Success: " + response.returnValue);
        },
        onFailure: function(response) {
            Mojo.Log.error("Alarm Clear FAILURE: " + response.returnValue);
        }
    });
    this.trackingContinuously = false;
};

MainAssistant.prototype.handleContinuousWakeupSuccess = function(event) {
    this.trackingContinuously = true;
};

MainAssistant.prototype.handleContinuousWakeupFailure = function(event) {
    this.recordContinuousButton.mojo.deactivate();
    Mojo.Controller.errorDialog(
        $L('Can\'t register alarm for continuous tracking!')
    );
};

MainAssistant.prototype.handleBackgroundTrackCall = function() {
    //console.log("MainAssistant background-called!");
    this.trackCurrentPosition();
    this.setWakeupCall(); // set a new wakeup request
};

MainAssistant.prototype.handleCommand = function(event) {
    this.controller = Mojo.Controller.stageController.activeScene();

    if( event.type == Mojo.Event.command ) {
        switch( event.command )
        {
            case 'cmdExport':
                this.exportGPX();
                break;
            case 'cmdClear':
                this.clearData();
                break;
            case 'bgtrack':
                this.handleBackgroundTrackCall();
                break;
        }
    }
}
