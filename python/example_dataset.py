import os
import bagel
from bagel.config import Settings
from uuid import UUID

api_key = "your_api_key"
user_id = "your_user_id"

def create_asset(api):
    title = "test_dataset_client2000"
    description = "Test dataset created from python client"
    payload = {
                "title": title,
                "dataset_type": "RAW",
                "tags": [
                    ""
                ],
                "category": "AI",
                "details": description,
                "user_id": user_id
            }

    dataset = api.create_asset(
        payload=payload,
        api_key=api_key
    )
    return dataset

def get_asset_info(api, asset_id, api_key):
    asset_info = api.get_asset_info(asset_id, api_key)
    return asset_info

def upload_dataset_file(api, asset_id, file_path):
    
    message = api.file_upload(
        file_path=file_path,
        asset_id=asset_id,
        api_key=api_key
    )
    return message

def buy_asset(api, asset_id, user_id, api_key):
    
    message = api.buy_asset(
        asset_id=asset_id,
        user_id=user_id,
        api_key=api_key
    )
    return message

def fine_tuning(api):
    title = "test_model_client2000"
    asset_id = "db10c616-bf57-4c6a-b619-d98e872f2e33"
    file_name = "state_of_the_union.txt"
    base_model = "45b4286c-de87-457c-bcb8-83985515085f"
    dataset = api.fine_tune(title=title, user_id=user_id, asset_id = asset_id, file_name = file_name, 
                  base_model = base_model, epochs = 3, learning_rate = 0.01, apiKey = api_key)
    return dataset

def get_job_by_asset_id(api, asset_id):
    response = api.get_job_by_asset_id(asset_id, api_key)
    return response

def download_model(api, asset_id):
    response = api.download_model(asset_id, api_key)
    return response

def delete_asset(api, asset_id):
    response = api.delete_asset(asset_id, api_key)
    return response

def main():
    # Bagel server settings for local testing

    # Create Bagel client
    client = bagel.Client()

    # Create a dataset
    # dataset = create_asset(client)
    # print(dataset)

    file_path = "data/image.jpg"

    # # Upload a file to the dataset
    # upload_dataset_file(client, dataset, file_path)

    # Get dataset info
    asset_id = "4351907b-7245-4c8a-ba4f-1b65c861111a"
    marketplace_asset_id = "eab700f1-d12e-4180-b2a4-2fbfb5174f7b"
    # dataset_info = get_asset_info(client, asset_id, api_key)
    # print(dataset_info)

    # # Download all files from the dataset
    # upload_dataset_file(client, asset_id, file_path)
    # client.download_dataset_files(dataset, target_dir)
    response = buy_asset(client, marketplace_asset_id, user_id, api_key)
    print(response)
    # response = fine_tuning(client)
    # print(response)
    model_id = "7c244ca7-0be0-47f2-833e-049138d47e2b"
    response = get_job_by_asset_id(client, model_id)
    print(response)

    # response = download_model(client, model_id)
    # print(response)
    response = delete_asset(client, asset_id)
    print(response)

if __name__ == "__main__":
    main()