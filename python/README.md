Here's a step-by-step guide on how to use the `BagelDB` Python client:

1. **Import the `BagelDB` client**

   Start by importing the `BagelDB` client into your Python script.

   ```python
   from betabageldb import BagelDB
   ```

2. **Initialize the BagelDB client**

   Next, initialize a new instance of the `BagelDB` client. Make sure you have your OpenAI API key set in your environment variables as `OPENAI_API_KEY`. 

   ```python
   db = BagelDB()
   ```

3. **Ping the BagelDB server**

   To check the connection to the BagelDB server, you can use the `ping()` method. This method will return a response from the BagelDB API in JSON format. 

   ```python
   response = db.ping()
   print(response)
   ```

4. **Get OpenAI embeddings**

   Use the `getOpenAIEmbedding(inputText, model='text-embedding-ada-002')` method to get embeddings from OpenAI. The `inputText` is the text for which embeddings are required. `model` is optional and defaults to 'text-embedding-ada-002'. 

   ```python
   input_text = "Some text"
   embeddings = db.getOpenAIEmbedding(input_text)
   print(embeddings)
   ```

5. **Insert vectors into BagelDB**

   To insert vectors into a given index in BagelDB, use the `insert(index, vectors)` method. `index` is the index in which vectors are to be inserted, and `vectors` is a list of vectors to be inserted.

   ```python
   index = "myIndex"
   vectors = [{'id': 'vec1', 'values': [0.1, 0.2, 0.3], 'metadata': {'key': 'value'}}]
   insert_response = db.insert(index, vectors)
   print(insert_response)
   ```

6. **Search for a vector in BagelDB**

   To search for a vector in a given index in BagelDB, use the `search(index, vector)` method. `index` is the index in which the search is to be performed, and `vector` is the vector for which the search is to be performed.

   ```python
   index = "myIndex"
   vector = [0.1, 0.2, 0.3]
   search_response = db.search(index, vector)
   print(search_response)
   ```

7. **Insert vectors from texts**

   The `insertFromTexts(texts, model='text-embedding-ada-002')` method can be used to convert a list of texts to their respective embeddings and insert these as vectors into BagelDB. The `texts` parameter is a list of strings for which embeddings are required, and `model` is optional and defaults to 'text-embedding-ada-002'. Each vector will be assigned an id incrementally starting from 0 and metadata will contain original text.

   ```python
   texts = ["Some text 1", "Some text 2"]
   insert_response = db.insertFromTexts(texts)
   print(insert_response)
   ```

8. **Search for a vector from text**

   To search for a vector derived from a given text in BagelDB, you can use the `searchFromText(text, model='text-embedding-ada-002')` method. `text` is the string for which the corresponding embedding is to be found and searched, and `model` is optional and defaults to 'text-embedding-ada-002'. 

   ```python
   text = "Some text"
   search_response = db.searchFromText(text)
   print(search_response)
   ```

These new methods, `insertFromTexts` and `searchFromText`, simplify the process of converting text to embeddings and performing operations on BagelDB, providing a higher level of abstraction for users to work with.

Remember to handle exceptions in your application. The methods in the `BagelDB` client can raise exceptions if a network error occurs or if the response from the server indicates a failed HTTP status code.
