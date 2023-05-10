import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';

const Splash = () => {
  const navigation = useNavigation();
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: true
    }).start(() => {
      if (SplashScreen && typeof SplashScreen.hide === 'function') {
        SplashScreen.hide();
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });
  }, [navigation, opacity]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('./assets/logo.png')}
        style={[styles.logo, { opacity: opacity }]}
      />
      <Animated.Text style={[styles.appName, { opacity: opacity }]}>DOMANT</Animated.Text>
      <Animated.Text style={[styles.appTitle, { opacity: opacity }]}>Chat App</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333'
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain'
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FFF'
  },
  appTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#FFF'
  }
});

export default Splash;
