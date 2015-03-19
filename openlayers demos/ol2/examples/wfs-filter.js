var map;

// use proxy if requesting features cross-domain
OpenLayers.ProxyHost= "http://localhost:8090/CrossDomainProxy/cgi-bin/proxy.cgi?url=";

function init() {
	
    map = new OpenLayers.Map({
        div: "map",
        layers: [
            new OpenLayers.Layer.WMS(
                "Natural Earth", 
                "http://demo.opengeo.org/geoserver/wms",
                {layers: "maps:ne_50m_land"}
            ),
            new OpenLayers.Layer.Vector("WFS", {
                strategies: [new OpenLayers.Strategy.BBOX()],
                protocol: new OpenLayers.Protocol.WFS({
                    url:  "http://localhost:8080/geoserver/wfs",
                    featureType: "archsites",
                    featureNS: "http://www.openplans.org/spearfish",
					featurePrefix: "",
					srsName: "EPSG:4326", // this is the default,
					version: "1.1.0"
                }),
				filter: new OpenLayers.Filter.Logical({
					type:	OpenLayers.Filter.Logical.AND,
					filters:	[
						new OpenLayers.Filter.Comparison({
							type: OpenLayers.Filter.Comparison.GREATER_THAN,
                            property: "cat",
                            value: 20
						}),
						new OpenLayers.Filter.Comparison({
							type: OpenLayers.Filter.Comparison.LESS_THAN,
                            property: "cat",
                            value: 50
						})
					]
				})
            })
			
        ],
        center: new OpenLayers.LonLat(1.7, 0.8),
        zoom: 1
    });

}
