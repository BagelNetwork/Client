🥯 **Welcome to the Bagel HTTP API Guide!** 🥯

Hey there, dough-tastic developer! 🥯 If you're looking to munch through your data with ease, you've come to the right place. Let's break down those endpoints so you can get started right away.

The official Bagel endpoint is `api.bageldb.ai`. Feel free to give it a whirl!

*Friendly reminder:* This API is conveniently wrapped up in both Python and JavaScript for your coding pleasure. Check 'em out:
- [Bagel Python package](https://github.com/BagelNetwork/Client/tree/main/python)
- [Bagel Javascript package](https://github.com/BagelNetwork/Client/tree/main/javascript)

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

4. **`/api/v1/clusters/{cluster_name}`**: 
   - **Method:** GET
   - **Description:** Fetch a specific cluster by its name.
   - **Returns:** A single cluster object with the given name.

5. **`/api/v1/clusters/id/{cluster_id}`**: 
   - **Method:** GET
   - **Description:** Fetch a specific cluster by its ID.
   - **Returns:** A single cluster object with the given ID.

6. **`/api/v1/clusters/{cluster_name}`**: 
   - **Method:** DELETE
   - **Description:** When it's time to say goodbye, use this to remove a cluster.
   - **Returns:** Nothing. The cluster will be deleted.

7. **`/api/v1/clusters/{cluster_id}`**: 
   - **Method:** PUT
   - **Description:** Update the details of a cluster with a new name or metadata.
   - **Returns:** Nothing. The specified cluster will be updated.

8. **`/api/v1/clusters/{cluster_id}/add`**: 
   - **Method:** POST
   - **Description:** Add a fresh batch of embeddings to a cluster.
   - **Returns:** True if successful.

9. **`/api/v1/clusters/{cluster_id}/add_image`**: 
   - **Method:** POST
   - **Description:** Add images to a cluster.
   - **Returns:** True if successful.

10. **`/api/v1/clusters/{cluster_id}/add_image_file`**: 
    - **Method:** POST
    - **Description:** Upload and add an image file to a cluster.
    - **Returns:** JSON response with upload details.

11. **`/api/v1/clusters/{cluster_id}/add_image_url`**: 
    - **Method:** POST
    - **Description:** Add images to a cluster using URLs.
    - **Returns:** JSON response with upload details.

12. **`/api/v1/clusters/{cluster_id}/update`**: 
    - **Method:** POST
    - **Description:** Update specific embeddings in a cluster.
    - **Returns:** Nothing. The specified embeddings will be updated.

13. **`/api/v1/clusters/{cluster_id}/upsert`**: 
    - **Method:** POST
    - **Description:** Update existing embeddings or add them if they don't exist.
    - **Returns:** Nothing. The specified embeddings will be upserted.

14. **`/api/v1/clusters/{cluster_id}/get`**: 
    - **Method:** POST
    - **Description:** Fetch a batch of embeddings with a variety of filter options.
    - **Returns:** A GetResult object containing ids, embeddings, metadata, and documents.

15. **`/api/v1/clusters/{cluster_id}/delete`**: 
    - **Method:** POST
    - **Description:** Delete specific embeddings from a cluster.
    - **Returns:** The IDs of the deleted embeddings.

16. **`/api/v1/clusters/{cluster_id}/count`**: 
    - **Method:** GET
    - **Description:** How many embeddings are chilling in your database? Find out here!
    - **Returns:** The number of embeddings.

17. **`/api/v1/clusters/{cluster_id}/query`**: 
    - **Method:** POST
    - **Description:** Fetch the nearest neighbors of an embedding.
    - **Returns:** A QueryResult object containing ids, distances, embeddings, metadata, and documents.

18. **`/api/v1/user`**: 
    - **Method:** GET
    - **Description:** Retrieve user details.
    - **Returns:** User details.

19. **`/api/v1/notification/user/{user_id}`**: 
    - **Method:** POST
    - **Description:** Get user notifications.
    - **Returns:** User notifications.

20. **`/api/v1/api_keys`**: 
    - **Method:** GET
    - **Description:** List API keys.
    - **Returns:** List of API keys.

21. **`/api/v1/api_keys`**: 
    - **Method:** POST
    - **Description:** Create new API keys.
    - **Returns:** Newly created API keys.

22. **`/api/v1/publish`**: 
    - **Method:** POST
    - **Description:** Publish a dataset to the marketplace.
    - **Returns:** Nothing. The dataset will be published.

23. **`/api/v1/publish-dataset`**: 
    - **Method:** POST
    - **Description:** Publish a dataset to the marketplace.
    - **Returns:** Nothing. The dataset will be published.

24. **`/api/v1/marketplace`**: 
    - **Method:** GET
    - **Description:** Get marketplace datasets.
    - **Returns:** List of marketplace datasets.

25. **`/api/v1/marketplace/{dataset_id}`**: 
    - **Method:** GET
    - **Description:** Get a specific marketplace dataset.
    - **Returns:** The specified marketplace dataset.

26. **`/api/v1/share-cluster`**: 
    - **Method:** POST
    - **Description:** Share a cluster with other users.
    - **Returns:** Nothing. The cluster will be shared.

27. **`/api/v1/dataset`**: 
    - **Method:** POST
    - **Description:** Create a new dataset.
    - **Returns:** Nothing. The dataset will be created.

28. **`/api/v1/dataset`**: 
    - **Method:** GET
    - **Description:** Get a specific dataset.
    - **Returns:** The specified dataset.

29. **`/api/v1/dataset/created_by/{created_by}`**: 
    - **Method:** GET
    - **Description:** List datasets created by a user.
    - **Returns:** List of datasets created by the specified user.

30. **`/api/v1/dataset/{dataset_id}`**: 
    - **Method:** DELETE
    - **Description:** Delete a specific dataset.
    - **Returns:** Nothing. The dataset will be deleted.

31. **`/api/v1/upload-dataset`**: 
    - **Method:** POST
    - **Description:** Upload a dataset.
    - **Returns:** Dataset upload details.

32. **`/api/v1/datasets/{dataset_id}/upload-dataset`**: 
    - **Method:** POST
    - **Description:** Upload a dataset to a specific dataset ID.
    - **Returns:** Dataset upload details.

33. **`/api/v1/download-dataset`**: 
    - **Method:** GET
    - **Description:** Download a dataset.
    - **Returns:** The dataset as a file.

34. **`/api/v1/dataset-info`**: 
    - **Method:** GET
    - **Description:** Get dataset information.
    - **Returns:** Dataset information.

35. **`/api/v1/dataset/id/{dataset_id}/data`**: 
    - **Method:** GET
    - **Description:** Get data from a specific dataset.
    - **Returns:** Data from the specified dataset.

36. **`/api/v1/reset`**: 
    - **Method:** POST
    - **Description:** Reset the database. Handle with care!
    - **Returns:** True if successful.

37. **`/api/v1/version`**: 
    - **Method:** GET
    - **Description:** Curious about the server version? Here you go!
    - **Returns:** A string with the server's version.

38. **`/api/v1/heartbeat`**: 
    - **Method:** GET
    - **Description:** Alias for `/api/v1` to check the server's heartbeat.
    - **Returns:** Server time in nanoseconds.

### Data Types and You:
In our API, you'll encounter several recurring data types like:

Documents: Your data, of course.
Embeddings: The processed form of your documents, ready to be queried.
Metadatas: Additional info to sprinkle on your documents.
... and more. Each endpoint may have specific expectations, so be sure to check the relevant details before taking a bite.

### **Bagel Bites (aka Errors)**

In the baking world of Bagel, errors can pop up. The API uses a middleware to catch exceptions and return appropriate error responses. Always check for these crunchy bits when baking your code!

### Conclusion

And that's the scoop! We've tried to make this as easy to digest as a Sunday morning bagel brunch. But, if you've got questions or need more butter on your bagel, let us know. We're here to help! 🥯❤️