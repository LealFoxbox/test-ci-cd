import Geolocation from 'react-native-geolocation-service';

export default function getCurrentPosition() {
  return new Promise<Geolocation.GeoPosition>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        reject(`Geolocation Error. Code: ${error.code}, Message: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, showLocationDialog: true },
    );
  });
}
