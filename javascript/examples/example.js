// example.js
const Bagel = require('bagelml') // Import the Bagel client

const main = async () => {
  const db = new Bagel() // Create a new instance of Bagel

  // Ping the server to check if it's responding
  try {
    const pingResponse = await db.ping()
    console.log(pingResponse)
  } catch (error) {
    console.error('An error occurred while pinging:', error)
  }

  // Get an OpenAI embedding for a sample text
  const inputText = 'Sample text for embedding'
  let embedding
  try {
    const embeddingResponse = await db.getOpenAIEmbedding(inputText)
    console.log(embeddingResponse)
    // Retrieve the embedding array from the response
    embedding = embeddingResponse.data[0].embedding
  } catch (error) {
    console.error('An error occurred while getting embedding:', error)
  }

  // Insert the embedding into Bagel
  const index = 'myEmbeddingsIndex'
  const vectors = [
    {
      id: 'embed1',
      values: embedding, // Use the retrieved embedding array
      metadata: { text: inputText }
    }
  ]

  try {
    const insertResponse = await db.insert(index, vectors)
    console.log(insertResponse)
  } catch (error) {
    console.error('An error occurred while inserting:', error)
  }

  // Perform a search in the index using the same embedding
  const vector = embedding

  try {
    const searchResponse = await db.search(index, vector)
    console.log(searchResponse)
  } catch (error) {
    console.error('An error occurred while searching:', error)
  }
}

main() // Call the main function to start the example
