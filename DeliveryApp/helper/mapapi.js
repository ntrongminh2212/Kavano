import { maps } from "../constants"

export function decodePolyline(encodedPolyline, includeElevation) {
    // array that holds the points
    let points = []
    let index = 0
    const len = encodedPolyline.length
    let lat = 0
    let lng = 0
    let ele = 0
    while (index < len) {
        let b
        let shift = 0
        let result = 0
        do {
            b = encodedPolyline.charAt(index++).charCodeAt(0) - 63 // finds ascii
            // and subtract it by 63
            result |= (b & 0x1f) << shift
            shift += 5
        } while (b >= 0x20)

        lat += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
        shift = 0
        result = 0
        do {
            b = encodedPolyline.charAt(index++).charCodeAt(0) - 63
            result |= (b & 0x1f) << shift
            shift += 5
        } while (b >= 0x20)
        lng += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))

        if (includeElevation) {
            shift = 0
            result = 0
            do {
                b = encodedPolyline.charAt(index++).charCodeAt(0) - 63
                result |= (b & 0x1f) << shift
                shift += 5
            } while (b >= 0x20)
            ele += ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
        }
        try {
            let location = [(lat / 1E5), (lng / 1E5)]
            if (includeElevation) location.push((ele / 100))
            points.push(location)
        } catch (e) {
            console.log(e)
        }
    }
    return points
}

export function requestOption(method, body, userToken) {
    return {
        method: method,
        mode: 'cors',
        headers: {
            "Content-Type": "application/JSON",
            "Authorization": userToken
        },
        body: body
    }
}

export const routeAPI = async (coordinates, instructions = false, geometry = false) => {
    const body = JSON.stringify({
        coordinates: coordinates,
        instructions: `${instructions}`,
        geometry: `${geometry}`
    })

    const rs = await fetch(maps.ROUTE_URL, requestOption('POST', body, maps.OPENROUTEKEY))
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.log('Error:', err);
            return err;
        })
    if (geometry) {
        rs.routes = rs.routes.map((route) => {
            return ({
                ...route,
                geometry: decodePolyline(route.geometry)
            })
        })
    }
    return rs;
}

export const GeoCodeReverseAPI = async (coordinate) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${coordinate.latitude}&lon=${coordinate.longitude}&zoom=16&email=ntrongminh2212@gmail.com&format=jsonv2`;
    return fetch(url, requestOption('GET'))
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.log(err);
            return err;
        })
}