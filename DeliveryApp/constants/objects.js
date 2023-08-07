export const speed = 9.5; //m/s

export const kavanoStore = {
    order: {
        order_id: 'home',
        address: 'Cửa hàng Kavano',
        coordinate: {
            latitude: 10.8004399,
            longitude: 106.7006567,
        }
    },
    coordinate: {
        latitude: 10.8004399,
        longitude: 106.7006567,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
    },
    direction_points: [],
    steps: [],
    distance: '',
    time: '0',
    reach: false
}

export const initialDestination = {
    origin: null,
    coordinate: null,
    order: {},
    direction_points: [],
    steps: [],
    distance: '',
    time: '0',
    reach: false
}

export const mapCamera = {
    pitch: 60,
    zoom: 18.8
}

export const GPSOptions = {
    enableHighAccuracy: true,
    timeout: 1000,
    maximumAge: 0
}

export const ggMapStyle = [
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    }
]


export default {
    initialDestination,
    speed,
    mapCamera,
    ggMapStyle
}