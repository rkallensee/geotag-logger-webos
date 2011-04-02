function MainAssistant() {};

MainAssistant.prototype.setup = function() {
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

MainAssistant.prototype.activate = function(event) {
};
/*
MainAssistant.prototype.serviceSuccess = function(successData){
   this.logInfo("Success Data: " + JSON.stringify(successData.reply));
}
MainAssistant.prototype.serviceFailure = function(failData){
    this.logInfo("Fail Data:" + JSON.stringify(failData));
}
*/
MainAssistant.prototype.deactivate = function(event) {};

MainAssistant.prototype.cleanup = function(event) {};

MainAssistant.prototype.handleDbError = function(transaction, error) {
    // console.log(error.message); console.log(error.code);

    if( error.code == 1 && error.message.indexOf('no such table') > -1 ) {
        // This means the database table is unavailable. The only reason could be
        // that there never was a table - so it's the first application start.
        return;
    }
};

MainAssistant.prototype.handleRecordButtonPress = function(event){
    this.controller.serviceRequest('palm://com.palm.location', {
        method: "getCurrentPosition",
        parameters: {
            accuracy: 2,
            maximumAge: 60, // seconds
            responseTime: 2
        },
        onSuccess: this.saveResultAsWaypoint.bind(this),
        onFailure: function(result) {
            Mojo.Controller.errorDialog(
                $L('Can\'t obtain your location. Have you enabled location services?')
            );
        }
    });
};

MainAssistant.prototype.saveResultAsWaypoint = function( result ) {
    if( result.errorCode === 0 ) {
        this.saveWaypoint(result);
    } else {
        Mojo.Controller.errorDialog(
            $L('Can\'t obtain your location. Have you enabled location services?')
        );
    }
};

MainAssistant.prototype.saveWaypoint = function( item ) {
    console.log("saving waypoint...");

    this.bucket.save( item );
};

MainAssistant.prototype.exportGPX = function() {
    // load all waypoints from Lawnchair bucket
    this.bucket.all( this.handleExportGPX.bind(this) );
};

MainAssistant.prototype.handleExportGPX = function( r ) {
    console.log("exporting gpx...");

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
        var dateStr = this.getIso8601(date);

        xml += '<wpt lat="' + r[i].latitude + '" lon="' + r[i].longitude + '">'
            + '<ele>' + r[i].altitude + '</ele>'
            + '<time>' + dateStr + '</time>'
            //+ '<name>Cala Sant Vicenç - Mallorca</name>'
            + '</wpt>';
    }

    xml += '</gpx>';

    // calling the geotag-service to write the GPX file
    var req = new Mojo.Service.Request(
        "palm://net.webpresso.geotaglogger.service",
        {
            method: "save",
            parameters: {"data": xml},
            onSuccess: this.serviceSaveSuccess.bind(this),
            onFailure: this.serviceSaveFailure.bind(this)
        }
    );
};

MainAssistant.prototype.serviceSaveSuccess = function(data) {
    Mojo.Controller.errorDialog(
        $L('Successfully saved GPX file to your USB partition! Find it in "geotag-logger" directory. >>' + data.reply)
    );
};

MainAssistant.prototype.serviceSaveFailure = function(error) {
    Mojo.Controller.errorDialog(
        $L('An error occured when saving the GPX file! >>' + JSON.stringify(error))
    );
};

MainAssistant.prototype.getIso8601 = function(d) {
    function pad(n) { return n<10 ? '0'+n : n }

    return d.getUTCFullYear() + '-'
        + pad( d.getUTCMonth() + 1 ) + '-'
        + pad( d.getUTCDate() ) + 'T'
        + pad( d.getUTCHours() ) + ':'
        + pad( d.getUTCMinutes() ) + ':'
        + pad( d.getUTCSeconds() ) + 'Z';
}
