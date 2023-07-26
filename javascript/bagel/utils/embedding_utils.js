const axios = require('axios');

class EmbeddingUtil {
  constructor(openAIKey, openAIURL = 'https://api.openai.com') {
    if (typeof openAIKey !== 'string') {
      throw new Error("OpenAI API key must be a string");
    }

    this.openAIKey = openAIKey;
    this.openAIURL = openAIURL;
  }

  async getOpenAIEmbedding(inputText, model = 'text-embedding-ada-002') {
    if (typeof inputText !== 'string') {
      throw new Error("Input text must be a string");
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
}

module.exports = EmbeddingUtil;
