import uuid
import bagel
from bagel.config import Settings
import requests


def check_emaillist(api):
    """
    Email waitlist test
    """
    valid_email = "example@gmail.com"

    url = api.get_api_url().replace('/api/v1', '') + "/join_waitlist/" + valid_email
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        # If the response is in JSON format, you can access the data like this:
        json_data = response.json()
        if json_data["message"] == "successful":
            print("joined_waitlist")
    except requests.exceptions.RequestException as ex:
        print(f"An error occurred: {ex}")


def create_and_delete(api):
    """
    Create and delete a cluster
    """
    # Generate a unique cluster name using UUID
    name = str(uuid.uuid4())
    print(name)

    # Create a cluster
    _ = api.create_cluster(name)

    # Delete it
    api.delete_cluster(name)
    print("create and delete done!")


def create_add_get(api):
    """
    Create, add, and get
    """
    name = "testing"

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name)

    # Add documents to the cluster
    cluster.add(
        documents=[
            "This is document1",
            "This is bidhan",
        ],
        metadatas=[
            {"source": "google"},
            {"source": "duckduckgo"}
        ],
        ids=[str(uuid.uuid4()), str(uuid.uuid4())]
    )

    # Print count
    print("count of docs:", cluster.count())

    # Get the first item
    first_item = cluster.peek(1)
    if first_item:
        print("get 1st item")

    print("create_add_get done!")


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
            "This is document2",
            "This is Towhid",
        ],
        metadatas=[{"source": "notion"},
                   {"source": "google-doc"}],
        ids=[str(uuid.uuid4()), str(uuid.uuid4())],
    )

    # Query the cluster for similar results
    results = cluster.find(
        query_texts=["This"],
        n_results=1,
    )

    print("find result:", results)
    print("create_add_find done !")


def create_add_find_em(api):
    """Create, add, & find embeddings

    Parameters
    ----------
    api : _type_
        _description_
    """
    name = "testing_embeddings"
    # Reset the Bagel server
    api.reset()

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name)
    # Add embeddings and other data to the cluster
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

    # Query the cluster for results
    results = cluster.find(
        query_embeddings=[[1.1, 2.3, 3.2]],
        n_results=2
    )

    print("find result:", results)
    print("create_add_find_em done !")


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
    cluster.modify(name=new_name)
    print("After:", cluster.name)

    # Add documents to the cluster
    cluster.add(
        documents=[
            "This is document1",
            "This is bidhan",
        ],
        metadatas=[
            {"source": "notion"},
            {"source": "google"}
        ],
        ids=["id1", "id2"]
    )

    # Retrieve document metadata before updating
    print("Before update:")
    print(cluster.get(ids=["id1"]))

    # Update document metadata
    cluster.update(
        ids=["id1"],
        metadatas=[
            {"source": "google"}
        ]
    )

    # Retrieve document metadata after updating
    print("After update:")
    print(cluster.get(ids=["id1"]))

    print("create_add_modify_update done!")


def create_upsert(api):
    """
    Create and upsert

    Parameters
    ----------
    api : _type_
        _description_
    """
    # Reset the Bagel server
    api.reset()

    name = "testing"

    # Get or create a cluster
    cluster = api.get_or_create_cluster(name)

    # Add documents to the cluster
    cluster.add(
        documents=[
            "This is document1",
            "This is bidhan",
        ],
        metadatas=[
            {"source": "notion"},
            {"source": "google"}
        ],
        ids=["id1", "id2"]
    )

    # Upsert documents in the cluster
    cluster.upsert(
        documents=[
            "This is document",
            "This is google",
        ],
        metadatas=[
            {"source": "notion"},
            {"source": "google"}
        ],
        ids=["id1", "id3"]
    )

    # Print the count of documents in the cluster
    print("Count of documents:", cluster.count())
    print("create_upsert done!")


def main():
    # Bagel server settings
    server_settings = Settings(
        bagel_api_impl="rest",
        bagel_server_host="api.bageldb.ai"
    )
    # Create Bagel client
    client = bagel.Client(server_settings)

    # Ping the Bagel server
    print("ping >>", client.ping())

    # Get the Bagel server version
    print("version >>", client.get_version())

    # calling all functions
    check_emaillist(client)
    create_and_delete(client)
    create_add_get(client)
    create_add_find(client)
    create_add_find_em(client)
    create_add_modify_update(client)
    create_upsert(client)


if __name__ == "__main__":
    main()
