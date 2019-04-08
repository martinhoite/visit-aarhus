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
var filterTags = [];
var markers;
var markerLayer;
var overlays = L.layerGroup().addTo(map);

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
    handleApiData(data, targetAPI);
  }).fail(function () {
    console.log("Error while pulling API data");
  }).always(function () {
    // console.log("complete");
  });
  // console.log(geoJson);
}

function handleApiData(data, targetAPI) {
  // console.log("second success");
  // console.log(data);

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

  //Add unique event tags to tag array, for filtering
  $.each(geoJson, function (k, v) {
    if (v.properties.tags !== undefined) {
      $.each(v.properties.tags, function (k, tag) {
        if (!filterTags.includes(tag)) {
          filterTags.push(tag);
        }
      });
    }
  });

  //Add current location marker
  var currentLocationMarker = L.marker(new L.LatLng(56.153473, 10.214455), {
    icon: L.mapbox.marker.icon({ 'marker-color': 'FF0000' }),
    properties: {
      title: "Dokk1 - Du er her", //occurrence.event.name,
      address: "Hack Kampmanns Pl. 2, 8000 Aarhus",
      description: "Du er i Dokk1 lige nu", //place.tags, //occurrence.event.description,
      tags: ["Guidance", "Information", "Dokk1"],
      'marker-color': '#ff0000'
    },
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [10.214455, 56.153473]
    }
  });
  map.addLayer(currentLocationMarker);
  // currentLocationMarker.on('click', function (e) {
  //   displayMarkerModal(e);
  // });
  // markers.addLayer(currentLocationMarker);
  // markers.setGeoJSON(geoJson);


  // console.log(test);

  //Add filters to menu
  createFilterToggles();
  createMarkerGroup([]);

}

function createMarkerGroup(filters) {
  markers = new L.MarkerClusterGroup();
  $.each(geoJson, function (k, v) {
    if (filters === undefined) {
      return;
    }
    //Check if any of markers have the active filters
    if ($(v.properties.tags).filter(filters).length > 0 || filters.length == 0 || filters.includes('Alle')) {
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

      // marker.bindPopup(title);
      markers.addLayer(marker);
    }
  });
  // console.log(markerLayer);
  // if (overlays !== undefined) {
  // map.removeLayer(markerLayer);  
  overlays.clearLayers();
  // console.log('Cleared layers');   
  // }
  overlays.addLayer(markers);
  // markerLayer = map.addLayer(markers);

  // Listener for marker click
  markers.on('click', function(e){
    displayMarkerModal(e);
  });
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

// console.log(apiQueryParameters);
populateMap("occurrences", apiQueryParameters);
// populateMap("occurrences", "startDate%5Bstrictly_after%5D%3D2019-04-08T00%3A00%3A00%2B02%3A00%26endDate%5Bstrictly_before%5D%3D2019-04-08T23%3A59%3A59%2B02%3A00%26items_per_page%3D200");
// populateMap("occurrences", "startDate%5Bstrictly_after%5D=2019-04-08T00%3A00%3A00%2B02%3A00&endDate%5Bstrictly_before%5D=2019-04-08T23%3A59%3A59%2B02%3A00&items_per_page=200");
// populateMap("occurrences", "startDate%5Bstrictly_after%5D=2019-04-07T00%3A00%3A00%2B00%3A00&endDate%5Bstrictly_before%5D=2019-04-08T00%3A00%3A00%2B00%3A00&items_per_page=200");




//Initialization for MaterializeCSS
$(document).ready(function () {
  $('.tooltipped').tooltip();
  $('.modal').modal();
  $('.fixed-action-btn').floatingActionButton();
  $('.sidenav').sidenav({ edge: 'right' });
  // console.log($('#showAllFiltersToggle').prop('checked'));
});

$('#modalNavigateToOccurrence').on("click", function () {
  getLocation();
});

function displayMarkerModal(e) {
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
  } else {
    $('#modalEventTimeContainer').show();
    $('#modalFromTime').html(moment(feature.properties.startDate).format('LLLL'));
    $('#modalToTime').html(moment(feature.properties.endDate).format('LLLL'));
  }
  $("#modalTagContainer").html(formattedTags);


  modalInstance.open();

  //Pan view to the clicked marker
  map.panTo(e.layer.getLatLng());
}

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

//Handling for adding filters for all the current tags available on the current vissible occurences
let filterToggleTemple = $('#filterToggleTemplate').html();
function createFilterToggles() {
  $.each(filterTags, function (k, tag) {
    let filterToggle = filterToggleTemple.replace("##filterTag##", tag).replace("##filterToggleText##", tag).replace("##filterName##", tag);
    $(filterToggle).appendTo($('#slide-out'));
  });
};

function applyFilters(tagName, checkboxObj) {
  let filteredTags = [];
  // console.log(checkboxObj);
  // console.log('Applying filters');
  if ($(checkboxObj).data('filter') != 'Alle') {
    $('#showAllFiltersToggle').prop('checked', false);
  }
  $(".filterCheckbox").each(function (k, checkbox) {
    if ($(checkboxObj).data('filter') == 'Alle') {
      // checkbox.checked = false;
      $(checkbox).prop('checked', false);
    }
    // console.log(checkbox.checked);
    if (checkbox.checked) {
      filteredTags.push($(checkbox).data('filter'));
    }
    // console.log(filteredTags);
  });
  if ($(checkboxObj).data('filter') == 'Alle') {
    checkboxObj.checked = true;
  }
  createMarkerGroup(filteredTags);
  if (filteredTags.length == 0) {
    $('#showAllFiltersToggle').prop('checked', true);
  }
}