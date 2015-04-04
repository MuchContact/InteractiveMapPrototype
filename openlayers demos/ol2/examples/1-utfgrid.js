OpenLayers.ProxyHost= "http://localhost:8090/CrossDomainProxy/proxy?requesturl=";

var utfgrid = new OpenLayers.Layer.TFS({
    url: "http://localhost:8080/geoserver/city/ows",
	typeName: "CITY-IN-WORLD",
    utfgridResolution: 4, // default is 2
    displayInLayerSwitcher: false
});
var nyAddressGrid = new OpenLayers.Layer.TFS({
    url: "http://localhost:8080/geoserver/address/ows",
	typeName: "XYus-ny-nyc",
    utfgridResolution: 4, // default is 2
    displayInLayerSwitcher: false
});

var ol_wms = new OpenLayers.Layer.WMS( "OpenLayers WMS",
                "http://vmap0.tiles.osgeo.org/wms/vmap0",
                {layers: 'basic'},
				{isBaseLayer: true}
				);
var nyAddress = new OpenLayers.Layer.WMS("city:CITY-IN-WORLD - Tiled", 
				"http://localhost:8080/geoserver/address/wms",
				{layers: "address:XYus-ny-nyc", transparent: 'true', format: 'image/png'},
				{isBaseLayer: true});

var tiledCity = new OpenLayers.Layer.WMS("OpenAddress", 
				"http://localhost:8080/geoserver/city/wms",
				{layers: "city:CITY-IN-WORLD", transparent: 'true', format: 'image/png'},
				{isBaseLayer: true});
				
var osm = new OpenLayers.Layer.OSM("stamen", "http://c.tile.stamen.com/toner/${z}/${x}/${y}.png" );

var esriLayer = new OpenLayers.Layer.XYZ( "ESRI",
                    "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}",
                    {sphericalMercator: true},
					{isBaseLayer: true});				
//map.addLayers([ol_wms, tiledCity, utfgrid]);
//var map = new OpenLayers.Map('map');
var map = new OpenLayers.Map({
	 div: "map",
	 layers: [
		nyAddress
	 ],
	 center: [-74.11, 40.58],
     zoom: 15
});

map.addControl(
	new OpenLayers.Control.MousePosition({
		prefix: '<a target="_blank" ' +
			'href="http://spatialreference.org/ref/epsg/4326/">' +
			'EPSG:4326</a> coordinates: ',
		separator: ' | ',
		numDigits: 2,
		emptyString: 'Mouse is not over map.'
	})
);

/*
if (!map.getCenter()) {
	map.zoomToMaxExtent();
}
*/
var callback = function(infoLookup) {
    var msg = "";
	this.map.getViewport().style.cursor = ''
    if (infoLookup) {
        var info;
        for (var idx in infoLookup) {
            // idx can be used to retrieve layer from map.layers[idx]
            info = infoLookup[idx];
            if (info) {
				this.map.getViewport().style.cursor = 'pointer'
				for(var index in info){
					var geometry = info[index].geometry;
					var item = info[index].data;
					msg += "[" + item.FID1 + "] <strong>In 2005, " + 
                    item.NAME + " had a population of " +
                    item.POPULATION + " people.</strong> ";
					var pixel = map.getPixelFromLonLat(new OpenLayers.LonLat(geometry.x, geometry.y));
					document.getElementById("marker").style.left = this.map.getViewport().offsetLeft + pixel.x - 4 +"px";
					document.getElementById("marker").style.top = this.map.getViewport().offsetTop + pixel.y - 4 +"px";
				}
                
            }
        }
    }
    document.getElementById("attrs").innerHTML = msg;
};
    
var controls = {
    move: new OpenLayers.Control.TFS({
        callback: callback,
        handlerMode: "move"
    }),
    hover: new OpenLayers.Control.TFS({
        callback: callback,
        handlerMode: "hover"
    }),
    click: new OpenLayers.Control.TFS({
        callback: callback,
        handlerMode: "click"
    })
};
for (var key in controls) {
    map.addControl(controls[key]);
}

function toggleControl(el) {
    for (var c in controls) {
        controls[c].deactivate();
    }
    controls[el.value].activate();
}

// activate the control that responds to mousemove
toggleControl({value: "move"});

function search(){
	var filterParams = {
		cql_filter: null
	};
	var filter = " CNTRY_NAME like '%"+document.getElementById('address').value+"%'";
	if (OpenLayers.String.trim(filter) != "") {
		filterParams["cql_filter"] = filter;
	}
	tiledCity.mergeNewParams(filterParams);
	utfgrid.CQL_FILTER = filterParams;
	utfgrid.mergeNewParams(filterParams);
}