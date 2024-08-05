
## Finetuning existing models on Bagel 

Here's a detailed example in JavaScript that integrates all the necessary functions for managing and fine-tuning models using Bagels API. This full example facilitates user interaction through a command-line interface (CLI) to enhance usability and control over model operations.


```js
import readline from "readline";
import { Settings, Client } from "bagelML";

// Configure Bagel client settings
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
});

const client = new Client(settings);

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt user for API key
async function getApiKey() {
  return new Promise((resolve) => {
    rl.question("Enter your Bagel API key: ", (apiKey) => {
      resolve(apiKey.trim());
    });
  });
}

// Function to prompt user for asset details
async function getAssetDetails() {
  return new Promise((resolve) => {
    rl.question("Enter the model title: ", (title) => {
      rl.question("Enter the model category: ", (category) => {
        rl.question("Enter the model details: ", (details) => {
          rl.question("Enter your user ID: ", (user_id) => {
            resolve({ title: title.trim(), category: category.trim(), details: details.trim(), user_id: user_id.trim() });
          });
        });
      });
    });
  });
}

// Function to handle model creation
async function createModel() {
  const apiKey = await getApiKey();
  const assetDetails = await getAssetDetails();

  const payload = {
    dataset_type: "MODEL",
    title: assetDetails.title,
    category: assetDetails.category,
    details: assetDetails.details,
    tags: [],
    user_id: assetDetails.user_id,
  };

  try {
    const asset = await client.create_asset(payload, apiKey);
    console.log("Model successfully created:");
    console.log(asset);

    rl.question(
      "Do you want to return to the main menu? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() === "yes") {
          showMainMenu();
        } else {
          rl.close();
        }
      }
    );
  } catch (error) {
    console.error("Error creating model:", error);
    rl.close();
  }
}

// Function to prompt user for fine-tune details
async function getFineTuneDetails() {
  return new Promise((resolve) => {
    rl.question("Enter the RAW asset ID: ", (asset_id) => {
      rl.question("Enter the model name: ", (model_name) => {
        rl.question("Enter the base model ID: ", (base_model) => {
          rl.question("Enter the file name: ", (file_name) => {
            rl.question("Enter your user ID: ", (user_id) => {
              rl.question("Enter the fine-tune title: ", (title) => {
                rl.question("Enter the fine-tune category: ", (category) => {
                  rl.question("Enter the fine-tune details: ", (details) => {
                    resolve({
                      asset_id: asset_id.trim(),
                      model_name: model_name.trim(),
                      base_model: base_model.trim(),
                      file_name: file_name.trim(),
                      user_id: user_id.trim(),
                      title: title.trim(),
                      category: category.trim(),
                      details: details.trim(),
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

// Function to handle fine-tuning
async function fineTuneModel() {
  const apiKey = await getApiKey();
  const fineTuneDetails = await getFineTuneDetails();

  const payload = {
    dataset_type: "MODEL",
    title: fineTuneDetails.title,
    category: fineTuneDetails.category,
    details: fineTuneDetails.details,
    tags: [],
    user_id: fineTuneDetails.user_id,
    fine_tune_payload: {
      asset_id: fineTuneDetails.asset_id,
      model_name: fineTuneDetails.model_name,
      base_model: fineTuneDetails.base_model,
      file_name: fineTuneDetails.file_name,
      user_id: fineTuneDetails.user_id,
    },
  };

  try {
    const response = await client.fine_tune(payload, apiKey);
    console.log("Fine-tune response:");
    console.log(response);

    rl.question(
      "Do you want to return to the main menu? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() === "yes") {
          showMainMenu();
        } else {
          rl.close();
        }
      }
    );
  } catch (error) {
    console.error("Error during fine-tuning:", error);
    rl.close();
  }
}

// Function to display the main menu
function showMainMenu() {
  console.log("\nBagel JavaScript Client - Finetuning");
  console.log("1. Create a Model");
  console.log("2. Fine-Tune an Existing Model");
  console.log("3. Exit\n");

  rl.question("Select an option (1-3): ", async (option) => {
    switch (option) {
      case "1":
        await createModel();
        break;
      case "2":
        await fineTuneModel();
        break;
      case "3":
        rl.close();
        break;
      default:
        console.log("Invalid option. Please select 1-3.");
        showMainMenu();
    }
  });
}

// Start the application by showing the main menu
showMainMenu();

```


### How it Works
- Initialization: Configures the Bagel client and sets up a CLI interface for user interaction.

- Create a Model: Allows users to create a new model by inputting title, category, details, and user ID. Sends a request to the Bagel API to create the model.

- Fine-Tune an Existing Model: Enables users to fine-tune an existing model by specifying details such as the RAW asset ID, model name, base model ID, file name, and user ID. Utilizes the Bagel API to perform the fine-tuning operation.

- Main Menu: Provides a menu-driven interface (CLI) for navigating between creating a model, fine-tuning an existing model, or exiting the application.