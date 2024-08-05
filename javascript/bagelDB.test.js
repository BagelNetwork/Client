/* eslint-disable no-undef, no-multiple-empty-lines */


import fetch from 'node-fetch'
import FormData from 'form-data'
import API from './src/api/api.js' // Adjust the path to where your API class is located


jest.mock('node-fetch', () => jest.fn())
jest.mock('form-data')
jest.mock('fs')

const settings = {
  bagel_server_ssl_enabled: true,
  bagel_server_host: 'api.bageldb.ai',
  bagel_server_https_port: 80
}

describe('API class', () => {
  let api

  beforeEach(() => {
    api = new API(settings)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('ping method', async () => {
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ 'nanosecond heartbeat': '1' }),
      data: { 'nanosecond heartbeat': '1' }
    })

    const result = await api.ping()
    expect(result).toBe('pong')
  })

  test('get_version method', async () => {
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ version: '1.0' }),
      data: { version: '1.0' }
    })

    const result = await api.get_version()
    expect(result).toEqual({ version: '1.0' })
  })

  test('create_asset method', async () => {
    const payload = { name: 'test' }
    const apiKey = '4gB2wJPByf8qnUihAmH8dgbGYsZESEOH'

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ id: '123' }),
      status: 200
    })

    await api.create_asset(payload, apiKey)
    expect(fetch).toHaveBeenCalledWith(`${api._api_url}/asset`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  })

  test('get_asset_by_Id method', async () => {
    const id = '123'
    const apiKey = '4gB2wJPByf8qnUihAmH8dgbGYsZESEOH'

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ id: '123', name: 'test' }),
      status: 200
    })

    await api.get_asset_by_Id(id, apiKey)
    expect(fetch).toHaveBeenCalledWith(`${api._api_url}/asset/${id}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })
  })

  test('get_all_assets method', async () => {
    const userId = '101481188466180740994'
    const apiKey = '4gB2wJPByf8qnUihAmH8dgbGYsZESEOH'

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue([{ id: '123', name: 'test' }]),
      status: 200
    })

    await api.get_all_assets(userId, apiKey)
    expect(fetch).toHaveBeenCalledWith(
      `${api._api_url}/datasets?owner=${userId}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    )
  })

  test('delete_asset method', async () => {
    const assetId = '123'
    const apiKey = '4gB2wJPByf8qnUihAmH8dgbGYsZESEOH'

    fetch.mockResolvedValue({
      ok: true,
      json: jest
        .fn()
        .mockResolvedValue({ message: 'Asset deleted successfully' })
    })

    await api.delete_asset(assetId, apiKey)
    expect(fetch).toHaveBeenCalledWith(`${api._api_url}/asset/${assetId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Key': apiKey
      }
    })
  })

  test('reset method', async () => {
    fetch.mockResolvedValue({ ok: true })

    await api.reset()
    expect(fetch).toHaveBeenCalledWith(`${api._api_url}/reset`, {
      method: 'POST'
    })
  })

  // test for update
  test('update_asset', async () => {
    const assetId = '2c3d2be5-c5b5-428a-b96d-07b2d4d6130c'
    const payload = { title: 'man' }
    const apiKey = '4gB2wJPByf8qnUihAmH8dgbGYsZESEOH'

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ message: '' }),
      status: 200
    })
    await api.update_asset(assetId, payload, apiKey)
    expect(fetch).toHaveBeenCalledWith(`${api._api_url}/datasets/${assetId}`, {
      method: 'PUT',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  })

  // test for fine_tune function
  test('fine_tune', async () => {
    const payload = {
      title: 'hello'
    }
    const apiKey = '4gB2wJPByf8qnUihAmH8dgbGYsZESEOH'

    const res = await api.fine_tune(payload, apiKey)

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(res),
      status: 200
    })
    expect(fetch).toHaveBeenCalledWith(`${api._api_url}/asset`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  })

  test('get_job_by_asset', async () => {
    const assetId = ''
    const apiKey = ''

    const res = await api.get_job_by_asset(assetId, apiKey)

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(res),
      status: 200
    })

    expect(fetch).toHaveBeenCalledWith(`${api._api_url}/asset/${assetId}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })
  })

  // test for get_job function in the api.js
  test('get_job', async () => {
    const jobId = ''
    const apiKey = ''
    const res = await api.get_job(jobId, apiKey)

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(res),
      status: 200
    })

    expect(fetch).toHaveBeenCalledWith(`${api._api_url}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })
  })

  // test for query_asset function in api.js
  test('query_asset', async () => {
    const assetId = ''
    const payload = {
      title: 'man'
    }
    const apiKey = ''
    const res = await api.query_asset(assetId, payload, apiKey)
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(res),
      status: 200
    })
    expect(fetch).toHaveBeenCalledWith(
      `${api._api_url}/asset/${assetId}/query`,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )
  })

  // test for add_file function in the api.js
  test('add_file', async () => {
    const assetId = ''
    const filePath = './somefile.txt'
    const apiKey = ''
    const res = await api.add_file(assetId, filePath, apiKey)

    const headers = {
      'x-api-key': apiKey
    }
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(res),
      status: 200
    })

    expect(fetch).toHaveBeenCalledWith(
      `${api._api_url}/asset/${assetId}/upload`,
      {
        method: 'POST',
        body: expect.any(FormData),
        headers
      }
    )
  })

  // test download_model_file function in api.js
  test('download_model_file', async () => {
    const assetId = ''
    const fileName = ''
    const apiKey = ''

    const res = await api.download_model_file(assetId, fileName, apiKey)
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(res),
      status: 200
    })
    expect(fetch).toHaveBeenCalledWith(
      `${api._api_url}/api/v1/jobs/asset/${assetId}/files/${fileName}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    )
  })

  // test get_user_details function in api.js
  test('get_user_details', async () => {
    const userId = ''
    const apiKey = ''

    const res = await api.get_user_details(userId, apiKey)

    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(res),
      status: 200
    })
    expect(fetch).toHaveBeenCalledWith(
      `${api._api_url}/user?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    )
  })
})
