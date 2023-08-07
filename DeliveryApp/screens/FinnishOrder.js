import React from "react";
import { StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { View, Text, Button } from "react-native";
import { Entypo, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from "../constants/theme";
import { dateFormat, priceFormat } from "../helper/globalfunc";
import { OrderItem } from "../components/OrderItem";
import { ConfirmModal, LoadingModal, OptionModal } from "../components/Modal";
import { icons } from "../constants";
import { useState } from "react";
import { cancelOrder, updateOrderStatus } from "../helper/serverapi";
import { async } from "@firebase/util";

const FinnishOrder = ({ navigation, route }) => {
    const { order } = route.params;
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        visible: false,
        icon: icons.success,
        text: 'Đã hoàn thành đơn hàng',
    });

    const [optionModal, setOptionModal] = useState({
        visible: false,
        icon: icons.warning,
        text: 'Hủy đơn do khách không nhận hàng?'
    })

    React.useEffect(() => {
        // Use `setOptions` to update the button that we previously specified
        // Now the button includes an `onPress` handler to update the count
        navigation.setOptions({
            headerRight: () => (
                <Button color="red"
                    onPress={() => {
                        setOptionModal({
                            visible: true,
                            icon: icons.warning,
                            text: 'Hủy đơn do khách không nhận hàng?'
                        })
                    }} title="HỦY ĐƠN" />
            ),
        });
    }, [navigation]);

    const onFinnishPress = async () => {
        setModalVisible(true);
        const rs = await updateOrderStatus(JSON.stringify(order));
        if (rs.success) {
            setConfirmModal({
                visible: true,
                icon: icons.success,
                text: 'Đã hoàn thành đơn hàng',
            });
        } else {
            setConfirmModal({
                visible: true,
                icon: icons.error,
                text: rs.message,
            });
        }
        setModalVisible(false);
    }

    const onCancelPress = async () => {
        setModalVisible(true);
        const rs = await cancelOrder(JSON.stringify(order));
        if (rs.success) {
            setConfirmModal({
                visible: true,
                icon: icons.success,
                text: 'Đơn hàng đã bị hủy',
            });
        } else {
            setConfirmModal({
                visible: true,
                icon: icons.error,
                text: rs.message,
            });
        }
        setModalVisible(false);
    }

    return (
        <View>
            <LoadingModal modalVisible={modalVisible} text='Đang xử lý...' />
            <OptionModal modalVisible={optionModal.visible} icon={optionModal.icon} text={optionModal.text}
                onConfirm={onCancelPress}
                onReject={() => {
                    setOptionModal({
                        visible: false,
                        icon: icons.warning,
                        text: 'Hủy đơn do khách không nhận hàng?'
                    });
                }} />
            <ConfirmModal modalVisible={confirmModal.visible} icon={confirmModal.icon} text={confirmModal.text}
                onConfirm={() => {
                    setConfirmModal({
                        visible: false,
                        icon: icons.success,
                        text: 'Đã hoàn thành đơn hàng',
                    });
                    navigation.navigate('OrderDelivery', {
                        finish_order: true,
                        order_id: order.order_id
                    })
                }} />
            <View style={styles.card}>
                <View style={styles.headerView}>
                    <FontAwesome5 style={{ flex: 0.1, marginLeft: 4 }} name="file-alt" size={24} color="black" />
                    <Text style={{ flex: 0.9, ...FONTS.body3, fontWeight: '700', color: 'black', padding: 4 }}>{order.order_id}</Text>
                </View>
                <View style={{
                    paddingHorizontal: 4,
                    paddingVertical: 8,
                }}>
                    <View style={styles.propView}>
                        <Text style={styles.tittleText}>Giao tới:  </Text>
                        <Text style={styles.contentText}>{order.address}</Text>
                    </View>
                    <View style={styles.propView}>
                        <Text style={styles.tittleText}>Người nhận: </Text>
                        <Text style={styles.contentText}>{order.name}</Text>
                    </View>
                    <View style={styles.propView}>
                        <Text style={styles.tittleText}>Xác nhận vào: </Text>
                        <Text style={styles.contentText}>{dateFormat(order.confirm_time)}</Text>
                    </View>
                    {order.payment_method === 'CRYPTO' ?
                        <View style={{ ...styles.propView, alignItems: 'center' }}>
                            <Text style={styles.tittleText}>Thanh toán: </Text>
                            <View style={{ ...styles.contentText, flexDirection: 'row', alignItems: 'center' }}>
                                <Text>Khách đã thanh toán </Text>
                                <Text style={{ color: COLORS.ethereum, fontSize: 17, fontWeight: '600' }}>{order.eth_pay} </Text>
                                <FontAwesome5 name="ethereum" size={17} color={COLORS.ethereum} />
                            </View>
                        </View>
                        : <View style={styles.propView}>
                            <Text style={styles.tittleText}>Thanh toán: </Text>
                            <Text style={styles.contentText}>Trả tiền mặt khi nhận hàng</Text>
                        </View>
                    }
                </View>
                <View style={{ paddingVertical: 8 }}>
                    <View style={{
                        ...styles.headerView,
                        borderBottomWidth: 0,
                        borderBottomColor: 'white',
                        borderTopWidth: 1.2,
                        borderTopColor: COLORS.lightGray,
                        paddingVertical: 8
                    }}>
                        <Entypo style={{ flex: 0.1 }} name="info-with-circle" size={24} color="black" />
                        <Text style={{ flex: 0.9, ...FONTS.body3, fontWeight: '700', color: 'black', padding: 4 }}>Sản phẩm mua:</Text>
                    </View>
                    <FlatList data={order.order_detail}
                        contentContainerStyle={{ justifyContent: "flex-start" }}
                        renderItem={({ item }) =>
                            <OrderItem orderItem={item} />
                        }
                        keyExtractor={(item) => `${item.product_id}${item.size_name}`}
                    />
                </View>
            </View>
            <View style={{
                width: '100%',
                position: 'absolute',
                bottom: 6,
            }}>
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    borderTopRightRadius: 4,
                    borderTopLeftRadius: 4,
                    marginTop: 6,
                    elevation: 6,
                    borderTopWidth: 1.2,
                    borderTopColor: COLORS.lightGray
                }}>
                    <View style={{
                        flex: 0.3,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        alignContent: 'center',
                        padding: 8,
                        paddingVertical: 12,
                    }}>
                        <Text style={{ ...FONTS.h4, textTransform: 'capitalize' }}>Thành tiền:    </Text>
                        <Text style={{
                            textAlign: "right",
                            fontSize: 20,
                            fontStyle: "bold",
                            color: "#0cb320",
                            textAlign: 'center'
                        }}>
                            {priceFormat(order.total)} VND
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.button} activeOpacity={0.7} delayPressOut={5}
                        onPress={onFinnishPress}>
                        <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons style={{ flex: 0.1 }} name="account-cash" size={24} color="white" />
                            <Text style={{ ...FONTS.body3, fontWeight: '700', color: 'white', textTransform: 'uppercase' }}> Khách trả tiền</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        height: '100%',
        padding: 8,
        elevation: 2,
        backgroundColor: "#FFF",
        borderRadius: 5,
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
        padding: 2.8
    },
    tittleText: {
        flex: 0.3,
        color: COLORS.darkgray,
    },
    contentText: {
        flex: 0.8
    },
    button: {
        height: 60,
        borderRadius: 8,
        width: '100%',
        backgroundColor: COLORS.green,
        justifyContent: 'center',
        alignItems: "center",
        textTransform: 'uppercase'
    },
    itemView: {
        flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 2
    }
})


export default FinnishOrder