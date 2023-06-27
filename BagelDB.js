const axios = require('axios');

class BagelDB {
  constructor() {
    this.baseURL = 'https://api.bageldb.ai';
  }

  async ping() {
    try {
      const response = await axios.get(`${this.baseURL}/v0/ping`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async insert(index, vectors) {
    try {
      const data = { index: index, vectors };
      const response = await axios.post(`${this.baseURL}/v0/insert`, data);
      return response.data;
    } catch (error) {
      throw error;
    }   
  }

  async search(index, vector) {
    try {
      const data = { index: index, vector };
      const response = await axios.post(`${this.baseURL}/v0/search`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BagelDB;
