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
    print("Dataset created:", dataset)
    return dataset

def get_dataset_info(api, dataset_id):
    dataset = api.get_dataset_info(dataset_id)
    print("Dataset info:", dataset)
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
    print("File upload message:", message)

def download_dataset_files(api, dataset_info, target_dir):

    dataset_id = dataset_info['dataset_id']
    repo_info = dataset_info['repo_info']
    files = repo_info['files']

    for file_info in files:
        file_path = file_info['path']
        if file_info['type'] == "file":
            file_content, file_name, file_type = api.download_dataset(
                dataset_id=dataset_id,
                file_path=file_path,
                api_key=api_key
            )
            
            file_path = os.path.join(target_dir, file_name)
            with open(file_path, "wb") as file:
                file.write(file_content)
            
            print(f"File downloaded: {file_path}")
        elif file_info['type'] == "dir":
            dataset_dir_info = api.get_dataset_info(dataset_id, file_path)
            download_dataset_files(api, dataset_dir_info, target_dir)

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
    os.makedirs(target_dir, exist_ok=True)

    # Get dataset info
    dataset_info = get_dataset_info(client, dataset)

    # Download all files from the dataset
    download_dataset_files(client, dataset_info, target_dir)

if __name__ == "__main__":
    main()