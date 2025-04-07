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


  async function getOrchestrationChatResponse(query, similarContent, history) {

    const capllmplugin = await cds.connect.to("cap-llm-plugin");
    const filterConfig = {
        Hate: 'ALLOW_SAFE_LOW',
        Violence: 'ALLOW_SAFE_LOW_MEDIUM'
      }
    const type = "azure";
    const filter = await capllmplugin.getContentFilters({type,filterConfig});

    const clientConfig = {
        llm: {
          model_name: 'gpt-4',
          model_params: { max_tokens: 50, temperature: 0.1 }
        },
        templating: {
          template: [
          { role: 'system', content: ` ${systemPrompt} \`\`\` ${similarContent} \`\`\` ` },
          { role: 'user', content:  '{{?query}}?'}
          ]
        },
        filtering: {
            input: {
              filters: [filter] 
            },
            output: {
              filters: [filter]
            }
          }
      };

    const chatCompletionConfig = {
        inputParams: { query },
        messagesHistory : history
      };


    const chatResponse = await capllmplugin.getHarmonizedChatCompletion({
        clientConfig,
        chatCompletionConfig,
        getContent: true // Retrieve only the content
    });
    
    return chatResponse;
  }


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

            //generate embeddings
            const embeddingModelConfig = cds.env.requires["gen-ai-hub"][embeddingModelName];
            const embeddingResult = await capllmplugin.getEmbeddingWithConfig(embeddingModelConfig, user_query);
            const embedding = embeddingResult?.data[0]?.embedding;

            //get the top relevant content from similarity search
            const similaritySearchResults = await capllmplugin.similaritySearch(
                tableName, 
                embeddingColumn, 
                contentColumn, 
                embedding, 
                "COSINE_SIMILARITY", 
                5);
            
            const similarContent = similaritySearchResults.map(
                (obj) => obj.PAGE_CONTENT
                );
            
            //Optional. handle memory before the RAG LLM call
            const memoryContext = await storeRetrieveMessages(conversationId, messageId, message_time, user_id, user_query, Conversation, Message, chatModelName);
            
            //chat completion response from Orchestration Service
            const orchestrationResponse = await getOrchestrationChatResponse(user_query, similarContent, memoryContext);

            //parse the response object according to the respective model for your use case.
            let chatCompletionResponse = null;
            if (chatModelName === "gpt-4"){
                chatCompletionResponse =
                {
                    "role": "assistant",
                    "content": orchestrationResponse
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
                "additionalContents": null,
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