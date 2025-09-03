import notifee from '@notifee/react-native';
import jwtDecode from 'jwt-decode';
import {DeviceEventEmitter} from 'react-native';
import {Client} from '../../api';
import {saveNotifications} from '../../../actions/notifications';

// Check user's certificates and create local notifications for those expiring within soonThresholdDays.
export async function checkCertificatesAndNotify(store, soonThresholdDays = 7) {
  try {
    const state = store.getState();
    const {user, notifications} = state;
    if (!user?.token) return;

    const tokenDecode = jwtDecode(user.token);
    const userId =
      tokenDecode?.data?.user?.id || tokenDecode?.data?.user_id || tokenDecode?.user_id || tokenDecode?.id;

    if (!userId) return;

    const response = await Client.getCertificates(userId, { per_page: 100, page: 1 });

    if (!Array.isArray(response) || response.length === 0) return;

    const now = Date.now();
    const thresholdMs = soonThresholdDays * 24 * 60 * 60 * 1000;

    const soon = response.filter(cert => {
      const expiresAt = new Date(cert.expiresAt).getTime();
      return expiresAt - now <= thresholdMs && expiresAt - now >= 0;
    });

    if (soon.length === 0) return;

    const newNotifications = soon.map(cert => ({
      id: `cert-${cert.id}`,
      title: 'Certificate expiring',
      message: `${cert.title} expires on ${new Date(cert.expiresAt).toLocaleDateString()}`,
      date: Date.now(),
      cert,
    }));

    // Display up to 3 immediate notifications for presentation
    for (let i = 0; i < Math.min(3, newNotifications.length); i++) {
      const n = newNotifications[i];
      try {
        await notifee.displayNotification({
          title: n.title,
          body: n.message,
          android: { channelId: 'default' },
        });
      } catch (e) {
        // continue if display fails
        // display error ignored in production
      }
    }

    try {
      notifee.incrementBadgeCount(newNotifications.length);
    } catch (e) {
      // ignore
    }

    // Merge with existing notifications in store (prepend new)
    const merged = [...newNotifications, ...(notifications?.list || [])];
    store.dispatch(saveNotifications(merged));

    // Emit an event so UI components can react (same event name used in login simulation)
    DeviceEventEmitter.emit('fakeCertificatesExpiring', { count: newNotifications.length, items: soon });
  } catch (e) {
    // error ignored (dev-only)
  }
}
