import os
import bagel
from bagel.config import Settings
from uuid import UUID

api_key = "sayapEip7OHVM0ko9PtzHhGN4cqrxb7s"

def create_dataset(api):
    name = "test_dataset_client2"
    description = "Test dataset created from python client"

    dataset = api.create_dataset(
        dataset_id=UUID,
        name=name,
        description=description,
        api_key=api_key
    )
    return dataset

def get_dataset_info(api, dataset_id):
    dataset = api.get_dataset_info(dataset_id)
    return dataset

def upload_dataset_file(api, dataset_id, file_path):
    
    file_name = os.path.basename(file_path)
    with open(file_path, "rb") as file:
        file_content = file.read()
    
    message = api.upload_dataset(
        dataset_id=dataset_id,
        file_name=file_name,
        file_content=file_content
    )

def main():
    # Bagel server settings for local testing
    server_settings = Settings(
        bagel_api_impl="rest",
        bagel_server_host="localhost",
        bagel_server_http_port="8088",
    )

    # Create Bagel client
    client = bagel.Client(server_settings)

    # Create a dataset
    dataset = create_dataset(client)

    file_path = "data/image.png"

    # Upload a file to the dataset
    upload_dataset_file(client, dataset, file_path)

    target_dir = "downloaded_dataset"

    # Get dataset info
    dataset_info = get_dataset_info(client, dataset)

    # Download all files from the dataset
    client.download_dataset_files(dataset, target_dir)

if __name__ == "__main__":
    main()