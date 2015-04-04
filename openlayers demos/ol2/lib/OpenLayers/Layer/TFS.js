/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer/XYZ.js
 * @requires OpenLayers/Tile/TFS.js
 */

/** 
 * Class: OpenLayers.Layer.TFS
 * This Layer reads from TFS tiled data sources.  Since TFSs are 
 * essentially JSON-based ASCII art with attached attributes, they are not 
 * visibly rendered.  In order to use them in the map, you must add a 
 * <OpenLayers.Control.TFS> control as well.
 *
 * Example:
 *
 * (start code)
 * var world_utfgrid = new OpenLayers.Layer.TFS({
 *     url: "/tiles/world_utfgrid/${z}/${x}/${y}.json",
 *     utfgridResolution: 4,
 *     displayInLayerSwitcher: false
 * );
 * map.addLayer(world_utfgrid);
 * 
 * var control = new OpenLayers.Control.TFS({
 *     layers: [world_utfgrid],
 *     handlerMode: 'move',
 *     callback: function(dataLookup) {
 *         // do something with returned data
 *     }
 * })
 * (end code)
 *
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.XYZ>
 */
OpenLayers.Layer.TFS = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs 
     */
    DEFAULT_PARAMS: { service: "WFS",
                      version: "1.0.0",
                      request: "GetFeature",
                      outputFormat: "application/json"
                     },    
    /**
     * APIProperty: isBaseLayer
     * Default is false, as TFSs are designed to be a transparent overlay layer. 
     */
    isBaseLayer: false,
    
    /**
     * APIProperty: projection
     * {<OpenLayers.Projection>}
     * Source projection for the TFSs.  Default is "EPSG:900913".
     */
    projection: new OpenLayers.Projection("EPSG:900913"),

    /**
     * Property: useJSONP
     * {Boolean}
     * Should we use a JSONP script approach instead of a standard AJAX call?
     *
     * Set to true for using utfgrids from another server. 
     * Avoids same-domain policy restrictions. 
     * Note that this only works if the server accepts 
     * the callback GET parameter and dynamically 
     * wraps the returned json in a function call.
     * 
     * Default is false
     */
    useJSONP: false,
    
    /**
     * APIProperty: url
     * {String}
     * URL tempate for TFS tiles.  Include x, y, and z parameters.
     * E.g. "/tiles/${z}/${x}/${y}.json"
     */

    /**
     * APIProperty: utfgridResolution
     * {Number}
     * Ratio of the pixel width to the width of a TFS data point.  If an 
     *     entry in the grid represents a 4x4 block of pixels, the 
     *     utfgridResolution would be 4.  Default is 2 (specified in 
     *     <OpenLayers.Tile.TFS>).
     */

    /**
     * Property: tileClass
     * {<OpenLayers.Tile>} The tile class to use for this layer.
     *     Defaults is <OpenLayers.Tile.TFS>.
     */
    tileClass: OpenLayers.Tile.TFS,
	
	/**
     * Property: typeName
     * {String} Local feature typeName.
     */
    typeName: null,
	
	/**
     * Property: CQL_FILTER
     * {String} filter for features.
     */
	CQL_FILTER: null,
	
    /**
     * Constructor: OpenLayers.Layer.TFS
     * Create a new TFS layer.
     *
     * Parameters:
     * config - {Object} Configuration properties for the layer.
     *
     * Required configuration properties:
     * url - {String} The url template for TFS tiles.  See the <url> property.
     */
    initialize: function(options) {
        OpenLayers.Layer.Grid.prototype.initialize.apply(
            this, [options.name, options.url, {}, options]
        );
		OpenLayers.Util.applyDefaults(
                       this.params, 
                       OpenLayers.Util.upperCaseObject(this.DEFAULT_PARAMS)
                       );
        this.tileOptions = OpenLayers.Util.extend({
            utfgridResolution: this.utfgridResolution
        }, this.tileOptions);
    },

    /**
     * Method: createBackBuffer
     * The TFS cannot create a back buffer, so this method is overriden.
     */
    createBackBuffer: function() {},
    
    /**
     * APIMethod: clone
     * Create a clone of this layer
     *
     * Parameters:
     * obj - {Object} Only used by a subclass of this layer.
     * 
     * Returns:
     * {<OpenLayers.Layer.TFS>} An exact clone of this OpenLayers.Layer.TFS
     */
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.TFS(this.getOptions());
        }

        // get all additions from superclasses
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);

        return obj;
    },

    /**
     * APIProperty: getFeatureInfo
     * Get details about a feature associated with a map location.  The object
     *     returned will have id and data properties.  If the given location
     *     doesn't correspond to a feature, null will be returned.
     *
     * Parameters:
     * location - {<OpenLayers.LonLat>} map location
     *
     * Returns:
     * {Object} Object representing the feature id and TFS data 
     *     corresponding to the given map location.  Returns null if the given
     *     location doesn't hit a feature.
     */
    getFeatureInfo: function(location) {
        var info = null;
        var tileInfo = this.getTileData(location);
        if (tileInfo && tileInfo.tile) {
            info = tileInfo.tile.getFeatureInfo(tileInfo.i, tileInfo.j);
        }
        return info;
    },

    /**
     * APIMethod: getFeatureId
     * Get the identifier for the feature associated with a map location.
     *
     * Parameters:
     * location - {<OpenLayers.LonLat>} map location
     *
     * Returns:
     * {String} The feature identifier corresponding to the given map location.
     *     Returns null if the location doesn't hit a feature.
     */
    getFeatureId: function(location) {
        var id = null;
        var info = this.getTileData(location);
        if (info.tile) {
            id = info.tile.getFeatureId(info.i, info.j);
        }
        return id;
    },
	/**
     * Method: getURL
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     *
     * Returns:
     * {String} A string with the layer's url and parameters and also the
     *          passed-in bounds and appropriate tile size specified as
     *          parameters
     */
    getURL: function (bounds) {
		var newParams = {};
		newParams.CQL_FILTER="BBOX(the_geom, "+ bounds.left+","+ bounds.bottom+","+ bounds.right+","+ bounds.top+")";
		if(this.CQL_FILTER != null)
			newParams.CQL_FILTER += " and " + this.CQL_FILTER.cql_filter;
		newParams.typeName = this.typeName;
		return this.getFullRequestString(newParams);
    },
	/** 
     * APIMethod: getFullRequestString
     * Combine the layer's url with its params and these newParams. 
     *   
     *     Add the SRS parameter from projection -- this is probably
     *     more eloquently done via a setProjection() method, but this 
     *     works for now and always.
     *
     * Parameters:
     * newParams - {Object}
     * altUrl - {String} Use this as the url instead of the layer's url
     * 
     * Returns:
     * {String} 
     */
    getFullRequestString:function(newParams, altUrl) {

        return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(
                                                    this, arguments);
    },	
    CLASS_NAME: "OpenLayers.Layer.TFS"
});
