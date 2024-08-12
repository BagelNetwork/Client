import os
import bagel
from bagel.config import Settings
from uuid import UUID

user_id = "116158400265137886010"
api_key = "MHh30EVG4V6FoePnagraY8fdMG0WgxR6"
os.environ["BAGEL_API_KEY"] = api_key
os.environ["BAGEL_USER_ID"] = user_id

def get_user_info(api):

    user_info = api.get_user_info(
        user_id=user_id,
        api_key=api_key
    )
    return user_info

def create_raw_asset(api):
    name = "test_asset_client6"
    details = "Test asset created from python client"

    asset_id = api.create_raw_asset(
        name=name,
        details=details,
        user_id=user_id,
        api_key=api_key
    )
    return asset_id

def get_asset_info(api, asset_id):
    asset = api.get_asset_info(asset_id)
    return asset

def upload_dataset_file(api, asset_id, file_path):
    
    file_name = os.path.basename(file_path)
    with open(file_path, "rb") as file:
        file_content = file.read()
    
    message = api.upload_dataset(
        asset_id=asset_id,
        file_name=file_name,
        file_content=file_content
    )

    return message

def main():
    # Bagel server settings for local testing
    server_settings = Settings(
        bagel_api_impl="rest",
        bagel_server_host="localhost",
        bagel_server_http_port="8088",
    )

    # Create Bagel client
    client = bagel.Client(server_settings)

    user_info = get_user_info(client)

    # Create a dataset
    dataset = create_raw_asset(client)
    print(dataset)

    file_path = "data/image.png"

    # # Upload a file to the dataset
    file_name = upload_dataset_file(client, dataset["asset_id"], file_path)
    print(file_name)

    # Get dataset info
    asset_info = get_asset_info(client, dataset["asset_id"])
    print(asset_info)

    # # Download all files from the dataset
    target_dir = "data"
    file_content, file_name, file_type = client.download_dataset(asset_id=dataset["asset_id"], api_key=api_key)
    file_path = os.path.join(target_dir, file_name)
    with open(file_path, "wb") as file:
        file.write(file_content)
    
    # Delete Asset
    message = client.delete_asset(asset_id=dataset["asset_id"], api_key=api_key)
    print(message)

    # Create Model Asset
    model_id = client.create_model_asset(name="model-client", 
                                            details="Test", 
                                            user_id=user_id,
                                            base_model_type="gpt2",
                                            api_key=api_key)
    print(model_id)
    file_path = "data/image.png"

    # # Upload a file to the dataset
    file_name = upload_dataset_file(client, model_id["model_id"], file_path)
    print(file_name)
    
    # Delete Asset
    message = client.delete_asset(asset_id=model_id["model_id"], api_key=api_key)
    print(message)

if __name__ == "__main__":
    main()