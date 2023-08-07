import React, { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { getOrders } from "../../helper/serverapi";
import Toast from 'react-native-toast-message';
import Order from "../../components/OrderItem";
import { Accuracy, watchPositionAsync } from "expo-location";
import { useRef } from "react";
import { FontAwesome } from '@expo/vector-icons';
import { getDistance } from "geolib";
import { kavanoStore } from "../../constants/objects";
import { child, firebaseDb, firebaseDbRef, get, onValue } from "../../firebase/firebase";
import { getData } from "../../helper/globalfunc";
import { COLORS } from "../../constants/theme";

const ConfirmOrders = ({ route, navigation }) => {
    let positionWatcher = useRef(null);
    const [confirmOrders, setConfirmOrders] = useState([]);
    const [canShipping, setCanShipping] = useState(false);
    // const [onScreen, setOnScreen] = useState(true);

    React.useEffect(() => {
        // updListOrders()
        (async () => {
            const shipper_id = (await getData('shipper')).info.shipper_id
            console.log('Shipper id : ', shipper_id);
            onValue(firebaseDbRef(firebaseDb, `orders`), (snapshot) => {
                console.log('connecting firebase');
                if (snapshot.exists()) {
                    let orders = snapshot.val();
                    if (orders) {
                        let confOrdersCount = Object.values(orders).filter(order => {
                            return (order.shipper_id == shipper_id)
                                && (order.status == 'Assign')
                        }).length
                        console.log('Firebase connected');
                        // console.log('onvalue /order: test1', confOrdersCount, confirmOrders);
                        if (confOrdersCount.length !== confirmOrders.length) {
                            // console.log('onvalue /order: test2', confOrdersCount, confirmOrders.length);
                            updListOrders()
                        }
                    }
                } else {
                    console.log('Không có đơn hàng');
                }
            })
        })()
    }, [])

    // React.useEffect(() => {
    //     if (onScreen) {
    //         const getOrderInterval = window.setInterval(async () => {
    //             let allOrders = await getOrders();
    //             let updConfirmOrders = allOrders.filter((order) => {
    //                 return order.status === 'Confirm';
    //             });
    //             console.log(onScreen);
    //             setConfirmOrders(prevOrders => {
    //                 if (JSON.stringify(prevOrders) !== JSON.stringify(updConfirmOrders)) {
    //                     Toast.show({
    //                         type: 'success',
    //                         text1: 'Đã cập nhật đơn hàng'
    //                     })
    //                     return (prevOrders = updConfirmOrders);
    //                 } else return prevOrders
    //             });
    //         }, 2000);
    //         return () => {
    //             window.clearInterval(getOrderInterval);
    //         };
    //     }
    // }, [onScreen]);

    //UseEffect: Step instruction mode realtime
    React.useEffect(() => {
        const unsubcribe = navigation.addListener('focus', async () => {
            console.log('Assign Tab Focus!');
            navigation.getParent().setOptions({
                headerRight: () => (
                    <TouchableOpacity style={{
                        padding: 8,
                        borderRadius: 30,
                        borderColor: COLORS.darkgray,
                        borderWidth: 0.5,
                        marginRight: 8
                    }}
                        onPress={updListOrders}>
                        <FontAwesome name="refresh" size={24} color={COLORS.darkgray} />
                    </TouchableOpacity>
                ),
            });
        });
        return unsubcribe;
    }, [navigation])

    // React.useEffect(() => {
    //     const unsubcribe = navigation.addListener('focus', async () => {
    //         // console.log('focus');
    //         positionWatcher = await watchPositionAsync({ accuracy: Accuracy.BestForNavigation, distanceInterval: 1, timeInterval: 1000 }, (curLoc) => {
    //             const distance = getDistance(kavanoStore.coordinate, curLoc.coords);
    //             distance < 20 ? setCanShipping(true) : setCanShipping(false);
    //         })
    //         // setOnScreen(true);
    //     });
    //     return unsubcribe;
    // }, [navigation])

    const updListOrders = async () => {
        console.log('Request assign orders from getOrders API...');
        let allOrders = await getOrders();
        console.log('response!');
        let updConfirmOrders = allOrders.filter((order) => {
            return order.status === 'Assign';
        });
        setConfirmOrders(prevOrders => {
            if (JSON.stringify(prevOrders) !== JSON.stringify(updConfirmOrders)) {
                Toast.show({
                    type: 'success',
                    text1: 'Đã cập nhật đơn hàng'
                })
                updConfirmOrders.sort((a, b) => {
                    return (new Date(b.confirm_time).getTime() - new Date(a.confirm_time).getTime())
                });
                return updConfirmOrders;
            } else return prevOrders
        });
    }

    const removeOrder = (order) => {
        setConfirmOrders(() => {
            let updOrders = confirmOrders.filter(order => {
                return order.order_id !== order.order_id;
            })
            return updOrders
        })
    }

    return (
        <FlatList data={confirmOrders}
            contentContainerStyle={{ justifyContent: "flex-start", paddingHorizontal: 12 }}
            renderItem={({ item }) =>
                <Order order={item} canShipping={canShipping} navigation={navigation} removeOrder={removeOrder} />
            }
            keyExtractor={(item) => item.order_id}
        />
    );
}

export default ConfirmOrders