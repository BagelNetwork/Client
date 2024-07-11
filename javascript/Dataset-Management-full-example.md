Here's a detailed example in JavaScript that incorporates all the functions necessary for asset management using the Bagels API. The example includes functionalities to create a vector asset, add data to the vector asset, query the data, and update the asset. It also includes user interaction through a command-line interface (CLI) for better usability.

```javascript
const readline = require("readline");
const { Settings, Client } = require("bageldb-beta");

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
  return new Promise((resolve, reject) => {
    rl.question("Enter your Bagel API key: ", (apiKey) => {
      resolve(apiKey.trim());
    });
  });
}

// Function to handle asset creation
async function createVectorAsset(apiKey) {
  const payload = {
    dataset_type: "VECTOR",
    title: "Example Vector Asset",
    category: "Example Category",
    details: "Example details about the asset",
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

// Function to handle adding data to a vector asset
async function addDataToVectorAsset(apiKey) {
  rl.question("Enter the asset ID of the vector asset: ", async (assetId) => {
    const payload = {
      metadatas: [{ source: "example source" }],
      documents: ["Example text data"],
      ids: ["example-id"], // Replace with actual IDs as needed
    };

    try {
      const response = await client.add_data_to_asset(assetId, payload, apiKey);
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
async function queryVectorAsset(apiKey) {
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
      const response = await client.query_asset(assetId, payload, apiKey);
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
async function updateVectorAsset(apiKey) {
  rl.question("Enter the asset ID to update: ", async (assetId) => {
    const payload = {
      price: 200,
      is_published: true,
      is_purchased: true,
      details: "Updated details",
      title: "Updated title",
    };

    try {
      const response = await client.update_asset(assetId, payload, apiKey);
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
        const apiKey = await getApiKey();
        await createVectorAsset(apiKey);
        break;
      case "2":
        const apiKey2 = await getApiKey();
        await addDataToVectorAsset(apiKey2);
        break;
      case "3":
        const apiKey3 = await getApiKey();
        await queryVectorAsset(apiKey3);
        break;
      case "4":
        const apiKey4 = await getApiKey();
        await updateVectorAsset(apiKey4);
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
