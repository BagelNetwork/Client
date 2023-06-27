const axios = require('axios');

class BagelDB {
  constructor() {
    this.baseURL = 'https://api.bageldb.ai';
    this.openAIURL = 'https://api.openai.com';
    this.openAIKey = process.env.OPENAI_API_KEY;
  }

  async ping() {
    try {
      const response = await axios.get(`${this.baseURL}/v0/ping`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

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
