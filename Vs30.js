'use strict';

var View = require('mvc/View'),
    Xhr = require('util/Xhr');


var Vs30 = function (options) {
  var _this,
      _initialize,
      // variables
      _data,
      _dataLayer,
      _layerControl,
      _map,
      _url,
      // functions
      _addLayers,
      _loadData;

  _this = View(options);

  _initialize = function () {
    _data = options.data || [];
    _url = options.url;
    _this.el.innerHTML = '<div class="map"></div>';
    _map = L.map(_this.el.querySelector('.map'));

    _layerControl = L.control.layers().addTo(_map);
    L.control.scale().addTo(_map);

    options = null;
    _addLayers();
    _loadData();
  };

  _addLayers = function () {
    _dataLayer = new L.MarkerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      disableClusteringAtZoom: 9
    });
    _map.addLayer(_dataLayer);

    // Mapquest base layers
    _layerControl.addBaseLayer(
        L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Esri, HERE, DeLorme, TomTom, USGS, NGA, USDA, EPA, NPS'
        }).addTo(_map),
        'Terrain');

    _layerControl.addBaseLayer(
        L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
          maxZoom: 18,
          subdomains: ['otile1','otile2','otile3','otile4'],
          attribution: 'Maps provided by <a href="http://open.mapquest.com" target="_blank">MapQuest</a>, <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> and contributors.'
        }),
        'Street');

    _layerControl.addBaseLayer(
        L.layerGroup([
          L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy;2014 Esri, DeLorme, HERE'
          }),
          L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}')
        ]),
        'Greyscale');

    _layerControl.addBaseLayer(
        L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg', {
          maxZoom: 18,
          subdomains: ['otile1','otile2','otile3','otile4'],
          attribution: 'Maps provided by <a href="http://open.mapquest.com" target="_blank">MapQuest</a> (portions courtesy NASA/JPL and USDA).'
        }),
        'Satellite');
  };

  _loadData = function () {
    Xhr.ajax({
      url: _url,
      success: function (data) {
        _data = (typeof data === 'string' ? JSON.parse(data) : data);
        _this.render();
      }
    });
  };

  _this.render = function () {
    var bounds = new L.LatLngBounds();

    _dataLayer.clearLayers();

    _data.features.forEach(function (feature) {
      var props = feature.properties,
          coords = feature.geometry.coordinates,
          latlng,
          marker,
          popup;

      latlng = L.latLng(coords[1], coords[0]);
      bounds.extend(latlng);
      marker = L.circleMarker(latlng, {
        radius: 8,
        color: props.color,
        opacity: 0.8,
        weight: 2,
        fillColor: props.color,
        fillOpacity: 0.6
      });
      _dataLayer.addLayer(marker);

      popup = '<div class="popup"><h1>' +
          props.index +
          '</h1><table><tr><th>Network/Station Code</th><td>' +
          (props.net_sta || 'N/A') +
          '</td></tr><tr><th>Station Name</th><td>' +
          (props.name || 'N/A') +
          '</td></tr><tr><th>Method</th><td>' +
          (props.method || 'N/A') +
          '</td></tr><tr><th><i>V</i><sub><i>S</i>30</sub></th><td>' +
          (props.vs30 || 'N/A') + ' m/s' +
          '</td></tr><tr><th>Max. Depth of Profile</th><td>',
          (props.d_max || 'N/A') + ' m' +
          '</div>';
      marker.bindPopup(popup);
    });

    _map.fitBounds(bounds);
  };


  _initialize();
  return _this;
};
