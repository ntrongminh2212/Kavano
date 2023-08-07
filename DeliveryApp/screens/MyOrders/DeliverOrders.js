import React, { useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { getOrders } from "../../helper/serverapi";
import Toast from 'react-native-toast-message';
import Order from "../../components/OrderItem";
import { FontAwesome } from '@expo/vector-icons';
import { useRef } from "react";
import { child, firebaseDb, firebaseDbRef, get, onValue } from "../../firebase/firebase";
import { getData } from "../../helper/globalfunc";
import { COLORS } from "../../constants/theme";

const DeliverOrders = ({ navigation }) => {
    // let getOrderInterval = useRef();
    const [deliverOrders, setdeliverOrders] = useState([]);
    // const [onScreen, setOnScreen] = useState(true);

    React.useEffect(() => {
        (async () => {
            const shipper_id = (await getData('shipper')).info.shipper_id
            onValue(firebaseDbRef(firebaseDb, `orders`), (snapshot) => {
                if (snapshot.exists()) {
                    let orders = snapshot.val();
                    if (orders) {
                        let delvOrdersCount = Object.values(orders).filter(order => {
                            return (order.shipper_id == shipper_id)
                                && (order.status == 'Deliver')
                        }).length

                        if (delvOrdersCount != deliverOrders.length) {
                            updListOrders()
                        }
                    }
                } else {
                    console.log('Không có đơn hàng');
                }
            })
        })()
    }, [])

    React.useEffect(() => {
        const unsubcribe = navigation.addListener('focus', async () => {
            console.log('Deliver Tab Focus!');
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

    const updListOrders = async () => {
        console.log('Request deliver orders from getOrders API...');
        let allOrders = await getOrders();
        let updDeliverOrders = allOrders.filter((order) => {
            return order.status === 'Deliver';
        });
        setdeliverOrders(prevOrders => {
            if (JSON.stringify(prevOrders) !== JSON.stringify(updDeliverOrders)) {
                Toast.show({
                    type: 'success',
                    text1: 'Đã cập nhật đơn hàng'
                })
                updDeliverOrders.sort((a, b) => {
                    return (new Date(b.deliver_time).getTime() - new Date(a.deliver_time).getTime())
                });
                return updDeliverOrders;
            } else return prevOrders
        });
    }
    // React.useEffect(() => {
    //     if (onScreen) {
    //         getOrderInterval = window.setInterval(async () => {
    //             let allOrders = await getOrders();
    //             let upddeliverOrders = allOrders.filter((order) => {
    //                 return order.status === 'Deliver';
    //             });
    //             setdeliverOrders(prevOrders => {
    //                 if (JSON.stringify(prevOrders) !== JSON.stringify(upddeliverOrders)) {
    //                     Toast.show({
    //                         type: 'success',
    //                         text1: 'Đã cập nhật đơn hàng'
    //                     })
    //                     return (prevOrders = upddeliverOrders);
    //                 } else return prevOrders
    //             });
    //         }, 1000);
    //         return () => {
    //             window.clearInterval(getOrderInterval);
    //         };
    //     }
    // }, [onScreen]);

    // React.useEffect(() => {
    //     const unsubcribe = navigation.addListener('blur', async () => {
    //         setOnScreen(false);
    //     });
    //     return unsubcribe;
    // }, [navigation])

    // React.useEffect(() => {
    //     const unsubcribe = navigation.addListener('focus', async () => {
    //         setOnScreen(true);
    //     });
    //     return unsubcribe;
    // }, [navigation])

    return (
        <FlatList data={deliverOrders}
            contentContainerStyle={{ justifyContent: "flex-start", paddingHorizontal: 12 }}
            renderItem={({ item }) =>
                <Order order={item} canShipping={false} />
            }
            keyExtractor={(item) => item.order_id}
        />
    );
}

export default DeliverOrders