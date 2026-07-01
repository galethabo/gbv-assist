// ResourcesScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Linking, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Mock resources data - Replace this with your actual Firebase data
const MOCK_RESOURCES = [
  {
    id: '1',
    name: 'GBV Emergency Helpline',
    type: 'hotline',
    description: '24/7 National gender-based violence helpline',
    location: {
      address: 'National Helpline',
      coordinates: {
        latitude: -26.2041,
        longitude: 28.0473
      }
    },
    contact: {
      phone: '0800428428'
    },
    hours: '24/7'
  },
  {
    id: '2',
    name: 'Lifeline Counseling',
    type: 'counseling',
    description: 'Free counseling and support services',
    location: {
      address: '123 Support Street, Johannesburg',
      coordinates: {
        latitude: -26.2041,
        longitude: 28.0473
      }
    },
    contact: {
      phone: '0861322322'
    },
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-1PM'
  },
  {
    id: '3',
    name: 'Legal Aid South Africa',
    type: 'legal',
    description: 'Free legal assistance for GBV cases',
    location: {
      address: '456 Justice Avenue, Pretoria',
      coordinates: {
        latitude: -25.7479,
        longitude: 28.2293
      }
    },
    contact: {
      phone: '0800110110'
    },
    hours: 'Mon-Fri: 8AM-4PM'
  },
  {
    id: '4',
    name: 'POWA Shelter',
    type: 'shelter',
    description: 'Safe accommodation for women and children',
    location: {
      address: '789 Safety Road, Cape Town',
      coordinates: {
        latitude: -33.9249,
        longitude: 18.4241
      }
    },
    contact: {
      phone: '0116424345'
    },
    hours: '24/7'
  },
  {
    id: '5',
    name: 'GBV Medical Center',
    type: 'medical',
    description: 'Specialized medical care for survivors',
    location: {
      address: '321 Health Lane, Durban',
      coordinates: {
        latitude: -29.8587,
        longitude: 31.0218
      }
    },
    contact: {
      phone: '0311234567'
    },
    hours: '24/7'
  }
];

export default function ResourcesScreen() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);

  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'legal', name: 'Legal Aid' },
    { id: 'medical', name: 'Medical Services' },
    { id: 'counseling', name: 'Counseling' },
    { id: 'shelter', name: 'Shelters' },
    { id: 'hotline', name: 'Hotlines' },
  ];

  useEffect(() => {
    loadResources();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchText, selectedCategory]);

  const loadResources = async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setResources(MOCK_RESOURCES);
        setLoading(false);
      }, 1000);
      
      
      /*
      const querySnapshot = await getDocs(collection(db, 'resources'));
      const resourcesData = [];
      querySnapshot.forEach((doc) => {
        resourcesData.push({ id: doc.id, ...doc.data() });
      });
      setResources(resourcesData);
      setLoading(false);
      */
    } catch (error) {
      console.error('Error loading resources:', error);
      Alert.alert('Error', 'Could not load resources. Please try again.');
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        Alert.alert(
          'Location Access', 
          'Location permission is needed to show resources near you. You can still use all features.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setLocationLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedCategory);
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.name.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        (resource.location?.address?.toLowerCase().includes(searchLower))
      );
    }

    setFilteredResources(filtered);
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not available');
      return;
    }

    Linking.openURL(`tel:${phoneNumber}`)
      .catch(err => {
        Alert.alert('Error', 'Could not make the call. Please check your device.');
        console.error('Error making call:', err);
      });
  };

  const handleGetDirections = (address) => {
    if (!address || address === 'National Helpline') {
      Alert.alert('Info', 'This is a national helpline. Please call for assistance.');
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url)
      .catch(err => {
        Alert.alert('Error', 'Could not open maps. Please check your device.');
        console.error('Error opening maps:', err);
      });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };

  const formatDistance = (distance) => {
    if (distance === null) return 'Distance unknown';
    
    return distance < 1 
      ? `${Math.round(distance * 1000)}m away` 
      : `${distance.toFixed(1)}km away`;
  };

  const renderResourceItem = (resource) => {
    const distance = userLocation && resource.location.coordinates
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          resource.location.coordinates.latitude,
          resource.location.coordinates.longitude
        )
      : null;

    return (
      <View key={resource.id} style={styles.resourceCard}>
        <Text style={styles.resourceName}>{resource.name}</Text>
        <Text style={styles.resourceType}>
          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
        </Text>
        <Text style={styles.resourceDescription}>{resource.description}</Text>
        
        <View style={styles.resourceDetails}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.resourceAddress}>{resource.location.address}</Text>
        </View>
        
        {distance !== null && (
          <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
        )}
        
        <View style={styles.resourceDetails}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.resourceHours}>{resource.hours}</Text>
        </View>
        
        <View style={styles.resourceActions}>
          {resource.contact.phone && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleCall(resource.contact.phone)}
            >
              <Ionicons name="call-outline" size={16} color="white" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.directionsButton]}
            onPress={() => handleGetDirections(resource.location.address)}
          >
            <Ionicons name="navigate-outline" size={16} color="white" />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A0DAD" />
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support Resources</Text>
      <Text style={styles.subtitle}>Find help and support services near you</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonSelected
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextSelected
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Location Status */}
      {locationLoading && (
        <View style={styles.locationStatus}>
          <ActivityIndicator size="small" color="#6A0DAD" />
          <Text style={styles.locationText}>Getting your location...</Text>
        </View>
      )}

      {/* Resources List */}
      <ScrollView 
        style={styles.resourcesList}
        showsVerticalScrollIndicator={false}
      >
        {filteredResources.length > 0 ? (
          filteredResources.map(renderResourceItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {searchText || selectedCategory !== 'all' 
                ? 'No resources found matching your criteria' 
                : 'No resources available at the moment'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadResources}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Emergency Hotline */}
      <View style={styles.emergencyBanner}>
        <Ionicons name="warning-outline" size={24} color="white" />
        <View style={styles.emergencyTextContainer}>
          <Text style={styles.emergencyText}>In crisis? Call the GBV Hotline:</Text>
          <Text style={styles.emergencyNumber}>0800 428 428</Text>
        </View>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => handleCall('0800428428')}
        >
          <Ionicons name="call-outline" size={20} color="white" />
          <Text style={styles.emergencyButtonText}>Call Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingVertical: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonSelected: {
    backgroundColor: '#6A0DAD',
    borderColor: '#6A0DAD',
  },
  categoryText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: 'white',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1976d2',
  },
  resourcesList: {
    flex: 1,
    marginBottom: 16,
  },
  resourceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resourceType: {
    fontSize: 14,
    color: '#6A0DAD',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  resourceDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  resourceAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  distanceText: {
    fontSize: 14,
    color: '#6A0DAD',
    fontWeight: '600',
    marginBottom: 6,
  },
  resourceHours: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    lineHeight: 18,
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A0DAD',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  directionsButton: {
    backgroundColor: '#4CAF50',
    marginRight: 0,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#6A0DAD',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emergencyBanner: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emergencyTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  emergencyText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emergencyNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emergencyButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
});