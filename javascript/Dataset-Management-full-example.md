## Dataset Management on Bagel

Here's a detailed example in JavaScript that incorporates all the functions necessary for asset management using the Bagels API. The example includes functionalities to create a vector asset, add data to the vector asset, query the data, and update the asset. It also includes user interaction through a command-line interface (CLI) for better usability.

```javascript
import readline from "readline";
import { Settings, Client } from "bagelml";

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
    rl.question("Enter the asset title: ", (title) => {
      rl.question("Enter the asset category: ", (category) => {
        rl.question("Enter the asset details: ", (details) => {
          resolve({
            title: title.trim(),
            category: category.trim(),
            details: details.trim(),
          });
        });
      });
    });
  });
}

// Function to handle asset creation
async function createVectorAsset() {
  const apiKey = await getApiKey();
  const assetDetails = await getAssetDetails();

  const payload = {
    dataset_type: "VECTOR",
    title: assetDetails.title,
    category: assetDetails.category,
    details: assetDetails.details,
    tags: [],
    userId: "user123", // Replace with actual user ID
    embedding_model: "bagel-text",
    dimensions: 768,
  };

  try {
    const asset = await client.create_asset(payload, apiKey);
    console.log("Asset successfully created:");
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
    console.error("Error creating vector asset:", error);
    rl.close();
  }
}

// Function to prompt user for data to add to a vector asset
async function getVectorAssetData() {
  return new Promise((resolve) => {
    rl.question("Enter the source of the data: ", (source) => {
      rl.question("Enter the text data: ", (text) => {
        rl.question("Enter the ID for the data: ", (id) => {
          resolve({ source: source.trim(), text: text.trim(), id: id.trim() });
        });
      });
    });
  });
}

// Function to handle adding data to a vector asset
async function addDataToVectorAsset() {
  const apiKey = await getApiKey();
  rl.question("Enter the asset ID of the vector asset: ", async (assetId) => {
    const vectorAssetData = await getVectorAssetData();

    const payload = {
      metadatas: [{ source: vectorAssetData.source }],
      documents: [vectorAssetData.text],
      ids: [vectorAssetData.id],
    };

    try {
      const response = await client.add_data_to_asset(
        assetId.trim(),
        payload,
        apiKey
      );
      console.log("Data successfully added to vector asset:");
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
      console.error("Error adding data to vector asset:", error);
      rl.close();
    }
  });
}

// Function to handle querying a vector asset
async function queryVectorAsset() {
  const apiKey = await getApiKey();
  rl.question("Enter the asset ID to query: ", async (assetId) => {
    const payload = {
      where: {
        // Define query parameters as needed
      },
      where_document: {
        // Define document query parameters as needed
      },
      n_results: 1,
      include: ["metadatas", "documents", "distances"],
      query_texts: ["Example query text"],
      padding: false,
    };

    try {
      const response = await client.query_asset(
        assetId.trim(),
        payload,
        apiKey
      );
      console.log("Query result for vector asset:");
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
      console.error("Error querying vector asset:", error);
      rl.close();
    }
  });
}

// Function to handle updating a vector asset
async function updateVectorAsset() {
  const apiKey = await getApiKey();
  rl.question("Enter the asset ID to update: ", async (assetId) => {
    const payload = {
      price: 200,
      is_published: true,
      is_purchased: true,
      details: "Updated details",
      title: "Updated title",
    };

    try {
      const response = await client.update_asset(
        assetId.trim(),
        payload,
        apiKey
      );
      console.log("Asset updated successfully:");
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
      console.error("Error updating vector asset:", error);
      rl.close();
    }
  });
}

// Function to display the main menu
function showMainMenu() {
  console.log("\nBagel JavaScript Client - Asset Management");
  console.log("1. Create Vector Asset");
  console.log("2. Add Data to Vector Asset");
  console.log("3. Query Vector Asset");
  console.log("4. Update Vector Asset");
  console.log("5. Exit\n");

  rl.question("Select an option (1-5): ", async (option) => {
    switch (option) {
      case "1":
        await createVectorAsset();
        break;
      case "2":
        await addDataToVectorAsset();
        break;
      case "3":
        await queryVectorAsset();
        break;
      case "4":
        await updateVectorAsset();
        break;
      case "5":
        rl.close();
        break;
      default:
        console.log("Invalid option. Please select 1-5.");
        showMainMenu();
    }
  });
}

// Start the application by showing the main menu
showMainMenu();
```

### How it works

- The script initializes the Bagel client and sets up a CLI interface using `readline`.
- Functions like `createVectorAsset`, `addDataToVectorAsset`, `queryVectorAsset`, and `updateVectorAsset` handle specific functionalities related to asset management.
- Each function prompts the user for required inputs such as API key, asset ID, and payload details.
- After each operation (create, add data, query, update), the script prompts the user if they want to return to the main menu or exit.
- This setup allows for interactive management of vector assets through a command-line interface, ensuring ease of use and clarity in operations.
