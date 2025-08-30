/* eslint-disable react-native/no-inline-styles */

import React, {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {Images} from '../../assets';
import styles from './styles';
import i18n from '../../config/translations';
import Icon from 'react-native-vector-icons/Ionicons';
import {CommonActions} from '@react-navigation/native';
import {Client} from 'app-api';
import {setUser} from '../../actions/user';
import jwtDecode from 'jwt-decode';

const YourOrder = ({navigation}) => {
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const user = useSelector(state => state.user);
  const contents = user?.info?.tabs?.orders?.content;
  const data = contents
    ? Object.values(contents).map(order => ({
        Id: order?.order_key || 0,
        Date: order?.date,
        Status: order?.status,
        Total: order?.total,
      }))
    : [];

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      const tokenDecode = jwtDecode(user.token);
      const response = await Client.getUser(tokenDecode.data.user.id);
      dispatch(setUser(response));
      setLoading(false);
    }

    // Call the function
    fetchUserData();
  }, [user.token, dispatch]);

  return (
    <View style={styles.container}>
      <Image source={Images.bannerMyCourse} style={styles.imgBanner} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(CommonActions.goBack())}>
          <Icon name="arrow-back-outline" style={{fontSize: 26}} />
        </TouchableOpacity>

        <Text style={styles.title}>{i18n.t('myOrders.title')}</Text>
        <Text />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator style={{marginTop: 20}} size="small" />
        ) : (
          <>
            {(!data || data.length === 0) && (
              <Text style={styles.noData}>{i18n.t('dataNotFound')} </Text>
            )}
            <View style={styles.wrapper}>
              {data &&
                data.length > 0 &&
                data.map((item, index) => (
                  <View key={'yourOrder' + index} style={styles.inner}>
                    <View style={styles.item}>
                      <Text style={styles.textTitle}>
                        {i18n.t('myOrders.order')}
                      </Text>
                      <Text style={styles.text}>{item.Id}</Text>
                    </View>
                    <View style={styles.item}>
                      <Text style={styles.textTitle}>
                        {i18n.t('myOrders.date')}
                      </Text>
                      <Text style={styles.text}>
                        {item.Date.slice(0, 10).replace(/-/g, '/')}
                      </Text>
                    </View>
                    <View style={styles.item}>
                      <Text style={styles.textTitle}>
                        {i18n.t('myOrders.status')}
                      </Text>
                      <Text style={styles.text}>{item.Status}</Text>
                    </View>
                    <View style={styles.item}>
                      <Text style={styles.textTitle}>
                        {i18n.t('myOrders.total')}
                      </Text>
                      <Text style={styles.text}>{item.Total}</Text>
                    </View>
                  </View>
                ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default YourOrder;
