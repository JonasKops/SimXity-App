import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Client} from 'app-api';
import {useTranslation} from 'react-i18next';
import notifee from '@notifee/react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Images} from 'app-assets';
import {
  saveNotifications as saveStoreNotifications,
  setLastIDNotifications,
} from '../../actions/notifications';
import styles from './styles';

export default function Notifications({navigation}) {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const notifications = useSelector(state => state.notifications);

  const [lastID, setLastId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFooter, setShowFooter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [isScrollEnd, setIsScrollEnd] = useState(false);

  useEffect(() => {
    setLastId(notifications?.lastID || 0);

    if (notifications?.list.length > 0) {
      saveNotifications(notifications?.list);
    }

    fetchNotifications();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (page > totalPages) {
          return;
        }

        if (!loadingMore && !refreshing) {
          return;
        }

        if (loadingMore) {
          setShowFooter(true);
        }

        await fetchNotifications();
      } catch (e) {
        setError(e.message || t('reviews.error'));
      }

      setRefreshing(false);
      setLoadingMore(false);
      setShowFooter(false);
    })();

    notifee.setBadgeCount(0);
  }, [refreshing, loadingMore]);

  function saveNotifications(data) {
    setData(data);
    dispatch(saveStoreNotifications(data || []));
    dispatch(setLastIDNotifications(data[0]?.notification_id || 0));
  }

  async function fetchNotifications() {
    const response = await Client.getNotifications({
      per_page: 20,
      page,
    });

    if (response?.success) {
      if (page === 1) {
        saveNotifications(response?.data?.notifications || []);
      } else {
        saveNotifications(data.concat(response?.data?.notifications || []));
      }
      if (response?.data?.total) {
        setTotalPages(Math.ceil(response?.data?.total / 15));
      }
    } else {
      saveNotifications([]);
    }
  }

  const handleRefresh = React.useCallback(async () => {
    saveNotifications([]);
    setRefreshing(true);
    setLoadingMore(false);
    setPage(1);
  }, []);

  function handleLoadMore(d) {
    if (!isScrollEnd) {
      return;
    }

    if (loadingMore || refreshing) {
      return;
    }

    if (!data || data.length <= 0) {
      return;
    }

    setLoadingMore(true);
    setPage(page + 1);

    setIsScrollEnd(false);
  }

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => (item?.source ? Linking.openURL(item.source) : null)}
        style={[
          styles.itemContainer,
          {
            backgroundColor:
              item?.notification_id && parseInt(item.notification_id) > lastID
                ? '#f1f5f9'
                : '#fff',
          },
        ]}>
        {item.image && (
          <FastImage source={{uri: item.image}} style={styles.itemImage} />
        )}
        <View style={styles.itemContentContainer}>
          {item.title ? (
            <Text style={styles.itemTitle}>{item.title}</Text>
          ) : null}
          <Text style={styles.itemContent}>{item.content}</Text>
          <Text style={styles.itemTime}>{item.date_created || ''}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Image source={Images.bannerMyCourse} style={styles.imgBanner} />
      <View style={styles.header}>
        <View style={styles.header1}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
            <Image source={Images.iconBack} style={styles.iconBack} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('notification.title')}</Text>
        </View>
      </View>

      {error ? (
        <Text
          style={[styles.dataNotFound, {alignSelf: 'center', marginTop: 50}]}>
          {error}
        </Text>
      ) : (
        <>
          {!refreshing && data.length === 0 ? (
            <Text
              style={[
                styles.dataNotFound,
                {alignSelf: 'center', marginTop: 50},
              ]}>
              {t('notification.empty')}
            </Text>
          ) : (
            <View style={styles.listContainer}>
              <FlatList
                contentContainerStyle={{paddingBottom: 30}}
                removeClippedSubviews={false}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal={false}
                refreshing={refreshing}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor="#000"
                    progressViewOffset={30}
                  />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                onScrollBeginDrag={() => {
                  setIsScrollEnd(true);
                }}
                onMomentumScrollBegin={() => {
                  setIsScrollEnd(true);
                }}
                ListFooterComponent={() =>
                  showFooter ? (
                    <View
                      style={{
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <ActivityIndicator size="small" color="#000" />
                    </View>
                  ) : null
                }
                scrollEnabled={true}
                scrollEventThrottle={1}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}
