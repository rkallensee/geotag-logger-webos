function ManualTagAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
};

ManualTagAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	that = this; // this allows accessing the assistent object from other scopes. Ugly!
	
	// Lawnchair bucket
    this.bucket = new Lawnchair({table: 'waypoints', adaptor: 'webkit', onError: this.handleDbError.bind(this)});
	
	/* setup widgets here */
	
    this.recordButtonModel = {
        buttonLabel: $L("Record waypoint"),
        buttonClass: "",
        disabled: false
    };
    this.controller.setupWidget(
        "RecordButton", 
        {}, 
        this.recordButtonModel
    );
    
    this.exportButtonModel = {
        buttonLabel: $L("Export GPX"),
        buttonClass: "",
        disabled: false
    };
    this.controller.setupWidget(
        "ExportButton", 
        {}, 
        this.exportButtonModel
    );

	/* add event handlers to listen to events from widgets */
	
	Mojo.Event.listen(this.controller.get("RecordButton"), Mojo.Event.tap, this.handleRecordButtonPress.bind(this));
	Mojo.Event.listen(this.controller.get("ExportButton"), Mojo.Event.tap, this.exportGPX.bind(this));
};

ManualTagAssistant.prototype.handleDbError = function(transaction, error) {
    // console.log(error.message); console.log(error.code);

    if( error.code == 1 && error.message.indexOf('no such table') > -1 ) {
        // This means the database table is unavailable. The only reason could be
        // that there never was a table - so it's the first application start.
        return;
    }
};

ManualTagAssistant.prototype.handleRecordButtonPress = function(event){
    this.controller.serviceRequest('palm://com.palm.location', {
        method: "getCurrentPosition",
        parameters: {
            accuracy: 2,
            maximumAge: 60, // seconds
            responseTime: 2
        },
        onSuccess: function(result) {
            if( result.errorCode === 0 ) {
                that.saveWaypoint(result);
            } else {
                Mojo.Controller.errorDialog(
                    $L('Can\'t obtain your location. Have you enabled location services?')
                );
            }
        },
        onFailure: function(result) {
            Mojo.Controller.errorDialog(
                $L('Can\'t obtain your location. Have you enabled location services?')
            );
        }
    }); 
};

ManualTagAssistant.prototype.saveWaypoint = function( item ) {
    console.log("saving waypoint...");
    
    this.bucket.save( item );
};

ManualTagAssistant.prototype.exportGPX = function() {
    console.log("exporting gpx...");
    
    // load all waypoints from bucket
    this.bucket.all( function(r) {
        
        // transform to GPX.
        // http://www.topografix.com/GPX/1/1/
        // http://de.wikipedia.org/wiki/GPS_Exchange_Format
        // http://developer.palm.com/index.php?option=com_content&view=article&id=1673#GPS-getCurrentPosition
        
        var xml = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>'
            + '<gpx xmlns="http://www.topografix.com/GPX/1/1" creator="byHand" version="1.1" '
            + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
            + 'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">';
            
        for( var i=0; i<r.length; i++ ) {
            var date = new Date()
            date.setTime(r[i].timestamp);
            var dateStr = that.getIso8601(date);
            
            xml += '<wpt lat="' + r[i].latitude + '" lon="' + r[i].longitude + '">'
                + '<ele>' + r[i].altitude + '</ele>'
                + '<time>' + dateStr + '</time>'
                //+ '<name>Cala Sant Vicenç - Mallorca</name>'
                + '</wpt>';
        }
        
        xml += '</gpx>';
        
        console.log(xml);
    } );
};

ManualTagAssistant.prototype.getIso8601 = function(d) {
    function pad(n) { return n<10 ? '0'+n : n }
    
    return d.getUTCFullYear() + '-'
        + pad( d.getUTCMonth() + 1 ) + '-'
        + pad( d.getUTCDate() ) + 'T'
        + pad( d.getUTCHours() ) + ':'
        + pad( d.getUTCMinutes() ) + ':'
        + pad( d.getUTCSeconds() ) + 'Z';
}



ManualTagAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
	// it seems like we have to re-set this variable after the scene was popped in again via back gesture
    that = this; // this allows accessing the assistant object from other scopes. Ugly!
};

ManualTagAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	
	// since "that" is global, maybe it's better to cleanup after scene became inactive.
    that = null;
};

ManualTagAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	
	// since "that" is global, maybe it's better to cleanup after scene became inactive.
    that = null;
};
