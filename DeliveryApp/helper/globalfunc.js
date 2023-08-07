import * as Location from "expo-location"
import * as Speech from "expo-speech"
import { getCompassDirection, getDistance, getDistanceFromLine, getRhumbLineBearing } from "geolib";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Intl from "intl";
import 'intl/locale-data/jsonp/en';
import { GeoCodeReverseAPI } from "./mapapi";

export const requestCurrentLocation = () =>
    new Promise(async (resolve, reject) => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            reject(status);
        }

        let location = await Location.getCurrentPositionAsync({})
        resolve({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        })
    })


export const secondToTimeString = (second, acronym = true) => {
    second = Number(second)
    let hours = Math.floor(second / (60 * 60));
    let minutes = Math.ceil((second % (60 * 60)) / 60);

    let timeStr = acronym ?
        `${hours !== 0 ? hours + 'h' : ''}${minutes}p` :
        `${hours !== 0 ? hours + ' giờ' : ''}${minutes} phút`
    return timeStr;
}

export const distanceString = (m0, speech = false) => {
    m0 = Number(m0)
    let km = Math.floor(m0 / 10) / 100;
    let m = Math.ceil(m0 % 1000);

    let distanceStr = speech === true ?
        (km >= 1 ? `${km} ki lô mét` : `${m} mét`)
        : (km >= 1 ? `${km} km` : `${m} m`);
    return distanceStr;
}

export const isCurLocInRoute = (curLoc, polygon) => {
    let rs = false;
    let nearest = 100;
    if (getDistance(curLoc, polygon[0]) < 25) {
        return 0
    }

    for (let i = 0; i < polygon.length - 1; i++) {
        const meter = getDistanceFromLine(curLoc, polygon[i], polygon[i + 1]);
        if (meter < 15 && meter < nearest) {
            rs = i;
            nearest = meter;
        }
    }
    return rs;
}

export const getAngleOfTwoLine = (origin, middle, destination) => {

    const P12 = Math.sqrt(Math.pow(middle.longitude - origin.longitude, 2) + Math.pow(middle.latitude - origin.latitude, 2));
    const P13 = Math.sqrt(Math.pow(middle.longitude - destination.longitude, 2) + Math.pow(middle.latitude - destination.latitude, 2));
    const P23 = Math.sqrt(Math.pow(origin.longitude - destination.longitude, 2) + Math.pow(origin.latitude - destination.latitude, 2));

    return 180 - (Math.acos((P12 * P12 + P13 * P13 - P23 * P23) / (2 * P12 * P13)) * 180 / Math.PI);
}

export const getClockWiseValue = (origin, middle, destination) => {
    const cross_product = (p1, p2) => {
        return (p1.longitude * p2.latitude - p2.longitude * p1.latitude) * 100000000
    }

    const p1p2 = {
        longitude: middle.longitude - origin.longitude,
        latitude: middle.latitude - origin.latitude
    }
    const p1p3 = {
        longitude: destination.longitude - origin.longitude,
        latitude: destination.latitude - origin.latitude
    }
    return cross_product(p1p3, p1p2);
}

export const calcStreetForCoordinate = async (p1, p2) => {
    // new Promise(async (resolve, reject) => {
    const pAddress = {
        latitude: (p1.latitude + p2.latitude) / 2,
        longitude: (p1.longitude + p2.longitude) / 2
    }
    // console.log(pAddress);
    // let address = await mapview.addressForCoordinate(pAddress);
    // console.log(address, pAddress);
    // if (!address.thoroughfare) {
    const rs = await GeoCodeReverseAPI(pAddress);
    return rs.address.road;
    // } else {
    //     let thoroughfare = address.thoroughfare;
    //     if (thoroughfare.toLowerCase().includes('đường') || thoroughfare.toLowerCase().includes('hẻm')) {
    //         resolve(thoroughfare);
    //     } else {
    //         if (address.subThoroughfare) {
    //             if (address.subThoroughfare.includes('/')) {
    //                 // console.log(address);
    //                 let alley = address.subThoroughfare.substring(0, address.subThoroughfare.lastIndexOf('/'));
    //                 resolve(`Hẻm ${alley} ${thoroughfare}`)
    //             } else {
    //                 resolve(address.subThoroughfare.includes('Hẻm') ?
    //                     `${address.subThoroughfare} ${thoroughfare}` : `Đường ${thoroughfare}`)
    //             }
    //         } else resolve(`Đường ${thoroughfare}`)
    //     }
    // }
    // })
}

export const calcMovingSteps = async (points, mapview) => {
    let steps = [];
    await Promise.all(points.map(async (point, index, pointsArr) => {
        if (pointsArr[index + 2]) {
            let angle = getAngleOfTwoLine(point, pointsArr[index + 1], pointsArr[index + 2])

            if (angle > 20) {
                const clockWiseVal = getClockWiseValue(point, pointsArr[index + 1], pointsArr[index + 2]);
                let action, instruction;
                if (clockWiseVal > 0) {
                    action = "up_right";
                    instruction = "rẽ phải sang ";
                } else {
                    action = "up_left";
                    instruction = "rẽ trái sang ";
                }

                if (steps.length > 0 && (action === steps[steps.length - 1].action)) {
                    // console.log('Check U turn', lastStepDistance + ' meter');
                    const lastPointIndex = steps[steps.length - 1].point_index
                    const lastStepDistance = getDistanceFromLine(pointsArr[index + 1], pointsArr[lastPointIndex - 1], pointsArr[lastPointIndex]);
                    if (lastStepDistance < 20) {
                        steps.pop();
                        action = (action === "up_right" ? "u_turn_right" : "u_turn_left");
                        instruction = "Đi vòng ngược lại ";
                    }
                }

                steps.push({
                    action: action,
                    point_index: (index + 1),
                    instruction: instruction,
                    angle: angle,
                    street: ''
                })
            }
            // else {
            //     point[index + 2] = point[index + 1];
            //     point[index + 1] = point;
            // }
        }
    }));

    const street = await calcStreetForCoordinate(points[steps[0].point_index],
        points[steps[0].point_index + 1])
    console.log(street);
    steps[0] = {
        ...steps[0],
        street: street
    };

    return steps;
}

export const calculateAngle = (coordinates) => {
    let startLat = coordinates[0]["latitude"]
    let startLng = coordinates[0]["longitude"]
    let endLat = coordinates[1]["latitude"]
    let endLng = coordinates[1]["longitude"]
    let dx = endLat - startLat
    let dy = endLng - startLng

    return Math.atan2(dy, dx) * 180 / Math.PI
}

export const speak = (text) => {
    Speech.stop();
    Speech.speak(text, { language: 'vi-Vi', rate: 1.2 });
}

export const storeData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
        // saving error
        console.log(e);
    }
}

export const getData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        // error reading value
        console.log(e);
    }
}

export const deleteData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

export function priceFormat(price) {
    return new Intl.NumberFormat('vn-VN').format(price);
}

export function dateFormat(strDate, time = true) {
    let date = new Date(strDate);
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let month = date.getMonth() < 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);

    let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let noon = hour < 12 ? 'AM' : 'PM'
    return `${day}/${month}/${date.getFullYear()}` + (time ? ` ${hour}:${minutes} ${noon}` : '');
}

export function sortFunc(a, b, by = 'name') {
    switch (by) {
        case 'name':
            const nameA = a.toUpperCase();
            const nameB = b.toUpperCase();
            return nameA.localeCompare(nameB);
            break;

        case 'number':
            return a - b
            break;
    }
}









  // console.log(points[4], points[5]);
    // for (let i = 0; i < points.length - 1; i++) {
    //     const distance = getDistance(points[i], points[i + 1]);
    // const street = await calcStreetForCoordinate(mapview, points[i], points[i + 1]);
    // const street = 'abx'
    // if (i >= 1) {
    //     const angle = getAngleOfTwoLine(points[i - 1], points[i], points[i + 1]);
    //     if (Math.abs(angle) > 20) {
    //         const clockWiseVal = getClockWiseValue(points[i - 1], points[i], points[i + 1]);
    //         let action, instruction;
    //         if (clockWiseVal > 0) {
    //             action = "up_right";
    //             instruction = "rẽ phải sang ";
    //         } else {
    //             action = "up_left";
    //             instruction = "rẽ trái sang ";
    //         }
    //         if (steps.length > 1 && (action === steps[steps.length - 2].action)) {
    //             const lastStepDistance = getDistance(points[steps[steps.length - 1].point_index], points[i]);
    //             if (lastStepDistance < 15) {
    //                 steps.pop();
    //                 action = (action === "up_right" ? "u_turn_right" : "u_turn_left");
    //                 instruction = "Đi vòng ngược lại ";
    //             }
    //         }

    //         if (steps[steps.length - 1]) {
    //             let stepStreet = { street: '', distance: 0 };
    //             const stepDistance = Object.keys(streetManage).reduce((accum, curStreet) => {
    //                 streetManage[curStreet].distance > stepStreet.distance ?
    //                     stepStreet = { ...streetManage[curStreet], street: curStreet } : ''
    //                 return accum + streetManage[curStreet].distance;
    //             }, 0)
    //             steps[steps.length - 1] = {
    //                 ...steps[steps.length - 1],
    //                 distance: stepDistance,
    //                 instruction: steps[steps.length - 1].instruction + stepStreet.street,
    //                 street: stepStreet.street
    //             }
    //         }
    //         steps.push({
    //             action: action,
    //             point_index: i,
    //             distance: 0,
    //             instruction: instruction,
    //             street: ''
    //         })
    //         streetManage = {};
    //     }
    // }

    // if (steps.length > 0 && street) {
    //     if (streetManage[street]) {
    //         streetManage[street].distance += distance;
    //     } else {
    //         streetManage[street] = {
    //             distance: distance,
    //             point_index: i
    //         }
    //     }
    // console.log(i, distance, streetManage);
    // }

    // if (i == points.length - 2) {
    //     let stepStreet = { street: '', distance: 0 };
    //     const stepDistance = Object.keys(streetManage).reduce((accum, curStreet) => {
    //         streetManage[curStreet].distance > stepStreet.distance ?
    //             stepStreet = { ...streetManage[curStreet], street: curStreet } : ''
    //         return accum + streetManage[curStreet].distance;
    //     }, 0)
    //     steps[steps.length - 1] = {
    //         ...steps[steps.length - 1],
    //         distance: stepDistance,
    //         instruction: steps[steps.length - 1].instruction + stepStreet.street,
    //         street: stepStreet.street
    //     }
    // }
    // filterIndex = 0;
    // for (let i = 0; i < lstStreets.length - 1; i++) {
    //     filterLstStreets.push(lstStreets[i]);
    //     for (let j = i; j < lstStreets.length; j++) {
    //         const street1 = lstStreets[j];
    //         const street2 = lstStreets[j + 1];
    //         const angle = Math.abs(getAngleOfTwoLine(points[street1.point_indexs[0]], points[street1.point_indexs[1]], points[street2.point_indexs[1]]));
    //         if (angle < 15) {
    //             if (street1.street === street2.street) {
    //                 filterLstStreets[filterIndex].length += street2.length;
    //                 filterLstStreets[filterIndex].point_indexs[1] = street2.point_indexs[1];
    //             } else {
    //                 if (filterLstStreets[filterIndex].length < 25 && filterLstStreets[filterIndex].length < street2.length) {
    //                     filterLstStreets[filterIndex].length += street2.length;
    //                     filterLstStreets[filterIndex].point_indexs[1] = street2.point_indexs[1];
    //                     filterLstStreets[filterIndex].street = street2.street;
    //                 } else {
    //                     filterIndex++;
    //                     i = j + 1;
    //                     break;
    //                 }
    //             }
    //         } else {
    //             if (street2.length < 1.5) {

    //             }
    //         }
    //     }
    // }
    // console.log(filterLstStreets);
    // for (let i = 0; i < steps.length; i++) {
    //     let address;
    //     if (i < (steps.length - 1)) {
    //         for (let j = steps[i].point_index + 1; j < steps[i + 1].point_index; j++) {
    //             const distance = getDistance(points[steps[i].point_index], points[j]);
    //             if (distance > 30) {
    //                 address = await calcStreetForCoordinate(mapview, points[steps[i].point_index], points[j]);
    //                 // console.log('from-to: ', points[steps[i].point_index], points[steps[i + 1].point_index]);
    //                 break
    //             }
    //         }
    //     } else address = await calcStreetForCoordinate(mapview, points[steps[i].point_index], points[points.length - 1]);

    //     try {
    //         steps[i].address = address;
    //         steps[i].instruction += address.street;
    //     } catch (error) {
    //         steps[i] = false;
    //     }
    // }
    // console.log(steps);
    // }
    // steps.forEach((step, index) => {
    //     for (let i = step.point_index; i < steps[index + 1].point_index; i++) {
    //         const distance = getDistance(points[i], points[i + 1]);
    //     }
    // });