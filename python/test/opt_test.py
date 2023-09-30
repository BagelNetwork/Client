import time
import uuid
import bagel
from bagel.config import Settings


def one_by_one(api, texts):
    """
    Create and delete a cluster
    """
    # Generate a unique cluster name using UUID
    name = str(uuid.uuid4())
    print(name)

    # Create a cluster
    cluster = api.get_or_create_cluster(name)

    for text in texts:
        cluster.add(
            documents=[text],
            metadatas=[{"source": "google"}],
            ids=[str(uuid.uuid4())],
        )

    # Delete it
    api.delete_cluster(name)


def add_all(api, texts):
    # Generate a unique cluster name using UUID
    name = str(uuid.uuid4())
    # Create a cluster
    cluster = api.get_or_create_cluster(name)

    # adding all at once
    metadatas = [{"source": "google"} for i in range(len(texts))]
    ids = [str(uuid.uuid4()) for i in range(len(texts))]
    cluster.add(documents=texts, metadatas=metadatas, ids=ids)

    # Delete it
    api.delete_cluster(name)


def main():
    # Bagel server settings
    server_settings = Settings(
        bagel_api_impl="rest",
        bagel_server_host="localhost:8000",
    )

    # Create Bagel client
    client = bagel.Client(server_settings)

    # Ping the Bagel server
    print("ping: ", client.ping())

    # Get the Bagel server version
    print("version: ", client.get_version())

    # Specify the path to your text file
    file_path = "state_of_the_union_2023.txt"
    file_encoding = "utf-8"
    # Initialize an empty list to store the lines
    lines = []
    # Open the file and read its lines
    with open(file_path, "r", encoding=file_encoding) as file:
        for line in file:
            line = line.strip()
            if line != "":
                lines.append(line.strip())

    start_time = time.time()  # Record the start time
    one_by_one(client, lines)
    end_time = time.time()  # Record the end time
    execution_time = end_time - start_time  # Calculate the execution time
    print(f"one_by_one execution time: {execution_time:.2f} seconds")

    start_time = time.time()  # Record the start time
    add_all(client, lines)
    end_time = time.time()  # Record the end time
    execution_time = end_time - start_time  # Calculate the execution time
    print(f"add_all execution time: {execution_time:.2f} seconds")


if __name__ == "__main__":
    main()
