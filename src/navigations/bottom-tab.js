/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import * as React from 'react';
import {View, Image, Dimensions, Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Images} from 'app-assets';
import i18next from '../config/translations';

import Home from '../screens/home';
import Courses from '../screens/courses';
import MyCourse from '../screens/my-course';  
import Wishlist from '../screens/wishlist';
import MyCertificate from '../screens/my-certificates';  
import Profile from '../screens/profile';
import YourOrder from '../screens/your-order';
import YourCourses from '../screens/your-courses';
import PilotRanking from '../screens/pilot-ranking';
import {useSelector} from 'react-redux';
import i18n from '../config/translations';

const deviceWidth = Dimensions.get('window').width;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="HomeMain" screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeMain" component={Home} />
    </Stack.Navigator>
  );
}

export default function BottomTabNavigator() {
  const {language} = useSelector(state => state.language);

  // keep i18n in sync when language changes; avoid extra state/timeouts
  React.useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const TAB_SCREENS = [
    {
      name: 'HomeTab',
      component: HomeStack,
      icon: Images.iconTabHome,
      label: i18next.t('bottomNavigation.home'),
    },
    // Leaderboard is a hidden tab so it does not show a button in the tab bar but
    // can still be navigated to as its own tab (so Home won't be selected).
    {
      name: 'LeaderboardTab',
      component: PilotRanking,
      icon: Images.iconTabPilot,
      label: i18next.t('bottomNavigation.pilot') || 'Pilots ranking',
      hide: true,
    },
    {
      name: 'Courses',
      component: Courses,
      icon: Images.iconTabCoures,
      label: i18next.t('bottomNavigation.courses'),
    },
    {
      name: 'MyCourse',
      component: MyCourse,
      icon: Images.iconTabMyCourse,
      label: i18next.t('bottomNavigation.myCourse'),
    },
    {
      name: 'Wishlist',
      component: Wishlist,
      icon: Images.iconWishlist,
      label: i18next.t('bottomNavigation.wishlist'),
    },
    {
      name: 'MyCertificate',
      component: MyCertificate,
      icon: Images.iconTabCertificates,
      label: i18next.t('bottomNavigation.myCertificate'),
    },
    {
      name: 'ProfileStackScreen',
      component: ProfileStack,
      icon: Images.iconTabProfile,
      label: i18next.t('bottomNavigation.profile'),
    },
  ];
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        lazy: false,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#000',
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderColor: 'transparent',
          position: 'absolute',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 10,
        },
      }}>
      {TAB_SCREENS.map((item, index) => {
        const baseOptions = {
          tabBarLabel: ({focused, color, position}) => (
            <TabBarLabel
              focused={focused}
              color={color}
              label={item.label}
              position={position}
            />
          ),
          tabBarIcon: ({focused, color}) => (
            <TabBarIcon focused={focused} icon={item.icon} color={color} />
          ),
        };
        const options = item.hide
          ? {...baseOptions, tabBarButton: () => null}
          : baseOptions;

        return (
          <Tab.Screen key={index} name={item.name} component={item.component} options={options} />
        );
      })}
    </Tab.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileScreen"
      presentation="card"
      screenOptions={{
        gesturesEnabled: true,
        headerTintColor: '#000',
        headerBackTitle: '',
        headerShown: false,
      }}>
      <Stack.Screen name="ProfileScreen" component={Profile} />
      <Stack.Screen name="YourOrderScreen" component={YourOrder} />
      <Stack.Screen name="YourCoursesScreen" component={YourCourses} />
    </Stack.Navigator>
  );
}

function TabBarLabel({focused, color, label, position}) {
  return (
    <Text
      style={{
        fontSize: deviceWidth < 600 ? 10 : 12,
        lineHeight: 15,
        textAlign: 'center',
        color: color || '#D1D1D1',
        zIndex: 100,
        marginLeft: position === 'beside-icon' ? 15 : 0,
      }}>
      {label}
    </Text>
  );
}

function TabBarIcon({focused, icon, color}) {
  return (
    <View>
      {deviceWidth < 600 && focused && (
        <Image
          source={Images.iconTabActive}
          style={{
            width: deviceWidth / 8,
            height: 3,
            position: 'absolute',
            alignSelf: 'center',
          }}
          resizeMode="contain"
        />
      )}
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image
          source={icon}
          style={{
            width: 20,
            height: 18,
            resizeMode: 'contain',
            position: 'relative',
            tintColor: color || '#D1D1D1',
          }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
