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
var featureMap = L.mapbox.featureLayer().addTo(map);

var geoJson = [];
var markers = new L.MarkerClusterGroup();
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
function populateMap(targetAPI, queryParameters) {
  let url = 'https://api.detskeriaarhus.dk/api/' + targetAPI + "?" + queryParameters;
  // console.log(url);
  // url = 'https://api.detskeriaarhus.dk/api/occurrences?startDate%5Bstrictly_after%5D=2019-04-07T00%3A00%3A00%2B00%3A00&endDate%5Bstrictly_before%5D=2019-04-08T00%3A00%3A00%2B00%3A00&items_per_page=200';
  // console.log(url);

  $.getJSON(url, function (data) {
    // console.log("success");
    geoJson = [];
    // console.log(data);
  }).done(function (data) {
    // console.log("second success");
    console.log(data);

    switch (targetAPI) {
      case "occurrences":
        $.each(data, function (key, occurrence) {
          // console.log(occurrence.event.name);
          // console.log(occurrence.event.startDate);
          // console.log(occurrence.event.endDate);
          geoJson.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [occurrence.place.longitude, occurrence.place.latitude]
            },
            properties: {
              title: occurrence.place.name, //occurrence.event.name,
              address: occurrence.place.streetAddress + ", " + occurrence.place.postalCode + " " + occurrence.place.addressLocality,
              description: occurrence.event.description, //place.tags, //occurrence.event.description,
              startDate: occurrence.startDate,
              endDate: occurrence.endDate,
              tags: occurrence.event.tags
              // 'marker-color': '#000'
            }
          });
        });
        break;
      case "places":
        $.each(data, function (key, place) {
          geoJson.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [place.longitude, place.latitude]
            },
            properties: {
              title: place.name, //occurrence.event.name,
              address: place.streetAddress + ", " + place.postalCode + " " + place.addressLocality,
              description: place.description, //place.tags, //occurrence.event.description,
              tags: place.tags,
              // 'marker-color': '#000'
            }
          });

        });
        break;
    }
    var filterTags = ["Alle"];
    $.each(geoJson, function (k, v) {
      var coordinates = v.geometry.coordinates;
      // var title = v.properties.title;

      var marker = L.marker(new L.LatLng(coordinates[1], coordinates[0]), {
        // icon: L.mapbox.marker.icon({'marker-color': '0044FF' }),
        // title: title,
        properties: {
          title: v.properties.title, //occurrence.event.name,
          address: v.properties.address,
          description: v.properties.description, //place.tags, //occurrence.event.description,
          startDate: v.properties.startDate,
          endDate: v.properties.endDate,
          tags: v.properties.tags
        },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [v.longitude, v.latitude]
        }
      });

      //Add unique event tags to tag array, for filtering
      if (v.properties.tags !== undefined) {
        $.each(v.properties.tags, function (k, tag) {
          if(!filterTags.includes(tag))  {
            filterTags.push(tag);
          }
        });
      }
      

      // marker.bindPopup(title);
      markers.addLayer(marker);
    });

    //Add current location marker
    var currentLocationMarker = L.marker(new L.LatLng(56.153473, 10.214455), {
      icon: L.mapbox.marker.icon({'marker-color': 'FF0000' }),
      // title: title,
      properties: {
        title: "Dokk1 - Du er her", //occurrence.event.name,
        address: "Hack Kampmanns Pl. 2, 8000 Aarhus",
        description: "Du er i Dokk1 lige nu", //place.tags, //occurrence.event.description,
        tags: ["Guidance","Information","Dokk1"],
        'marker-color': '#ff0000'
      },
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [10.214455, 56.153473]
      }
    });
    map.addLayer(currentLocationMarker);
    // markers.addLayer(currentLocationMarker);
    // markers.setGeoJSON(geoJson);

    map.addLayer(markers);
    // markers.setGeoJSON(geoJson);
  }).fail(function () {
    console.log("Error while pulling API data");
  }).always(function () {
    // console.log("complete");
  });
  // console.log(geoJson);
}

//Initial map setup - pull all places
// populateMap("places","items_per_page=1250");
// populateMap("occurrences", "startDate%5Bstrictly_after%5D=2019-04-07T00%3A00%3A00%2B00%3A00&endDate%5Bstrictly_before%5D=2019-04-08T00%3A00%3A00%2B00%3A00&items_per_page=200");

let apiQueryParameters = 
  encodeURIComponent("startDate[strictly_after]") + "=" + encodeURIComponent(moment().startOf('day').format())
  + "&" + encodeURIComponent("endDate[strictly_before]") + "=" + encodeURIComponent(moment().endOf('day').format()) 
  + "&items_per_page=200";

//Manual replacement of characters that need to be URL encoded due to the API wanting a mix of things...
//Actually nevermind, let's not use regex today. (See above for finished result instead)
// apiQueryParameters = apiQueryParameters.replace("[","%5B").replace("]","%5D").replace(":","%3A");

console.log(apiQueryParameters);
populateMap("occurrences", apiQueryParameters);
// populateMap("occurrences", "startDate%5Bstrictly_after%5D%3D2019-04-08T00%3A00%3A00%2B02%3A00%26endDate%5Bstrictly_before%5D%3D2019-04-08T23%3A59%3A59%2B02%3A00%26items_per_page%3D200");
// populateMap("occurrences", "startDate%5Bstrictly_after%5D=2019-04-08T00%3A00%3A00%2B02%3A00&endDate%5Bstrictly_before%5D=2019-04-08T23%3A59%3A59%2B02%3A00&items_per_page=200");
// populateMap("occurrences", "startDate%5Bstrictly_after%5D=2019-04-07T00%3A00%3A00%2B00%3A00&endDate%5Bstrictly_before%5D=2019-04-08T00%3A00%3A00%2B00%3A00&items_per_page=200");


// Listener for marker click
markers.on('click', function (e) {
  // console.log(e);
  // Force close the popup.
  // e.layer.closePopup();
  var modalInstance = M.Modal.getInstance($('.modal'));
  // var feature = e.layer.feature;
  var feature = e.layer.options;
  var title = feature.properties.title;
  var description = feature.properties.description;
  var address = feature.properties.address;
  let formattedTags = "";
  try {
    var tags = feature.properties.tags;
  
  for (i = 0; i < tags.length; i++) {
    formattedTags += '<div class="chip">' + tags[i] + '</div>';
  };  
  } catch (error) {
    console.log('No tags attached to this occurrence');
  }
  

  // Modal Content
  $("#modalMarkerTitle").text(title);
  $("#modalMarkerDescription").html(description);
  $("#modalAddress").html(address);
  // console.log(feature);
  if (feature.properties.startDate == undefined) {
    $('#modalEventTimeContainer').hide();
  }else{
    $('#modalEventTimeContainer').show();
    $('#modalFromTime').html(moment(feature.properties.startDate).format('LLLL'));
    $('#modalToTime').html(moment(feature.properties.endDate).format('LLLL'));
  }
  $("#modalTagContainer").html(formattedTags);


  modalInstance.open();

  //Pan view to the clicked marker
  map.panTo(e.layer.getLatLng());
});

//Initialization for MaterializeCSS
$(document).ready(function () {
  $('.tooltipped').tooltip();
  $('.modal').modal();
  $('.fixed-action-btn').floatingActionButton({ toolbarEnabled: true });
  $('.sidenav').sidenav({ edge: 'right' });
});

$('#modalNavigateToOccurrence').on("click", function () {
  getLocation();
});

function getLocation() {
  if (navigator.geolocation) {
    var position = navigator.geolocation.getCurrentPosition(showPosition);
    
  } else {
    $("#modalMarkerTitle").text("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  alert("Navigate from: Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude);
}