import pytest
import uuid
import bagel
from bagel.config import Settings


CLUSTER_NAME = str(uuid.uuid4())

@pytest.fixture
def cluster():
    server_settings = Settings(
        bagel_api_impl="rest",
        bagel_server_host="api.bageldb.ai",
    )

    client = bagel.Client(server_settings)
    return client.get_or_create_cluster(CLUSTER_NAME)


def test_cluster(cluster):
    assert cluster.cluster_size == 0
    assert cluster.embedding_size is None


def test_add(cluster):
    cluster.add(ids=["id"], documents=["test doc"], metadatas=[{"meta": "m1"}])
    assert cluster.count() == 1


def test_get(cluster):
    resp = cluster.get(ids=["id"])
    assert resp.get("ids")[0] == "id"


def test_find(cluster):
    resp = cluster.find(
        query_texts=["test"],
        n_results=1
    )
    assert resp.get("ids")[0] == ["id"]


def test_delete():
    server_settings = Settings(
        bagel_api_impl="rest",
        bagel_server_host="api.bageldb.ai",
    )

    client = bagel.Client(server_settings)
    client.delete_cluster(CLUSTER_NAME)
    with pytest.raises(Exception):
        client.get_cluster(CLUSTER_NAME)
