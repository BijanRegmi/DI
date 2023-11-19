import { v4 as uuid } from 'uuid';
import 'reflect-metadata';

type Constructor = new (...args: any[]) => any;
type LifeSpan = 'transient' | 'singleton';
type InjectableOptions = { type: LifeSpan };
type InstanceType<T extends Constructor> = T extends new (...args: any[]) => infer R ? R : never;

export class DependencyService {
    private container: {
        [name: string]: InstanceType<any>;
    } = {};

    register<T extends Constructor>(instance: InstanceType<T>) {
        const injectable = Reflect.getMetadata('__injectable', instance.constructor);
        if (!injectable) {
            throw new Error(
                `${instance.constructor.name} is not injectable. Add @Injectable() decorator to make the class injectable.`,
            );
        }

        const lifespan: LifeSpan = Reflect.getMetadata('__lifespan', instance.constructor);
        if (lifespan == 'transient') {
            // No need to register transient deps
            return;
        }

        this.container[instance.constructor.name] = instance;
    }

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

        const record = this.container[target.name] as InstanceType<T>;
        if (record) {
            return record;
        }

        const args = params.map((param: any) => this.get(param));
        const instance: InstanceType<T> = new target(...args);
        this.container[target.name] = instance;

        return instance;
    }
}

export const Injectable = (options: InjectableOptions = { type: 'singleton' }) => {
    return <T extends Constructor>(target: T) => {
        Object.defineProperty(target, 'name', { value: uuid() });
        Reflect.defineMetadata('__injectable', true, target);
        Reflect.defineMetadata('__lifespan', options.type, target);
    };
};
