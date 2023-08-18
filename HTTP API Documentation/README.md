🥯 **Welcome to the BagelDB HTTP API Guide!** 🥯

Hey there, dough-tastic developer! 🥯 If you're looking to munch through your data with ease, you've come to the right place. Let's break down those endpoints so you can get started right away.

The official BagelDB endpoint is `api.bageldb.ai`. Feel free to give it a whirl!

*Friendly reminder:* This API is conveniently wrapped up in both Python and JavaScript for your coding pleasure. Check 'em out:
- [BagelDB Python package](https://github.com/Bagel-DB/Client/tree/main/python)
- [BagelDB Javascript package](https://github.com/Bagel-DB/Client/tree/main/javascript)

### **Endpoints & Their Delights**

1. **`/api/v1`**: 
   - **Method:** GET
   - **Description:** A quick pulse-check to see if the server's heart is still beating.
   - **Returns:** Server time in nanoseconds.

2. **`/api/v1/clusters`**: 
   - **Method:** GET
   - **Description:** Fetch a delightful assortment of all available clusters.
   - **Returns:** A list of cluster objects.

3. **`/api/v1/clusters`**: 
   - **Method:** POST
   - **Description:** Create a fresh new cluster. 
   - **Returns:** The newly created cluster object.

4. **`/api/v1/clusters/{name}`**: 
   - **Method:** GET
   - **Description:** Fetch a specific cluster by its name.
   - **Returns:** A single cluster object with the given name.

5. **`/api/v1/clusters/{name}`**: 
   - **Method:** DELETE
   - **Description:** When it's time to say goodbye, use this to remove a cluster.
   - **Returns:** Nothing. The cluster will be deleted.

6. **`/api/v1/clusters/{id}`**: 
   - **Method:** PUT
   - **Description:** Update the details of a cluster with a new name or metadata.
   - **Returns:** Nothing. The specified cluster will be updated.

7. **`/api/v1/clusters/{cluster_id}/count`**: 
   - **Method:** GET
   - **Description:** How many embeddings are chilling in your database? Find out here!
   - **Returns:** The number of embeddings.

8. **`/api/v1/clusters/{cluster_id}/get`**: 
   - **Method:** POST
   - **Description:** Fetch a batch of embeddings with a variety of filter options.
   - **Returns:** A GetResult object containing ids, embeddings, metadata, and documents.

9. **`/api/v1/clusters/{cluster_id}/delete`**: 
   - **Method:** POST
   - **Description:** Delete specific embeddings from a cluster.
   - **Returns:** The IDs of the deleted embeddings.

10. **`/api/v1/clusters/{cluster_id}/add`**: 
    - **Method:** POST
    - **Description:** Add a fresh batch of embeddings to a cluster.
    - **Returns:** True if successful.

11. **`/api/v1/clusters/{cluster_id}/update`**: 
    - **Method:** POST
    - **Description:** Update specific embeddings in a cluster.
    - **Returns:** True if successful.

12. **`/api/v1/clusters/{cluster_id}/upsert`**: 
    - **Method:** POST
    - **Description:** Update existing embeddings or add them if they don't exist.
    - **Returns:** True if successful.

13. **`/api/v1/clusters/{cluster_id}/query`**: 
    - **Method:** POST
    - **Description:** Fetch the nearest neighbors of an embedding.
    - **Returns:** A QueryResult object containing ids, distances, embeddings, metadata, and documents.

14. **`/api/v1/reset`**: 
    - **Method:** POST
    - **Description:** Reset the database. Handle with care!
    - **Returns:** Nothing. The database will be reset.

15. **`/api/v1/persist`**: 
    - **Method:** POST
    - **Description:** Make sure your data stays put by persisting the database.
    - **Returns:** True if successful.

<!-- 16. **`/api/v1/raw_sql`**: 
    - **Method:** POST
    - **Description:** Run a raw SQL query against the database. (For the SQL wizards out there!)
    - **Returns:** A DataFrame with the result of the SQL query. -->

17. **`/api/v1/clusters/{cluster_name}/create_index`**: 
    - **Method:** POST
    - **Description:** Indexing can speed things up. Create an index for a given cluster with this.
    - **Returns:** True if successful.

18. **`/api/v1/version`**: 
    - **Method:** GET
    - **Description:** Curious about the server version? Here you go!
    - **Returns:** A string with the server's version.

### Data Types and You:
In our API, you'll encounter several recurring data types like:

Documents: Your data, of course.
Embeddings: The processed form of your documents, ready to be queried.
Metadatas: Additional info to sprinkle on your documents.
... and more. Each endpoint may have specific expectations, so be sure to check the relevant details before taking a bite.

### **Bagel Bites (aka Errors)**

In the baking world of BagelDB, errors can pop up. We've got a nifty function `raise_bagel_error` that checks the server response for any hiccups. If there's a known BagelError, it raises it. Otherwise, it gives a generic HTTP error. Always check for these crunchy bits when baking your code!

### Conclusion

And that's the scoop! We've tried to make this as easy to digest as a Sunday morning bagel brunch. But, if you've got questions or need more butter on your bagel, let us know. We're here to help! 🥯❤️
