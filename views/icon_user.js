L.DivIcon.SVGIcon.UserIcon = L.DivIcon.SVGIcon.extend({
    options: {
        "iconSize": L.point(25, 25),
        "fillColor":"#000000",
        "txtVal":0.0,
        "txtColor":"#FFFFF"
    },
    _createCircle: function() { return ""; },
    _createPathDescription: function() {
        var s = 9;
        var d = 
        "M" + ( 339.602/s) + "," + ( 46.658/s) + 
        "H" + ( 172.398/s) + 
        "C" + ( 77.173/s) + "," + ( 46.658/s) + "," + ( 0/s) + "," + ( 123.849/s) + "," + ( 0/s) + "," + ( 219.048/s) + 
        "c" + ( 0/s) + "," + ( 95.225/s) + "," + ( 77.173/s) + "," + ( 172.416/s) + "," + ( 172.398/s) + "," + ( 172.416/s) + 
        "h" + ( 122.568/s) + 
        "c" + ( 24.641/s) + "," + ( 0/s) + "," + ( 32.324/s) + "," + ( 11.437/s) + "," + ( 32.324/s) + "," + ( 20.799/s) + 
        "c" + ( 0/s) + "," + ( 13.849/s) + (-7.189/s) + "," + ( 26.831/s) + ( -24.606/s) + "," + ( 39.248/s) + 
        "c" + ( -10.793/s) + "," + ( 7.684/s) + ( -2.314/s) + "," + ( 13.831/s) + "," + ( 6.147/s) + "," + ( 13.831/s) + 
        "C" + ( 418.878/s) + "," + ( 465.342/s) + "," + ( 512/s) + "," + ( 345.282/s) + "," + ( 512/s) + "," + ( 219.048/s) + 
        "C" + ( 512/s) + "," + ( 123.849/s) + "," + ( 434.81/s) + "," + ( 46.658/s) + "," + ( 339.602/s) + "," + ( 46.658/s) + 
        "z";
        return d;
    },
    _createPath: function(setval) {
        var pathd = this._createPathDescription();
        var dispval = (setval != undefined && setval != null) ? setval : this.options.txtVal;
        var xpos = (dispval < 10) ? 20 : 8;

        var path =  '<path d="' + pathd + '" fill="' + this.options.fillColor + '" stroke="black"></path>' +
                    '<text x="' + xpos + '" y="30" fill="' + this.options.txtColor + '">' + dispval + '</text>';
        return path;
    },
    _createText: function() { return ""; }
});

L.divIcon.svgIcon.userIcon = function(options) { return new L.DivIcon.SVGIcon.UserIcon(options); };
L.Marker.SVGMarker.UserMarker = L.Marker.SVGMarker.extend({ options: { "iconFactory": L.divIcon.svgIcon.userIcon  } });
L.marker.svgMarker.userMarker = function(latlng, options) { return new L.Marker.SVGMarker.UserMarker(latlng, options); };
