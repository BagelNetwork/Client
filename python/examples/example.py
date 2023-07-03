import BagelDB

def main():
    # Define the index name to use with BagelDB.
    # This would typically be a string specific to your application.
    index = 'your_index'
    
    # Create a BagelDB client instance using the specified index.
    # The BagelDB class takes care of initializing connections and setting up necessary parameters.
    bageldb = BagelDB.BagelDB(index)

    # Define a list of text items to be inserted into BagelDB.
    # These items will be converted into vectors using OpenAI's text embeddings and inserted into the specified index.
    texts_to_insert = ['I love to play football.', 'The weather is lovely today.']

    # Invoke the insertFromTexts method to convert the text items into vectors and insert them into BagelDB.
    # The response from the insert operation is logged for debugging purposes.
    insert_response = bageldb.insertFromTexts(texts_to_insert)
    print(f'Insert operation completed. Response from server: {insert_response}')

    # Define a text item to be used for searching similar items in BagelDB.
    search_text = 'I enjoy soccer.'
    
    # Invoke the searchFromText method to convert the search text into a vector and find similar vectors in BagelDB.
    search_response = bageldb.searchFromText(search_text)

    # Extract the first match from the search response.
    # Please note that matches are usually sorted by relevance, with the most relevant item first.
    first_match = search_response['results']['matches'][0]

    # Log the ID and the score of the first match.
    print(f'First match ID: {first_match["id"]}')
    print(f'First match score: {first_match["score"]}')

if __name__ == '__main__':
    # Invoke the main function to execute the operations.
    main()
