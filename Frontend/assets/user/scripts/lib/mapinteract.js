var mapOptions = {
    center: [10.8, 106.8],
    zoom: 10
}

// Creating a map object
var map = L.map('map', mapOptions);

// Creating a Layer object
var layer = new L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

// Adding layer to the map
map.addLayer(layer);

const iconOption = {
    tittle: 'Điểm nhận hàng',
    draggable: true
}

var marker = new L.marker([10.8, 106.8], iconOption);
marker.addTo(map)

function geoCodeReverseAPI(lat, lng) {
    const api = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`
    return fetch(api, requestOption('GET'))
        .then((res) => {
            return res.json();
        })
}

marker.on('moveend', async () => {
    const coord = marker.getLatLng();
    const address = await geoCodeReverseAPI(coord.lat, coord.lng);
    selectedLoc = address;
    let input = document.querySelector('#address');
    input.value = selectedLoc.display_name;
    setMarkerCoord(selectedLoc.lat, selectedLoc.lon);
})

function getMarkerCoord() {
    const coord = marker.getLatLng()
    return {
        latitude: coord.lat,
        longitude: coord.lng
    }
}

function setMarkerCoord(lat, lng) {
    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 17);
}