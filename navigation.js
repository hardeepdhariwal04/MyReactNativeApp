import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import App from './App';
import RateTranslations from './rate';

const Stack = createStackNavigator();

export default function Navigation() { 
    console.log("Navigation component rendering");
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#023047',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={App} 
          options={{
            title: 'Translation App'
          }}
        />
        <Stack.Screen 
          name="Rate" 
          component={RateTranslations} 
          options={{
            title: 'Rate Translations'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}