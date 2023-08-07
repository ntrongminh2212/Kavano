import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { Gesture, GestureDetector, FlatList } from 'react-native-gesture-handler';
import { Entypo } from '@expo/vector-icons';
import { priceFormat } from "../helper/globalfunc";
import { COLORS, FONTS } from "../constants/theme";
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { OrderItem } from "./OrderItem";
import { useCallback } from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 24;
const MIN_TRANSLATE_Y = -SCREEN_HEIGHT / 4.2;

// type BottomSheetProps = {
//     children?: React.ReactNode;
// };

// export type BottomSheetRefProps = {
//     scrollTo: (destination: number) => void;
//     isActive: () => boolean;
// };

const BottomSheet = ({ children, style, order }) => {
    const translateY = useSharedValue(0);
    const active = useSharedValue(false);

    const scrollTo = useCallback((destination) => {
        'worklet';
        active.value = destination !== 0;
        translateY.value = withSpring(destination, { damping: 50 });
    }, []);

    // const isActive = useCallback(() => {
    //     return active.value;
    // }, []);

    // useImperativeHandle(ref, () => ({ scrollTo, isActive }), [
    //     scrollTo,
    //     isActive,
    // ]);

    useEffect(() => {
        translateY.value = withTiming(MIN_TRANSLATE_Y);
    }, [])
    const context = useSharedValue({ y: 0 });
    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        }).onUpdate((event) => {
            translateY.value = event.translationY + context.value.y;
            translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
            translateY.value = Math.min(translateY.value, MIN_TRANSLATE_Y);
        })
        .onEnd((event) => {
            if (event.translationY > 80) {
                scrollTo(MIN_TRANSLATE_Y);
            } else if (event.translationY < -50) {
                scrollTo(MAX_TRANSLATE_Y);
            }
        });

    const rBottomSheetStyle = useAnimatedStyle(() => {
        const borderRadius = interpolate(
            translateY.value,
            [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
            [25, 5],
            Extrapolate.CLAMP
        );

        return {
            borderRadius,
            transform: [{ translateY: translateY.value }]
        };
    });

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.bottomSheetContainer, styles.shadow, rBottomSheetStyle]}>
                <View style={styles.line} />
                {/* <View style={ }> */}
                <View style={{ flex: 0.24 }}>
                    {children}
                </View>
                <View style={{ flex: 0.76 }}>
                    <View style={styles.headerView}>
                        <Entypo style={{ flex: 0.1 }} name="location" size={24} color="red" />
                        <Text style={{ flex: 0.9, ...FONTS.body4, fontWeight: '700', color: 'black', padding: 4 }}>{order.address}</Text>
                    </View>
                    <View style={{
                        ...styles.headerView, paddingVertical: 8,
                        borderBottomWidth: 1.2,
                        borderBottomColor: COLORS.lightGray
                    }}>
                        <Entypo style={{ flex: 0.1 }} name="info-with-circle" size={24} color="black" />
                        <Text style={{ flex: 0.9, ...FONTS.body4, fontWeight: '600', color: 'black', padding: 4 }}>Chi tiết đơn hàng: </Text>
                    </View>

                    {order.order_id === 'home' ? null
                        : <View style={{}}>
                            <FlatList data={order.order_detail}
                                contentContainerStyle={{ justifyContent: "flex-start" }}
                                renderItem={({ item }) =>
                                    <OrderItem orderItem={item} />
                                }
                                keyExtractor={(item) => item.product_id + item.size_name}
                            />
                        </View>
                    }
                    {/* <View style={{
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
                    </View> */}
                </View>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        backgroundColor: 'white',
        top: SCREEN_HEIGHT,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -7,
        },
        shadowOpacity: 0.6,
        shadowRadius: 6.6,
        elevation: 3
    },
    line: {
        width: 75,
        height: 4,
        backgroundColor: 'grey',
        alignSelf: 'center',
        marginVertical: 12,
        borderRadius: 2,
    },
    shadow: {
        // height: '100%',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        borderRadius: 12,
        zIndex: 1
    },
    headerView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 4,
        borderTopWidth: 1.2,
        borderTopColor: COLORS.lightGray
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
    }
})

export default BottomSheet