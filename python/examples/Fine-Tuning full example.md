
```python
import bagel
from bagel.config import Settings
import sys

# Configure Bagel client settings
server_settings = Settings(
    bagel_api_impl="rest",
    bagel_server_host="api.bageldb.ai"
)

client = bagel.Client(server_settings)

# Function to prompt user for input
def prompt_input(prompt_text):
    return input(prompt_text).strip()

# Function to create a model
def create_model():
    api_key = prompt_input("Enter your Bagel API key: ")
    title = prompt_input("Enter the model title: ")
    category = prompt_input("Enter the model category: ")
    details = prompt_input("Enter the model details: ")
    user_id = prompt_input("Enter your user ID: ")

    payload = {
        "dataset_type": "MODEL",
        "title": title,
        "category": category,
        "details": details,
        "tags": [],
        "user_id": user_id
    }

    try:
        asset = client.create_asset(payload, api_key)
        print("Model successfully created:")
        print(asset)
    except Exception as error:
        print("Error creating model:", error)

# Function to fine-tune a model
def fine_tune_model():
    api_key = prompt_input("Enter your Bagel API key: ")
    asset_id = prompt_input("Enter the RAW asset ID: ")
    model_name = prompt_input("Enter the model name: ")
    base_model = prompt_input("Enter the base model ID: ")
    file_name = prompt_input("Enter the file name: ")
    user_id = prompt_input("Enter your user ID: ")
    title = prompt_input("Enter the fine-tune title: ")
    category = prompt_input("Enter the fine-tune category: ")
    details = prompt_input("Enter the fine-tune details: ")

    payload = {
        "dataset_type": "MODEL",
        "title": title,
        "category": category,
        "details": details,
        "tags": [],
        "user_id": user_id,
        "fine_tune_payload": {
            "asset_id": asset_id,
            "model_name": model_name,
            "base_model": base_model,
            "file_name": file_name,
            "user_id": user_id
        }
    }

    try:
        response = client.fine_tune(payload, api_key)
        print("Fine-tune response:")
        print(response)
    except Exception as error:
        print("Error during fine-tuning:", error)

# Function to display the main menu
def show_main_menu():
    while True:
        print("\nBagel Python Client - Finetuning")
        print("1. Create a Model")
        print("2. Fine-Tune an Existing Model")
        print("3. Exit\n")

        option = prompt_input("Select an option (1-3): ")

        if option == "1":
            create_model()
        elif option == "2":
            fine_tune_model()
        elif option == "3":
            sys.exit()
        else:
            print("Invalid option. Please select 1-3.")

# Start the application by showing the main menu
if __name__ == "__main__":
    show_main_menu()
```

### How it Works

- **Initialization**: Configures the Bagel client and sets up a CLI interface for user interaction.
  
- **Create a Model**: Allows users to create a new model by inputting title, category, details, and user ID. Sends a request to the Bagel API to create the model.

- **Fine-Tune an Existing Model**: Enables users to fine-tune an existing model by specifying details such as the RAW asset ID, model name, base model ID, file name, and user ID. Utilizes the Bagel API to perform the fine-tuning operation.

- **Main Menu**: Provides a menu-driven interface (CLI) for navigating between creating a model, fine-tuning an existing model, or exiting the application.

### Running the Example

To run this example:

1. Ensure you have installed the `bagel` library.
2. Copy the code into a Python file, e.g., `bagel_client.py`.
3. Run the file using Python: `python bagel_client.py`.
4. Follow the prompts to interact with the Bagel API through the CLI.