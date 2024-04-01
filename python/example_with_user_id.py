import time
import uuid
import bagel
from bagel.config import Settings
import os

DEMO_KEY_IN_USE = "5QwQk5SUHgSf8wsXGUK6xhiPqt1vvfY6"

# Set environment variable
os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE


def create_and_delete(api):
    """
    Create and delete a cluster
    """
    name = str("create_and_delete_test")
    print(name)

    # Create a cluster
    cluster = api.create_cluster(name=name)
    print(f"cluster size {cluster.cluster_size} mb")
    print(f"embedding size {cluster.embedding_size} ")
    print()

    # Delete it
    api.delete_cluster(name=name)
    print(">> create and delete done !\n")


def create_add_get(api):
    """
    Create, add, and get
    """
    name = "testing"

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name=name)

    # Add documents to the cluster
    _ = cluster.add(
        documents=[
            "This is document1",
            "This is bidhan",
        ],
        metadatas=[{"source": "google"}, {"source": "notion"}],
        ids=[str(uuid.uuid4()), str(uuid.uuid4())],
    )

    # Print count
    print("count of docs:", cluster.count())

    # Get the first item
    first_item = cluster.peek(1)
    if first_item:
        print("get 1st item")
    # detete after test
    api.delete_cluster(name)
    print(">> create_add_get done !\n")


def create_add_find(api):
    """
    Create, add, & find

    Parameters
    ----------
    api : _type_
        _description_
    """
    name = "testing"

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name)

    # Add documents to the cluster
    cluster.add(
        documents=[
            "This is document",
            "This is Towhid",
            "This is text",
        ],
        metadatas=[
            {"source": "notion"},
            {"source": "notion"},
            {"source": "google-doc"},
        ],
        ids=[str(uuid.uuid4()), str(uuid.uuid4()), str(uuid.uuid4())],
    )

    # Query the cluster for similar results
    results = cluster.find(
        query_texts=["This"],
        n_results=5,
        where={"source": "notion"},
        where_document={"$contains": "is"},
    )

    print(results)
    # detete after test
    api.delete_cluster(name)
    print(">> create_add_find done  !\n")


def create_add_find_em(api):
    """Create, add, & find embeddings

    Parameters
    ----------
    api : _type_
        _description_
    """
    name = "testing_embeddings"

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name=name, embedding_model="custom", dimension=3)
    # Add embeddings and other data to the cluster
    try:
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
            documents=["doc1", "doc2", "doc3", "doc4", "doc5", "doc6", "doc7", "doc8"],
            ids=["id1", "id2", "id3", "id4", "id5", "id6", "id7", "id8"],
        )
    except Exception as exc:  # pylint: disable=W0718
        print(exc)
    # Query the cluster for results
    results = cluster.find(query_embeddings=[[1.1, 2.3, 3.2]], n_results=5)

    print("find result:", results)
    # detete after test
    api.delete_cluster(name)
    print(">> create_add_find_em done  !\n")


def create_add_modify_update(api):
    """
    Create, add, modify, and update

    Parameters
    ----------
    api : _type_
        _description_
    """
    name = "testing"
    new_name = "new_" + name

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name)

    # Modify the cluster name
    print("Before:", cluster.name)
    try:
        cluster.modify(name=new_name)
    except Exception as exc:  # pylint: disable=W0718
        print(exc)

    print("After:", cluster.name)

    # Add documents to the cluster
    cluster.add(
        documents=[
            "This is document1",
            "This is bidhan",
        ],
        metadatas=[{"source": "notion"}, {"source": "google"}],
        ids=["id1", "id2"],
    )

    # Retrieve document metadata before updating
    print("Before update:")
    print(cluster.get(ids=["id1"]))

    # Update document metadata
    cluster.update(ids=["id1"], metadatas=[{"source": "google"}])

    # Retrieve document metadata after updating
    print("After update source:")
    print(cluster.get(ids=["id1"]))
    # detete after test
    api.delete_cluster(new_name)
    print(">> create_add_modify_update done !\n")


def create_upsert(api):
    """
    Create and upsert

    Parameters
    ----------
    api : _type_
        _description_
    """
    name = "testing"

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name)

    # Add documents to the cluster
    try:
        cluster.add(
            documents=[
                "This is document1",
                "This is bidhan",
            ],
            metadatas=[{"source": "notion"}, {"source": "google"}],
            ids=["id1", "id2"],
        )
    except Exception as exc:  # pylint: disable=W0718
        print("add warning: ", exc)
    # Upsert documents in the cluster
    try:
        cluster.upsert(
            documents=[
                "This is document",
                "This is google",
            ],
            metadatas=[{"source": "notion"}, {"source": "google"}],
            ids=["id1", "id3"],
        )
    except Exception as exc:  # pylint: disable=W0718
        print("upsert warning: ", exc)
    # Print the count of documents in the cluster
    print("Count of documents :", cluster.count())
    # detete after test
    api.delete_cluster(name)
    print(">> create_upsert done !\n")


def add_image_find(api):
    """
    Create and add image and find
    """
    # Generate a unique cluster name using UUID
    name = "image_add_test"

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name, embedding_model="bagel-multi-modal")
    img_file_list = [
        "image_emb/test.jpg",
        "image_emb/test.png",
    ]  # add image path to the list
    for filename in img_file_list:
        resp = cluster.add_image(filename)
        print("---------------\n", resp.json())

    # Print count
    print("count of images:", cluster.count())
    # Get the first item
    first_item = cluster.peek(1)
    embeddings = first_item.get("embeddings")[0]  # replace with your embedding

    # Query the cluster for similar results
    results = cluster.find(query_embeddings=embeddings, n_results=5)

    print(results)
    # Delete it
    api.delete_cluster(name)
    print(">> add_image_find done !\n")


def add_image_urls_find(api):
    """
    Create and add images by urls
    """
    # Generate a unique cluster name using UUID
    name = "image_add_urls_tesing"

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name=name, embedding_model="bagel-multi-modal")
    urls = [
        "https://bagel-public-models-s3-download.s3.eu-north-1.amazonaws.com/cat/60de145c79609acaba3bbe08974a9ff5.jpg",
        "https://bagel-public-models-s3-download.s3.eu-north-1.amazonaws.com/cat/black-white-cat-wallpaper.jpg",
        "https://bagel-public-models-s3-download.s3.eu-north-1.amazonaws.com/cat/cat-10-e1573844975155.jpg",
        "https://bagel-public-models-s3-download.s3.eu-north-1.amazonaws.com/dog/thumb-1920-454156.jpg",
        "https://bagel-public-models-s3-download.s3.eu-north-1.amazonaws.com/dog/istockphoto-1181270413-170667a.jpg",
    ]
    ids = [str(uuid.uuid4()) for i in range(len(urls))]
    resp = cluster.add_image_urls(ids=ids, urls=urls)
    print("count of images:", cluster.count())

    # Get the first item
    first_item = cluster.peek(1)
    embeddings = first_item.get("embeddings")[0]  # replace with your embedding

    # Query the cluster for similar results
    results = cluster.find(query_embeddings=embeddings, n_results=5)
    print(results)
    # Delete it
    api.delete_cluster(name)
    print(">> add_image_urls_find done !\n")


def share_cluster(api):

    name = "testing_cluster_sharing"

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name=name)
    print("Cluster created:", cluster.name)

    cluster.share_with(usernames = [
        "hugging-face"
    ])

    api.delete_cluster(name)
    print(">> create_add_find done  !\n")

def main():
    start_time = time.time()  # Record the start time

    # Bagel server settings for production
    server_settings = Settings(
        bagel_api_impl="rest",
        bagel_server_host="api.bageldb.ai",
    )

    # Bagel server settings for local
    # server_settings = Settings(
    #     bagel_api_impl="rest",
    #     bagel_server_host="localhost",
    #     bagel_server_http_port="8088",
    # )

    # Create Bagel client
    client = bagel.Client(server_settings)

    # Ping the Bagel server
    print("ping: ", client.ping())

    # Get the Bagel server version
    print("version: ", client.get_version())

    # calling all functions
    create_and_delete(client)
    create_add_get(client)
    create_add_find(client)
    create_add_find_em(client)
    share_cluster(client)
    create_add_modify_update(client)
    create_upsert(client)
    add_image_find(client)
    add_image_urls_find(client)
    end_time = time.time()  # Record the end time
    execution_time = end_time - start_time  # Calculate the execution time
    print(f"Total execution time: {execution_time:.2f} seconds")


if __name__ == "__main__":
    main()
