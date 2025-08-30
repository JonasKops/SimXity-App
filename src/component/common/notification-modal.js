import BottomHalf from './modal/bottom-half';
import {View, Text, TouchableOpacity, Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSelector, useDispatch} from 'react-redux';
import {setTimeShowPopup} from '../../actions/notifications';

const NotificationModal = ({isVisible}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const notifications = useSelector(state => state.notifications);

  const isShowModal =
    isVisible &&
    notifications.enable &&
    notifications.timeShowPopup < Date.now();

  const onClose = () => {
    // After 10 days
    dispatch(setTimeShowPopup(Date.now() + 10 * 24 * 60 * 60 * 1000));
  };

  return (
    <BottomHalf
      isVisible={isShowModal}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}>
      <View>
        <View
          style={{
            marginTop: 8,
            alignSelf: 'center',
            width: 40,
            height: 4,
            backgroundColor: '#e5e7eb',
            borderRadius: 5,
          }}
        />
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 16,
            marginBottom: 10,
            paddingTop: 20,
          }}>
          {t('notificationModal.title')}
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins',
            color: '#666',
            marginBottom: 20,
          }}>
          {t('notificationModal.description')}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginBottom: 20,
          }}>
          <TouchableOpacity
            onPress={() => Linking.openSettings()}
            style={{
              backgroundColor: '#222',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 5,
            }}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Poppins-Medium',
                fontSize: 14,
              }}>
              {t('notificationModal.openSettings')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#e5e7eb',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 5,
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 14,
                color: '#222',
              }}>
              {t('notificationModal.close')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomHalf>
  );
};

export default NotificationModal;
