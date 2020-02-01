'use strict';

class Store {
  constructor() {
    const data = Object.create(null);

    this.get = (prop) => {
      if (data[prop]) {
        return data[prop];
      }
      throw Error('Requested property does not exists');
    };

    this.set = (prop, value) => {
      data[prop] = value;
    };

    this.listProps = () => Object.keys(data);
  }
}

module.exports = Store;
