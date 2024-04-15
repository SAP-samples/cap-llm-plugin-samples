## CAP LLM Plugin class methods

Use any of the following class methods:

### `async getAnonymizedData(entityName, [sequenceIds=[]])`

Retrieve anonymized data for a given entity.

### Parameters

- `entityName` (string): Name of the entity.
- `sequenceIds` (array, optional): Sequence IDs of the entity to retrieve the data. Default is an empty array.

### Returns

- (object): The retrieved anonymized data.

### Example

```
const anonymizer = await cds.connect.to("cap-llm-plugin");
let response = await anonymizer.getAnonymizedData("EmployeeService.Employee",[1001])
```

Refer the [doc](./usage.md) for more details.



### `async getEmbedding(input)`

Retrieve vector embeddings.

### Parameters

- `input` (string): The input string to be embedded.

### Returns

- (object): Returns the vector embeddings.

### Example:

```
const input = "<user_input>";
const vectorplugin = await cds.connect.to("cap-llm-plugin");
let result = await vectorplugin.getEmbedding(<input_query>);
```

---

### `async getChatCompletion(payload)`

Retrieve chat completion response.

### Parameters

- `payload` (object): The payload for the chat completion model.

### Returns

- (object): The chat completion results from the model.

---

### Example:

```
const summaryPrompt = {
  "messages": [
    {
      "role": "user",
      "content": "Your task is to generate a short summary of a product review from an ecommerce site. Summarize the review below, delimited by triple backticks, in at most 30 words. Review:```Got this panda plush toy for my daughter's birthday, who loves it and takes it everywhere. It's soft and super cute, and its face has a friendly look. It's a bit small for what I paid though. I think there might be other options that are bigger for the same price. It arrived a day earlier than expected, so I got to play with it myself before I gave it to her. ```"
    }
  ]
}
const vectorplugin = await cds.connect.to("cap-llm-plugin");
let result = await vectorplugin.getChatCompletion(summaryPrompt);
```

### `async getRagResponse(input, tableName, embeddingColumnName, contentColumn, chatInstruction, context, [topK=3], [algoName='COSINE_SIMILARITY'], [chatParams])`

Retrieve RAG (retrival-agumented generation) response from LLM.

### Parameters

- `input` (string): User input.
- `tableName` (string): The full name of the SAP HANA Cloud table which contains the vector embeddings.
- `embeddingColumnName` (string): The full name of the SAP HANA Cloud table column which contains the embeddings.
- `contentColumn` (string): The full name of the SAP HANA Cloud table column which contains the page content.
- `chatInstruction` (string): The custom prompt user can pass in. Important: Ensure that the prompt contains the message "content which is enclosed in triple quotes".
- `context` (object, optional): The chat history.
- `topK` (number, optional): The number of the entries you want to return. Default value is 3.
- `algoName` (string, optional): The algorithm of similarity search. Currently only COSINE_SIMILARITY and L2DISTANCE are accepted. The default is 'COSINE_SIMILARITY'.
- `chatParams` (object, optional): The other chat model params.

### Returns

- (object): Returns the RAG response from the LLM.


### Example:

```
const vectorplugin = await cds.connect.to("cap-llm-plugin");
const chatRagResponse = await vectorplugin.getRagResponse(
    '<user_input>',
    '<table_name>', 
    '<embedding_column_name>', 
    '<page_content_column_name>', 
    'You are a chatbot. Answer the user question based only on the context, delimited by triple backticks\n '
);
```


### `async similaritySearch(tableName, embeddingColumnName, contentColumn, embedding, algoName, topK)`

Perform Similarity Search.

### Parameters

- `tableName` (string): The full name of the SAP HANA Cloud table which contains the vector embeddings.
- `embeddingColumnName` (string): The full name of the SAP HANA Cloud table column which contains the embeddings.
- `contentColumn` (string): The full name of the SAP HANA Cloud table column which contains the page content.
- `embedding` (number[]): The input query embedding for similarity search.
- `algoName` (string): The algorithm of similarity search. Currently only COSINE_SIMILARITY and L2DISTANCE are accepted.
- `topK` (number): The number of entries you want to return.

### Returns

- (object): The highest match entries from DB.

### Example:

```
const vectorplugin = await cds.connect.to("cap-llm-plugin");
const similaritySearchResults = vectorplugin.similaritySearch(
    '<table_name>', 
    '<embedding_column_name>', 
    'page_content_column_name>', 
    '<user_query_embeddings_from_embedding_model. Use getEmbedding method for generating the user embedding.>', 
    "L2DISTANCE", 
    2);
```

