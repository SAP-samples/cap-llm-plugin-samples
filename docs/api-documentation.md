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

Refer the [doc](./anonymization-usage.md) for more details.



### `async getEmbeddingWithConfig(config, input)`

Retrieve the vector embeddings.

Currently the following models are supported:

```
Executable ID: azure-openai
Model Name: "text-embedding-ada-002", "text-embedding-3-small", "text-embedding-3-large"
```

Refer the [SAP AI Core documentation](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/models-and-scenarios-in-generative-ai-hub) for more details.

The config(for all the methods that require a config parameter) would be a json object like the following in your package.json file. As you can see, multiple models are supported:

```
  "cds": {
    "requires": {
      "gen-ai-hub": {
        "text-embedding-ada-002": {
          "destinationName": "AICoreAzureOpenAIDestination",
          "deploymentUrl": "/v2/inference/deployments/{DEPLOYMENT_ID like d42ed73b0a6a3333}",
          "resourceGroup": "default",
          "apiVersion": "2024-02-15-preview",
          "modelName": "text-embedding-ada-002"
        }
      }
    }
  }
```

### Parameters

- `config` (object): The configuration for the embedding model.
- `input` (string): The input string to be embedded.

### Returns

- (object): Returns the vector embeddings. The complete response returned by the respective embedding model.

### Example:

```
const vectorplugin = await cds.connect.to("cap-llm-plugin");
const embeddingModelConfig = cds.env.requires["gen-ai-hub"]["text-embedding-ada-002"];
const embeddingGenResp = await vectorplugin.getEmbeddingWithConfig(embeddingModelConfig, user_query);
const vector_embedding = embeddingGenResp?.data[0]?.embedding;
```

---

### `async getChatCompletionWithConfig(config, payload)`

Retrieve the chat completion response.

Currently the following models are supported:

```
Executable ID: azure-openai
Model Name: "gpt-4", "gpt-4o", "gpt-4-32k", "gpt-35-turbo-16k", "gpt-35-turbo"

Executable ID: gcp-vertexai
Model Name: gemini-1.0-pro

Executable ID: aws-bedrock
Model Name: "anthropic--claude-3-sonnet", "anthropic--claude-3-haiku", "anthropic--claude-3-opus", "anthropic--claude-3.5-sonnet"

```

Refer the [SAP AI Core documentation](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/models-and-scenarios-in-generative-ai-hub) for more details.

The config(for all the methods that require a config parameter) would be a json object like the following in your package.json file. As you can see, multiple models are supported:

```
  "cds": {
    "requires": {
      "gen-ai-hub": {
        "gpt-4": {
          "destinationName": "AICoreAzureOpenAIDestination",
          "deploymentUrl": "/v2/inference/deployments/{DEPLOYMENT_ID like d42ed73b0a6a3333}",
          "resourceGroup": "default",
          "apiVersion": "2024-02-15-preview",
          "modelName": "gpt-4"
        },
        "gpt-4o": {
          "destinationName": "AICoreAzureOpenAIDestination",
          "deploymentUrl": "/v2/inference/deployments/{DEPLOYMENT_ID like d42ed73b0a6a3333}",
          "resourceGroup": "default",
          "apiVersion": "2024-02-15-preview",
          "modelName": "gpt-4o"
        },
        "text-embedding-ada-002": {
          "destinationName": "AICoreAzureOpenAIDestination",
          "deploymentUrl": "/v2/inference/deployments/{DEPLOYMENT_ID like d42ed73b0a6a3333}",
          "resourceGroup": "default",
          "apiVersion": "2024-02-15-preview",
          "modelName": "text-embedding-ada-002"
        },
        "gemini-1.0-pro": {
          "destinationName": "AICoreAzureOpenAIDestination",
          "deploymentUrl": "/v2/inference/deployments/{DEPLOYMENT_ID like d42ed73b0a6a3333}",
          "resourceGroup": "default",
          "apiVersion": "001",
          "modelName": "gemini-1.0-pro"
        },
         "anthropic--claude-3-sonnet": {
          "destinationName": "GenAIHubDestination",
          "deploymentUrl": "/v2/inference/deployments/d3ba5e081a658475",
          "resourceGroup": "default",
          "anthropic_version": "bedrock-2023-05-31",
          "max_tokens": 4096,
          "modelName": "anthropic--claude-3-sonnet"
          }
      },
      ...
    }
  }
```

### Parameters
- `config` (object): The configuration for the model.
- `payload` (object): The payload for the specific chat completion model.

### Returns

- (object): The chat completion results from the model. The complete chat completion response by the respective model.

---

### Example:

```
/*
Some chat models require mandatory chat parameters in the payload to be passed. Please refer to the model documentation for more details. For instance, AWS claude models requires 'anthropic_version' and 'max_tokens', so you will need to pass the parameters in the payload body.
*/

const chatModelConfig = cds.env.requires["gen-ai-hub"][{modelType like gemini-1.0-pro | anthropic--claude-3-sonnet | gpt-4 }];
const vectorplugin = await cds.connect.to("cap-llm-plugin");
let result = await vectorplugin.getChatCompletionWithConfig(chatModelConfig, payload);

```

### `async getRagResponseWithConfig(input, tableName, embeddingColumnName, contentColumn, chatInstruction, context, [topK=3], [algoName='COSINE_SIMILARITY'], [chatParams], embeddingConfig, chatConfig)`

Retrieve RAG (retrival-agumented generation) response from LLM.

### Parameters

- `input` (string): User input.
- `tableName` (string): The full name of the SAP HANA Cloud table which contains the vector embeddings.
- `embeddingColumnName` (string): The full name of the SAP HANA Cloud table column which contains the embeddings.
- `contentColumn` (string): The full name of the SAP HANA Cloud table column which contains the page content.
- `chatInstruction` (string): The custom prompt user can pass in. Important: Ensure that the prompt contains the message "content which is enclosed in triple quotes".
- `embeddingConfig` The configuration for the embedding model.
- `chatConfig` The configuration for the chat completion model - same as described for previous config.
- `context` (object, optional): The chat history.
- `topK` (number, optional): The number of the entries you want to return. Default value is 3.
- `algoName` (string, optional): The algorithm of similarity search. Currently only COSINE_SIMILARITY and L2DISTANCE are accepted. The default is 'COSINE_SIMILARITY'.
- `chatParams` (object, optional): The other chat model params.


### Returns

- (object): Returns the RAG response from the LLM in the form of {
        "completion": chat completion response from getChatCompletionWithConfig method,
        "additionalContents": complete similarity search results from SAP HANA Cloud,
      }


### Example:

```
const vectorplugin = await cds.connect.to("cap-llm-plugin");
const embeddingModelConfig = cds.env.requires["gen-ai-hub"]["text-embedding-ada-002"];
                
const chatModelConfig = cds.env.requires["gen-ai-hub"][{modelType like gemini-1.0-pro | anthropic--claude-3-sonnet | gpt-4 }];
/*
Some chat models require mandatory chatParams to be passed. Please refer to the model documentation for more details. For instance, AWS claude models requires 'anthropic_version' and 'max_tokens', so you will need to pass the chatParams as follows:
const chatParams = chatModelConfig?.modelName === "anthropic--claude-3-sonnet" ? { 
                 anthropic_version: chatModelConfig?.anthropic_version,
                 max_tokens: chatModelConfig?.max_tokens
                } : undefined;
*/

const chatRagResponse = await vectorplugin.getRagResponseWithConfig(
   '<user_input>', //user query
    '<table_name>',  //table name containing the embeddings
    '<embedding_column_name>', //column in the table containing the vector embeddings
    '<contentColumn>', //  column in the table containing the actual content
    '<SystemPrompt like You are a chatbot. Answer the user question based only on the context, delimited by triple backticks\n>', // system prompt for the task
    embeddingModelConfig, //embedding model config
    chatModelConfig, //chat model config
    <memory-context or none>, //Optional.conversation memory context to be used.
    15,  //Optional. topK similarity search results to be fetched. Defaults to 5,
    "COSINE_SIMILARITY", //Optional. Defaults to 'COSINE_SIMILARITY',
    <chatParams or none> //Optional. Additional chat parameters for the chat model. Pass the above chatParams for AWS anthropic models.
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

- (object): The highest matched entries from DB.

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

### `async getEmbedding(input)`

Note: This method is for backward compatibilty. This method just supports Azure OpenAI embedding model. Use the `getEmbeddingWithConfig` method instead.

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

Note: This method is for backward compatibilty. This method just supports Azure OpenAI chat model. Use the `getChatCompletionWithConfig` method instead.

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

Note: This method is for backward compatibilty. This method just supports Azure OpenAI chat model. Use the `getRagResponseWithConfig` method instead.

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


