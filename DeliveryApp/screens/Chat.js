import React from "react";
import { TouchableOpacity, FlatList, View, KeyboardAvoidingView, Text, Image, StyleSheet, SafeAreaView, Keyboard, TouchableHighlight, ToastAndroid } from "react-native";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { color } from "react-native-reanimated";
import { TextInput } from "react-native-gesture-handler";
import { useRef } from "react";
import { firebaseDb, firebaseDbRef, firebaseSet, onValue } from "../firebase/firebase";

const Message = (props) => {
    const { isSender,
        timestamp,
        message,
    } = props.message

    const nextIsSender = props.nextIsSender
    const avatar = props.avatar
    return (
        <View style={{
            flexDirection: "row",
            margin: 2,
            justifyContent: isSender ? 'flex-end' : 'flex-start',
            paddingHorizontal: 8,
            marginBottom: nextIsSender === isSender ? 2 : 12

        }}>{(nextIsSender === true) && (isSender === false) ?
            <Image
                style={{
                    width: 36,
                    height: 36,
                    resizeMode: 'cover',
                    borderRadius: 40,
                    marginRight: 4,
                }}
                source={{ uri: avatar }} >
            </Image>
            : <View style={{ width: 50 }} />
            }
            <Text style={{
                color: 'black',
                maxWidth: SIZES.width / 1.5,
                ...FONTS.body3,
                fontWeight: '600',
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 8,
                backgroundColor: isSender ? COLORS.lightblue : COLORS.lightGray,
                color: isSender ? 'white' : 'black',
            }}>{message}</Text>
        </View>
    )
}

const Chat = ({ navigation, route }) => {
    const flatListMessagesRef = useRef()
    const [typedText, setTypedText] = useState('')
    const [chatHistory, setChatHistory] = useState([
        {
            isSender: false,
            timestamp: 1669856304000,
            message: 'Hello, how are you'
        },
        {
            isSender: true,
            timestamp: 1669859544000,
            message: 'ok'
        },
        {
            isSender: true,
            timestamp: 1669853544000,
            message: 'Sắp rồi anh'
        },
        {
            isSender: false,
            timestamp: 1669856844000,
            message: 'Hàng đến chưa'
        },
        {
            isSender: false,
            timestamp: 1669853545000,
            message: 'abc xyz'
        }, {
            isSender: true,
            timestamp: 1669853544020,
            message: 'Sắp rồi anh'
        },
        {
            isSender: false,
            timestamp: 1669856844300,
            message: 'Hàng đến chưa'
        },
        {
            isSender: false,
            timestamp: 1669853545004,
            message: 'abc xyz'
        },
        {
            isSender: true,
            timestamp: 1669856544020,
            message: 'Sắp rồi anh'
        },
        {
            isSender: false,
            timestamp: 1669156844300,
            message: 'Hàng đến chưa'
        },
        {
            isSender: false,
            timestamp: 1669853045004,
            message: 'abc xyz'
        }, {
            isSender: true,
            timestamp: 1669856644020,
            message: 'Sắp rồi anh'
        },
        {
            isSender: false,
            timestamp: 1669156244300,
            message: 'Hàng đến chưa'
        },
        {
            isSender: false,
            timestamp: 1660853045004,
            message: 'abc xyz'
        }
    ]);

    const { order } = route.params;
    React.useEffect(() => {
        navigation.setOptions({ title: `${order.name}` })

        onValue(firebaseDbRef(firebaseDb, `messenger/${order.order_id}`), async (snapshot) => {
            if (snapshot.exists()) {
                const chatHistories = snapshot.val()
                setChatHistory(() => {
                    return Object.keys(chatHistories).map((timestamp) => ({
                        ...chatHistories[timestamp],
                        timestamp
                    }))
                })
            }
        })
    }, []);

    const sendMessage = () => {
        if (typedText.trim().length == 0) {
            return;
        }
        let newMessage = {
            isSender: true,
            message: typedText
        }
        firebaseSet(firebaseDbRef(
            firebaseDb,
            `messenger/${order.order_id}/${new Date().getTime()}`),
            newMessage)
        setTypedText('');
    }
    return (
        <View style={{
            flex: 1,
            backgroundColor: 'white',
            flexDirection: 'column'
        }}>
            <TouchableHighlight
                activeOpacity={0.9}
                underlayColor='#DDDDDD'
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 8,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderColor: COLORS.lightGray,
                    backgroundColor: 'white',
                    // elevation: 5
                }}
                onPress={() => {
                    navigation.navigate('OrderDelivery', { order_id: order.order_id })
                }}>
                <Text style={{
                    flex: 1,
                    color: 'black',
                    ...FONTS.body3,
                    fontWeight: '700',
                    textAlign: 'center',
                    width: "100%",
                }}>Đơn hàng {order.order_id}</Text>
            </TouchableHighlight>
            <FlatList ref={flatListMessagesRef}
                contentContainerStyle={{
                    backgroundColor: 'white',
                    paddingTop: 8,
                    paddingBottom: 60,
                }}
                renderItem={({ item, index }) => (
                    <Message message={item}
                        avatar={order.avatar}
                        nextIsSender={index < chatHistory.length - 1 ? chatHistory[index + 1].isSender : true} />
                )}
                data={chatHistory}
                keyExtractor={item => item.timestamp}
            />
            <View style={{
                height: 50,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                flexDirection: 'row',
                backgroundColor: COLORS.lightGray2,
            }}>
                <TextInput
                    onChangeText={setTypedText}
                    style={{
                        flex: 0.84,
                        color: 'black',
                        paddingHorizontal: 8,
                    }}
                    onPressOut={(evt) => {
                        setTimeout(() => {
                            flatListMessagesRef.current.scrollToEnd()
                        }, 300)
                    }}
                    placeholder='Gửi tin nhắn...'
                    value={typedText}
                />
                <TouchableOpacity
                    style={{ ...styles.destinationFuncBtt, flex: 0.16 }}
                    onPress={sendMessage}
                >
                    <Ionicons name="ios-send-sharp" size={16} color={COLORS.lightblue} />

                    <Text style={{ ...FONTS.body5, fontWeight: '600', textTransform: 'capitalize', marginLeft: 4 }}>Gửi</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    destinationFuncBtt: {
        position: 'relative',
        height: '80%',
        alignSelf: 'center',
        flexDirection: "row",
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 20,
        alignItems: 'center',
        alignContent: 'center',
        paddingHorizontal: 8,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
})

export default Chat