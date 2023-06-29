import os
import requests
import json

class BagelDB:
    def __init__(self):
        """
        Constructor to initialize BagelDB and OpenAI base URLs and OpenAI API key from environment variables.
        """
        self.baseURL = 'https://api.bageldb.ai'
        self.openAIURL = 'https://api.openai.com'
        self.openAIKey = os.getenv('OPENAI_API_KEY')

    def ping(self):
        """
        Method to send a GET request to the BagelDB API.
        
        :return: Response from the BagelDB API in json format.
        :rtype: dict
        """
        try:
            response = requests.get(f'{self.baseURL}/v0/ping')
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as err:
            print(f'Request failed: {err}')

    def getOpenAIEmbedding(self, inputText, model='text-embedding-ada-002'):
        """
        Method to get OpenAI embeddings.
        
        :param inputText: The input text for which embeddings are required.
        :type inputText: str
        :param model: The model to use for generating embeddings. Defaults to 'text-embedding-ada-002'.
        :type model: str, optional
        :return: Embeddings from OpenAI in json format.
        :rtype: dict
        """
        if not isinstance(inputText, str):
            raise ValueError("Input text must be a string")

        if not self.openAIKey:
            raise ValueError("OpenAI API key is missing from environment variables")

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.openAIKey}'
        }

        data = {
            "input": inputText,
            "model": model
        }

        try:
            response = requests.post(f'{self.openAIURL}/v1/embeddings', headers=headers, data=json.dumps(data))
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as err:
            print(f'Request failed: {err}')

    def insert(self, index, vectors):
        """
        Method to insert vectors into a given index in BagelDB.
        
        :param index: The index in which vectors are to be inserted.
        :type index: str
        :param vectors: An array of vectors to be inserted.
        :type vectors: list
        :return: Response from the BagelDB API in json format.
        :rtype: dict
        """
        if not isinstance(index, str):
            raise ValueError("Index must be a string")

        if not isinstance(vectors, list):
            raise ValueError("Vectors must be an array")

        for vector in vectors:
            if not ('id' in vector and isinstance(vector['values'], list) and isinstance(vector['metadata'], dict)):
                raise ValueError("Each vector must be an object with an 'id', 'values' array, and 'metadata' object")

        data = {
            "index": index,
            "vectors": vectors
        }

        try:
            response = requests.post(f'{self.baseURL}/v0/insert', data=json.dumps(data))
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as err:
            print(f'Request failed: {err}')

    def search(self, index, vector):
        """
        Method to search for a vector in a given index in BagelDB.
        
        :param index: The index in which the search is to be performed.
        :type index: str
        :param vector: The vector for which the search is to be performed.
        :type vector: list
        :return: Response from the BagelDB API in json format.
        :rtype: dict
        """
        if not isinstance(index, str):
            raise ValueError("Index must be a string")

        if not isinstance(vector, list):
            raise ValueError("Vector must be an array")

        data = {
            "index": index,
            "vector": vector
        }

        try:
            response = requests.post(f'{self.baseURL}/v0/search', data=json.dumps(data))
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as err:
            print(f'Request failed: {err}')

