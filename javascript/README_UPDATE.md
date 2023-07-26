## BagelDB JavaScript Client - Example Readme

The BagelDB JavaScript Client is a library that enables interaction with the BagelDB server, allowing you to manage embeddings and perform similarity searches efficiently. This readme provides comprehensive documentation on how to utilize the client library and understand the functionality using the example.js script as a demonstration.
Getting Started

To use the BagelDB JavaScript Client, follow the steps below:

    Installation: Start by installing the BagelDB_v2 package. Ensure that you have Node.js installed on your system before proceeding.

    Import the BagelDB Client: In your JavaScript code, import the necessary modules using the following code snippet:

```
const { BagelDB, Settings } = require('../BagelDB_v2');
```

    Create BagelDB Instance: Next, create a new instance of BagelDB by providing the required settings. The Settings class allows you to configure the BagelDB server parameters. Customize the settings according to your BagelDB deployment.

```
const server_settings = new Settings(
  bagel_api_impl = "rest",
  bagel_server_host = "api2.bageldb.ai",
  bagel_server_http_port = "8000"
);

const db = new BagelDB(server_settings);
```

Example Usage - Performing Ping and Embedding Operations

The exampleTest.js script demonstrates the basic workflow of interacting with BagelDB using the client library. The script follows these essential steps:

    Ping the Server: Verify if the BagelDB server is responsive.

    Get OpenAI Embedding: Obtain an OpenAI embedding for a sample text.

    Insert Embedding: Insert the retrieved embedding into BagelDB.

    Perform a Search: Use the same embedding to perform a similarity search within the specified index.

To run the example, call the main function as shown below:

```
main();
```

Note: Replace the placeholder index, id, and inputText with your specific values.
Understanding Internal Activities of main

The main function in the example.js script performs the following internal activities:

Step 1: Ping the Server
The function starts by sending a ping request to the BagelDB server to check if it is responsive and can handle requests. The db.ping() method is called, and the server's response is logged to the console. If an error occurs during the ping operation, the catch block will log an error message to the console.

Step 2: Get an OpenAI Embedding
The function then proceeds to obtain an OpenAI embedding for the sample text provided ('Sample text for embedding'). It calls the db.getOpenAIEmbedding(inputText) method, passing the input text as a parameter. The response from the server, which includes the embedding for the input text, is logged to the console. The obtained embedding is stored in the embedding variable for future use. If an error occurs during the embedding retrieval process, the catch block will log an error message to the console.

Step 3: Insert the Embedding into BagelDB
After obtaining the embedding, the function proceeds to insert it into the BagelDB index. It prepares the data for insertion by creating a vectors array with the necessary information, such as the ID, the embedding array, and any metadata associated with the text. The db.insert(index, vectors) method is called to perform the insertion. The server's response to the insertion operation is logged to the console. If an error occurs during the insertion, the catch block will log an error message to the console.

Step 4: Perform a Search in the Index
Finally, the function demonstrates how to perform a similarity search in the index using the same embedding that was inserted previously. The vector variable holds the embedding array obtained earlier. The db.search(index, vector) method is called, passing the index and the embedding vector as parameters. The server's response, which includes the search results, is logged to the console. If an error occurs during the search operation, the catch block will log an error message to the console.
Error Handling

The example script demonstrates basic error handling for each operation. If an error occurs during any of the interactions with BagelDB, the script will display an appropriate error message.
Conclusion

The BagelDB JavaScript Client provides a convenient way to interact with BagelDB and utilize its powerful embedding management and similarity search capabilities. Feel free to explore the library further and integrate it into your projects as needed.

For more details about the BagelDB JavaScript Client and its API functions, refer to the source code and documentation in the BagelDB_v2 package.
