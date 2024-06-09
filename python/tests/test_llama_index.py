import unittest
import bagel
from bagel import Settings
import uuid

class TestLlamaIndexBagel(unittest.TestCase):
    def setUp(self):
        # Set up the Bagel server settings
        self.server_settings = Settings(
            bagel_api_impl="rest", bagel_server_host="api.bageldb.ai"
        )
        # Create a Bagel client
        self.client = bagel.Client(self.server_settings)

    def test_01_create_add_get(self):
        # Create a cluster
        cluster = self.client.get_or_create_cluster("test_create_add_get")
        
        # Add documents to the cluster
        cluster.add(
            documents=["This is document1", "This is document2"],
            metadatas=[{"source": "google"}, {"source": "notion"}],
            ids=[str(uuid.uuid4()), str(uuid.uuid4())],
        )
        
        # Get the first item
        first_item = cluster.peek(1)
        self.assertIsNotNone(first_item)
        
        # Clean up the cluster
        self.client.delete_cluster("test_create_add_get")

    def test_02_create_add_find_by_text(self):
        # Create a cluster
        cluster = self.client.get_or_create_cluster("test_create_add_find_by_text")
        
        # Add documents to the cluster
        cluster.add(
            documents=["This is document", "This is Towhid", "This is text"],
            metadatas=[{"source": "notion"}, {"source": "notion"}, {"source": "google-doc"}],
            ids=[str(uuid.uuid4()), str(uuid.uuid4()), str(uuid.uuid4())],
        )
        
        # Query the cluster for similar results
        results = cluster.find(
            query_texts=["This"],
            n_results=5,
            where={"source": "notion"},
            where_document={"$contains": "is"},
        )
        self.assertIsNotNone(results)
        
        # Clean up the cluster
        self.client.delete_cluster("test_create_add_find_by_text")

    def test_03_create_add_find_by_embeddings(self):
        # Create a cluster
        cluster = self.client.get_or_create_cluster("test_create_add_find_by_embeddings", embedding_model="custom", dimension=3)
        
        cluster.add(
        embeddings=[
                [1.1, 2.3, 3.2],
                [4.5, 6.9, 4.4],
                [1.1, 2.3, 3.2],
                [4.5, 6.9, 4.4],
                [1.1, 2.3, 3.2],
                [4.5, 6.9, 4.4],
                [1.1, 2.3, 3.2],
                [4.5, 6.9, 4.4],
            ],
            metadatas=[
                {"uri": "img1.png", "style": "style1"},
                {"uri": "img2.png", "style": "style2"},
                {"uri": "img3.png", "style": "style1"},
                {"uri": "img4.png", "style": "style1"},
                {"uri": "img5.png", "style": "style1"},
                {"uri": "img6.png", "style": "style1"},
                {"uri": "img7.png", "style": "style1"},
                {"uri": "img8.png", "style": "style1"},
            ],
            documents=[
                "doc1",
                "doc2",
                "doc3",
                "doc4",
                "doc5",
                "doc6",
                "doc7",
                "doc8",
            ],
            ids=["id1", "id2", "id3", "id4", "id5", "id6", "id7", "id8"],
        )

        # Query the cluster for results
        results = cluster.find(query_embeddings=[[1.1, 2.3, 3.2]], n_results=5)
        self.assertIsNotNone(results)
        
        # Clean up the cluster
        self.client.delete_cluster("test_create_add_find_by_embeddings")

    def test_04_create_add_modify_update(self):
        # Create a cluster
        cluster = self.client.get_or_create_cluster("test_create_add_modify_update")
        
        # Add documents to the cluster
        cluster.add(
            documents=["This is document1", "This is document2"],
            metadatas=[{"source": "notion"}, {"source": "google"}],
            ids=["id1", "id2"],
        )
        
        # Retrieve document metadata before updating
        before_update = cluster.get(ids=["id1"])
        
        # Update document metadata
        cluster.update(ids=["id1"], metadatas=[{"source": "google"}])
        
        # Retrieve document metadata after updating
        after_update = cluster.get(ids=["id1"])
        
        self.assertNotEqual(before_update, after_update)
        
        # Clean up the cluster
        self.client.delete_cluster("test_create_add_modify_update")

    def test_05_create_upsert(self):
        # Create a cluster
        cluster = self.client.get_or_create_cluster("test_create_upsert")
        
        # Add documents to the cluster
        cluster.add(
            documents=["This is document1", "This is document2"],
            metadatas=[{"source": "notion"}, {"source": "google"}],
            ids=["id1", "id2"],
        )
        
        # Upsert documents in the cluster
        cluster.upsert(
            documents=["This is updated document1", "This is new document3"],
            metadatas=[{"source": "notion"}, {"source": "google"}],
            ids=["id1", "id3"],
        )
        
        # Retrieve the updated and new documents
        updated_doc = cluster.get(ids=["id1"])
        new_doc = cluster.get(ids=["id3"])
        
        self.assertIsNotNone(updated_doc)
        self.assertIsNotNone(new_doc)
        
        # Clean up the cluster
        self.client.delete_cluster("test_create_upsert")

if __name__ == "__main__":
    unittest.main()