import os
import time

import bagel
from bagel import API
from bagel.api import CreateDatasetPayload
from bagel.config import Settings

DEMO_KEY_IN_USE = "iX6I91z5ZxeQglZKfmSNZICBTaGgEYxW"

# Set environment variable
os.environ['BAGEL_API_KEY'] = DEMO_KEY_IN_USE


def create_and_delete(api: API):
    dataset = api.create_dataset(CreateDatasetPayload(
        title="string", tags=["string"], category="string", details="string"))
    print(f"Dataset created successfully {dataset.dataset_id}")

    dataset.delete()
    print(f"Dataset deleted successfully {dataset.dataset_id}")


def create_and_publish_to_marketplace(api: API):
    dataset = api.create_dataset(CreateDatasetPayload(
        title="string", tags=["string"], category="string", details="string"))
    print(f"Dataset created successfully {dataset.dataset_id}")

    dataset.publish_to_marketplace()
    print(f"Dataset published successfully {dataset.dataset_id}")


def download_dataset(api):
    df = api.load_dataset("test-upload")
    print(df)


def upload_dataset(api):
    file_path = "image_emb/input.csv"
    dataset_id = "test-upload"
    api.upload_dataset(file_path=file_path, dataset_id=dataset_id, file_name="input.csv", rows_per_chunk=5)


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
    create_and_publish_to_marketplace(client)
    upload_dataset(client)
    download_dataset(client)

    end_time = time.time()  # Record the end time
    execution_time = end_time - start_time  # Calculate the execution time
    print(f"Total execution time: {execution_time:.2f} seconds")


if __name__ == "__main__":
    main()
