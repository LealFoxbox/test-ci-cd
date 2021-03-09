import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export type Coords = { latitude: number | null; longitude: number | null };

export default async function getCurrentPosition() {
  let coords: Coords = {
    latitude: null,
    longitude: null,
  };

  try {
    const position = await new Promise<Geolocation.GeoPosition>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (p) => {
          resolve(p);
        },
        (error) => {
          reject(`Geolocation Error. Code: ${error.code}, Message: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, showLocationDialog: true },
      );
    });
    coords = position.coords;
  } catch (e) {
    console.warn('getCurrentPosition failed with error: ', e);
  }

  return coords;
}

export async function requestLocationPermission() {
  try {
    const response = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
      title: 'Location Access Permission',
      message: 'We would like to use your location',
      buttonPositive: 'Okay',
    });

    return response === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    console.warn('requestLocationPermission failed with error: ', e);
    return false;
  }
}
