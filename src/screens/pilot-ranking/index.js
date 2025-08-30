import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import i18n from '../../config/translations';
import { getStatusBarHeight } from 'app-common';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {Images} from 'app-assets';
import { addPilotAirport, addPilotBadge, setPilotData } from '../../actions/pilot';

const PilotRankingGame = ({t, pilot, addPilotAirport, addPilotBadge, setPilotData}) => {
  const [pilots, setPilots] = useState([]);
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 70; // adjust if your tab bar is taller
  const [currentUser, setCurrentUser] = useState({id: 1, name: 'Your Pilot'});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAirport, setNewAirport] = useState('');
  const [userAirports, setUserAirports] = useState([]); // local mirror for immediate UI updates
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [userBadges, setUserBadges] = useState([]); // local mirror
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  useEffect(() => {
    const samplePilots = [
      {id: 1, name: 'Your Pilot', airportCount: 15, airports: ['FRA', 'MUC', 'DUS', 'HAM', 'TXL']},
      {id: 2, name: 'Captain Sky', airportCount: 85, airports: []},
      {id: 3, name: 'Ace Navigator', airportCount: 42, airports: []},
      {id: 4, name: 'Cloud Walker', airportCount: 120, airports: []},
      {id: 5, name: 'Wing Commander', airportCount: 28, airports: []},
      {id: 6, name: 'Sky Explorer', airportCount: 67, airports: []},
    ];

    setPilots(samplePilots.sort((a, b) => b.airportCount - a.airportCount));
    setUserAirports(samplePilots[0].airports);
    // initialize pilot data in redux (won't overwrite persisted data if exists)
    setPilotData({airports: samplePilots[0].airports, badges: []});
    setTimeout(() => checkAndAwardBadges(samplePilots[0].airports), 100);
  }, []);

  const worldAirports = [
    {code: 'FRA', name: 'Frankfurt am Main', city: 'Frankfurt', country: 'Deutschland', continent: 'Europa'},
    {code: 'MUC', name: 'München Franz Josef Strauß', city: 'München', country: 'Deutschland', continent: 'Europa'},
    {code: 'DUS', name: 'Düsseldorf', city: 'Düsseldorf', country: 'Deutschland', continent: 'Europa'},
    {code: 'TXL', name: 'Berlin Tegel', city: 'Berlin', country: 'Deutschland', continent: 'Europa'},
    {code: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Deutschland', continent: 'Europa'},
    {code: 'HAM', name: 'Hamburg', city: 'Hamburg', country: 'Deutschland', continent: 'Europa'},
    {code: 'CGN', name: 'Köln/Bonn', city: 'Köln', country: 'Deutschland', continent: 'Europa'},
    {code: 'STR', name: 'Stuttgart', city: 'Stuttgart', country: 'Deutschland', continent: 'Europa'},
    {code: 'LHR', name: 'London Heathrow', city: 'London', country: 'Großbritannien', continent: 'Europa'},
    {code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'Frankreich', continent: 'Europa'},
    {code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Niederlande', continent: 'Europa'},
    {code: 'FCO', name: 'Rom Fiumicino', city: 'Rom', country: 'Italien', continent: 'Europa'},
    {code: 'MAD', name: 'Madrid Barajas', city: 'Madrid', country: 'Spanien', continent: 'Europa'},
    {code: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona', country: 'Spanien', continent: 'Europa'},
    {code: 'ZUR', name: 'Zürich', city: 'Zürich', country: 'Schweiz', continent: 'Europa'},
    {code: 'VIE', name: 'Wien Schwechat', city: 'Wien', country: 'Österreich', continent: 'Europa'},
    {code: 'CPH', name: 'Kopenhagen Kastrup', city: 'Kopenhagen', country: 'Dänemark', continent: 'Europa'},
    {code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Schweden', continent: 'Europa'},
    {code: 'JFK', name: 'New York John F. Kennedy', city: 'New York', country: 'USA', continent: 'Nordamerika'},
    {code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', continent: 'Nordamerika'},
    {code: 'ORD', name: "Chicago O'Hare", city: 'Chicago', country: 'USA', continent: 'Nordamerika'},
    {code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', continent: 'Nordamerika'},
    {code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', continent: 'Nordamerika'},
    {code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Kanada', continent: 'Nordamerika'},
    {code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Kanada', continent: 'Nordamerika'},
    {code: 'NRT', name: 'Tokio Narita', city: 'Tokio', country: 'Japan', continent: 'Asien'},
    {code: 'ICN', name: 'Seoul Incheon', city: 'Seoul', country: 'Südkorea', continent: 'Asien'},
    {code: 'PEK', name: 'Peking Capital', city: 'Peking', country: 'China', continent: 'Asien'},
    {code: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'China', continent: 'Asien'},
    {code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China', continent: 'Asien'},
    {code: 'SIN', name: 'Singapur Changi', city: 'Singapur', country: 'Singapur', continent: 'Asien'},
    {code: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand', continent: 'Asien'},
    {code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', continent: 'Asien'},
    {code: 'DEL', name: 'Delhi Indira Gandhi', city: 'Delhi', country: 'Indien', continent: 'Asien'},
    {code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australien', continent: 'Ozeanien'},
    {code: 'MEL', name: 'Melbourne Tullamarine', city: 'Melbourne', country: 'Australien', continent: 'Ozeanien'},
    {code: 'AKL', name: 'Auckland', city: 'Auckland', country: 'Neuseeland', continent: 'Ozeanien'},
    {code: 'CAI', name: 'Kairo International', city: 'Kairo', country: 'Ägypten', continent: 'Afrika'},
    {code: 'JNB', name: 'Johannesburg OR Tambo', city: 'Johannesburg', country: 'Südafrika', continent: 'Afrika'},
    {code: 'CPT', name: 'Kapstadt International', city: 'Kapstadt', country: 'Südafrika', continent: 'Afrika'},
    {code: 'LOS', name: 'Lagos Murtala Muhammed', city: 'Lagos', country: 'Nigeria', continent: 'Afrika'},
    {code: 'GRU', name: 'São Paulo Guarulhos', city: 'São Paulo', country: 'Brasilien', continent: 'Südamerika'},
    {code: 'GIG', name: 'Rio de Janeiro Galeão', city: 'Rio de Janeiro', country: 'Brasilien', continent: 'Südamerika'},
    {code: 'EZE', name: 'Buenos Aires Ezeiza', city: 'Buenos Aires', country: 'Argentinien', continent: 'Südamerika'},
    {code: 'BOG', name: 'Bogotá El Dorado', city: 'Bogotá', country: 'Kolumbien', continent: 'Südamerika'},
    {code: 'LIM', name: 'Lima Jorge Chávez', city: 'Lima', country: 'Peru', continent: 'Südamerika'},
    {code: 'SCL', name: 'Santiago Arturo Merino Benítez', city: 'Santiago', country: 'Chile', continent: 'Südamerika'},
  ];

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = worldAirports
        .filter(airport =>
          airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          airport.country.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 10);
      setFilteredAirports(filtered);
    } else {
      setFilteredAirports([]);
    }
  }, [searchTerm]);

  // Persisting pilot data is handled by redux-persist now; local mirrors will be synced from redux below

  // Sync redux pilot -> local UI mirrors when store updates
  useEffect(() => {
    if (pilot) {
      if (Array.isArray(pilot.airports)) setUserAirports(pilot.airports);
      if (Array.isArray(pilot.badges)) setUserBadges(pilot.badges);
    }
  }, [pilot]);

  const availableBadges = [
    {id: 'europa', name: 'Europe Explorer', icon: '🇪🇺', description: 'Visited 5 airports in Europe', type: 'continent', requirement: 5, continent: 'Europa'},
    {id: 'asien', name: 'Asia Adventurer', icon: '🏯', description: 'Visited 5 airports in Asia', type: 'continent', requirement: 5, continent: 'Asien'},
    {id: 'nordamerika', name: 'America Master', icon: '🗽', description: 'Visited 3 airports in North America', type: 'continent', requirement: 3, continent: 'Nordamerika'},
    {id: 'afrika', name: 'Africa Pioneer', icon: '🦁', description: 'Visited 2 airports in Africa', type: 'continent', requirement: 2, continent: 'Afrika'},
    {id: 'suedamerika', name: 'South America Scout', icon: '🌎', description: 'Visited 2 airports in South America', type: 'continent', requirement: 2, continent: 'Südamerika'},
    {id: 'ozeanien', name: 'Oceania Discoverer', icon: '🏄', description: 'Visited 1 airport in Oceania', type: 'continent', requirement: 1, continent: 'Ozeanien'},
    {id: 'erstflug', name: 'First Flight', icon: '🛫', description: 'Visited your first airport', type: 'milestone', requirement: 1},
    {id: 'frequent', name: 'Frequent Flyer', icon: '💺', description: 'Visited 10 airports', type: 'milestone', requirement: 10},
    {id: 'weltreisender', name: 'World Traveler', icon: '🌍', description: 'Visited 25 airports', type: 'milestone', requirement: 25},
    {id: 'lufthansa', name: 'Lufthansa Fan', icon: '🐦', description: 'Visited main German airports', type: 'special', requirement: ['FRA', 'MUC', 'DUS', 'HAM', 'BER']},
    {id: 'megahub', name: 'Mega Hub Collector', icon: '🏢', description: 'Visited top 5 world hubs', type: 'special', requirement: ['JFK', 'LHR', 'NRT', 'SIN', 'DXB']},
    {id: 'deutschland', name: 'Germany Complete', icon: '🇩🇪', description: 'Visited 5 German airports', type: 'country', requirement: 5, country: 'Deutschland'},
    {id: 'usa', name: 'USA Expert', icon: '🇺🇸', description: 'Visited 5 US airports', type: 'country', requirement: 5, country: 'USA'},
    {id: 'speed', name: 'Speed Collector', icon: '⚡', description: 'Add 5 airports in one day', type: 'achievement', requirement: 'speed'},
    {id: 'collector', name: 'Completionist', icon: '🎯', description: 'Visited 50 different airports', type: 'milestone', requirement: 50},
  ];

  const checkAndAwardBadges = (airports) => {
    const newBadges = [];
    availableBadges.forEach(badge => {
      if (userBadges.find(b => b.id === badge.id)) return;
      let earned = false;
      switch (badge.type) {
        case 'milestone':
          earned = airports.length >= badge.requirement;
          break;
        case 'continent':
          const continentAirports = airports.filter(code => {
            const airport = worldAirports.find(a => a.code === code);
            return airport && airport.continent === badge.continent;
          });
          earned = continentAirports.length >= badge.requirement;
          break;
        case 'country':
          const countryAirports = airports.filter(code => {
            const airport = worldAirports.find(a => a.code === code);
            return airport && airport.country === badge.country;
          });
          earned = countryAirports.length >= badge.requirement;
          break;
        case 'special':
          if (Array.isArray(badge.requirement)) {
            earned = badge.requirement.every(code => airports.includes(code));
          }
          break;
      }
      if (earned) {
        newBadges.push({...badge, earnedAt: Date.now()});
      }
    });

    if (newBadges.length > 0) {
      const updatedBadges = [...userBadges, ...newBadges];
      setUserBadges(updatedBadges);
      newBadges.forEach(badge => {
        setTimeout(() => {
          Alert.alert('🏆 New Badge Earned!', `${badge.icon} ${badge.name}\n${badge.description}`);
        }, 300);
      });
    }
    return newBadges;
  };

  const getMedal = (rank) => {
    if (rank === 1) return {emoji: '🥇', name: 'Gold', color: '#FFD700'};
    if (rank === 2) return {emoji: '🥈', name: 'Silver', color: '#C0C0C0'};
    if (rank === 3) return {emoji: '🥉', name: 'Bronze', color: '#CD7F32'};
    return {emoji: '🏅', name: 'Participant', color: '#4A90E2'};
  };

  const getRankByAirports = (count) => {
    if (count >= 100) return {level: 'World-class Pilot', color: '#FF6B6B', icon: '✈️'};
    if (count >= 50) return {level: 'Experienced Pilot', color: '#4ECDC4', icon: '🛩️'};
    if (count >= 25) return {level: 'Advanced Pilot', color: '#45B7D1', icon: '🚁'};
    if (count >= 10) return {level: 'Junior Pilot', color: '#96CEB4', icon: '🛫'};
    return {level: 'Rookie Pilot', color: '#FFEAA7', icon: '🎓'};
  };

  const addAirport = (airportCode = null) => {
    const codeToAdd = (airportCode || newAirport).trim().toUpperCase();
    if (!codeToAdd) return;
    if (userAirports.includes(codeToAdd)) {
      Alert.alert('', 'Airport already added');
      return;
    }
    const airport = worldAirports.find(a => a.code === codeToAdd);
    if (airport || airportCode) {
      const updatedAirports = [...userAirports, codeToAdd];
      // update redux store
      addPilotAirport(codeToAdd);
      // keep immediate UI responsive via local mirror
      setUserAirports(updatedAirports);
      const updatedPilots = pilots.map(pilot => pilot.id === currentUser.id ? {...pilot, airportCount: updatedAirports.length, airports: updatedAirports} : pilot).sort((a, b) => b.airportCount - a.airportCount);
      setPilots(updatedPilots);
      setNewAirport('');
      setSearchTerm('');
      setShowAddModal(false);
      // award badges (this will also dispatch addPilotBadge below)
      const newlyAwarded = checkAndAwardBadges(updatedAirports);
      if (newlyAwarded && newlyAwarded.length > 0) {
        newlyAwarded.forEach(b => addPilotBadge(b));
      }
      if (updatedAirports.length % 5 === 0) {
        Alert.alert('🎉 Achievement', `You have visited ${updatedAirports.length} airports!`);
      }
    } else {
      Alert.alert('', 'Airport not found in database!');
    }
  };

  const renderPilot = ({item, index}) => {
    const medal = getMedal(index + 1);
    const rank = getRankByAirports(item.airportCount);
    const isCurrentUser = item.id === currentUser.id;
    return (
      <View style={[styles.pilotItem, isCurrentUser ? styles.currentPilot : styles.otherPilot]}>
        <View style={styles.pilotLeft}>
          <Text style={styles.medal}>{medal.emoji}</Text>
          <Text style={[styles.rankNumber, {color: medal.color}]}>#{index + 1}</Text>
        </View>
        <View style={styles.pilotCenter}>
          <Text style={[styles.pilotName, isCurrentUser && styles.currentPilotName]}>{item.name}{isCurrentUser ? ' (You)' : ''}</Text>
          <View style={[styles.rankBadge, {backgroundColor: rank.color}]}> 
            <Text style={styles.rankBadgeText}>{rank.icon} {rank.level}</Text>
          </View>
        </View>
        <View style={styles.pilotRight}>
          <Text style={styles.airportCount}>{item.airportCount}</Text>
          <Text style={styles.airportLabel}>Airports</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom + TAB_BAR_HEIGHT}] }>
      {/* Top non-scrolling header area */}
      <ScrollView contentContainerStyle={{padding: 16}} style={{maxHeight: 300}}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>🛩️ {i18n.t('pilotRanking.title') || 'Pilots ranking'}</Text>
          <Text style={styles.headerSubtitle}>{i18n.t('pilotRanking.subtitle') || 'Collect airports and climb the leaderboard!'}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statLeft}>
            <Text style={styles.statNumber}>{userAirports.length}</Text>
            <Text style={styles.statLabel}>Airports visited</Text>
          </View>
          <View style={styles.statRight}>
            <View style={[styles.rankPill, {backgroundColor: getRankByAirports(userAirports.length).color}]}> 
              <Text style={styles.rankPillText}>{getRankByAirports(userAirports.length).icon} {getRankByAirports(userAirports.length).level}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add new airport</Text>
        </TouchableOpacity>

        {userBadges.length > 0 && (
          <View style={styles.badgePreview}>
            <Text style={styles.badgeTitle}>🏆 Your Badges ({userBadges.length})</Text>
            <TouchableOpacity onPress={() => setShowBadgesModal(true)}>
              <Text style={styles.badgeShowAll}>Show all</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Leaderboard takes remaining space and is independently scrollable */}
      <View style={{flex: 1, paddingHorizontal: 16}}>
        <View style={[styles.leaderCard, {flex: 1, padding: 12}]}>
          <Text style={styles.sectionTitle}>🏆 Pilots ranking</Text>
          <FlatList
            data={pilots}
            keyExtractor={(i) => `${i.id}`}
            renderItem={renderPilot}
            contentContainerStyle={{paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 24}}
            style={{flex: 1}}
          />
        </View>

        <View style={[styles.goalsCard, {marginTop: 12}]}>
          <Text style={styles.sectionTitle}>🎯 Next goals</Text>
          <View style={styles.goalsRow}>
            <View style={styles.goalItem}><Text style={styles.goalEmoji}>🎓</Text><Text style={styles.goalText}>25 Airports{"\n"}Advanced</Text></View>
            <View style={styles.goalItem}><Text style={styles.goalEmoji}>🌍</Text><Text style={styles.goalText}>50 Airports{"\n"}World Traveler</Text></View>
            <View style={styles.goalItem}><Text style={styles.goalEmoji}>👑</Text><Text style={styles.goalText}>100 Airports{"\n"}World-class</Text></View>
          </View>
        </View>
      </View>

      {/* Add Airport Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✈️ Select airport</Text>
            <TextInput placeholder="Search by airport, city or country..." style={styles.searchInput} value={searchTerm} onChangeText={setSearchTerm} />

            {filteredAirports.length > 0 ? (
              <ScrollView style={{maxHeight: 240}}>
                {filteredAirports.map((airport) => (
                  <TouchableOpacity key={airport.code} style={styles.searchItem} onPress={() => addAirport(airport.code)}>
                    <View>
                      <Text style={styles.searchCode}>{airport.code}</Text>
                      <Text style={styles.searchName}>{airport.name}</Text>
                      <Text style={styles.searchMeta}>{airport.city}, {airport.country}</Text>
                    </View>
                    <Text style={styles.searchCont}>{airport.continent}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View>
                <Text style={{marginBottom: 8, color: '#666'}}>Popular airports</Text>
                <View style={styles.popularRow}>
                  {['FRA','MUC','LHR','JFK','NRT','SIN','DXB','LAX'].map(code => {
                    const airport = worldAirports.find(a => a.code === code);
                    if (!airport) return null;
                    return (
                      <TouchableOpacity key={code} style={styles.popularButton} onPress={() => addAirport(code)} disabled={userAirports.includes(code)}>
                        <Text style={styles.popularCode}>{code}</Text>
                        <Text style={styles.popularCity}>{airport.city}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <Text style={{marginTop: 12, marginBottom: 6}}>Or enter manually (IATA)</Text>
            <TextInput value={newAirport} onChangeText={v => setNewAirport(v.toUpperCase())} placeholder="e.g. FRA" style={styles.manualInput} maxLength={4} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#888'}]} onPress={() => {setShowAddModal(false); setNewAirport(''); setSearchTerm('');}}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#2b8ef6'}]} onPress={() => addAirport()}>
                <Text style={styles.modalBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Badges Modal */}
      <Modal visible={showBadgesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {maxHeight: '85%'}]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.modalTitle}>🏆 Your badge collection</Text>
              <TouchableOpacity onPress={() => setShowBadgesModal(false)}><Text style={{fontSize: 22}}>×</Text></TouchableOpacity>
            </View>

            {userBadges.length > 0 && (
              <View>
                <Text style={{marginVertical: 8, color: '#2d995b'}}>Earned ({userBadges.length})</Text>
                {userBadges.map(b => (
                  <View key={b.id} style={styles.earnedBadge}>
                    <Text style={{fontSize: 22, marginRight: 8}}>{b.icon}</Text>
                    <View>
                      <Text style={{fontWeight: '700'}}>{b.name}</Text>
                      <Text style={{color: '#666'}}>{b.description}</Text>
                      <Text style={{color: '#999', fontSize: 12}}>Earned: {new Date(b.earnedAt).toLocaleDateString('en-US')}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View>
              <Text style={{marginTop: 12, marginBottom: 8}}>To earn</Text>
              {availableBadges.filter(b => !userBadges.find(ub => ub.id === b.id)).map(badge => (
                <View key={badge.id} style={styles.availableBadge}>
                  <Text style={{fontSize: 20, marginRight: 8}}>{badge.icon}</Text>
                  <View>
                    <Text style={{fontWeight: '700'}}>{badge.name}</Text>
                    <Text style={{color: '#666'}}>{badge.description}</Text>
                  </View>
                </View>
              ))}
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F7FAFC', paddingTop: Platform.OS !== 'ios' ? getStatusBarHeight() : 0},
  headerCard: {backgroundColor: '#3b82f6', borderRadius: 12, padding: 16, marginBottom: 12, marginTop: 20},
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center'},
  headerSubtitle: {color: '#dbeafe', textAlign: 'center', marginTop: 6},
  statCard: {backgroundColor: '#fff', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  statLeft: {},
  statNumber: {fontSize: 36, fontWeight: '700', color: '#ef4444'},
  statLabel: {color: '#6b7280'},
  statRight: {},
  rankPill: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20},
  rankPillText: {color: '#fff', fontWeight: '700'},
  addButton: {backgroundColor: '#2563eb', padding: 12, borderRadius: 10, marginBottom: 12},
  addButtonText: {color: '#fff', textAlign: 'center', fontWeight: '700'},
  badgePreview: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  badgeTitle: {fontWeight: '700'},
  badgeShowAll: {color: '#2563eb'},
  leaderCard: {backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12},
  sectionTitle: {fontSize: 16, fontWeight: '700', marginBottom: 8},
  pilotItem: {flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 8},
  currentPilot: {backgroundColor: '#ebf5ff', borderWidth: 1, borderColor: '#bfdbfe'},
  otherPilot: {backgroundColor: '#f8fafc'},
  pilotLeft: {width: 56, alignItems: 'center'},
  medal: {fontSize: 22},
  rankNumber: {fontSize: 12, fontWeight: '700'},
  pilotCenter: {flex: 1, paddingHorizontal: 8},
  pilotName: {fontSize: 16, fontWeight: '600'},
  currentPilotName: {color: '#155e75'},
  rankBadge: {marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8},
  rankBadgeText: {color: '#fff', fontWeight: '700'},
  pilotRight: {width: 80, alignItems: 'center'},
  airportCount: {fontSize: 18, fontWeight: '800', color: '#ef4444'},
  airportLabel: {fontSize: 12, color: '#6b7280'},
  goalsCard: {backgroundColor: '#fff', borderRadius: 12, padding: 12},
  goalsRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  goalItem: {alignItems: 'center', width: '30%'},
  goalEmoji: {fontSize: 20},
  goalText: {textAlign: 'center', color: '#6b7280', fontSize: 12, lineHeight: 18},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16},
  modalContent: {backgroundColor: '#fff', borderRadius: 12, padding: 12},
  modalTitle: {fontSize: 18, fontWeight: '700', marginBottom: 8},
  searchInput: {borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, marginBottom: 8},
  searchItem: {flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eef2ff', marginBottom: 8},
  searchCode: {fontWeight: '700', color: '#1e293b'},
  searchName: {color: '#0f172a'},
  searchMeta: {color: '#6b7280', fontSize: 12},
  searchCont: {color: '#475569'},
  popularRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  popularButton: {padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e6eefc', marginRight: 8, marginBottom: 8},
  popularCode: {fontWeight: '700', color: '#1e3a8a'},
  popularCity: {color: '#6b7280', fontSize: 12},
  manualInput: {borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8},
  modalActions: {flexDirection: 'row', marginTop: 12, justifyContent: 'space-between'},
  modalBtn: {flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center'},
  modalBtnText: {color: '#fff', fontWeight: '700'},
  earnedBadge: {flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: '#ecfdf5', marginBottom: 8},
  availableBadge: {flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: '#f8fafc', marginBottom: 8},
});

const mapStateToProps = (state) => ({
  pilot: state.pilot,
});

const mapDispatchToProps = {
  addPilotAirport,
  addPilotBadge,
  setPilotData,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PilotRankingGame));
