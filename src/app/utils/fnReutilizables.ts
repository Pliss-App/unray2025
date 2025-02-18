import * as ttServices from '@tomtom-international/web-sdk-services';
// src/app/utils/helpers.ts
export function reverseGeocoding(lat: number, lng: number): Promise<string | null> {
    return new Promise((resolve, reject) => {
      ttServices.services
        .reverseGeocode({
          key: 'yhGwpc1KP3yK4Pqb7KZXjJD91wf3aTy9',
          position: { lat: lat, lng: lng },
        })
        .then((result: any) => {
          const direccion = result.addresses[0].address.freeformAddress;
          resolve(direccion);
        })
        .catch((error: any) => {
          console.error("Error en reverseGeocoding:", error);
          reject(error);
        });
    });
  }
  

  