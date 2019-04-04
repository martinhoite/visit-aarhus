L.mapbox.accessToken = 'pk.eyJ1IjoiYmxpeno5MSIsImEiOiJjanUyc2pndWQwZWYwNDNxY29kNTlodGd6In0.E0n19FKq3k7HtFgQG9w30Q';
var geocoder = L.mapbox.geocoder('mapbox.places');

var map = L.mapbox.map('map')
    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'));

geocoder.query('Aarhus, DK', showMap);

function showMap(err, data) {
    // The geocoder can return an area, like a city, or a
    // point, like an address. Here we handle both cases,
    // by fitting the map bounds to an area or zooming to a point.
    if (data.lbounds) {
        map.fitBounds(data.lbounds);
    } else if (data.latlng) {
        map.setView([data.latlng[0], data.latlng[1]], 13);
    }
}