const axios = require('axios');
const Bagel = require('./Bagel'); // assuming the client and test file are in the same directory

// Mocking the axios module
jest.mock('axios');

describe('Bagel', () => {
  let bagel;

  beforeEach(() => {
    bagel = new Bagel();
    // Reset the mock status of axios before each test
    axios.get.mockReset();
    axios.post.mockReset();
  });

  test('ping', async () => {
    const responseData = { status: 'ok' };
    axios.get.mockResolvedValue({ data: responseData });

    const result = await bagel.ping();

    expect(result).toEqual(responseData);
    expect(axios.get).toHaveBeenCalledWith(`${bagel.baseURL}/v0/ping`);
  });

  test('getOpenAIEmbedding', async () => {
    const inputText = 'Some input text';
    const model = 'text-embedding-ada-002';
    const responseData = {
      embeddings: [0.1, 0.2, 0.3, 0.4],
    };
    axios.post.mockResolvedValue({ data: responseData });
  
    const result = await bagel.getOpenAIEmbedding(inputText, model);
  
    expect(result).toEqual(responseData);
    expect(axios.post).toHaveBeenCalledWith(`${bagel.openAIURL}/v1/embeddings`, { input: inputText, model: model }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bagel.openAIKey}`,
      },
    });
  });  

  test('insert with valid data', async () => {
    const index = 'bagel';
    const vectors = [
      {
        id: 'vec1',
        values: [0.1, 0.2, 0.3, 0.4],
        metadata: { genre: 'drama' },
      },
      {
        id: 'vec2',
        values: [0.2, 0.3, 0.4, 0.5],
        metadata: { genre: 'action' },
      },
    ];

    const responseData = { status: 'ok' };
    axios.post.mockResolvedValue({ data: responseData });

    const result = await bagel.insert(index, vectors);

    expect(result).toEqual(responseData);
    expect(axios.post).toHaveBeenCalledWith(`${bagel.baseURL}/v0/insert`, { index, vectors });
  });

  test('search', async () => {
    const index = 'bagel';
    const vector = [1.0, 2.0, 3.0, 4.0];
    const responseData = {
      results: {
        matches: [{ score: 0.75, vectorId: 'vec1' }, { score: 0.65, vectorId: 'vec2' }],
      },
    };
    axios.post.mockResolvedValue({ data: responseData });

    const result = await bagel.search(index, vector);

    expect(result).toEqual(responseData);
    expect(axios.post).toHaveBeenCalledWith(`${bagel.baseURL}/v0/search`, { index, vector });
  });
});
