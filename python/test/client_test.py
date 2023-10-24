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
    resp = cluster.find(query_texts=["test"], n_results=1)
    assert resp.get("ids")[0] == ["id"]


def test_upsert(cluster):
    cluster.upsert(
        documents=[
            "test new",
            "test upsert",
        ],
        metadatas=[{"source": "notion"}, {"source": "google"}],
        ids=["id", "id3"],
    )
    assert cluster.count() == 2


def test_big_text(cluster):
    cluster.add(
        ids=["id4"],
        documents=[
            """Hello and a hearty welcome to the BagelDB client hub!
            It's an absolute delight and thrill to have you join us
            on this exciting journey into the future of BagelDB. As
            we stand on the cusp of technological innovation,
            embarking on this forward-thinking adventure, we
            can't help but feel the exhilaration of what's to come.
            Our team is committed to pushing the boundaries,
            constantly innovating and evolving to stay ahead of
            the curve and we are dedicated to providing you with
            top-notch service and support, ensuring that your
            experience with BagelDB is nothing short of exceptional.
            """
        ],
        metadatas=[{"meta": "m1"}],
    )
    assert cluster.count() == 3


def test_img_url(cluster):
    url = [
        "https://bagel-public-models-s3-download.s3.eu-north-1.amazonaws.com/dog/thumb-1920-454156.jpg",
    ]
    cluster.add_image_urls(ids=["ids"], urls=url)
    assert cluster.count() == 4


# client tests
@pytest.fixture
def client():
    server_settings = Settings(
        bagel_api_impl="rest",
        bagel_server_host="api.bageldb.ai",
    )
    return bagel.Client(server_settings)


def test_ping(client):
    resp = client.ping()
    assert isinstance(resp, int)


def test_version(client):
    assert isinstance(client.get_version(), str)


def test_delete(client):
    client.delete_cluster(CLUSTER_NAME)
    with pytest.raises(Exception):
        client.get_cluster(CLUSTER_NAME)
