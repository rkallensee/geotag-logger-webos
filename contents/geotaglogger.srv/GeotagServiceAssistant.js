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

    var dirname = '/media/internal/geotag-logger/';
    var filename = '2011-03-23_08-48-00.gpx';
    var gpxPath = dirname + filename;

    if( !path.existsSync(dirname) ) {
        fs.mkdirSync(dirname, 0777);
    }

    fs.writeFileSync(gpxPath, args.data, 'utf8');
    future.result = { reply: 'super!' };

/*
    fs.open(gpxPath, "a", 0666, function(err, fd) {
        if( err ) future.result = {reply: 'super!'};
        fs.writeSync(fd, args.data, null, 'utf8');
        future.result = { reply: 'super!' };
        return;
/*
        fs.write(fd, args.data, null, 'utf8', function (err, written) {
            if(err) future.result = {error: false, text: err};
            future.result = {error: false, text: 'Successfully exported GPX.'};
        });
*//*
    });
*/

/*
    this.writeData(
        gpxPath,
        this.args.data,
        function(response) {
            this.future.result = response;
        }.bind(this)
    );
*/
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