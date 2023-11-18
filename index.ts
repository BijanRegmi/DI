import { v4 as uuid } from 'uuid';
import 'reflect-metadata';

type Constructor = new (...args: any[]) => any;
type LifeSpan = 'transient' | 'singleton';
type InjectableOptions = { type: LifeSpan };
type InstanceType<T extends Constructor> = T extends new (...args: any[]) => infer R ? R : never;

class DependencyService {
    private container: {
        [name: string]: any;
    } = {};

    get<T extends Constructor>(target: T): InstanceType<T> {
        const injectable = Reflect.getMetadata('__injectable', target);
        if (!injectable) {
            throw new Error(
                `${target.name} is not injectable. Add @Injectable() decorator to make the class injectable.`,
            );
        }

        const lifespan: LifeSpan = Reflect.getMetadata('__lifespan', target);
        const params = Reflect.getMetadata('design:paramtypes', target);

        if (lifespan == 'transient') {
            const args = params.map((param: any) => this.get(param));
            return new target(...args) as InstanceType<T>;
        }

        const record = this.container[target.name];
        if (record) {
            return record;
        }

        const args = params.map((param: any) => this.get(param));
        const instance: InstanceType<T> = new target(...args);
        this.container[target.name] = instance;

        return instance;
    }

    all() {
        return this.container;
    }
}

const dService = new DependencyService();

const Injectable = (options: InjectableOptions = { type: 'singleton' }) => {
    return <T extends Constructor>(target: T) => {
        Object.defineProperty(target, 'name', { value: uuid() });
        Reflect.defineMetadata('__injectable', true, target);
        Reflect.defineMetadata('__lifespan', options.type, target);
    };
};

@Injectable()
class ServiceOne {
    constructor() { }

    getNumber() {
        return 'Value from Service One';
    }
}

@Injectable()
class ServiceTwo {
    constructor(private serviceOne: ServiceOne) { }

    getNumber() {
        return 'Value from Service Two' + '...' + this.serviceOne.getNumber();
    }
}

const servTwo = dService.get(ServiceTwo);
console.log(servTwo.getNumber());
