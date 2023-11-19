import { DependencyService, Injectable } from '../';

const dService = new DependencyService();

@Injectable()
class NumberGenerator {
    constructor(private num: number) {}

    getNumber() {
        return this.num;
    }
}

@Injectable()
class LocationService {
    private latitudeSeed: number;
    private longitudeSeed: number;

    constructor(private numberGenerator: NumberGenerator) {
        this.latitudeSeed = this.numberGenerator.getNumber() * 180;
        this.longitudeSeed = this.numberGenerator.getNumber() * 360;
    }

    getSeeds() {
        return { latitudeSeed: this.latitudeSeed, longitudeSeed: this.longitudeSeed };
    }
}

dService.register(new NumberGenerator(2));

const locationService = dService.get(LocationService);
const seeds = locationService.getSeeds();
console.log(seeds); // Should be {latitudeSeed: 2*180=360, longitudeSeed: 2*360=720}
