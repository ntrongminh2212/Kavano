import { icons, images, objects } from "../constants";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import React, { useRef, useState } from "react";
import { View, Button, TextInput, SafeAreaView, Image, Platform, Text, StyleSheet, Animated, TouchableOpacity, LogBox, FlatList, ScrollView } from "react-native";
import { LoadingModal } from "../components/Modal";
import { login } from "../helper/serverapi";
import Toast from 'react-native-toast-message';
import { getData, storeData } from "../helper/globalfunc";
import { StackActions, NavigationAction } from "@react-navigation/native";
import { auth, firebaseDb, firebaseDbRef, firebaseSet, onAuthStateChanged, signInWithEmailAndPassword } from "../firebase/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    React.useEffect(() => {
        (async () => {
            try {
                const shipper = await getData('shipper');
                const rs = await login(JSON.stringify({ token: shipper.token }));
                if (rs) {
                    // handleFirebaseLogIn(shipper.info.email, shipper.info.password)
                    navigation.replace('MainTabScreen');
                }
            } catch (error) {

            }
        })();
    }, [])

    const handleFirebaseLogIn = (email, password) => {
        signInWithEmailAndPassword(auth, email, password)
            .then((user) => {
                // console.log(user);
            })
            .catch((err) => {
                console.log(err.message);
            })

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                //sign in
                const userId = user.uid;
                firebaseSet(firebaseDbRef(
                    firebaseDb,
                    `users/${userId}`
                ), {
                    email: user.email,
                    emailVerified: user.emailVerified,
                    accessToken: user.accessToken
                })
                storeData('shipper', {
                    ...(await getData('shipper')),
                    accessToken: user.accessToken
                })
            }
        })
    }
    const handleLogin = async (evt) => {
        const data = {
            username: username,
            password: password
        }
        setModalVisible(true);
        const rs = await login(JSON.stringify(data))
        setModalVisible(false);
        if (rs) {
            // handleFirebaseLogIn(username, password);
            navigation.replace('MainTabScreen');
            Toast.show({
                type: 'success',
                text1: 'Đăng nhập thành công'
            })
        } else {
            Toast.show({
                type: 'error',
                text1: 'Đăng nhập thất bại',
                text2: 'Sai tên đăng nhập hoặc mật khẩu'
            })
        }
    }

    return (
        <View style={styles.screenContainer}>
            <LoadingModal modalVisible={modalVisible} text='Đang đăng nhập' />
            <View style={styles.logoContainer}>
                <Image style={{ height: 80, resizeMode: 'contain', marginBottom: 12 }} source={icons.logo}></Image>
                <Image style={{ height: 60, resizeMode: 'contain' }} source={icons.shipper}></Image>
            </View>
            <View style={styles.formContainer}>
                <SafeAreaView>
                    <View style={styles.input}>
                        <Image style={{ height: 28, width: 28, resizeMode: 'contain' }} source={icons.mail_account} />
                        <TextInput
                            style={{ height: '100%', width: '100%', marginLeft: 8 }}
                            placeholder="Email hoặc số điện thoại"
                            onChangeText={setUsername}
                            value={username}
                        />
                    </View>
                    <View style={styles.input}>
                        <Image style={{ height: 28, width: 28, resizeMode: 'contain' }} source={icons.password} />
                        <TextInput
                            style={{ height: '100%', width: '100%', marginLeft: 8 }}
                            secureTextEntry={true}
                            placeholder="Mật khẩu"
                            onChangeText={setPassword}
                            value={password}
                        />
                    </View>
                </SafeAreaView>
                <TouchableOpacity
                    style={styles.buttonLogin}
                    activeOpacity={0.8}
                    onPress={handleLogin}>
                    <View>
                        <Text style={{ ...FONTS.body4, fontWeight: '700', textTransform: 'uppercase', color: 'white' }}>Đăng nhập</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <Text style={{ ...FONTS.body3, position: 'absolute', width: SIZES.CARD_WIDTH, top: SIZES.width / 0.65, color: 'grey', textAlign: 'center' }}>Ứng dụng chỉ dành cho Shipper của Kavano</Text>
        </View>
    )
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
        height: 44,
        marginBottom: 16,
        marginHorizontal: 12,
        borderWidth: 1,
        padding: 10,
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
})

export default Login