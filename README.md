Geotag-logger for WebOS
=======================

This application is a Geotag logger for HP [WebOS](http://en.wikipedia.org/wiki/Palm_webOS)
to geo-tag images from an external camera. It records your position and exports the data as
GPX (a standardized, open format). You can tag your photos with this GPX file later, e.g.
with other free and open-source applications like [Geotag](http://geotag.sourceforge.net/)
or [GPicSync](http://code.google.com/p/gpicsync/) or
[GPSCorrelate](http://freefoote.dview.net/linux_gpscorr.html). Exported GPX files can get
visualized with [GPX Mapper](http://developer.palm.com/appredirect/?packageid=com.rustyapps.gpxmapper)
which is available freely in the App Catalog.

The description in the HP App Catalog reads as follows:

> Geotagging of pictures just means to store the (more or less exact) position where
> the picture was taken as metadata into your pictures. While WebOS devices can geotag
> their pictures automatically, it's not that easy to tag pictures from a photo camera
> without GPS sensor.
>
> This is where Geotag Logger can help you: Basically this application just tracks your
> position (manually or automatically) and allows you to export a GPX file to your USB
> partition. You can use this file to tag your photos with a third-party desktop
> application later.

This application *requires WebOS 2.1 or greater* since it makes use of the Node.js
services to access the USB partition for GPX file export.


Status
------

The application is available in the
[official HP App Catalog](http://developer.palm.com/appredirect/?packageid=net.webpresso.geotaglogger).
IPK files are available under the [Files](http://forge.webpresso.net/projects/geotag-logger/files)
section on the project website (they can be installed e.g. via the SDK or Preware).


Users' guide
------------

You can find a description of the features and a
[Users' guide](http://forge.webpresso.net/projects/geotag-logger/wiki/Wiki)
in the project Wiki.


Used libraries
--------------

The application uses [Lawnchair](http://blog.westcoastlogic.com/lawnchair/) (MIT) for
storage. The icon is built from two icons of the
[Tango Icon Library](http://tango.freedesktop.org/Tango_Icon_Library) (Public Domain).


Bug tracker
-----------

Bugs are tracked in the project Redmine installation:
https://forge.webpresso.net/projects/geotag-logger/issues


Source code
-----------

The source code of the application can be found in a Git repository. Browse it
online (https://forge.webpresso.net/projects/geotag-logger/repository) or

`git clone https://code.webpresso.net/git/geotag-logger`


Authors
-------

**Raphael Kallensee**

+ http://raphael.kallensee.name
+ http://identi.ca/rkallensee
+ http://twitter.com/rkallensee


License
---------------------

Copyright 2011-2012 Raphael Kallensee.

[![GPLv3](http://www.gnu.org/graphics/gplv3-127x51.png)](http://www.gnu.org/licenses/gpl-3.0.html)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
