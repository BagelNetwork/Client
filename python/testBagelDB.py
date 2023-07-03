import os
import unittest
import BagelDB

class TestBagelDB(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bageldb = BagelDB.BagelDB('your_real_index')

    def test_constructor(self):
        self.assertEqual(self.bageldb.index, 'your_real_index')
        self.assertEqual(self.bageldb.openAIKey, os.getenv('OPENAI_API_KEY'))

    def test_ping(self):
        response = self.bageldb.ping()
        self.assertIn('ok', response.values())

    #def test_getOpenAIEmbedding(self):
    #    response = self.bageldb.getOpenAIEmbedding('test_text')
    #    self.assertIn('embedding', response['data'][0])

    def test_insert(self):
        response = self.bageldb.insert([{'id': 'test_id', 'values': [1.0], 'metadata': {}}])
        self.assertIn('status', response)

    def test_search(self):
        response = self.bageldb.search([1.0])
        self.assertIn('results', response)

    def test_insertFromTexts(self):
        response = self.bageldb.insertFromTexts(['test_text'])
        self.assertIn('status', response)

    def test_searchFromText(self):
        response = self.bageldb.searchFromText('test_text')
        self.assertIn('results', response)

if __name__ == '__main__':
    unittest.main()
