import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ToastAndroid } from "react-native";
import { Entypo, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, FONTS } from "../constants/theme";
import { dateFormat, priceFormat } from "../helper/globalfunc";
import { updateOrderStatus } from "../helper/serverapi";
import { LoadingModal } from "./Modal";
import { useState } from "react";
import { Toast } from "react-native-toast-message";

export const OrderItem = (props) => {
    const { orderItem } = props;
    return (
        <View style={{ ...styles.itemView, ...props.style }}>
            <Image style={{ flex: 0.24, width: 80, height: 80, resizeMode: 'contain' }} source={{ uri: orderItem.image_url }} />
            <View style={{ flex: 0.76, padding: 6, flexDirection: 'column', justifyContent: 'space-between' }}>
                <Text numberOfLines={2}>{orderItem.name}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>x{orderItem.amount}</Text>
                    <Text style={styles.tittleText}>{priceFormat(orderItem.price)} VND</Text>
                </View>
            </View>
        </View >
    );
}

const Order = (props) => {
    const { order, canShipping } = props;
    const [modalVisible, setModalVisible] = useState(false);
    const navigateToMap = (order_id) => {
        props.navigation.navigate('OrderDelivery', { order_id: order_id });
    }
    const onUpdOrderPress = async () => {
        setModalVisible(true);
        const rs = await updateOrderStatus(JSON.stringify(order));
        console.log(rs);
        if (rs.success) {
            ToastAndroid.show("Đã nhận đơn hàng, bắt đầu giao !", ToastAndroid.SHORT);
            props.removeOrder(order);
        } else {
            ToastAndroid.show("Đơn hàng có thể đã bị hủy !", ToastAndroid.SHORT);

        }
        setModalVisible(false);
    }

    const timeTitle = () => {
        let title = '';
        switch (order.status) {
            case 'Assign':
                title = 'Phân công: ';
                break;
            case 'Deliver':
                title = 'Vận chuyển:  ';
                break;
            case 'Complete':
                title = 'Hoàn thành:  ';
                break;

            default:
                break;
        }
        return title
    }

    const timeShow = () => {
        let time = '';
        switch (order.status) {
            case 'Assign':
                time = order.confirm_time;
                break;
            case 'Deliver':
                time = order.deliver_time;
                break;
            case 'Complete':
                time = order.complete_time;
                break;

            default:
                break;
        }
        return time
    }

    return (
        <View style={styles.card}>
            <LoadingModal modalVisible={modalVisible} text='Đang xử lý...' />
            <View style={styles.headerView}>
                <Entypo style={{ flex: 0.1 }} name="location" size={24} color="red" />
                <Text style={{ flex: 0.9, ...FONTS.body4, fontWeight: '700', color: 'black', padding: 4 }}>{order.address}</Text>
            </View>
            <View style={{ paddingVertical: 8 }}>
                <FlatList data={order.order_detail}
                    contentContainerStyle={{ flex: 1, justifyContent: "flex-start" }}
                    renderItem={({ item }) =>
                        <OrderItem orderItem={item} />
                    }
                    keyExtractor={(item) => `${item.product_id}${item.size_name}`}
                />
            </View>
            <View style={{
                ...styles.propView,
                justifyContent: 'flex-end',
                paddingHorizontal: 18,
                paddingVertical: 8,
                borderTopWidth: 1.2,
                borderTopColor: COLORS.lightGray,
                borderBottomWidth: 1.2,
                borderBottomColor: COLORS.lightGray,
            }}>
                <Text style={styles.tittleText}>Thành tiền:  </Text>
                <Text style={{
                    textAlign: "right",
                    fontSize: 16,
                    fontStyle: "bold",
                    color: "#0cb320",
                }}>
                    {priceFormat(order.total)} VND
                </Text>
            </View>
            <View style={{
                paddingHorizontal: 4,
                paddingVertical: 8,
            }}>
                <View style={styles.propView}>
                    <Text style={styles.tittleText}>Người nhận: </Text>
                    <Text style={styles.contentText}>{order.name}</Text>
                </View>
                <View style={styles.propView}>
                    <Text style={styles.tittleText}>{timeTitle()}</Text>
                    <Text style={styles.contentText}>{dateFormat(timeShow())}</Text>
                </View>
            </View>
            {
                order.status === 'Assign' ?
                    // (canShipping ?
                    <TouchableOpacity style={{ ...styles.button, backgroundColor: '#2196F3' }} activeOpacity={0.7} delayPressOut={5}
                        onPress={onUpdOrderPress}>
                        <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center' }}>
                            <FontAwesome5 name="box" size={22} color="white" style={{ marginRight: 8 }} />
                            <Text style={{ ...FONTS.body3, fontWeight: '700', color: 'white', textTransform: 'uppercase' }}> Lấy hàng</Text>
                        </View>
                    </TouchableOpacity>
                    // : <TouchableOpacity style={styles.button} activeOpacity={0.7} delayPressOut={5}
                    //     onPress={() => navigateToMap('home')}>
                    //     <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center' }}>
                    //         <FontAwesome5 name="store-alt" size={22} color="white" style={{ marginRight: 8 }} />
                    //         <Text style={{ ...FONTS.body3, fontWeight: '700', color: 'white', textTransform: 'uppercase' }}>Về lấy hàng</Text>
                    //     </View>
                    // </TouchableOpacity>) 
                    : ''
            }
        </View >
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 8,
        elevation: 2,
        backgroundColor: "#FFF",
        borderRadius: 5,
        marginHorizontal: 8,
        marginVertical: 4,
        shadowColor: "#000",
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { x: 2, y: -2 },
        overflow: "hidden"
    },
    headerView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 4,
        borderBottomWidth: 1.2,
        borderBottomColor: COLORS.lightGray
    },
    propView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 4
    },
    tittleText: {
        color: COLORS.darkgray,
    },
    contentText: {
    },
    button: {
        height: 40,
        marginHorizontal: 4,
        borderRadius: 5,
        backgroundColor: '#f7a33b',
        justifyContent: 'center',
        alignItems: "center",
        textTransform: 'uppercase'
    },
    itemView: {
        flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 2
    }
})

export default Order;