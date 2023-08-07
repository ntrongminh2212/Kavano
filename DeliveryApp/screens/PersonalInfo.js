import React, { useState } from 'react';
import { icons } from "../constants";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { View, TextInput, SafeAreaView, Image, StyleSheet, Text, TouchableOpacity, Button, ScrollView } from "react-native";
import { dateFormat, deleteData, getData } from '../helper/globalfunc';
import RadioButton from '../components/RadioButton';
import { Entypo, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker'
import { auth, firebaseDb, firebaseDbRef } from '../firebase/firebase'
import { StackActions } from '@react-navigation/native';

const PersonalInfo = ({ navigation }) => {
    const [info, setInfo] = useState({
        avatar: "",
        dateOfBirth: "",
        email: "",
        name: "",
        phone: "",
        sex: 1,
        shipper_id: 1,

    });
    const [updMode, setUpdMode] = useState(false);
    const [pickDate, setPickDate] = useState(false);

    React.useState(() => {
        (async () => {
            const initinfo = (await getData('shipper')).info
            // console.log(await getData('shipper'));
            console.log(initinfo);
            setInfo(initinfo);
        })()
    }, [])

    const logOut = async () => {
        await deleteData('shipper');
        auth.signOut();
        navigation.replace('Login');
    }

    return (
        <ScrollView contentContainerStyle={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            marginVertical: 4,
            borderRadius: 8,
            padding: 12
        }}>
            <View style={{ flex: 0.24, justifyContent: 'center', alignItems: 'center' }}>
                <Image style={{ width: 120, height: 120, resizeMode: 'contain' }}
                    source={{ uri: info.avatar }}></Image>
                {updMode ?
                    <TouchableOpacity style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        position: 'absolute',
                    }}>
                        <FontAwesome name="pencil" size={16} color={COLORS.lightblue} />
                        <Text style={{ color: COLORS.lightblue }}>Đổi ảnh đại diện</Text>
                    </TouchableOpacity>
                    : <Text>Ảnh đại diện</Text>
                }
            </View>
            <SafeAreaView style={{ flex: 0.76, width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                    <Entypo name="info-with-circle" size={24} color="black" />
                    <Text style={[FONTS.h3, { marginLeft: 4, fontWeight: '700' }]}>Thông tin cá nhân:</Text>
                </View>
                <View style={styles.field}>
                    <Text style={styles.tittleText}>Họ tên: </Text>
                    <View style={styles.input}>
                        {updMode ?
                            <TextInput
                                style={{ height: '100%', width: '100%', marginLeft: 8 }}
                                placeholder="Họ tên"
                                onChangeText={(name) => {
                                    setInfo({
                                        ...info,
                                        name: name
                                    })
                                }}
                                editable={false}
                                value={info.name}
                            />
                            : <Text>{info.name}</Text>
                        }
                    </View>
                </View>
                <View style={styles.field}>
                    <Text style={styles.tittleText}>Số điện thoại: </Text>
                    <View style={styles.input}>
                        {updMode ?
                            <TextInput
                                style={{ height: '100%', width: '100%', marginLeft: 8 }}
                                placeholder="Số điên thoại"
                                onChangeText={(phone) => {
                                    setInfo({
                                        ...info,
                                        phone: phone
                                    })
                                }}
                                editable={false}
                                value={info.phone}
                            />
                            : <Text>{info.phone}</Text>
                        }
                    </View>
                </View>
                <View style={styles.field}>
                    <Text style={styles.tittleText}>Ngày sinh: </Text>
                    <View style={styles.input}>
                        <Text>{dateFormat(info.dateOfBirth, false)}</Text>
                        {updMode ?
                            <Button title='Chọn ngày' onPress={setPickDate} /> : ''
                        }
                    </View>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', width: SIZES.width }}>
                    <Text style={styles.tittleText}>Giới tính: </Text>
                    <View style={{ flex: 0.8, flexDirection: 'row', justifyContent: 'space-around' }}>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RadioButton selected={info.sex === 1} style={{ marginRight: 4 }} />
                            <Text>Nam</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RadioButton selected={info.sex === 0} style={{ marginRight: 4 }} />
                            <Text>Nữ</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ marginTop: 40 }}>
                    <Text style={FONTS.h3}>Thông tin tài khoản:</Text>
                    <View style={{ ...styles.input, marginHorizontal: 8 }}>
                        <Image style={{ height: 28, width: 28, resizeMode: 'contain', marginRight: 4 }} source={icons.mail_account} />
                        <Text>{info.email}</Text>
                    </View>
                    <View style={{ ...styles.input, marginHorizontal: 8 }}>
                        <Image style={{ height: 28, width: 28, resizeMode: 'contain', marginRight: 4 }} source={icons.password} />
                        <Text>***********</Text>
                    </View>
                </View>
            </SafeAreaView>
            <DatePicker
                modal
                open={pickDate}
                date={new Date()}
                onConfirm={(date) => {
                    setPickDate(false)
                    console.log(typeof (date));
                    // setDate(date)
                }}
                onCancel={() => {
                    setPickDate(false)
                }}
            />
            {updMode ? null :
                <TouchableOpacity style={{
                    flexDirection: 'row',
                    borderWidth: 1,
                    borderColor: COLORS.lightGray,
                    marginTop: 12,
                    alignSelf: 'flex-end'
                }}
                    onPress={logOut}>
                    <MaterialIcons name="logout" size={24} color="red" />
                    <Text style={{ color: 'red' }}>Đăng xuất</Text>
                </TouchableOpacity>
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    input: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 40,
        marginBottom: 12,
        borderBottomWidth: 1,
        padding: 0,
        backgroundColor: ''
    },
    logoContainer: {
        position: 'absolute',
        top: SIZES.height / 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },
    formContainer: {
        position: 'absolute',
        flexDirection: 'column',
        justifyContent: 'center',
        top: SIZES.height / 3,
        width: SIZES.CARD_WIDTH
    },
    buttonLogin: {
        height: 40,
        flexDirection: "row",
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        backgroundColor: COLORS.lightblue,
        borderRadius: 30,
        alignItems: 'center',
        alignContent: 'center',
        paddingHorizontal: 8,
        marginHorizontal: 2,
        overflow: 'hidden'
    },
    field: {
        paddingHorizontal: 8
    },
    tittleText: {
        color: COLORS.darkgray,
    }
})


export default PersonalInfo
