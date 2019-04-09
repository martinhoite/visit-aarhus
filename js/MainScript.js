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
            address: '<i class="material-icons inline-icon">home</i>' + occurrence.place.streetAddress + ", " + occurrence.place.postalCode + " " + occurrence.place.addressLocality,
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

  //Make sure filters are in alphabetic order
  filterTags.sort();

  //Add current location marker
  // var currentLocationMarker = L.marker(new L.LatLng(56.153473, 10.214455), {
  //   icon: L.mapbox.marker.icon({ 'marker-color': 'FF0000' }),
  //   properties: {
  //     title: "Dokk1 - Du er her", //occurrence.event.name,
  //     address: "Hack Kampmanns Pl. 2, 8000 Aarhus",
  //     description: "Du er i Dokk1 lige nu", //place.tags, //occurrence.event.description,
  //     tags: ["Guidance", "Information", "Dokk1"],
  //     'marker-color': '#ff0000'
  //   },
  //   type: 'Feature',
  //   geometry: {
  //     type: 'Point',
  //     coordinates: [10.214455, 56.153473]
  //   }
  // });
  // map.addLayer(currentLocationMarker);
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
          // coordinates: [v.longitude, v.latitude]
        },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coordinates[0], coordinates[1]]
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
  markers.on('click', function (e) {
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


var idleTimer = null;
var idleState = false;
const idleWait = 5000;

$(document).ready(function () {
  //Initialization for MaterializeCSS
  $('.tooltipped').tooltip();
  $('.modal').modal({
    onCloseStart: function () {
      //Make sure modal's scroll is reset everytime it reopens
      $('.modal-content').scrollTop(0);
    }
  });
  $('.fixed-action-btn').floatingActionButton();
  $('.sidenav').sidenav({ edge: 'right' });
  // console.log($('#showAllFiltersToggle').prop('checked'));

  let notificationText = "Klik for at filtrere";
  //See if no action has happened
  $('*').bind('mousemove keydown scroll', function () {

    clearTimeout(idleTimer);

    if (idleState == true) {
      //Someone interacted with the screen, draw attention to filter

      //Handle different languages
      switch (currentLanguage) {
        case 'da':
          notificationText = "Klik her for at filtrere";
          break;
        case 'no':
          notificationText = "Klikk her for å legge til filter";
          break;
        case 'de':
          notificationText = "Klicken Sie hier, um Filter hinzuzufügen";
          break;
        case 'en-us':
          notificationText = "Click here to add filters";
          break;
        default:
          notificationText = "Klik her for at filtrere";
          break;
      }
      // $(".fixed-action-btn").notify(
      $("#filterBtn").notify(
        notificationText,
        {
          position: "top-right",
          autoHide: true,
          autoHideDelay: 10000,
          clickToHide: true,
          className: 'info'
        }
      );
    }

    idleState = false;

    idleTimer = setTimeout(function () {

      // Idle Event
      // $("body").append("<p>You've been idle for " + idleWait/1000 + " seconds.</p>");

      idleState = true;
    }, idleWait);
  });
  $("body").trigger("mousemove");
});



$('#modalNavigateToOccurrence').on("click", function (e) {
  getLocation(e);
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
    switch (currentLanguage) {
      case "da":
        //Set all datetimes to be in Danish format (and language)
        moment.locale('da');
        break;
      case 'no':
        //Set all datetimes to be in Norwegian format (and language)
        moment.locale('no');
        break;
      case 'de':
        //Set all datetimes to be in German format (and language)
        moment.locale('de');
        break;
      case 'en-us':
        //Set all datetimes to be in English(US) format (and language)
        moment.locale('en');
        break;
      default:
        //Fallback to english since most will understand that.
        //Set all datetimes to be in English(US) format (and language)
        moment.locale('en');
        break;
    }
    $('#modalFromTime').html(moment(feature.properties.startDate).format('LLLL'));
    $('#modalToTime').html(moment(feature.properties.endDate).format('LLLL'));
  }
  $("#modalTagContainer").html(formattedTags);
  $('#modalNavigateToOccurrence').data('longitude', feature.geometry.coordinates[0]);
  $('#modalNavigateToOccurrence').data('latitude', feature.geometry.coordinates[1]);

  $("#modalMarkerDescription > p").each(function () {
    var $el = $(this);
    //Remove empty p tags in description
    if ($.trim($el.html()) == "&nbsp;") {
      $el.remove();
    }
    //Remove external styles on p tags to keep descriptions coherent
    $el.removeAttr("style");
  });
  modalInstance.open();

  //Pan view to the clicked marker
  map.panTo(e.layer.getLatLng());
}

var currentUserLocation;

function getLocation() {
  if (navigator.geolocation) {
    var position = navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("Sorry - Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  console.log($('#modalNavigateToOccurrence').data('latitude'));
  alert("Navigate\nFrom: Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude + "\n To: Latitude:" + $('#modalNavigateToOccurrence').data('latitude') + ", Longitude: " + $('#modalNavigateToOccurrence').data('longitude'));
  currentUserLocation = [position.coords.latitude, position.coords.longitude];
  // alert(currentUserLocation);
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

//Send event to phone handling
function sendEventToPhone() {
  alert('This will show a form to fill in your phone number\nand allow you to send the event to your phone');
}

//Translation handling
var currentLanguage = "da";
function changeActiveLanguage(e) {
  $('#languageControlsContainer').find('a').removeClass('active');
  $(e).addClass('active');
  currentLanguage = $(e).data('language');

  switch (currentLanguage) {
    case 'da':
      //Make sure we hide all current notifications as they're not necessarily in the correct language anymore
      $('.notifyjs-wrapper').trigger('notify-hide');
      $(e).notify("Sprog er sat til Dansk", { position: "top-right", className: "success", arrowSize: 12 });
      $('#filterMenuHeader').text('Filtrer begivenheder');
      $('#showAllFiltersToggleText').text('Vis alle');
      $('#filterBtn').html('Vis filtre<i class="material-icons right">filter_list</i>');
      //Adjust modal text
      $('#modalFromTimeText').text('Fra:');
      $('#modalToTimeText').text('Til:');
      $('#modalNavigateToOccurrence').html('Naviger<i class="material-icons right">navigation</i>');
      $('#modalSendToPhone').html('Send til mobil<i class="material-icons right">phone_android</i>');
      $('#modalClose').html('Luk<i class="material-icons right">close</i>');
      break;
    case 'no':
      //Make sure we hide all current notifications as they're not necessarily in the correct language anymore
      $('.notifyjs-wrapper').trigger('notify-hide');
      $(e).notify("Språk satt til norsk", { position: "top-right", className: "success", arrowSize: 12 });
      $('#filterMenuHeader').text('Filter hendelser');
      $('#showAllFiltersToggleText').text('Vis alle');
      $('#filterBtn').html('Vis filtre<i class="material-icons right">filter_list</i>');
      //Adjust modal text
      $('#modalFromTimeText').text('Fra:');
      $('#modalToTimeText').text('Til:');
      $('#modalNavigateToOccurrence').html('Navigere<i class="material-icons right">navigation</i>');
      $('#modalSendToPhone').html('Send til mobil<i class="material-icons right">phone_android</i>');
      $('#modalClose').html('Lukk<i class="material-icons right">close</i>');
      break;
    case 'de':
      //Make sure we hide all current notifications as they're not necessarily in the correct language anymore
      $('.notifyjs-wrapper').trigger('notify-hide');
      $(e).notify("Sprache auf Deutsch eingestellt", { position: "top-right", className: "success", arrowSize: 12 });
      $('#filterMenuHeader').text('Ereignisse filtern');
      $('#showAllFiltersToggleText').text('Zeig es allen');
      $('#filterBtn').html('Filter anzeigen<i class="material-icons right">filter_list</i>');
      //Adjust modal text
      $('#modalFromTimeText').text('Von:');
      $('#modalToTimeText').text('Bis:');
      $('#modalNavigateToOccurrence').html('Navigieren<i class="material-icons right">navigation</i>');
      $('#modalSendToPhone').html('Senden Sie an das Telefon<i class="material-icons right">phone_android</i>');
      $('#modalClose').html('Schließen<i class="material-icons right">close</i>');
      break;
    case 'en-us':
      //Make sure we hide all current notifications as they're not necessarily in the correct language anymore
      $('.notifyjs-wrapper').trigger('notify-hide');
      $(e).notify("Language set to English", { position: "top-right", className: "success", arrowSize: 12 });
      $('#filterMenuHeader').text('Filter events');
      $('#showAllFiltersToggleText').text('Show all');
      $('#filterBtn').html('Show filters<i class="material-icons right">filter_list</i>');
      //Adjust modal text
      $('#modalFromTimeText').text('From:');
      $('#modalToTimeText').text('To  :');
      $('#modalNavigateToOccurrence').html('Navigate<i class="material-icons right">navigation</i>');
      $('#modalSendToPhone').html('Send to mobile<i class="material-icons right">phone_android</i>');
      $('#modalClose').html('Close<i class="material-icons right">close</i>');
      break;
    default:
      $(e).notify("Unable to set language", { position: "top-right", className: "error" });
      break;
  }
}