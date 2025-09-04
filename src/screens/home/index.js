import React, {PureComponent} from 'react';
import {
  DeviceEventEmitter,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {withTranslation} from 'react-i18next';
import {Images} from 'app-assets';
import {connect} from 'react-redux';
import {
  ProgressCircle,
  PopularCourses,
  LearnToday,
  Instructor,
} from 'app-component';
import {Client} from 'app-api';
import styles from './styles';
import SkeletonFlatList from '../../component/common/skeleton/flatlist';
import SkeletonCategory from '../../component/common/skeleton/category';

const deviceWidth = Dimensions.get('window').width;

class Home extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataInstructor: [],
      dataOverview: {},
      dataNewCourse: [],
      dataCate: [],
      topCourseWithStudent: [],
      loading1: true,
      loading2: true,
      loading3: true,
      loading4: true,
    };

    this.eventListener = null;

    // Static sample pilots (would normally come from API or redux)
    this.topPilots = [
      {id: 4, name: 'Cloud Walker', airportCount: 120},
      {id: 2, name: 'Captain Sky', airportCount: 85},
      {id: 6, name: 'Sky Explorer', airportCount: 67},
    ];
  }

  async componentDidMount() {
    this.eventListener = DeviceEventEmitter.addListener(
      'refresh_overview',
      this.refreshOverview,
    );
    this.onGetData();
  }

  componentWillUnmount() {
    if (this.eventListener) {
      this.eventListener.remove();
    }
  }

  async onGetData() {
    const param = {
      roles: ['lp_teacher', 'administrator'],
    };

    const {user} = this.props;

    if (user?.overview) {
      Client.getOverview(user.overview).then(response => {
        this.setState({
          dataOverview: response,
        });
      });
    }
    Client.topCoursesWithStudent().then(response => {
      this.setState({
        topCourseWithStudent: response,
        loading2: false,
      });
    });
    Client.newCourses().then(response => {
      this.setState({
        dataNewCourse: response,
        loading3: false,
      });
    });
    Client.getCategoryHome().then(response => {
      this.setState({
        dataCate: response,
        loading1: false,
      });
    });
    Client.getIntructor(param).then(response => {
      this.setState({
        dataInstructor: response,
        loading4: false,
      });
    });
  }

  refreshOverview = async () => {
    const {user} = this.props;

    if (user?.overview) {
      const response = await Client.getOverview(user.overview);
      this.setState({dataOverview: response});
    }
  };

  onBack = () => {
    const {navigation} = this.props;
    navigation.goBack();
  };

  onRefresh = async () => {
    this.setState({
      refreshing: true,
      loading1: true,
      loading2: true,
      loading3: true,
      loading4: true,
    });
    await this.onGetData();
    this.setState({refreshing: false});
  };

  getRankByAirports = count => {
    if (count >= 100) return {level: 'World-class Pilot', color: '#FF6B6B'};
    if (count >= 50) return {level: 'Experienced Pilot', color: '#4ECDC4'};
    if (count >= 25) return {level: 'Advanced Pilot', color: '#45B7D1'};
    if (count >= 10) return {level: 'Junior Pilot', color: '#96CEB4'};
    return {level: 'Rookie Pilot', color: '#FFEAA7'};
  };

  getMedal = rank => {
    if (rank === 1) return {emoji: '🥇'};
    if (rank === 2) return {emoji: '🥈'};
    if (rank === 3) return {emoji: '🥉'};
    return {emoji: '🏅'};
  };

  render() {
    const {
      dataInstructor,
      dataOverview,
      topCourseWithStudent,
      dataNewCourse,
      dataCate,
      refreshing,
      loading1,
      loading2,
      loading3,
      loading4,
    } = this.state;

    const {t, navigation, user, notifications} = this.props;

    const isTablet = deviceWidth >= 768;

    return (
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 150}}>
          <Image source={Images.bannerHome} style={styles.imgBanner} />
          <View style={styles.header}>
            <Image source={Images.iconHome} style={styles.iconHome} />
            {!user?.token ? (
              <View style={styles.loginRegister}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('LoginScreen')}>
                  <Text style={styles.loginRegisterText}>{t('login')}</Text>
                </TouchableOpacity>
                <Text style={styles.loginRegisterIcon}>|</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('RegisterScreen')}>
                  <Text style={styles.loginRegisterText}>{t('register')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('NotificationsScreen')}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  style={styles.iconNotification}>
                  <Image
                    source={Images.iconNotification}
                    style={styles.iconHeader}
                  />
                  {notifications?.list[0]?.notification_id &&
                    notifications.list[0].notification_id >
                      notifications?.lastID && <View style={styles.dot} />}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {user?.token && (
            <View
              style={{
                paddingHorizontal: 16,
                marginTop: 16,
              }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileStackScreen')}
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  style={styles.avatar}
                  source={{
                    uri:
                      user?.info?.avatar_url ||
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMjCj43UJiVu-3Qp9b5yj-SwLGR-kndCzqLaiMv5SMkITd4CcbQQ7vX_CEZd-xxqka8ZM&usqp=CAU',
                  }}
                />
                <View style={{marginLeft: 15}}>
                  <Text style={styles.fullname}>{user?.info?.name}</Text>
                  {user?.info?.email && (
                    <Text style={styles.email}>{user.info.email}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}

          {user?.token && (
            <View style={isTablet ? styles.topPilotsRowTablet : styles.topPilotsRow}>
              {this.topPilots.slice(0, 3).map((p, idx) => {
                const rankInfo = this.getRankByAirports(p.airportCount);
                const medal = this.getMedal(idx + 1);
                const level = rankInfo.level;
                const shortLabel = level.startsWith('World')
                  ? 'World-class'
                  : level.startsWith('Experienced')
                  ? 'Experienced'
                  : level.startsWith('Advanced')
                  ? 'Advanced'
                  : level.startsWith('Junior')
                  ? 'Junior'
                  : 'Rookie';
                const pillColor = level.startsWith('World')
                  ? '#F46647'
                  : level.startsWith('Experienced')
                  ? '#4ECDC4'
                  : level.startsWith('Advanced')
                  ? '#45B7D1'
                  : level.startsWith('Junior')
                  ? '#96CEB4'
                  : '#FFEAA7';

                if (isTablet) {
                  return (
                    <TouchableOpacity key={p.id} style={styles.pilotCardInline} onPress={() => navigation.navigate('LeaderboardTab')} activeOpacity={0.8}>
                      <View style={styles.pilotInfo}>
                        <Text style={styles.medalEmoji}>{medal.emoji}</Text>
                        <View style={styles.pilotTextWrap}>
                          <Text style={styles.pilotNameInline} numberOfLines={1}>{p.name}</Text>
                          <Text style={styles.pilotAirportsInline}>{p.airportCount} Airports</Text>
                        </View>
                      </View>
                      <View style={[styles.rankBadge,{backgroundColor: pillColor}]}> 
                        <Text style={styles.rankBadgeText}>{shortLabel}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity key={p.id} style={styles.pilotCardVertical} onPress={() => navigation.navigate('LeaderboardTab')} activeOpacity={0.85}>
                    <View style={styles.medalStack}>
                      <Text style={styles.medalEmojiLarge}>{medal.emoji}</Text>
                    </View>
                    <Text style={styles.pilotNameCard} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.pilotAirportsCard}>{p.airportCount} Airports</Text>
                    <View style={[styles.rankPillCard, {backgroundColor: pillColor}]}> 
                      <Text style={styles.rankPillCardText}>{shortLabel}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {user?.token && dataOverview?.id && (
            <View style={styles.overview}>
              <Text style={styles.overTitle}>{t('home.overview.title')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 16,
                }}>
                <ProgressCircle
                  widthX={77}
                  progress={
                    Math.round(dataOverview.course_data?.result?.result) / 100
                  }
                  strokeWidth={8}
                  backgroundColor="#F6F6F6"
                  progressColor="#958CFF"
                />
                <View style={{marginLeft: 24}}>
                  <View style={styles.viewItem}>
                    <Image
                      source={Images.iconLession}
                      style={styles.iconItem}
                    />
                    <View>
                      <Text style={styles.txtItem}>{t('lesson')}</Text>
                      <View style={styles.line}>
                        <View
                          style={[
                            styles.progress,
                            {
                              width: `${
                                (dataOverview.course_data?.result?.items?.lesson
                                  ?.completed /
                                  dataOverview.course_data?.result?.items
                                    ?.lesson?.total) *
                                100
                              }%`,
                              backgroundColor: '#FFD336',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.viewItem}>
                    <Image source={Images.iconQuiz} style={styles.iconItem} />
                    <View>
                      <Text style={styles.txtItem}>{t('quiz')}</Text>
                      <View style={styles.line}>
                        <View
                          style={[
                            styles.progress,
                            {
                              width: `${
                                (dataOverview.course_data?.result?.items?.quiz
                                  ?.completed /
                                  dataOverview.course_data?.result?.items?.quiz
                                    ?.total) *
                                100
                              }%`,
                              backgroundColor: '#41DBD2',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  {dataOverview.course_data?.result?.items?.assignment?.total >
                    0 && (
                    <View style={styles.viewItem}>
                      <Image
                        source={Images.iconAssignment}
                        style={styles.iconItem}
                      />
                      <View>
                        <Text style={styles.txtItem}>{t('assignment')}</Text>
                        <View style={styles.line}>
                          <View
                            style={[
                              styles.progress,
                              {
                                width: `${
                                  (dataOverview.course_data?.result?.items
                                    ?.assignment?.completed /
                                    dataOverview.course_data?.result?.items
                                      ?.assignment?.total) *
                                  100
                                }%`,
                                backgroundColor: '#958CFF',
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('CoursesDetailsScreen', {
                    id: dataOverview.id,
                  })
                }
                style={{marginTop: 16}}>
                <Text
                  numberOfLines={1}
                  style={styles.overTitle}>
                  {dataOverview?.name}
                </Text>
                <Text style={styles.txt1}>
                  {dataOverview?.sections.length}{' '}
                  {dataOverview?.sections.length > 1
                    ? t('home.overview.sections').toUpperCase()
                    : t('home.overview.section').toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {topCourseWithStudent && topCourseWithStudent.length > 0 && (
            <View style={styles.viewList}>
              <Text style={styles.titleList}>{t('home.popular')}</Text>
              <PopularCourses
                navigation={navigation}
                contentContainerStyle={{paddingHorizontal: 16}}
                data={topCourseWithStudent}
                horizontal
              />
            </View>
          )}
          {loading2 && (
            <View style={styles.viewList}>
              <Text style={styles.titleList}>{t('home.popular')}</Text>
              <SkeletonFlatList />
            </View>
          )}
          {dataNewCourse && dataNewCourse.length > 0 && (
            <View style={styles.viewList}>
              <Text style={styles.titleList}>{t('home.new')}</Text>
              <PopularCourses
                navigation={navigation}
                contentContainerStyle={{paddingHorizontal: 16}}
                data={dataNewCourse}
                horizontal
              />
            </View>
          )}
          {loading3 && (
            <View style={styles.viewList}>
              <Text style={styles.titleList}>{t('home.new')}</Text>
              <SkeletonFlatList />
            </View>
          )}

          {dataInstructor && dataInstructor.length > 0 && (
            <View style={styles.viewList}>
              <Text style={[styles.titleList, {marginBottom: 8}]}>
                {t('instructor')}
              </Text>

              <Instructor
                navigation={navigation}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                }}
                data={dataInstructor}
                horizontal
              />
            </View>
          )}
          {loading4 && (
            <View style={styles.viewList}>
              <Text style={[styles.titleList, {marginBottom: 8}]}>
                {t('instructor')}
              </Text>
              <SkeletonFlatList
                itemStyles={{
                  height: 80,
                  borderRadius: 10,
                }}
              />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}
const mapStateToProps = ({user, notifications}) => ({
  user,
  notifications,
});
const mapDispatchToProps = dispatch => ({dispatch});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(Home));
