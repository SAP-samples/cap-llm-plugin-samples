/* Main implementation file for handling chat */

const cds = require('@sap/cds');
const { DELETE } = cds.ql;
const { storeRetrieveMessages, storeModelResponse } = require('./memory-helper');


const tableName = 'SAP_TISCE_DEMO_DOCUMENTCHUNK';
const embeddingColumn = 'EMBEDDING';
const contentColumn = 'TEXT_CHUNK';

const systemPrompt =
    ` You are an helpful assistant who answers user question based only on the following context enclosed in triple quotes.\n
`;

module.exports = function () {

    this.on('getChatRagResponse', async (req) => {
        try {
            //request input data
            const { conversationId, messageId, message_time, user_id, user_query } = req.data;
            const { Conversation, Message } = this.entities;
            const capllmplugin = await cds.connect.to("cap-llm-plugin");
            console.log("***********************************************************************************************\n");
            console.log(`Received the request for RAG retrieval for the user query : ${user_query}\n`);
            /*
            For this sample use case we show how you can leverage the gpt model. However, you can easily customize this code to use any models supported by CAP LLM Plugin.
            Chat Model:  gpt-4 
            Embedding Model: text-embedding-ada-002
            */

            //set the modeName you want
            const chatModelName = "gpt-4";
            const embeddingModelName = "text-embedding-ada-002";

            console.log(`Leveraing the following LLMs \n Chat Model:  gpt-4 \n Embedding Model: text-embedding-ada-002\n`);
            //Optional. handle memory before the RAG LLM call
            const memoryContext = await storeRetrieveMessages(conversationId, messageId, message_time, user_id, user_query, Conversation, Message, chatModelName);

            //Obtain the model configs configured in package.json
            const chatModelConfig = cds.env.requires["gen-ai-hub"][chatModelName];
            const embeddingModelConfig = cds.env.requires["gen-ai-hub"][embeddingModelName];
            
            /*Some models require you to pass few mandatory chat params, please check the respective model documentation to pass those params in the 'charParams' parameter. 
            For example, AWS anthropic models requires few mandatory parameters such as anthropic_version and max_tokens, the you will need to pass those parameters in the 'chatParams' parameter of getRagResponseWithConfig(). 
            */

            /*Single method to perform the following :
            - Embed the input query
            - Perform similarity search based on the user query 
            - Construct the prompt based on the system instruction and similarity search
            - Call chat completion model to retrieve relevant answer to the user query
            */
            console.log("Getting the RAG retrival response from the CAP LLM Plugin!");

            const chatRagResponse = await capllmplugin.getRagResponseWithConfig(
                user_query,  //user query
                tableName,   //table name containing the embeddings
                embeddingColumn, //column in the table containing the vector embeddings
                contentColumn, //  column in the table containing the actual content
                systemPrompt, // system prompt for the task
                embeddingModelConfig, //embedding model config
                chatModelConfig, //chat model config
                memoryContext.length > 0 ? memoryContext : undefined, //Optional.conversation memory context to be used.
                5  //Optional. topK similarity search results to be fetched. Defaults to 5
            );

            //parse the response object according to the respective model for your use case. For instance, lets consider the following three models.
            let chatCompletionResponse = null;
            if (chatModelName === "gpt-4"){
                chatCompletionResponse =
                {
                    "role": chatRagResponse.completion.choices[0].message.role,
                    "content": chatRagResponse.completion.choices[0].message.content
                }
            }
            //Optional. parse other model outputs if you choose to use a different model.
            else
            {
                throw new Error("The model supported in this application is 'gpt-4'. Please customize this application to use any model supported by CAP LLM Plugin. Please make the customization by referring to the comments.")
            }
            //Optional. handle memory after the RAG LLM call
            const responseTimestamp = new Date().toISOString();
            await storeModelResponse(conversationId, responseTimestamp, chatCompletionResponse, Message, Conversation);

            //build the response payload for the frontend.
            const response = {
                "role": chatCompletionResponse.role,
                "content": chatCompletionResponse.content,
                "messageTime": responseTimestamp,
                "additionalContents": chatRagResponse.additionalContents,
            };

            return response;
        }
        catch (error) {
            // Handle any errors that occur during the execution
            console.log('Error while generating response for user query:', error);
            throw error;
        }
    })


    this.on('deleteChatData', async () => {
        try {
            const { Conversation, Message } = this.entities;
            await DELETE.from(Conversation);
            await DELETE.from(Message);
            return "Success!"
        }
        catch (error) {
            // Handle any errors that occur during the execution
            console.log('Error while deleting the chat content in db:', error);
            throw error;
        }
    })

}