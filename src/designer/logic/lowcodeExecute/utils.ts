import _ from 'lodash';

export function clone(source: any, constructors: any) {
  const target = new constructors.Object();
  _.forEach(source, (value, key) => {
    switch (getType(value)) {
      case 'boolean': {
        return (target[key] = new constructors.Boolean(value));
      }
      case 'string': {
        return (target[key] = new constructors.String(value));
      }
      case 'number': {
        return (target[key] = new constructors.Number(value));
      }
      case 'array': {
        return (target[key] = new constructors.Array().concat(value));
      }
      case 'object': {
        return (target[key] = clone(new constructors.Object(value), constructors));
      }
      case 'function': {
        const newValue = value.bind(constructors);
        newValue.__proto__ = constructors.Function.prototype;
        return (target[key] = newValue);
      }
      default: {
        return (target[key] = value);
      }
    }
  });
  return target;
}

export function getType(target: any) {
  const targetType = _.toLower(Object.prototype.toString.call(target))
  return targetType?.match?.(/\[object\s(\S*)\]/)?.[1];
}
