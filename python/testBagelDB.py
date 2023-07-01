import unittest
from unittest.mock import patch, Mock
from BagelDB import BagelDB
import json

class TestBagelDB(unittest.TestCase):
    def setUp(self):
        self.index = 'bagel'
        self.bagelDB = BagelDB(self.index)
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
        result = self.bagelDB.insert(vectors)
        self.assertEqual(result, {'status': 'ok'})
        mock_post.assert_called_once_with(
            f'{self.bagelDB.baseURL}/v0/insert',
            data=f'{{"index": "{self.index}", "vectors": {json.dumps(vectors)}}}'
        )

    @patch('requests.post')
    def test_search(self, mock_post):
        mock_post.return_value.json.return_value = {
            'results': {
                'matches': [{'score': 0.75, 'vectorId': 'vec1'}, {'score': 0.65, 'vectorId': 'vec2'}]
            }
        }
        result = self.bagelDB.search(self.vector)
        self.assertEqual(result, {'results': {'matches': [{'score': 0.75, 'vectorId': 'vec1'}, {'score': 0.65, 'vectorId': 'vec2'}]}})
        mock_post.assert_called_once_with(
            f'{self.bagelDB.baseURL}/v0/search',
            data=f'{{"index": "{self.index}", "vector": {self.vector}}}'
        )

    @patch.object(BagelDB, 'getOpenAIEmbedding')
    @patch('requests.post')
    def test_insertFromTexts(self, mock_post, mock_getEmbedding):
        mock_getEmbedding.return_value = {'embeddings': [0.1, 0.2, 0.3, 0.4]}
        texts = ["Some text 1", "Some text 2"]
        vectors = [
            {
                'id': 'vec0',
                'values': [0.1, 0.2, 0.3, 0.4],
                'metadata': {'text': "Some text 1"},
            },
            {
                'id': 'vec1',
                'values': [0.1, 0.2, 0.3, 0.4],
                'metadata': {'text': "Some text 2"},
            },
        ]
        mock_post.return_value.json.return_value = {'status': 'ok'}
        result = self.bagelDB.insertFromTexts(texts, self.model)
        self.assertEqual(result, {'status': 'ok'})
        mock_post.assert_called_once_with(
            f'{self.bagelDB.baseURL}/v0/insert',
            data=f'{{"index": "{self.index}", "vectors": {json.dumps(vectors)}}}'
        )

    @patch.object(BagelDB, 'getOpenAIEmbedding')
    @patch('requests.post')
    def test_searchFromText(self, mock_post, mock_getEmbedding):
        mock_getEmbedding.return_value = {'embeddings': [0.1, 0.2, 0.3, 0.4]}
        mock_post.return_value.json.return_value = {
            'results': {
                'matches': [{'score': 0.75, 'vectorId': 'vec1'}, {'score': 0.65, 'vectorId': 'vec2'}]
            }
        }
        result = self.bagelDB.searchFromText(self.inputText, self.model)
        self.assertEqual(result, {'results': {'matches': [{'score': 0.75, 'vectorId': 'vec1'}, {'score': 0.65, 'vectorId': 'vec2'}]}})
        mock_post.assert_called_once_with(
            f'{self.bagelDB.baseURL}/v0/search',
            data=f'{{"index": "{self.index}", "vector": {mock_getEmbedding.return_value["embeddings"]}}}'
        )

if __name__ == '__main__':
    unittest.main()
