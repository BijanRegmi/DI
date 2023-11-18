type ClassType = 'transient' | 'singleton';
type ObjectWithConstructor = { constructor: Function };
type InjectableOptions = { type: ClassType };

type ContainerRecord<T extends ObjectWithConstructor> = {
    instance: T;
    type: ClassType;
    constructorFn: Function;
};

class DependencyService {
    private container: {
        [name: string]: ContainerRecord<any>;
    } = {};

    registerService<T extends ObjectWithConstructor>(instance: T): ContainerRecord<T> {
        const record: ContainerRecord<T> = {
            instance,
            type: 'singleton',
            constructorFn: instance.constructor,
        };
        this.container[instance.constructor.name] = record;
        return record;
    }

    getService<T extends new (...args: any[]) => any>(target: T) {
        const record = this.container[target.name];
        return record ? (record.instance as T) : null;
    }
}

const dService = new DependencyService();

const Injectable = (options: InjectableOptions = { type: 'singleton' }) => {
    return <T extends new (...args: any[]) => any>(target: T) => {
        return class {
            constructor(...args: any[]) {
                if (options.type == 'transient') return new target(...args);

                const existingInstance = dService.getService(target);
                if (existingInstance) {
                    return existingInstance;
                }

                const newInstance = new target(...args);
                dService.registerService(newInstance);
                return newInstance;
            }
        } as T;
    };
};

@Injectable()
class ServiceOne {
    private myNum: number;

    constructor(num: number) {
        this.myNum = num;
    }

    getNumber() {
        return this.myNum;
    }
}

const x = new ServiceOne(2);
const y = new ServiceOne(3);
console.log(x.getNumber(), y.getNumber());
