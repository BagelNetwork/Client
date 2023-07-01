import os
import requests
import json

class BagelDB:
    def __init__(self, index):
        """
        Constructor to initialize BagelDB and OpenAI base URLs, OpenAI API key from environment variables, 
        and an index that can't be changed afterwards.
        
        :param index: The index in which vectors are to be inserted or searched.
        :type index: str
        """
        if not isinstance(index, str):
            raise ValueError("Index must be a string")

        self.baseURL = 'https://api.bageldb.ai'
        self.openAIURL = 'https://api.openai.com'
        self.openAIKey = os.getenv('OPENAI_API_KEY')
        self.index = index

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

    def insert(self, vectors):
        """
        Method to insert vectors into the initialized index in BagelDB.
        
        :param vectors: An array of vectors to be inserted.
        :type vectors: list
        :return: Response from the BagelDB API in json format.
        :rtype: dict
        """
        if not isinstance(vectors, list):
            raise ValueError("Vectors must be an array")

        for vector in vectors:
            if not ('id' in vector and isinstance(vector['values'], list) and isinstance(vector['metadata'], dict)):
                raise ValueError("Each vector must be an object with an 'id', 'values' array, and 'metadata' object")

        data = {
            "index": self.index,
            "vectors": vectors
        }

        try:
            response = requests.post(f'{self.baseURL}/v0/insert', data=json.dumps(data))
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as err:
            print(f'Request failed: {err}')

    def search(self, vector):
        """
        Method to search for a vector in the initialized index in BagelDB.
        
        :param vector: The vector for which the search is to be performed.
        :type vector: list
        :return: Response from the BagelDB API in json format.
        :rtype: dict
        """
        if not isinstance(vector, list):
            raise ValueError("Vector must be an array")

        data = {
            "index": self.index,
            "vector": vector
        }

        try:
            response = requests.post(f'{self.baseURL}/v0/search', data=json.dumps(data))
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as err:
            print(f'Request failed: {err}')

    def insertFromTexts(self, texts, model='text-embedding-ada-002'):
        """
        Method to convert a list of texts to embeddings and insert them into the initialized index in BagelDB.

        :param texts: A list of texts to be converted to embeddings and inserted.
        :type texts: list of str
        :param model: The model to use for generating embeddings. Defaults to 'text-embedding-ada-002'.
        :type model: str, optional
        :return: Response from the BagelDB API in json format.
        :rtype: dict
        """
        if not isinstance(texts, list):
            raise ValueError("Texts must be a list")

        vectors = []
        for i, text in enumerate(texts):
            embedding = self.getOpenAIEmbedding(text, model)
            vector = {
                'id': f'vec{i}',
                'values': embedding['embeddings'],
                'metadata': {'text': text},
            }
            vectors.append(vector)

        return self.insert(vectors)

    def searchFromText(self, text, model='text-embedding-ada-002'):
        """
        Method to convert a text to an embedding and search for it in the initialized index in BagelDB.

        :param text: The text to be converted to an embedding and searched.
        :type text: str
        :param model: The model to use for generating embeddings. Defaults to 'text-embedding-ada-002'.
        :type model: str, optional
        :return: Response from the BagelDB API in json format.
        :rtype: dict
        """
        if not isinstance(text, str):
            raise ValueError("Text must be a string")

        embedding = self.getOpenAIEmbedding(text, model)
        vector = embedding['embeddings']

        return self.search(vector)

