import unittest
from unittest.mock import patch, Mock
from betabageldb import BagelDB

class TestBagelDB(unittest.TestCase):
    def setUp(self):
        self.bagelDB = BagelDB()
        self.index = 'bagel'
        self.vector = [1.0, 2.0, 3.0, 4.0]
        self.inputText = 'Some input text'
        self.model = 'text-embedding-ada-002'

    @patch('requests.get')
    def test_ping(self, mock_get):
        mock_get.return_value.json.return_value = {'status': 'ok'}
        result = self.bagelDB.ping()
        self.assertEqual(result, {'status': 'ok'})
        mock_get.assert_called_once_with(f'{self.bagelDB.baseURL}/v0/ping')

    @patch('requests.post')
    def test_getOpenAIEmbedding(self, mock_post):
        mock_post.return_value.json.return_value = {'embeddings': [0.1, 0.2, 0.3, 0.4]}
        result = self.bagelDB.getOpenAIEmbedding(self.inputText, self.model)
        self.assertEqual(result, {'embeddings': [0.1, 0.2, 0.3, 0.4]})
        mock_post.assert_called_once_with(
            f'{self.bagelDB.openAIURL}/v1/embeddings',
            data='{"input": "Some input text", "model": "text-embedding-ada-002"}',
            headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {self.bagelDB.openAIKey}'}
        )

    @patch('requests.post')
    def test_insert(self, mock_post):
        vectors = [
            {
                'id': 'vec1',
                'values': [0.1, 0.2, 0.3, 0.4],
                'metadata': {'genre': 'drama'},
            },
            {
                'id': 'vec2',
                'values': [0.2, 0.3, 0.4, 0.5],
                'metadata': {'genre': 'action'},
            },
        ]
        mock_post.return_value.json.return_value = {'status': 'ok'}
        result = self.bagelDB.insert(self.index, vectors)
        self.assertEqual(result, {'status': 'ok'})
        mock_post.assert_called_once_with(
            f'{self.bagelDB.baseURL}/v0/insert',
            data='{"index": "bagel", "vectors": [{"id": "vec1", "values": [0.1, 0.2, 0.3, 0.4], "metadata": {"genre": "drama"}}, {"id": "vec2", "values": [0.2, 0.3, 0.4, 0.5], "metadata": {"genre": "action"}}]}'
        )

    @patch('requests.post')
    def test_search(self, mock_post):
        mock_post.return_value.json.return_value = {
            'results': {
                'matches': [{'score': 0.75, 'vectorId': 'vec1'}, {'score': 0.65, 'vectorId': 'vec2'}]
            }
        }
        result = self.bagelDB.search(self.index, self.vector)
        self.assertEqual(result, {'results': {'matches': [{'score': 0.75, 'vectorId': 'vec1'}, {'score': 0.65, 'vectorId': 'vec2'}]}})
        mock_post.assert_called_once_with(
            f'{self.bagelDB.baseURL}/v0/search',
            data='{"index": "bagel", "vector": [1.0, 2.0, 3.0, 4.0]}'
        )

if __name__ == '__main__':
    unittest.main()


