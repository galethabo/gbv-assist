import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './screens/HomeScreen';
import ReportScreen from './screens/ReportScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// Import AuthProvider
import { AuthProvider, useAuth } from './AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Report" 
        component={ReportScreen} 
        options={{ title: 'Report Incident' }} 
      />
      <Stack.Screen 
        name="Resources" 
        component={ResourcesScreen} 
        options={{ title: 'Support Resources' }} 
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ title: 'Support Chat' }} 
      />
    </Stack.Navigator>
  );
}

function AppTabs() {
  const { currentUser } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Resources') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6A0DAD',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ title: 'Home' }} 
      />
      <Tab.Screen 
        name="Report" 
        component={ReportScreen} 
        options={{ title: 'Report Incident' }} 
      />
      <Tab.Screen 
        name="Resources" 
        component={ResourcesScreen} 
        options={{ title: 'Resources' }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ title: 'Support Chat' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: currentUser?.isAnonymous ? 'Guest' : 'Profile' }} 
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      {/* Add Emergency screen to AuthStack */}
      <Stack.Screen 
        name="Emergency" 
        component={EmergencyScreen} 
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { currentUser } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          // User is logged in - show main app with emergency access
          <>
            <Stack.Screen name="MainApp" component={AppTabs} />
            <Stack.Screen 
              name="Emergency" 
              component={EmergencyScreen} 
              options={{ 
                gestureEnabled: false 
              }}
            />
          </>
        ) : (
          // User is not logged in - show auth screens with emergency access
          <>
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen 
              name="Emergency" 
              component={EmergencyScreen} 
              options={{ 
                gestureEnabled: false 
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}