import React from 'react';
import OrderDelivery from './screens/OrderDelivery';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import Login from './screens/Login';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import PersonalInfo from './screens/PersonalInfo';
import { COLORS } from './constants/theme';
import ConfirmOrders from './screens/MyOrders/ConfirmOrders';
import DeliverOrders from './screens/MyOrders/DeliverOrders';
import CompleteOrders from './screens/MyOrders/CompleteOrders';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FinnishOrder from './screens/FinnishOrder';
import Messenger from './screens/Messenger';
import Chat from './screens/Chat';

const TopTab = createMaterialTopTabNavigator();
function MyOrders() {
  return (
    <TopTab.Navigator>
      <TopTab.Screen name="ConfirmOrder" component={ConfirmOrders} options={{ title: 'Chờ lấy hàng' }} />
      <TopTab.Screen name="DeliverOrder" component={DeliverOrders} options={{ title: 'Đang giao' }} />
      <TopTab.Screen name="CompleteOrder" component={CompleteOrders} options={{ title: 'Hoàn thành' }} />
    </TopTab.Navigator>
  );
}

const BottomTab = createBottomTabNavigator();
function MainTabScreen() {
  return (
    <BottomTab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        let icon;
        if (route.name === 'OrderDelivery') {
          iconName = 'delivery-dining'
          color = focused ? COLORS.lightblue : COLORS.darkgray
          icon = <MaterialIcons name={iconName} size={size} color={color} />;
        } else if (route.name === 'PersonalInfo') {
          iconName = 'person-circle'
          color = focused ? COLORS.lightblue : COLORS.darkgray
          icon = <Ionicons name={iconName} size={size} color={color} />
        } else if (route.name === 'MyOrders') {
          iconName = 'box'
          color = focused ? COLORS.lightblue : COLORS.darkgray
          icon = <Entypo name={iconName} size={size} color={color} />
        } else if (route.name === 'Messenger') {
          color = focused ? COLORS.lightblue : COLORS.darkgray
          icon = <MaterialIcons name="message" size={size} color={color} />
        }
        // You can return any component that you like here!
        return icon
      },
      tabBarActiveTintColor: COLORS.lightblue,
      tabBarInactiveTintColor: 'gray',
    })}>
      <BottomTab.Screen name='OrderDelivery' component={OrderDelivery} options={{ title: 'Giao hàng', headerShown: false, animation: 'fade', animationTypeForReplace: 'push' }} />
      <BottomTab.Screen name='MyOrders' component={MyOrders} options={{ title: 'Đơn hàng', animation: 'fade', animationTypeForReplace: 'push' }} />
      <BottomTab.Screen name='Messenger' component={Messenger} options={{ title: 'Tin nhắn', animation: 'fade', animationTypeForReplace: 'push' }} />
      <BottomTab.Screen name='PersonalInfo' component={PersonalInfo} options={{ title: 'Hồ sơ', animation: 'fade', animationTypeForReplace: 'push' }} />
    </BottomTab.Navigator>
  )
}

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name='Login' component={Login} options={{ title: 'Đăng nhập', animation: 'slide_from_right' }} />
          <Stack.Screen name='MainTabScreen' component={MainTabScreen} options={{ headerShown: false, animation: 'fade', animationTypeForReplace: 'push' }} />
          <Stack.Screen name='Chat' component={Chat} options={{ animation: 'slide_from_right', animationTypeForReplace: 'push' }} />
          <Stack.Screen name='FinnishOrder' component={FinnishOrder} options={{ title: 'Thu tiền', animation: 'slide_from_right', animationTypeForReplace: 'push' }} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
