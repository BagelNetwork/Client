const axios = require('axios')
const BagelDB = require('./BagelDB') // assuming the client and test file are in the same directory

// Mocking the axios module
jest.mock('axios')

describe('BagelDB', () => {
  let bagelDB

  beforeEach(() => {
    bagelDB = new BagelDB()
    // Reset the mock status of axios before each test
    axios.get.mockReset()
    axios.post.mockReset()
  })

  test('ping', async () => {
    const responseData = { status: 'ok' }
    axios.get.mockResolvedValue({ data: responseData })

    const result = await bagelDB.ping()

    expect(result).toEqual(responseData)
    expect(axios.get).toHaveBeenCalledWith(`${bagelDB.baseURL}/v0/ping`)
  })

  test('getOpenAIEmbedding', async () => {
    const inputText = 'Some input text'
    const model = 'text-embedding-ada-002'
    const responseData = {
      embeddings: [0.1, 0.2, 0.3, 0.4]
    }
    axios.post.mockResolvedValue({ data: responseData })

    const result = await bagelDB.getOpenAIEmbedding(inputText, model)

    expect(result).toEqual(responseData)
    expect(axios.post).toHaveBeenCalledWith(`${bagelDB.openAIURL}/v1/embeddings`, { input: inputText, model }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bagelDB.openAIKey}`
      }
    })
  })

  test('insert with valid data', async () => {
    const index = 'bagel'
    const vectors = [
      {
        id: 'vec1',
        values: [0.1, 0.2, 0.3, 0.4],
        metadata: { genre: 'drama' }
      },
      {
        id: 'vec2',
        values: [0.2, 0.3, 0.4, 0.5],
        metadata: { genre: 'action' }
      }
    ]

    const responseData = { status: 'ok' }
    axios.post.mockResolvedValue({ data: responseData })

    const result = await bagelDB.insert(index, vectors)

    expect(result).toEqual(responseData)
    expect(axios.post).toHaveBeenCalledWith(`${bagelDB.baseURL}/v0/insert`, { index, vectors })
  })

  test('search', async () => {
    const index = 'bagel'
    const vector = [1.0, 2.0, 3.0, 4.0]
    const responseData = {
      results: {
        matches: [{ score: 0.75, vectorId: 'vec1' }, { score: 0.65, vectorId: 'vec2' }]
      }
    }
    axios.post.mockResolvedValue({ data: responseData })

    const result = await bagelDB.search(index, vector)

    expect(result).toEqual(responseData)
    expect(axios.post).toHaveBeenCalledWith(`${bagelDB.baseURL}/v0/search`, { index, vector })
  })
})
