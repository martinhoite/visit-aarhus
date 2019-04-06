L.mapbox.accessToken = 'pk.eyJ1IjoiYmxpeno5MSIsImEiOiJjanUyc2pndWQwZWYwNDNxY29kNTlodGd6In0.E0n19FKq3k7HtFgQG9w30Q';
var geocoder = L.mapbox.geocoder('mapbox.places');

var map = L.mapbox.map('map'
).addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'));
// new L.Control.Zoom({ position: 'topright' }).addTo(map);



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

geocoder.query('Aarhus, DK', showMap);

// Add Feature Layer to map
var markers = L.mapbox.featureLayer().addTo(map);

var geoJson = [];
//   {
//   type: 'Feature',
//   geometry: {
//     type: 'Point',
//     coordinates: [-87.949444, 36.308056]
//   },
//   properties: {
//     title: 'Benton-Houston Ferry',
//     address: '1234 Fake Street, Somewhere, TN 38888',
//     description: 'Some Random text',
//     'marker-color': '#000'
//   }
// }, 

// Assign handlers immediately after making the request,
// and remember the jqxhr object for this request
// $.getJSON("https://api.detskeriaarhus.dk/api/occurrences?endDate%5Bstrictly_after%5D=2019-05-06T10%3A00%3A00%2B00%3A00", function (data) {
//   console.log("success");
// }).done(function (data) {
//   console.log("second success");
//   // console.log(data);
//   $.each(data, function (key, occurrence) {
//     // console.log(occurrence);
//     geoJson.push({
//       type: 'Feature',
//       geometry: {
//         type: 'Point',
//         coordinates: [occurrence.place.latitude, occurrence.place.longitude]
//       },
//       properties: {
//         title: occurrence.event.name,
//         address: occurrence.place.name + " " + occurrence.place.streetAddress + ", " + occurrence.place.postalCode + " " + occurrence.place.addressLocality,
//         description: occurrence.event.description,
//         'marker-color': '#000'
//       }
//     });
//   });
// }).fail(function () {
//   console.log("error");
// }).always(function () {
//   console.log("complete");
// });

$.getJSON("https://api.detskeriaarhus.dk/api/places?items_per_page=1250", function (data) {
  // console.log("success");
}).done(function (data) {
  // console.log("second success");
  // console.log(data);
  $.each(data, function (key, place) {
    // console.log(occurrence);
    geoJson.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [place.longitude, place.latitude]
      },
      properties: {
        title: place.name, //occurrence.event.name,
        address: place.streetAddress + ", " + place.postalCode + " " + place.addressLocality,
        description: "description", //place.tags, //occurrence.event.description,
        tags: place.tags,
        'marker-color': '#000'
      }
    });
    // console.log('Added: ' + place.name);
    // console.log(place.latitude + " , " + place.longitude);
  });
  // geoJson.push({
  //   type: 'Feature',
  //     geometry: {
  //     type: 'Point',
  //       // coordinates: [-87.949444, 36.308056]
  //       coordinates: [10.2064256, 56.1520891]

  //   },
  //   properties: {
  //     title: 'Benton-Houston Ferry',
  //       address: '1234 Fake Street, Somewhere, TN 38888',
  //         description: 'Some Random text',
  //           'marker-color': '#000'
  //   }
  // });
  // console.log('Adding markers to map');

  markers.setGeoJSON(geoJson);
}).fail(function () {
  console.log("Error while pulling API data");
}).always(function () {
  // console.log("complete");
});
// console.log(geoJson);


// Listener for marker click
markers.on('click', function (e) {
  // Force close the popup.
  e.layer.closePopup();

  var modalInstance = M.Modal.getInstance($('.modal'));
  var feature = e.layer.feature;
  var title = feature.properties.title;
  var content = feature.properties.description;
  var address = feature.properties.address;
  var tags = feature.properties.tags;
  let formattedTags = "";
  for (i = 0; i < tags.length; i++) {
    formattedTags += '<div class="chip">' + tags[i] + '</div>';
  }; 
  
  // var latlng = feature.geometry.coordinates;

  // Modal Content
  $("#modalMarkerTitle").text(title);
  $("#modalMarkerContent").text(content);
  $("#modalAddress").text(address);
  $("#modalTagContainer").html(formattedTags);


  modalInstance.open();
});

// Filter click event
// $('.menu-ui a').on('click', function () {
//   var filter = $(this).data('filter');
//   $(this).addClass('active').siblings().removeClass('active');
//   markers.setFilter(function (f) {
//     return (filter === 'all') ? true : f.properties[filter] === true;
//   });
//   return false;
// });

// // Clear Modal Data
// function empty() {
//   // TODO: Clear Modal when Modal is closed for next marker clicked
// }

// // Formats Latitude and Longitude for Modal
// function formatLatLng(latlng) {
//   // TODO: Format Latitude and Longitude
//   return latlng;
// }


//Initialization for MaterializeCSS
$(document).ready(function () {
  $('.tooltipped').tooltip();
  $('.modal').modal();
  $('.fixed-action-btn').floatingActionButton({ toolbarEnabled: true });
  $('.sidenav').sidenav({ edge: 'right' });
});