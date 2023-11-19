import { DependencyService, Injectable } from '../';

const dService = new DependencyService();

@Injectable()
class RandomNumberGenerator {
    constructor() {}

    getNumber() {
        return Math.random();
    }
}

@Injectable()
class LocationService {
    private latitudeSeed: number;
    private longitudeSeed: number;

    constructor(private numberGenerator: RandomNumberGenerator) {
        this.latitudeSeed = this.numberGenerator.getNumber() * 180;
        this.longitudeSeed = this.numberGenerator.getNumber() * 360;
    }

    getCurrentLocation(userId: number) {
        return {
            latitude: ((userId * this.latitudeSeed) % 180) - 90,
            longitude: ((userId * this.longitudeSeed) % 360) - 180,
        };
    }
}

@Injectable()
class UserService {
    constructor(private locationService: LocationService) {}

    getUserById(userId: number) {
        return {
            id: userId,
            firstname: 'John',
            lastname: 'Doe',
            age: 22,
            location: this.locationService.getCurrentLocation(userId),
        };
    }
}

const userService = dService.get(UserService); // All the dependencies are auto resolved

const user = userService.getUserById(2);
console.log(user);
