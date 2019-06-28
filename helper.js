const axios = require('axios');

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
  }
};
