import {SITE_URL} from '../config';

const DEEP_LINKING = {
  prefixes: [SITE_URL, 'edumaapp://'],
  config: {
    screens: {
      HomeTabScreen: {
        screens: {
          HomeScreen: 'home',
          Courses: 'courses',
          MyCourse: 'my-course',
          Wishlist: 'wishlist',
          ProfileStackScreen: {
            screens: {
              ProfileScreen: 'profile',
              SettingsScreen: 'settings',
              YourOrderScreen: 'my-order',
              YourCoursesScreen: 'my-courses',
            },
          },
        },
      },
      CoursesDetailsScreen: {
        path: 'courses/:id',
      },
      NotificationsScreen: 'notifications',
    },
  },
};
export default DEEP_LINKING;
