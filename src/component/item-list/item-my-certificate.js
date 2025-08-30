/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { withTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import styles from './styles/item-my-certificate';

class ItemMyCertificate extends PureComponent {
  onNavigateDetail = (item) => {
    const { navigation } = this.props;
    navigation.navigate('CertificateDetailsScreen', { id: item.id });
  };

  render() {
    const { t, item } = this.props;
    const categories =
      item.categories.length > 0
        ? item.categories.map((x) => x.name).join(', ')
        : null;
   return (
      <TouchableOpacity
        onPress={() => this.onNavigateDetail(item)}
        style={styles.container}
      >
        <FastImage source={{ uri: item.image }} style={styles.image} />
        <View style={styles.viewContent}>
          {categories && (
            <Text numberOfLines={1} style={styles.content}>
              {categories}
            </Text>
          )}
          <Text style={styles.txt1} numberOfLines={1}>
            {item.course_title}
          </Text>

          <View>
            {
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={styles.txtProgress}>
                  {t('myCertificates.issued')}
                </Text>
                <Text style={[styles.txtProgress, { color: '#939393' }]}>
					{item.issued_date.slice(0, 10).replace(/-/g, '/')}
                </Text>				
              </View>
            }
          </View>
		  
          <View>
            {
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={styles.txtProgress}>
                  {t('myCertificates.expires')}  	
                </Text>


                {item.expire_date && item.expire_date.length > 0 && (
                    <Text style={[styles.txtProgress, { color: '#939393' }]}>              
                      {item.expire_date.slice(0, 10).replace(/-/g, '/')}
                    </Text>
                )}

              </View>
            }
          </View>		  

        </View>
      </TouchableOpacity>
    );
  }
}
export default withTranslation()(ItemMyCertificate);
