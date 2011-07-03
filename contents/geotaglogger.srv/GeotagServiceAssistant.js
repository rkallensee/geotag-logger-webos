var GeotagServiceAssistant = function(){
}

var path = IMPORTS.require('path');
var fs = IMPORTS.require('fs');

GeotagServiceAssistant.prototype.run = function(future) {
    args = this.controller.args;

    console.log("entering service...");

    if( !args.data ) {
        var error = new Error("No data to save!");
        error.errorText = error.message;
        error.errorCode = -1;
        future.exception = error;
        return;
    }

    // build the GPX content with the received data

    // http://www.topografix.com/GPX/1/1/
    // http://de.wikipedia.org/wiki/GPS_Exchange_Format
    // http://developer.palm.com/index.php?option=com_content&view=article&id=1673#GPS-getCurrentPosition

    var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>'
        + '<gpx xmlns="http://www.topografix.com/GPX/1/1" creator="http://forge.webpresso.net/projects/geotag-logger" version="1.1" '
            + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
            + 'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">'
            + '<trk>'
                + '<name><![CDATA[geotag-logger for WebOS track]]></name>'
                + '<desc><![CDATA[Exported track to geotag your pictures.]]></desc>'
                + '<number>1</number>'
                + '<topografix:color>333333</topografix:color>'
                + '<trkseg>';

    for( var i=0; i<args.data.length; i++ ) {
        var date = new Date();
        date.setTime(args.data[i].timestamp);
        var dateStr = this.getIso8601(date);

        xml += '<trkpt lat="' + args.data[i].latitude + '" lon="' + args.data[i].longitude + '">'
            + '<ele>' + args.data[i].altitude + '</ele>'
            + '<time>' + dateStr + '</time>'
            + '<sym>Waypoint</sym>'
            + '</trkpt>';
    }

    xml += '</trkseg></trk></gpx>';

    // save the GPX string as file to the USB partition

    var dirname = '/media/internal/geotag-logger/';
    var filename = this.getFilename();
    var gpxPath = dirname + filename;

    if( !path.existsSync(dirname) ) {
        fs.mkdirSync(dirname, 0777);
    }

    //fs.writeFileSync(gpxPath, args.data, 'utf8');
    //future.result = { reply: 'super!' };

    //fs.open(gpxPath, "a", 0666, function(err, fd) {
    //    if( err ) future.result = {reply: 'super!'};
    //    fs.writeSync(fd, args.data, null, 'utf8');
    //    future.result = { reply: 'super!' };
    //    return;
    //});

    fs.open(gpxPath, "a", 0777, function(err, fd) {
        if( err ) future.result = {reply: 'super!'};

        fs.write(fd, xml, null, 'utf8', function (err, written) {
            if(err) future.result = {error: false, text: err};
            future.result = {error: false, text: 'Successfully exported GPX.'};
        });
    });

    //this.writeData(
    //    gpxPath,
    //    this.args.data,
    //    function(response) {
    //        this.future.result = response;
    //    }.bind(this)
    //);
};

GeotagServiceAssistant.prototype.writeData = function(filename, data, callback) {
    path.exists(filename, function(exists) {
        if(!exists) {
            //fs.createWriteStream(filename, {flags:"a"}).write(data);

            fs.open(filename, "a", 0777, function(err, fd) {
                if( err ) callback({error: false, text: err});
                fs.write(fd, data, null, 'utf8', function (err, written) {
                    if(err) callback({error: false, text: err});
                    callback({error: false, text: 'Successfully exported GPX.'});
                });
            });
        } else {
            callback({error: true, text: 'File already exists!'});
        }
    });

};

GeotagServiceAssistant.prototype.getFilename = function() {
    var d = new Date();

    return d.getFullYear()+'-'+(((parseInt(d.getMonth())+1) < 10 ? '0' : '')+(parseInt(d.getMonth())+1))
        +'-'+((d.getDate() < 10 ? '0' : '')+d.getDate())+'_'
        +((d.getHours() < 10 ? '0' : '')+d.getHours())+'-'
        +((d.getMinutes() < 10 ? '0' : '')+d.getMinutes())+'-'
        +((d.getSeconds() < 10 ? '0' : '')+d.getSeconds())+'-'+d.getMilliseconds()+'.gpx';
};

GeotagServiceAssistant.prototype.getIso8601 = function(d) {
    function pad(n) { return n<10 ? '0'+n : n }

    return d.getUTCFullYear() + '-'
        + pad( d.getUTCMonth() + 1 ) + '-'
        + pad( d.getUTCDate() ) + 'T'
        + pad( d.getUTCHours() ) + ':'
        + pad( d.getUTCMinutes() ) + ':'
        + pad( d.getUTCSeconds() ) + 'Z';
}
