import { Accuracy, watchPositionAsync } from "expo-location";
import { computeDestinationPoint, getBounds, getDistance, getPathLength } from "geolib";
import React, { useMemo, useRef, useState } from "react";
import { View, Image, Platform, Text, StyleSheet, Animated, TouchableOpacity, ScrollView } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import BottomSheet from "../components/BottomSheet";
import { ScrollView as ScrollView2, FlatList } from "react-native-gesture-handler";
import { icons, objects } from "../constants";
import { ggMapStyle, initialDestination, kavanoStore, mapCamera } from "../constants/objects";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { calcMovingSteps, calcStreetForCoordinate, calculateAngle, distanceString, getAngleOfTwoLine, isCurLocInRoute, priceFormat, requestCurrentLocation, secondToTimeString, speak } from "../helper/globalfunc";
import { routeAPI, GeoCodeReverseAPI } from "../helper/mapapi";
import { getOrders } from "../helper/serverapi";
import { ConfirmModal, LoadingModal } from "../components/Modal";
import { OrderItem } from "../components/OrderItem";
import { MaterialIcons } from '@expo/vector-icons';

let positionWatcher = null;
let mapIndex = 0;
let saveForRotation = {
    oldCoord: {
        longitude: 0,
        latitude: 0
    },
    newCoord: {
        longitude: 0,
        latitude: 0
    }
};
let isProcessingRouteAPI = false;

const OrderDelivery = ({ navigation, route }) => {
    const mapViewRef = useRef();
    const animateMarkerRef = useRef();
    const ordersScrollView = useRef();

    const [orders, setOrders] = useState([]);
    const [confirmOrdersCount, setConfirmOrdersCount] = useState(0);
    const [location, setLocation] = useState({
        curLoc: {
            longitude: 106.7006893,
            latitude: 10.8004796,
        },
        isLoading: false,
        heading: 0
    })
    const [smoothMarker, setSmoothMarker] = useState({
        coordinate: {
            longitude: 0,
            latitude: 0,
        }
    })
    const aniCurLoc = useRef(new Animated.ValueXY({
        x: 0,
        y: 0
    })).current
    const { curLoc } = location
    const [destination, setDestination] = React.useState(initialDestination);
    const [curStep, setCurStep] = useState({ instruction: '' });
    const [curPointIndex, setCurPointIndex] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [region, setRegion] = React.useState({
        longitude: 106.660172,
        latitude: 10.762622,
        latitudeDelta: 0.3,
        longitudeDelta: 0.3
    });
    const [isInstructionMode, setStepInstructionMode] = useState(false);
    const [onScreen, setOnScreen] = useState(true);
    const [loadingModal, setLoadingModal] = useState({
        modalVisible: false,
        text: 'Đang tải đường'
    })
    const [confirmModal, setConfirmModal] = useState(false);

    const [mapAnimation, setMapAnimation] = React.useState(new Animated.Value(0))

    React.useEffect(() => {
        (async () => {
            console.log("init");
            let [curLocc, orders] = await Promise.all([requestCurrentLocation(), getOrders()]);
            orders = orders.filter((order) => {
                return order.status === 'Deliver';
            });
            let ordersCoords = orders.map((order) => order.coordinate);
            ordersCoords.push(curLocc)
            const bound = getBounds(ordersCoords);
            let mapRegion = mappingRegion(...Object.values(bound));
            setRegion(mapRegion);
            setOrders(orders);
        })();
    }, []);

    React.useEffect(() => {
        if (onScreen) {
            // const getOrderInterval = window.setInterval
            (async () => {
                let allOrders = await getOrders();
                let updDeliverOrders = allOrders.filter((order) => {
                    return order.status === 'Deliver';
                });

                let updConfirmOrdersCount = allOrders.filter((order) => {
                    return order.status === 'Confirm';
                }).length;

                setConfirmOrdersCount(updConfirmOrdersCount)

                setOrders(prevOrders => {
                    if (JSON.stringify(prevOrders) !== JSON.stringify(updDeliverOrders)) {
                        return (prevOrders = updDeliverOrders);
                    } else return prevOrders
                });
            })()
            // }, 2000);
            // return () => {
            //     window.clearInterval(getOrderInterval);
            // };
        }
    }, [onScreen]);

    React.useEffect(() => {
        mapAnimation.removeAllListeners();
        setMapAnimation(new Animated.Value(0));
    }, [orders])

    React.useEffect(() => {
        if (destination.coordinate != null) {
            navigation.setOptions({ tabBarStyle: { display: 'none' } });
        } else {
            navigation.setOptions({ tabBarStyle: { display: 'flex' } });
        }
    }, [destination])

    React.useEffect(() => {
        if (curStep.instruction) {
            (async () => {
                const distance = getDistance(curLoc, destination.direction_points[curStep.point_index]);
                let speech;
                if (distance > 400) {
                    speech = `Tiếp tục đi thẳng ${curStep.curStreet}`;
                }
                else speech = `Cách ${distanceString(distance, true)}, ` + curStep.instruction + curStep.street;
                speak(speech);
            })()
        }
    }, [curStep.point_index])

    React.useEffect(() => {
        mapViewRef.current.animateToRegion(region, 600);
    }, [region])

    React.useEffect(() => {
        if (selectedOrder != null && orders) {
            mapViewRef.current.animateToRegion({
                ...orders.find((order) => order.order_id === selectedOrder).coordinate,
                latitudeDelta: SIZES.LATITUDE_DELTA,
                longitudeDelta: SIZES.LONGITUDE_DELTA
            }, 600);
        }
    }, [selectedOrder])

    //UseEffect: MapMarker select navigate animation
    React.useEffect(() => {
        mapAnimation.addListener(({ value }) => {
            let index = Math.floor(value / SIZES.CARD_WIDTH + 0.3)

            if (index >= orders.length) {
                index = orders.length - 1;
            }
            if (index < 0) {
                index = 0;
            }
            if (mapIndex !== index) {
                mapIndex = index;
                setSelectedOrder(orders[mapIndex].order_id)
            }
        })
        return () => mapAnimation.removeAllListeners();
    }, [mapAnimation]);

    React.useEffect(() => {
        aniCurLoc.addListener((aniCurLoc) => {
            const newMarker = {
                coordinate: {
                    longitude: Number(JSON.stringify(aniCurLoc.x)),
                    latitude: Number(JSON.stringify(aniCurLoc.y))
                }
            }
            setSmoothMarker(newMarker);
        });

        return () => aniCurLoc.removeAllListeners();
    }, [aniCurLoc])

    //UseEffect: Step instruction mode realtime
    React.useEffect(() => {
        (async () => {
            if (isInstructionMode) {
                if (positionWatcher == null) {
                    positionWatcher = await watchPositionAsync({ accuracy: Accuracy.Highest, distanceInterval: 1, timeInterval: 1000 }, (newLocation) => {
                        setLocation({
                            ...location,
                            curLoc: {
                                ...newLocation.coords
                            }
                        })
                        animateMoving(newLocation.coords);
                    })
                }
                let curStreet = await GeoCodeReverseAPI(curLoc);
                if (curStep.step) {
                    setCurStep({
                        ...destination.steps[curStep.step],
                        curStreet: curStreet.address.road,
                        distance: getDistance(curLoc, destination.direction_points[curStep.point_index])
                    });
                } else
                    setCurStep({
                        ...destination.steps[0],
                        curStreet: curStreet.address.road,
                        distance: getDistance(curLoc, destination.direction_points[destination.steps[0].point_index])
                    });
            } else {
                if (positionWatcher != null) {
                    await positionWatcher.remove();
                    positionWatcher = null;
                    const directionRegion = mappingRegion(curLoc.latitude, destination.coordinate.latitude, curLoc.longitude, destination.coordinate.longitude);
                    setRegion(directionRegion)
                    setCurStep({ instruction: '' });
                }
            }
        })()
    }, [isInstructionMode])

    React.useEffect(() => {
        if (isInstructionMode) {
            saveForRotation.oldCoord = saveForRotation.newCoord;
            saveForRotation.newCoord = {
                longitude: curLoc.longitude,
                latitude: curLoc.latitude
            }
            // console.log(calculateAngle([saveForRotation.oldCoord, saveForRotation.newCoord]), curLoc.heading);
            const center = computeDestinationPoint(curLoc, 110, location.curLoc.heading);
            mapViewRef.current.animateCamera({
                center: {
                    ...center
                },
                heading: location.curLoc.heading,
                pitch: mapCamera.pitch,
                zoom: mapCamera.zoom
            }, { duration: 1000 })

            let steps = destination.steps;
            for (let i = 0; i < steps.length; i++) {
                if (curPointIndex < steps[i].point_index) {
                    const distance = getDistance(curLoc, destination.direction_points[steps[i].point_index]);
                    (async () => {
                        if (curStep.point_index) {
                            if (curStep.point_index !== steps[i].point_index) {
                                const street = await calcStreetForCoordinate(destination.direction_points[steps[i].point_index],
                                    destination.direction_points[steps[i].point_index + 1])
                                setCurStep({
                                    ...steps[i],
                                    distance: distance,
                                    street: street,
                                    step: i,
                                    curStreet: curStep.street
                                });
                            } else {
                                if (distance < 400 && curStep.distance > 400) {
                                    const speech = `Cách ${distanceString(distance, true)}, ` + curStep.instruction + curStep.street;
                                    speak(speech);
                                }

                                setCurStep({
                                    ...curStep,
                                    distance: distance,
                                });
                            }
                        }
                    })()
                    break;
                }
            }
        }
        if (destination.direction_points.length > 0 && !destination.reach) {
            routeCalc();
        }
    }, [location.curLoc])

    React.useEffect(() => {
        const unsubcribe = navigation.addListener('focus', () => {
            setOnScreen(true);
        });
        return unsubcribe;
    }, [navigation])

    React.useEffect(() => {
        const unsubcribe = navigation.addListener('blur', () => {
            setOnScreen(false);
        });
        return unsubcribe;
    }, [navigation])

    React.useEffect(() => {
        // console.log(orders);
        if (route.params?.order_id && orders.length > 0) {
            setSelectedOrder(route.params?.order_id);
            let order = orders.find(order =>
                order.order_id === route.params?.order_id)
            setDestination({
                ...initialDestination,
                origin: {
                    ...curLoc
                },
                coordinate: {
                    ...order.coordinate
                },
                order: order,
                distance: distanceString(getPathLength([curLoc, order.coordinate]))
            });
        }
    }, [route.params?.order_id]);

    React.useEffect(() => {
        if (route.params?.finish_order) {
            try {
                const order_id = route.params?.order_id;
                const remainOrders = orders.filter((order) => {
                    return order.order_id !== order_id;
                })
                // console.log(orders);
                let ordersCoords = orders.map((order) => order.coordinate);
                ordersCoords.push(curLoc)
                const bound = getBounds(ordersCoords);
                let mapRegion = mappingRegion(...Object.values(bound));
                setRegion(mapRegion);
                setOrders(remainOrders);
                setDestination(initialDestination);
                navigation.setParams({
                    finish_order: false,
                    order_id: null
                })
            } catch (error) {

            }
        }
    }, [route.params?.finish_order]);

    const routeCalc = () => {
        if (destination.direction_points.length > 0) {
            const distance = getPathLength([curLoc, ...destination.direction_points.slice(curPointIndex + 1)]);
            const time = distance / objects.speed;
            const curLocIndex = isCurLocInRoute(curLoc, destination.direction_points);
            setCurPointIndex(curLocIndex);
            if (getPathLength([curLoc, destination.coordinate]) < 50) {
                isInstructionMode ? setStepInstructionMode(false) : '';
                destination.reach ? '' : setConfirmModal(true);
                setDestination({
                    ...destination,
                    origin: {
                        ...curLoc
                    },
                    // direction_points: [],
                    distance: distanceString(distance),
                    time: time,
                    reach: true
                })
            } else {
                if (curLocIndex === false) {
                    updDirection(destination.order, false);
                } else {
                    setDestination({
                        ...destination,
                        origin: {
                            ...curLoc
                        },
                        distance: distanceString(distance),
                        time: time,
                        reach: false
                    });
                }
            }
        }
    }

    const animateMoving = (toCoords) => {
        if (isInstructionMode) {
            let toValue = new Animated.ValueXY({
                x: toCoords.longitude,
                y: toCoords.latitude
            });
            Animated.timing(aniCurLoc, {
                toValue: toValue,
                duration: 1000,
                useNativeDriver: false
            }).start();
        }
    }

    const mappingRegion = (maxLat, minLat, maxLong, minLong) => {
        return {
            longitude: (maxLong + minLong) / 2,
            latitude: (maxLat + minLat) / 2,
            latitudeDelta: Math.abs(maxLat - minLat) * 2,
            longitudeDelta: Math.abs(maxLong - minLong) * 2
        }
    }

    const updDirection = async (order, start = false) => {

        if (isProcessingRouteAPI) {
            return
        }

        const orderCoord = order.coordinate;
        console.log('update direction');
        if (!destination.reach) {
            start ? setLoadingModal({
                modalVisible: true,
                text: 'Đang tải đường đi...'
            }) : '';
            isProcessingRouteAPI = true;
            const rs = await routeAPI([[curLoc.longitude, curLoc.latitude], [orderCoord.longitude, orderCoord.latitude]], false, true);
            console.log('done api call');
            let points = rs.routes[0].geometry.map((point) => {
                return {
                    longitude: point[1],
                    latitude: point[0]
                }
            });
            points.unshift(curLoc);
            for (let i = 1; i < points.length - 2; i++) {
                const angle = getAngleOfTwoLine(points[i - 1], points[i], points[i + 1], 0.1);
                if (angle < 2) {
                    points.splice(i, 1);
                }
                // console.log(i, ' ', points[i], points[i + 1]);
                const distance = getDistance(points[i], points[i + 1], 0.1);
                if (distance < 1) {
                    points.splice(i + 1, 1);
                }
            }
            debugger
            const steps = await calcMovingSteps(points, mapViewRef.current);
            console.log('done calcmovingstep');
            isProcessingRouteAPI = false;
            start ? setLoadingModal({
                modalVisible: false,
                text: 'Đang tải đường đi...'
            }) : '';
            setDestination({
                origin: {
                    ...curLoc
                },
                coordinate: {
                    ...orderCoord
                },
                order: order,
                direction_points: points,
                steps: steps,
                distance: distanceString(rs.routes[0].summary.distance),
                time: rs.routes[0].summary.duration,
                reach: false
            });
            const directionRegion = mappingRegion(curLoc.latitude, orderCoord.latitude, curLoc.longitude, orderCoord.longitude);
            if (start) setRegion(directionRegion)
        }
    }

    const onMarkerPress = (mapEventData) => {
        if (destination.coordinate === null) {
            const markerID = mapEventData._targetInst.return.key;
            let x = markerID * SIZES.CARD_WIDTH;
            if (Platform.OS === 'ios') {
                x = x - SPACING_FOR_CARD_INSET;
            }

            ordersScrollView.current.scrollTo({ x: x, y: 0, animated: true });
            let index = Math.floor(x / SIZES.CARD_WIDTH + 0.3)
            if (index >= orders.length) {
                index = orders.length - 1;
            }
            if (index < 0) {
                index = 0;
            }
            mapIndex = index;
            setSelectedOrder(orders[mapIndex].order_id);
        }
    }

    //Component
    let RouteCalcHeader = () => {
        return (
            <View style={{
                position: 'absolute',
                top: 30,
                left: 0,
                right: 0,
                height: 56,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center',
                        width: SIZES.width * 0.96,
                        paddingVertical: 8,
                        paddingHorizontal: 8,
                        borderRadius: 28,
                        backgroundColor: "white",
                        elevation: 6
                    }}
                >
                    <TouchableOpacity
                        style={{
                            flex: 0.1,
                            width: 30,
                            height: 30,
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 4
                        }}
                        onPress={() => {
                            setDestination(initialDestination);
                        }}
                    >
                        <Image style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            alignSelf: 'center'
                        }} source={icons.back} />
                    </TouchableOpacity>
                    <Image
                        source={icons.red_pin}
                        style={{
                            flex: 0.05,
                            width: 24,
                            height: 24
                        }}
                    />

                    <View style={{ flex: 0.7, height: '100%', paddingHorizontal: 8, justifyContent: 'space-around', flexDirection: "column", overflow: 'hidden' }}>
                        <Text style={{ ...FONTS.body3, overflow: 'hidden' }} numberOfLines={1}>{destination.order.address}</Text>
                        <Text style={{ ...FONTS.body5, color: 'grey' }}>{destination.distance}</Text>
                    </View>
                    <View style={{
                        flex: 0.2,
                        flexDirection: "row",
                        position: "absolute",
                        alignItems: 'center',
                        right: 10
                    }}>
                        <Image
                            source={icons.delivery_time}
                            style={{
                                width: 20,
                                height: 20,
                                marginRight: 5
                            }}
                        />
                        <Text style={{ ...FONTS.h4 }}>{secondToTimeString(destination.time)}</Text>
                    </View>
                </View>
            </View >
        )
    }

    let InstructionHeaderView = useMemo(() => {
        if (curStep.instruction) {
            return (
                <View style={{
                    position: 'absolute',
                    top: 30,
                    left: 0,
                    right: 0,
                    // height: 100,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {curStep.distance > 400 ?
                        <>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: 100,
                                    width: SIZES.width * 0.95,
                                    borderRadius: 10,
                                    backgroundColor: COLORS.darkgreen,
                                    elevation: 5,
                                    borderBottomLeftRadius: 0
                                }}
                            >
                                <Image
                                    source={icons.go_straight}
                                    style={{
                                        flex: 0.25,
                                        width: 60,
                                        height: 60,
                                        resizeMode: "contain"
                                    }}
                                />

                                <View style={{ flex: 0.75, flexDirection: "column", justifyContent: 'space-around', alignItems: "flex-start" }}>
                                    <Text style={{ ...FONTS.body2, marginBottom: 4, color: 'white' }}>{distanceString(curStep.distance)}</Text>
                                    <Text style={{ ...FONTS.h2, lineHeight: 26, color: 'white', marginRight: 4 }} numberOfLines={2}>{curStep.curStreet}</Text>
                                </View>
                            </View>
                            <View style={{
                                flex: 0.,
                                flexDirection: 'row',
                                alignItems: 'center',
                                alignSelf: 'flex-start',
                                padding: 8,
                                width: SIZES.width * 0.25,
                                borderRadius: 5,
                                backgroundColor: COLORS.darkgreen,
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                                elevation: 5,
                                marginLeft: 10
                            }}
                            >
                                <Text style={{ ...FONTS.body4, fontWeight: '700', lineHeight: 26, color: 'white', marginRight: 4 }} numberOfLines={2}>Sau đó: </Text>
                                <Image
                                    source={icons[`${curStep.action}`]}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        resizeMode: "contain"
                                    }}
                                />
                            </View>
                        </> :
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                height: 100,
                                width: SIZES.width * 0.95,
                                borderRadius: 10,
                                backgroundColor: COLORS.darkgreen,
                                elevation: 5
                            }}
                        >
                            <Image
                                source={icons[`${curStep.action}`]}
                                style={{
                                    flex: 0.25,
                                    width: 60,
                                    height: 60,
                                    resizeMode: "contain"
                                }}
                            />

                            <View style={{ flex: 0.75, flexDirection: "column", justifyContent: 'space-around', alignItems: "flex-start" }}>
                                <Text style={{ ...FONTS.body2, marginBottom: 4, color: 'white' }}>{distanceString(curStep.distance)}</Text>
                                <Text style={{ ...FONTS.h2, lineHeight: 26, color: 'white', marginRight: 4 }} numberOfLines={2}>{curStep.street}</Text>
                            </View>
                        </View>}
                </View>
            )
        }
    }, [curStep])

    let DestinationMarker = (order, index) => {
        if (!order) return;
        return (
            <Marker
                key={index}
                coordinate={order.coordinate}
                onPress={onMarkerPress}>
                <Image
                    style={{
                        height: 36,
                        width: 36
                    }}
                    source={icons.destination}
                />
                <View style={{
                    position: "absolute",
                    borderRadius: 10,
                    height: 14,
                    width: 14,
                    backgroundColor: order.order_id === selectedOrder ? "black" : "white",
                    transform: [{ translateX: 11.5 }, { translateY: 6 }]
                }}>
                </View>
            </Marker>
        )
    }

    let CurrentMarker = useMemo(() => {
        if (aniCurLoc.x && smoothMarker.coordinate) {
            return (
                <Animated.View>
                    <Marker
                        ref={animateMarkerRef}
                        coordinate={smoothMarker.coordinate}
                        rotation={calculateAngle([saveForRotation.oldCoord, saveForRotation.newCoord])}
                        flat={true}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.transCircle1}>
                            <Image source={icons.gps}
                                style={{
                                    width: 30,
                                    height: 30,
                                    transform: [{ translateY: 5 }]
                                }}
                            />
                        </View>
                    </Marker>
                </Animated.View>
            )
        }
    }, [smoothMarker.coordinate])

    let DestinationDetailView = (order, index) => {
        return (
            <View key={index}
                style={styles.card}>
                <Text style={{
                    alignSelf: "center",
                    fontSize: 18,
                    marginBottom: 6,
                    marginTop: 6,
                    fontWeight: '600'
                }}
                >
                    Người nhận
                </Text>
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    style={{ flex: 0.3 }}>
                    <Text style={styles.content}>
                        Tên: {order.name}
                    </Text>
                    <Text style={styles.content}>
                        Số điện thoại: {order.phone}
                    </Text>
                    <Text style={styles.content}>
                        Địa chỉ: {order.address}
                    </Text>
                </ScrollView>
                <Text style={{
                    flex: 0.3,
                    textAlign: "right",
                    fontSize: 20,
                    fontStyle: "bold",
                    color: "#0cb320",
                }}>
                    {priceFormat(order.total)} VND
                </Text>
                <View style={{ flex: 0.3, justifyContent: 'flex-start', flexDirection: 'row', }}>
                    {getPathLength([curLoc, order.coordinate]) < 50 ?
                        <TouchableOpacity
                            style={{ ...styles.destinationFuncBtt, backgroundColor: COLORS.green }}
                            onPress={() => {
                                setDestination({
                                    ...initialDestination,
                                    origin: {
                                        ...curLoc
                                    },
                                    coordinate: {
                                        ...order.coordinate
                                    },
                                    order: order,
                                    distance: distanceString(getPathLength([curLoc, order.coordinate])),
                                    reach: true
                                });
                                setRegion(mappingRegion(curLoc.latitude, order.coordinate.latitude,
                                    curLoc.longitude, order.coordinate.longitude));
                            }}
                            activeOpacity={0.7}
                        >
                            <Image style={styles.funcImage} source={icons.handbox} />

                            <Text style={{ ...FONTS.body4, fontWeight: '700', textTransform: 'capitalize', color: 'white' }}>Giao hàng</Text>
                        </TouchableOpacity>
                        : <React.Fragment>
                            <TouchableOpacity
                                style={{ ...styles.destinationFuncBtt, backgroundColor: COLORS.lightblue }}
                                onPress={() => {
                                    if (!destination.coordinate) {
                                        updDirection(order, true);
                                    }
                                }}
                            >
                                <Image style={styles.funcImage} source={icons.route} />

                                <Text style={{ ...FONTS.body4, fontWeight: '700', textTransform: 'capitalize', color: 'white' }}>Chỉ đường</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ ...styles.destinationFuncBtt }}
                                onPress={() => {
                                    new Promise((resolve, reject) => {
                                        // console.log(order.coordinate);
                                        const distance = getPathLength([curLoc, order.coordinate]);
                                        if (distance < 50) {
                                            setConfirmModal(true);
                                        } else {
                                            if (!destination.coordinate) {
                                                resolve(updDirection(order, true));
                                            } else {
                                                resolve(0)
                                            }
                                        }
                                    }).then(rs => {
                                        setStepInstructionMode(true)
                                    })
                                }}
                            >
                                <Image style={styles.funcImage} source={icons.start_delivery} />

                                <Text style={{ ...FONTS.body4, fontWeight: '600', textTransform: 'capitalize' }}>Bắt đầu</Text>
                            </TouchableOpacity>
                        </React.Fragment>
                    }
                    <TouchableOpacity
                        style={{ ...styles.destinationFuncBtt }}
                        onPress={() => {
                            navigation.navigate('Chat', {
                                order
                            })
                        }}
                    >
                        <Image style={styles.funcImage} source={icons.message} />

                        <Text style={{ ...FONTS.body4, fontWeight: '600', textTransform: 'capitalize' }}>Nhắn tin</Text>
                    </TouchableOpacity>
                    {/*<TouchableOpacity
                        style={{ ...styles.destinationFuncBtt }}
                        onPress={() => { }}

                    >
                        <Image style={styles.funcImage} source={icons.phone} />

                        <Text style={{ ...FONTS.body4, fontWeight: '600', textTransform: 'capitalize' }}>Gọi điện</Text>
                    </TouchableOpacity> */}
                </View>
            </View>
        )
    }

    let DestinationsScrollViews = () => {
        return (
            <Animated.ScrollView
                ref={ordersScrollView}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                pagingEnabled
                scrollEventThrottle={1}
                decelerationRate={1}
                snapToInterval={SIZES.CARD_WIDTH + 10}
                snapToAlignment="center"
                onMomentumScrollEnd={Animated.event([{
                    nativeEvent: {
                        contentOffset: {
                            x: mapAnimation
                        }
                    }
                }], { useNativeDriver: true })}
            >
                {orders.map(DestinationDetailView)}
            </Animated.ScrollView>
        )
    }

    let DirectionPassLine = useMemo(() => {
        let atLoc;
        if (destination.direction_points.length > 0) {
            getPathLength([curLoc, destination.direction_points[curPointIndex + 1]]) < 5 ?
                atLoc = destination.direction_points[curPointIndex + 1] : atLoc = curLoc;
            let strokeWidth = isInstructionMode ? 12 : 7
            return (
                <Polyline coordinates={[...destination.direction_points.slice(0, curPointIndex + 1), atLoc]}
                    strokeWidth={strokeWidth}
                    strokeColor={COLORS.darkgray}
                />
            )
        }
    }, [curLoc])

    let OrderFocusView = (order) => {
        return (
            <BottomSheet style={{ top: SIZES.height / 1.28, zIndex: 5 }} order={order}>
                {order.order_id !== 'home' ?
                    <>
                        <Text style={{
                            alignSelf: "center",
                            fontSize: 18,
                            marginBottom: 8
                        }}
                        >
                            Người nhận
                        </Text>
                        <Text style={styles.content}>
                            Tên: {order.name}
                        </Text>
                        <Text style={styles.content}>
                            Số điện thoại: {order.phone}
                        </Text>
                        <View style={{ flexDirection: "row", alignContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.content}>
                                Thanh toán:
                            </Text>
                            <Text style={{
                                ...FONTS.h4,
                                color: "#0cb320",
                                marginLeft: 4
                            }}>
                                {priceFormat(order.total)} VND
                            </Text>
                        </View>
                    </>
                    : <View style={{ height: '60%', padding: 4, paddingHorizontal: 8 }}>
                        <Text style={{
                            ...FONTS.h3,
                            marginBottom: 8,
                            fontWeight: '700'
                        }}
                        >
                            Cửa hàng Kavano
                        </Text>
                        <Text style={[styles.content, { marginTop: 16 }]}>
                            {confirmOrdersCount > 0 ?
                                `Bạn hiện có ${confirmOrdersCount} đơn chờ lấy hàng`
                                : "Hiện chưa có đơn hàng nào khác cần giao"}
                        </Text>
                    </View>
                }
                <ScrollView2
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    paddingVertical={8}
                >
                    {getPathLength([curLoc, destination.coordinate]) < 50 ?
                        (order.order_id !== 'home' ?
                            <TouchableOpacity
                                style={{ ...styles.destinationFuncBtt, backgroundColor: COLORS.green }}
                                onPress={() => {
                                    navigation.navigate('FinnishOrder', { order: order });
                                }}
                                activeOpacity={0.7}
                            >
                                <Image style={styles.funcImage} source={icons.take_cash} />
                                <Text style={{ ...FONTS.body4, fontWeight: '700', textTransform: 'capitalize', color: 'white' }}>Khách nhận hàng</Text>
                            </TouchableOpacity>
                            : <TouchableOpacity
                                style={{ ...styles.destinationFuncBtt, backgroundColor: COLORS.green }}
                                onPress={() => {
                                    navigation.navigate('MyOrders');
                                }}
                                activeOpacity={0.7}
                            >
                                <Image style={styles.funcImage} source={icons.take_cash} />
                                <Text style={{ ...FONTS.body4, fontWeight: '700', textTransform: 'capitalize', color: 'white' }}>Lấy hàng</Text>
                            </TouchableOpacity>
                        )
                        : <React.Fragment>
                            <TouchableOpacity
                                style={{ ...styles.destinationFuncBtt, backgroundColor: COLORS.lightblue }}
                                onPress={() => { updDirection(order, true) }}
                            >
                                <Image style={styles.funcImage} source={icons.route} />

                                <Text style={{ ...FONTS.body4, fontWeight: '700', textTransform: 'capitalize', color: 'white' }}>Chỉ đường</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ ...styles.destinationFuncBtt }}
                                onPress={() => {
                                    new Promise((resolve, reject) => {
                                        if (!destination.coordinate) {
                                            resolve(updDirection(order, true));
                                        } else {
                                            resolve(0)
                                        }
                                    }).then(rs => {
                                        setStepInstructionMode(true);
                                    })
                                }}
                            >
                                <Image style={styles.funcImage} source={icons.start_delivery} />

                                <Text style={{ ...FONTS.body4, fontWeight: '600', textTransform: 'capitalize' }}>Bắt đầu</Text>
                            </TouchableOpacity>
                        </React.Fragment>
                    }
                    {order.order_id !== kavanoStore.order.order_id ?
                        <TouchableOpacity
                            style={{ ...styles.destinationFuncBtt }}
                            onPress={() => {
                                navigation.navigate('Chat', {
                                    order
                                })
                            }}
                        >
                            <Image style={styles.funcImage} source={icons.message} />

                            <Text style={{ ...FONTS.body4, fontWeight: '600', textTransform: 'capitalize' }}>Nhắn tin</Text>
                        </TouchableOpacity> : null}
                    {/* <TouchableOpacity
                        style={{ ...styles.destinationFuncBtt }}
                        onPress={() => {  }}

                    >
                        <Image style={styles.funcImage} source={icons.phone} />

                        <Text style={{ ...FONTS.body4, fontWeight: '600', textTransform: 'capitalize' }}>Gọi điện</Text>
                    </TouchableOpacity> */}
                </ScrollView2>
            </BottomSheet >
        )
    }

    let InstructionBottomView = useMemo(() => {
        return (
            <View style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                // paddingTop: 4,
                top: SIZES.height * 0.92,
            }}>
                <View style={{
                    flex: 1,
                    height: '12%',
                    flexDirection: 'row',
                    paddingHorizontal: 12,
                    backgroundColor: 'white',
                    borderRadius: 12,
                    shadowOffset: {
                        width: 0,
                        height: -7,
                    },
                    shadowOpacity: 0.6,
                    shadowRadius: 6.6,
                    shadowColor: "#000",
                    elevation: 3
                }}>
                    <TouchableOpacity
                        style={{
                            width: 52,
                            height: '12%',
                            alignContent: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                        }}
                        onPress={() => {
                            setStepInstructionMode(false);
                        }}
                    >
                        <Image style={{
                            width: 52,
                            height: 52,
                            resizeMode: 'contain',
                            alignSelf: 'center'
                        }} source={icons.close} />
                    </TouchableOpacity>
                    <View style={{ flex: 0.8, height: '12%', padding: 16, justifyContent: 'space-evenly', alignItems: 'center', flexDirection: "column", overflow: 'hidden' }}>
                        <Text style={{ ...FONTS.h2 }}>{secondToTimeString(destination.time, false)}</Text>
                        <Text style={{ ...FONTS.body3, color: 'grey' }}>{destination.distance} • {Math.floor(curLoc.speed * 10) / 10} m/s</Text>
                    </View>
                </View>
            </View>
        )
    }, [destination])

    let renderMap = () => {
        return (
            <View style={{ flex: 1 }}>
                <LoadingModal modalVisible={loadingModal.modalVisible} text={loadingModal.text} />
                <ConfirmModal modalVisible={confirmModal} icon={icons.reach_destination} text={'Đã đến địa điểm giao hàng!'} onConfirm={() => setConfirmModal(false)} />
                <MapView
                    ref={mapViewRef}
                    style={{ flex: 1 }}
                    provider={PROVIDER_GOOGLE}
                    customMapStyle={ggMapStyle}
                    initialRegion={{
                        longitude: 106.660172,
                        latitude: 10.762622,
                        latitudeDelta: 0.3,
                        longitudeDelta: 0.3
                    }}
                    showsUserLocation={!isInstructionMode}
                    showsMyLocationButton={false}
                    showsCompass={false}
                    showsScale={false}
                    moveOnMarkerPress={false}
                    showsBuildings={false}
                    onUserLocationChange={evt => {
                        const newLoc = evt.nativeEvent.coordinate;
                        setLocation({
                            ...location,
                            curLoc: {
                                ...newLoc
                            }
                        })
                    }}
                >
                    {(destination.coordinate && !destination.reach && destination.direction_points.length > 0) ?
                        <>
                            <Polyline coordinates={destination.direction_points}
                                strokeWidth={isInstructionMode ? 12 : 7}
                                strokeColor='#116ef0'
                            />
                            {DirectionPassLine}
                        </> : ""}
                    <Marker
                        coordinate={kavanoStore.coordinate}
                        title='Cửa hàng Kavano'
                        onPress={(event) => {
                            mapViewRef.current.animateToRegion({
                                ...kavanoStore.coordinate
                            })
                            // console.log(kavanoStore);
                            setDestination({
                                ...kavanoStore,
                                distance: distanceString(getPathLength([curLoc, kavanoStore.coordinate]))
                            });
                        }}
                    >
                        <Image
                            style={{
                                height: 32,
                                width: 32
                            }}
                            source={icons.store}
                        />
                    </Marker>
                    {orders.map(DestinationMarker)}
                    {isInstructionMode ? CurrentMarker : ""}
                </MapView>
                {destination.coordinate != null ?
                    (isInstructionMode ?
                        <React.Fragment>
                            {InstructionHeaderView}
                            {InstructionBottomView}
                        </React.Fragment> :
                        <React.Fragment>
                            {RouteCalcHeader()}
                            {OrderFocusView(destination.order)}
                        </React.Fragment>)
                    : DestinationsScrollViews()}

                <TouchableOpacity
                    style={{ position: 'absolute', top: SIZES.height / 1.82, right: 5 }}
                    activeOpacity={0.7}
                    onPress={() => {
                        mapViewRef.current.animateToRegion({
                            ...kavanoStore.coordinate
                        })
                        setDestination({
                            ...kavanoStore,
                            distance: distanceString(getPathLength([curLoc, kavanoStore.coordinate]))
                        });
                    }}>
                    <View style={styles.circleButton}>
                        <MaterialIcons name="store" size={28} color="black" />
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        renderMap()
    )
}

const styles = StyleSheet.create({
    scrollView: {
        // display: "flex",
        // justifyContent: "space-evenly",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 4,
    },
    content: {
        ...FONTS.body4,
        margin: 4
    },
    card: {
        flex: 1,
        padding: 8,
        elevation: 2,
        flexDirection: 'column',
        backgroundColor: "#FFF",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { x: 2, y: -2 },
        height: SIZES.CARD_HEIGHT,
        width: SIZES.CARD_WIDTH,
        overflow: "hidden"
    },
    destinationFuncBtt: {
        position: 'relative',
        height: 40,
        flexDirection: "row",
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 30,
        alignItems: 'center',
        alignContent: 'center',
        paddingHorizontal: 8,
        marginHorizontal: 2,
        overflow: 'hidden'
    },
    funcImage: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginRight: 4
    },
    transCircle1: {
        width: 48,
        height: 48,
        alignItems: 'center',
        backgroundColor: COLORS.lightblue2Trans,
        borderWidth: 1,
        borderColor: COLORS.lightblue2,
        borderRadius: 50
    },
    circleButton: {
        height: 50,
        width: 50,
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center',
        borderRadius: 24,
        backgroundColor: 'white',
        padding: 8,
        borderWidth: 0.5,
        borderColor: COLORS.lightGray,
        elevation: 1
    }
})


export default OrderDelivery