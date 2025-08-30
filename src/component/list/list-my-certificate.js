/* eslint-disable no-param-reassign */
import React, { useReducer, useRef, forwardRef, memo } from 'react';
import { Dimensions, FlatList, Animated } from 'react-native';
import { ItemMyCertificate } from 'app-component';

const { width } = Dimensions.get('window');

const FlatListAnimated = Animated.createAnimatedComponent(FlatList);
const ListMyCertificate = memo(
  forwardRef((props, ref) => {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const flatList = useRef();
    let onEndReachedCalledDuringMomentum = true;
    const {
      data,
      style,
      horizontal,
      showFooter,
      refreshing,
      refreshScreen,
      contentContainerStyle,
      scrollEnabled,
      ListEmptyComponent,
      navigation,
      nextPage,
      extraData,
      onRefresh,
    } = props;

    const renderItem = ({ item }) => {
      return <ItemMyCertificate item={item} navigation={navigation} />;
    };

    const keyExtractor = (item) => String(item?.id);

    const onEndReached = () => {
      if (!onEndReachedCalledDuringMomentum) {
        if (!data) return;
        if (data.length === 0) return;
        if (nextPage) nextPage();
      }
    };

    const ListFooter = () => {
      //if (showFooter) return <ActivityIndicator size="small" />;
      return null;
    };

    return (
      <FlatListAnimated
        ref={flatList}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={contentContainerStyle}
        style={style}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshScreen}
        refreshing={refreshing}
        data={data}
        extraData={extraData}
        renderItem={renderItem}
        onEndReached={onEndReached}
        keyExtractor={keyExtractor} // Performance purpose
        removeClippedSubviews
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmptyComponent}
        scrollEventThrottle={1}
        numColumns={width > 600 ? 2 : 1}
      />
    );
  }),
  () => false
);
export default ListMyCertificate;
