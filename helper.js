const axios = require('axios');
require('dotenv').config();

const server = process.env.SERVER;

module.exports = {
  checkUser: async (url) => {
    try {
      await axios.get(url);
      return true;
    } catch (error) {
      if (error.response.data.msg === 'user not found') {
        return false;
      } else {
        console.log(error);
      }
    }
  },
  validateItem: async (report) => {
    const hasil = [];

    try {
      const { data: { result: allItems } } = await axios.get(`${server}/items`);

      allItems.forEach(menu => {
        report.forEach(datum => {
          if (menu.itemName.toLowerCase() === datum.itemName.toLowerCase()) {
            hasil.push(datum);
          }
        });
      });
      return hasil;
    } catch (err) {
      console.log('Error get items', err);
    }
  },
  mappingReport: async (report) => {
    const hasil = [];

    report.forEach(item => {
      let data = item.split(' ');

      if (!Number(data[1])) {
        const obj = {
          itemName: data[0] + ' ' + data[1],
          quantity: data[2] ? Number(data[2]) : null
        };

        hasil.push(obj);
      } else if (!Number(data[0])) {
        const obj = {
          itemName: data[0],
          quantity: data[1] ? Number(data[1]) : null
        };

        hasil.push(obj);
      }
    });

    try {
      const validateItems = await module.exports.validateItem(hasil);
      return validateItems;
    } catch (err) {
      console.log(err);
    }
  }
};
