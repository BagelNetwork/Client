import bagel as bagel
import unittest
from langchain_community.vectorstores import Bagel
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

class TestLangchain(unittest.TestCase):
    def test_01_create_vectorstore_from_texts(self):
        texts = ["hello bagel", "hello langchain", "I love salad", "my car", "a dog"]
        cluster = Bagel.from_texts(cluster_name="testing_texts", texts=texts)
        docs = cluster.similarity_search("bagel", k=3)
        cluster.delete_cluster()

    def test_02_create_vectorstore_from_docs(self):
        loader = TextLoader("test/state_of_the_union_2023.txt")
        documents = loader.load()
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        docs = text_splitter.split_documents(documents)[:10]
        cluster = Bagel.from_documents(cluster_name="testing_docs", documents=docs)
        query = "What did the president say about Ketanji Brown Jackson"
        docs = cluster.similarity_search(query)
        cluster.delete_cluster()

    def test_03_create_cluster_with_metadata(self):
        texts = ["hello bagel", "this is langchain"]
        metadatas = [{"source": "notion"}, {"source": "google"}]
        cluster = Bagel.from_texts(cluster_name="testing_metadata", texts=texts, metadatas=metadatas)
        results = cluster.similarity_search_with_score("hello bagel", where={"source": "notion"})
        cluster.delete_cluster()

    def test_04_get_all_data_from_cluster(self):
        texts = ["hello bagel", "this is langchain"]
        cluster = Bagel.from_texts(cluster_name="testing_get_data", texts=texts)
        cluster_data = cluster.get()
        cluster.delete_cluster()

if __name__ == "__main__":
    unittest.main()