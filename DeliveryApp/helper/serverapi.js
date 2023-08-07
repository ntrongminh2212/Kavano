import Constants from "expo-constants";
import { getData, storeData } from "./globalfunc";
const { manifest } = Constants;

const serverURL = (typeof manifest.packagerOpts === `object`) && manifest.packagerOpts.dev
    ? 'http://' + manifest.debuggerHost.split(`:`).shift().concat(`:5000`) + '/shipper'
    : `api.example.com`

function requestOption(method, body, userToken) {
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

export function login(data) {
    return fetch(serverURL + "/login", requestOption('POST', data))
        .then(res => {
            return res.json();
        })
        .then(async (res) => {
            if (res.success) {
                await storeData("shipper", res.shipper);
                return true;
            } else {
                return false
            }
        })
}

export async function getOrders() {
    const shipperToken = (await getData("shipper")).token;
    if (shipperToken) {
        return fetch(serverURL + "/my-orders", requestOption('GET', undefined, shipperToken))
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    const orders = res.orders.map((order) => {
                        if (order.coordinate) {
                            return {
                                ...order,
                                coordinate: {
                                    longitude: Number(JSON.parse(order.coordinate).longitude),
                                    latitude: Number(JSON.parse(order.coordinate).latitude)
                                }
                            }
                        } else return order
                    })
                    return orders;
                } else {
                    return false
                }
            })
            .catch(err => {
                return false;
            });
    } else {
        return false
    }
}

export async function updateOrderStatus(order) {
    console.log('Get shipper token...');
    const shipperToken = (await getData("shipper")).token;
    console.log('call update status...');
    if (shipperToken) {
        return fetch(serverURL + "/update-status", requestOption('PUT', order, shipperToken))
            .then(res => {
                // console.log(res);
                console.log('Response!');
                return res.json();
            })
            .then(res => {
                console.log(res);
                return res;
            })
            .catch(err => {
                console.log(err);
                return false;
            });
    } else {

        return false
    }
}

export async function cancelOrder(order) {
    const shipperToken = (await getData("shipper")).token;
    if (shipperToken) {
        return fetch(serverURL + "/cancel-order", requestOption('PUT', order, shipperToken))
            .then(res => {
                // console.log(res);
                return res.json();
            })
            .then(res => {
                console.log(res);
                return res;
            })
            .catch(err => {
                console.log(err);
                return false;
            });
    } else {

        return false
    }
}

export async function getOrderById(order_id) {
    return fetch(serverURL + `/order/${order_id}`, requestOption('GET'))
        .then(res => {
            // console.log(res);
            return res.json();
        })
        .then(res => {
            console.log(res);
            return res;
        })
        .catch(err => {
            console.log(err);
            return false;
        });

}
