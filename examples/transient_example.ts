import { DependencyService, Injectable } from '../';

const dService = new DependencyService();

@Injectable({ type: 'transient' })
class LocationService {
    private latitudeSeed: number;
    private longitudeSeed: number;

    constructor() {
        this.latitudeSeed = Math.random() * 180;
        this.longitudeSeed = Math.random() * 360;
    }

    getCurrentLocation(userId: number) {
        return {
            latitude: ((userId * this.latitudeSeed) % 180) - 90,
            longitude: ((userId * this.longitudeSeed) % 360) - 180,
        };
    }
}

const locationServiceA = dService.get(LocationService);
const locationServiceB = dService.get(LocationService);

const locationA = locationServiceA.getCurrentLocation(2);
const locationB = locationServiceB.getCurrentLocation(2);

console.log(locationA, locationB); // Both shouldn't be same
