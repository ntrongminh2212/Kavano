import { View, Modal, ActivityIndicator, Text, StyleSheet, Image, Button, Pressable } from "react-native";
import { COLORS, FONTS } from "../constants/theme";

export const LoadingModal = ({ modalVisible, text }) => {
    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={modalVisible}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <ActivityIndicator size="large" colo />
                    <Text style={styles.modalText}>{text}...</Text>
                </View>
            </View>
        </Modal>
    )
}

export const ConfirmModal = ({ modalVisible, icon, text, onConfirm }) => {
    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={modalVisible}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Image source={icon} />
                    <Text style={styles.modalText}>{text}...</Text>
                    <Button title="Xác nhận" onPress={onConfirm} />
                </View>
            </View>
        </Modal>
    )
}


export const OptionModal = ({ modalVisible, icon, text, onConfirm, onReject }) => {
    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={modalVisible}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Image source={icon} style={{
                        width: 44,
                        height: 44
                    }} />
                    <Text style={styles.modalText}>{text}</Text>
                    <View style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-evenly'
                    }}>
                        <Pressable style={styles.customPressable}
                            onPress={onReject}>
                            <Text style={{ ...FONTS.body4, fontWeight: '700', color: 'white', textTransform: 'capitalize' }}>Bỏ qua</Text>
                        </Pressable>
                        <Pressable style={{
                            ...styles.customPressable,
                            backgroundColor: 'white',
                            borderWidth: 1,
                            borderColor: COLORS.defaultButtonColor
                        }}
                            onPress={onConfirm}>
                            <Text style={{ ...FONTS.body4, fontWeight: '600', color: COLORS.defaultButtonColor, textTransform: 'capitalize' }}>Xác nhận hủy</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        height: '100%',
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        backgroundColor: 'rgba(135, 135, 135,0.5)'
    },
    modalView: {
        margin: 12,
        backgroundColor: "white",
        width: '80%',
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
        alignContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        ...FONTS.body3,
        marginVertical: 12,
        textAlign: "center",
    },
    customPressable: {
        flexDirection: 'row',
        width: 100,
        height: 36,
        backgroundColor: COLORS.defaultButtonColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    }
})