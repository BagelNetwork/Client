```py
import bagel
from bagel.config import Settings
from datasets import load_dataset
import os

# Bagel server settings
server_settings = Settings(
    bagel_api_impl="rest",
    bagel_server_host="api.bageldb.ai",
    bagel_server_http_port="80",
)

# Create Bagel client
client = bagel.Client(server_settings)

# Load the dataset from Hugging Face and save it to the working directory
data = load_dataset("dair-ai/emotion")

# Define the API key
api_key = "4gB2wJPByf8qnUihAmH8dgbGYsZESEOH"

# # Payload for creating the asset
# payload = {
#     "dataset_type": "RAW",  # Dataset type
#     "title": "Emotion777",  # Title of the dataset
#     "category": "CAT1",  # Category
#     "details": "we want to test",  # Additional details
#     "tags": ["AI", "DEMO"],  # Tags
#     "user_id": "101481188466180740994"  # User ID
# }

# # Creating the asset
# asset_response = client.create_asset(payload, api_key)

# Manually setting the dataset_id since the response is None
dataset_id = "9c3a3a27-3924-4379-9b56-8bdfa7dfc8ab"
print(f"Using dataset ID: {dataset_id}")

# Save the dataset to a file in the working directory
file_path = "emotion_dataset.csv"
data['train'].to_csv(file_path, index=False)
print(f"Dataset saved to {file_path}")

# Upload the file to Bagel
upload_response = client.file_upload(file_path, dataset_id, api_key)
print("Upload response:", upload_response)

# Clean up the file after upload if necessary
os.remove(file_path)
print(f"File {file_path} removed after upload.")
```