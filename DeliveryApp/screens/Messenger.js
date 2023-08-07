import React from "react";
import { TouchableOpacity, FlatList, View, Text, Image } from "react-native";
import { COLORS, FONTS } from "../constants/theme";
import { useState } from "react";
import { AntDesign } from '@expo/vector-icons';
import { firebaseDb, firebaseDbRef, onValue } from "../firebase/firebase";
import { getOrders } from "../helper/serverapi";
import { useRef } from "react";
import { getData } from "../helper/globalfunc";

const MessengerItem = (props) => {
    const { order, onPress } = props

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flex: 1,
                alignItems: 'flex-start',
                paddingVertical: 12,
                paddingHorizontal: 12,
                flexDirection: 'column',
                borderWidth: 1,
                borderBottomColor: COLORS.lightGray,
                borderTopColor: COLORS.lightGray,
            }}>
            <View style={{
                flex: 1,
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginBottom: 16,
                marginLeft: 4
            }}>
                <AntDesign name="profile" size={24} color={COLORS.darkblue} />
                <Text style={{
                    color: COLORS.darkblue,
                    ...FONTS.body3,
                    fontWeight: '700',
                    marginLeft: 8
                }}>{order.order_id}</Text>
            </View>

            <View style={{
                flex: 1,
                alignItems: 'center',
                flexDirection: 'row',
            }}>
                <View>
                    <Image
                        style={{
                            width: 44,
                            height: 44,
                            resizeMode: 'cover',
                            borderRadius: 25,
                            marginRight: 15
                        }}
                        source={{ uri: order.avatar }} >
                    </Image>
                    {order.unreadMessageNums > 0 ? <Text style={{
                        position: 'absolute',
                        backgroundColor: 'red',
                        width: 18,
                        textAlign: 'center',
                        right: 10,
                        ...FONTS.body5,
                        padding: 2,
                        borderRadius: 30,
                        color: 'white',
                        paddingHorizontal: 2
                    }}>{order.unreadMessageNums}</Text> : null}
                </View>
                <View style={{
                    flexDirection: 'column', justifyContent: 'space-around',
                    flex: 2
                }}>
                    <Text style={{
                        color: 'black',
                        ...FONTS.body3,
                        fontWeight: '600',
                        width: 200
                    }}>{order.name}</Text>
                    <Text numberOfLines={1} style={{
                        color: 'black',
                        ...FONTS.body4,
                        fontWeight: '600',
                        marginTop: 2,
                        color: COLORS.darkgray
                    }}>{order.lastMessage}</Text>
                </View>
                <View style={{
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                }}>
                    <Text style={{
                        color: 'black',
                        ...FONTS.body4,
                        //fontWeight: '700',
                    }}>{order.lastTimeSend}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

let onScreen = true;
const Messenger = ({ navigation }) => {
    let interval = useRef();
    const [notListenChats, setnotListenChats] = useState([]);
    const [deliverOrders, setdeliverOrders] = useState([]);
    const [orderChats, setOrderChats] = useState([
    ]);

    // useEffect(() => {
    //     (async () => {
    //         onValue(firebaseDbRef(firebaseDb, `messenger/${order.order_id}`), (snapshot) => {
    //             if (snapshot.exists()) {
    //                 let timeStamps = snapshot.val();
    //                 if (timeStamps) {
    //                     let lastTimeStamp = Object.keys(timeStamps)[Object.keys(timeStamps).length - 1];
    //                     let index = orderChats.findIndex(orderChat => {
    //                         return orderChat.order_id === order.order_id
    //                     })
    //                     index >= 0 ?
    //                         setOrderChats(prevOrders => {
    //                             prevOrders[index] = {
    //                                 order_id: order.order_id,
    //                                 avatar: order.avatar,
    //                                 name: order.name,
    //                                 lastMessage: timeStamps[lastTimeStamp].message,
    //                                 lastTimeStamp: lastTimeStamp,
    //                                 lastTimeSend: calcLastTimeMessage(lastTimeStamp),
    //                                 unreadMessageNums: 0
    //                             }
    //                             return prevOrders;
    //                         }) :
    //                         setOrderChats(prevOrders => {
    //                             prevOrders.push({
    //                                 order_id: order.order_id,
    //                                 avatar: order.avatar,
    //                                 name: order.name,
    //                                 lastMessage: timeStamps[lastTimeStamp].message,
    //                                 lastTimeStamp: lastTimeStamp,
    //                                 lastTimeSend: calcLastTimeMessage(lastTimeStamp),
    //                                 unreadMessageNums: 0
    //                             })
    //                             return prevOrders
    //                         })
    //                 }
    //             } else {
    //                 setOrderChats(prevOrders => {
    //                     prevOrders.push({
    //                         order_id: order.order_id,
    //                         avatar: order.avatar,
    //                         name: order.name,
    //                         lastMessage: 'Chưa có tin nhắn nào',
    //                         lastTimeStamp: '',
    //                         lastTimeSend: '',
    //                         unreadMessageNums: 0
    //                     })
    //                     return prevOrders;
    //                 })
    //             }
    //         })
    //     })()
    // }, [])

    React.useEffect(() => {
        console.log('On value to orders');
        onValue(firebaseDbRef(firebaseDb, `orders`), async (snapshot) => {
            if (snapshot.exists()) {
                let orders = snapshot.val();
                // console.log('Snapshot: ', orders);
                if (orders) {
                    const shipper_id = (await getData('shipper')).info.shipper_id
                    let deliOrdersFireBase = Object.keys(orders).filter(order_id => {
                        return (orders[order_id].shipper_id == shipper_id)
                            && (orders[order_id].status == 'Deliver')
                    })

                    let deliverOrderIds = deliverOrders.map((order) => {
                        return order.order_id
                    })

                    if (JSON.stringify(deliOrdersFireBase) !== JSON.stringify(deliverOrderIds)) {
                        console.log('Orders change!, updating chatroom');
                        let notListenChatKeys = deliOrdersFireBase.filter((order_id) => {
                            return !deliverOrderIds.includes(order_id)
                        })
                        setnotListenChats(notListenChatKeys);
                    }
                }
            } else {
                console.log('Không có đơn hàng');
            }
        })
    }, [])

    React.useEffect(() => {
        updListOrders();
    }, [notListenChats])

    React.useEffect(() => {
        let notListenChatOrders = deliverOrders.filter((order) => {
            return notListenChats.includes(order.order_id);
        })
        listenToChats(notListenChatOrders);
    }, [deliverOrders])

    React.useEffect(() => {
        interval = window.setInterval(async () => {
            if (onScreen && orderChats.length > 0) {
                setOrderChats((prevOrderChats) => {
                    return prevOrderChats.map(orderChat => ({
                        ...orderChat,
                        lastTimeSend: calcLastTimeMessage(orderChat.lastTimeStamp)
                    }))
                });
            }
        }, 60000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    React.useEffect(() => {
        const unsubcribe = navigation.addListener('blur', async () => {
            onScreen = false;
        });
        return unsubcribe;
    }, [navigation])

    React.useEffect(() => {
        const unsubcribe = navigation.addListener('focus', async () => {
            onScreen = true;
        });
        return unsubcribe;
    }, [navigation])

    const updListOrders = async () => {
        let allOrders = await getOrders();
        let updDeliverOrders = allOrders.filter((order) => {
            return order.status === 'Deliver';
        });
        setdeliverOrders(updDeliverOrders);
    }

    const calcLastTimeMessage = (lastTimeStamp) => {
        if (lastTimeStamp) {
            let remainTime = new Date().getTime() - lastTimeStamp;

            let second = 1000;
            let minute = 60 * 1000;
            let hour = 60 * minute;
            let day = 24 * hour;

            if ((remainTime / second) < 60) return "Vừa xong"
            else if ((remainTime / minute) < 60) return `${Math.floor(remainTime / minute)} phút trước`
            else if ((remainTime / hour) < 24) return `${Math.floor(remainTime / hour)} tiếng trước`
            else if ((remainTime / day) < 30) return `${Math.floor(remainTime / day)} ngày trước`
        } else return ''
    }

    const listenToChats = (notListenChatOrders) => {
        notListenChatOrders.forEach((order) => {
            console.log('Connecting to chat ', order.order_id, '...');
            onValue(firebaseDbRef(firebaseDb, `messenger/${order.order_id}/`), (snapshot) => {
                if (snapshot.exists()) {
                    console.log('Listening chatroom ', order.order_id, ' !');
                    let lstTimeStamp = snapshot.val();
                    if (lstTimeStamp) {
                        let lastTimeStamp = Math.max(...Object.keys(lstTimeStamp));
                        updOrderChats({
                            order_id: order.order_id,
                            avatar: order.avatar,
                            name: order.name,
                            lastMessage: lstTimeStamp[lastTimeStamp].message,
                            lastTimeStamp: lastTimeStamp,
                            lastTimeSend: calcLastTimeMessage(lastTimeStamp),
                            unreadMessageNums: 0
                        });
                    } else {
                        updOrderChats({
                            order_id: order.order_id,
                            avatar: order.avatar,
                            name: order.name,
                            lastMessage: 'Hiện chưa có tin nhắn nào',
                            lastTimeStamp: null,
                            lastTimeSend: '',
                            unreadMessageNums: 0
                        })
                    }
                } else {
                    console.log('Chua co don hang nao van chuyen');
                }
            })
        })

        //Remove old chats
        setOrderChats(() => {
            let lstOrderIds = deliverOrders.map(order => order.order_id);
            console.log('lstOrderIds: ', lstOrderIds);
            let updOrderChats = orderChats.filter(orderChat => {
                return lstOrderIds.includes(orderChat.order_id);
            })
            console.log('updOrderChats: ', updOrderChats.length);
            return updOrderChats;
        })
    }

    const updOrderChats = (updOrderChat) => {

        let index = orderChats.findIndex(orderChat => {
            return orderChat.order_id === updOrderChat.order_id
        })
        if (index >= 0) {
            setOrderChats(() => {
                let newOrderChats = orderChats;
                newOrderChats[index] = updOrderChat
                return newOrderChats.map((orderChat) => ({
                    ...orderChat
                }));
            })
        } else {
            setOrderChats(() => {
                let newOrderChats = orderChats;
                newOrderChats.push(updOrderChat)
                return newOrderChats.map((orderChat) => ({
                    ...orderChat
                }));
            })
        }
    }
    return (
        <View style={{ flexDirection: 'column' }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginStart: 10
            }}>
                {/* <Text style={{
                    color: 'black',
                    ...FONTS.body4,
                    marginVertical: 4,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: COLORS.darkgray
                }}>Có 6 tin nhắn chưa đọc</Text> */}
            </View>
            <FlatList style={{
                backgroundColor: 'white',
                marginTop: 8
            }}
                renderItem={({ item }) => (
                    <MessengerItem order={item} onPress={() => (
                        navigation.navigate('Chat', { order: item })
                    )} />
                )}
                data={orderChats}
                keyExtractor={(item) => item.order_id}
            />
        </View>
    )
}

export default Messenger