# example.py
from betabageldb import BagelDB # Import the BagelDB client

def main():
    db = BagelDB() # Create a new instance of BagelDB

    # Ping the server to check if it's responding
    try:
        ping_response = db.ping()
        print(ping_response)
    except Exception as e:
        print(f'An error occurred while pinging: {e}')

    # Get an OpenAI embedding for a sample text
    input_text = 'Sample text for embedding'
    try:
        embedding_response = db.get_openai_embedding(input_text)
        print(embedding_response)
        # Retrieve the embedding array from the response
        embedding = embedding_response['data'][0]['embedding']
    except Exception as e:
        print(f'An error occurred while getting embedding: {e}')

    # Insert the embedding into BagelDB
    index = 'myEmbeddingsIndex'
    vectors = [
        {
            'id': 'embed1',
            'values': embedding, # Use the retrieved embedding array
            'metadata': { 'text': input_text },
        },
    ]

    try:
        insert_response = db.insert(index, vectors)
        print(insert_response)
    except Exception as e:
        print(f'An error occurred while inserting: {e}')

    # Perform a search in the index using the same embedding
    vector = embedding

    try:
        search_response = db.search(index, vector)
        print(search_response)
    except Exception as e:
        print(f'An error occurred while searching: {e}')


if __name__ == "__main__":
    main() # Call the main function to start the example

