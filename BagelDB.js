const axios = require('axios');

/**
 * BagelDB is a class to interact with the BagelDB and OpenAI APIs.
 * It provides methods to insert data, search data in BagelDB, and get embeddings from OpenAI.
 * This class requires the axios module and uses environment variables.
 */
class BagelDB {
  /**
   * Constructor to initialize BagelDB and OpenAI base URLs and OpenAI API key from environment variables.
   */
  constructor() {
    this.baseURL = 'https://api.bageldb.ai';
    this.openAIURL = 'https://api.openai.com';
    this.openAIKey = process.env.OPENAI_API_KEY;
  }

  /**
   * Async method to send a ping request to BagelDB API.
   * @returns {Promise} A promise that resolves with the response from the BagelDB API.
   */
  async ping() {
    try {
      const response = await axios.get(`${this.baseURL}/v0/ping`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Async method to get OpenAI embeddings.
   * @param {string} inputText - The input text for which embeddings are required.
   * @param {string} [model='text-embedding-ada-002'] - The model to use for generating embeddings. Defaults to 'text-embedding-ada-002'.
   * @returns {Promise} A promise that resolves with the embeddings from OpenAI.
   * @throws Will throw an error if inputText is not a string or if OpenAI API key is missing from environment variables.
   */
  async getOpenAIEmbedding(inputText, model='text-embedding-ada-002') {
    if (typeof inputText !== 'string') {
        throw new Error("Input text must be a string");
    }

    if (!this.openAIKey) {
        throw new Error("OpenAI API key is missing from environment variables");
    }

    try {
        const response = await axios.post(`${this.openAIURL}/v1/embeddings`, {
            input: inputText,
            model: model
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.openAIKey}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
  }

  /**
   * Async method to insert vectors into a given index in BagelDB.
   * @param {string} index - The index in which vectors are to be inserted.
   * @param {Array} vectors - An array of vectors to be inserted.
   * @returns {Promise} A promise that resolves with the response from the BagelDB API.
   * @throws Will throw an error if index is not a string, vectors is not an array, or if each vector is not an object with an 'id', 'values' array, and 'metadata' object.
   */
  async insert(index, vectors) {
    if (typeof index !== 'string') {
      throw new Error("Index must be a string");
    }

    if (!Array.isArray(vectors)) {
      throw new Error("Vectors must be an array");
    }

    for (let vector of vectors) {
      if (!vector.id || !Array.isArray(vector.values) || typeof vector.metadata !== 'object') {
        throw new Error("Each vector must be an object with an 'id', 'values' array, and 'metadata' object");
      }
    }

    try {
      const data = { index: index, vectors };
      const response = await axios.post(`${this.baseURL}/v0/insert`, data);
      return response.data;
    } catch (error) {
      throw error;
    }   
  }

  /**
   * Async method to search for a vector in a given index in BagelDB.
   * @param {string} index - The index in which the search is to be performed.
   * @param {Array} vector - The vector for which the search is to be performed.
   * @returns {Promise} A promise that resolves with the response from the BagelDB API.
   * @throws Will throw an error if index is not a string or vector is not an array.
   */
  async search(index, vector) {
    if (typeof index !== 'string') {
      throw new Error("Index must be a string");
    }

    if (!Array.isArray(vector)) {
      throw new Error("Vector must be an array");
    }

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
