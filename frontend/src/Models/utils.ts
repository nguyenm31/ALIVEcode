import axios from 'axios';
import Model from './Model';

type TypeLoadObj = <T extends Object>(url: string, target: Model & Function, body?: Object) => Promise<T[] | T>

export const loadObj: TypeLoadObj = async (url, target, body?) => {
    const data = (await axios.get(url, body)).data;
    return Array.isArray(data) ?
        data.map((obj: any) => deepConstruct(Object.create(target), obj, target.prototype))
        :
        deepConstruct(Object.create(target), data, target.prototype);
}

const deepConstruct = (target: any, source: any, prototype?: Object) => {
    // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
    for (const key of Object.keys(source)) {
        const sourceValue = source[key];

        if (key === "name" && target) {
            Object.defineProperty(target, 'name', {
                writable: true,
                value: source["name"]
            })
        }
        else if (Array.isArray(sourceValue)) {
            if (target.dependencies[key] != null) {
                const objTarget = target.dependencies[key]
                console.log("source: " + sourceValue)
                source[key] = source[key].map((obj: any) => deepConstruct(Object.create(objTarget), obj, objTarget.prototype))
            }
            else source[key] = source[key].map((obj: any) => deepConstruct({}, obj))
        }
        else if (sourceValue instanceof Object) {
            if (target.dependencies[key] != null) {
                source[key] = deepConstruct(target[key], sourceValue, target.dependencies[key].prototype);
            }
            else source[key] = deepConstruct(target[key], sourceValue);
        }
    }
    // Join `target` and modified `source`
    target = Object.assign(target || {}, source);
    return prototype ? Object.setPrototypeOf(target, prototype) : target;
}









