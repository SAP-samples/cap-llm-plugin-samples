const cds = require('@sap/cds');
const { INSERT, SELECT, UPDATE } = cds.ql;
const { v4: uuidv4 } = require('uuid');

// Helper method to get the current timestamp
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// Helper method to insert the messages and update the latest conversation timestamp in db
async function insertMessage(messageEntity, messageRecord, conversationId, conversationEntity, messageTime) {

    console.log(`Inserting new message for conversation id: ${conversationId}`);
    const messageInsertionStatus = await INSERT.into(messageEntity).entries([messageRecord]);
    if (!messageInsertionStatus) { throw new Error("Insertion of message into db failed!"); };

    console.log(`Updating the time for conversation id: ${conversationId}`);
    const updateConversationStatus = await UPDATE(conversationEntity).set`last_update_time = ${messageTime}`.where`cID = ${conversationId}`;
    if (updateConversationStatus !== 1) { throw new Error("Updating the conversation time failed!"); }
}

// Helper method to handle conversation memory in HANA CLoud before RAG LLM call.
async function handleMemoryBeforeRagCall(conversationId, messageId, message_time, user_id, user_query, Conversation, Message) {
    try {

        const memoryContext = [];

        // Check if conversation exists in the db
        const isConversationPresent = await SELECT.from(Conversation).where({ "cID": conversationId });

        // If conversation is present, select messages from db and store it in memory context obj
        if (isConversationPresent.length > 0) {
            console.log(`Retrieving messages for conversation id: ${conversationId}`);

            const messageSelectStmt = await SELECT.from(Message).where({ "cID_cID": conversationId }).orderBy('creation_time');
            if (messageSelectStmt.length > 0) {
                messageSelectStmt.forEach(message => {
                    memoryContext.push({
                        "role": message.role,
                        "content": message.content
                    });
                });
            }
            else { throw new Error(`Messages corresponding to conversation id: ${conversationId} not present!`) }
        }

        // If conversation is not present, insert the conversation into db
        else {

            const conversationTitle = await getConversationSummarization(user_query);

            console.log(`Inserting new conversation for conversation id: ${conversationId}`);
            const currentTimestamp = getCurrentTimestamp()
            const conversationEntry = {
                "cID": conversationId,
                "userID": user_id,
                "creation_time": currentTimestamp,
                "last_update_time": currentTimestamp,
                "title": conversationTitle,
            }
            const conversationInsertStatus = await INSERT.into(Conversation).entries([conversationEntry])
            if (!conversationInsertStatus) { throw new Error("Insertion of conversation into db failed!"); }
        }

        // In both cases, insert the message into db
        const messageRecord = {
            "cID_cID": conversationId,
            "mID": messageId,
            "role": "user",
            "content": user_query,
            "creation_time": message_time
        };

        await insertMessage(Message, messageRecord, conversationId, Conversation, message_time);
        return memoryContext;
    }

    catch (error) {
        // Handle any errors that occur during the execution
        console.log('Error handling memory prior to RAG response:', error);
        throw error;
    }
}

// Helper method to handle conversation memory in HANA CLoud after RAG LLM call.
async function handleMemoryAfterRagCall(conversationId, message_time, chatRagResponse, Message, Conversation) {
    try {
        const aiMessageRecord = {
            "cID_cID": conversationId,
            "mID": uuidv4(),
            "role": chatRagResponse.role,
            "content": chatRagResponse.content,
            "creation_time": message_time
        };

        // Insert the assistant message to db
        await insertMessage(Message, aiMessageRecord, conversationId, Conversation, getCurrentTimestamp());
    }
    catch (error) {
        // Handle any errors that occur during the execution
        console.log('Error handling memory post RAG response:', error);
        throw error;
    }

}

async function getConversationSummarization(userQuestion){
    
    const genAIHubConfig = cds.env.requires?.GENERATIVE_AI_HUB,
          resourceGroupname = genAIHubConfig.CHAT_MODEL_RESOURCE_GROUP,
          modelDeploymentUri = genAIHubConfig.CHAT_MODEL_DEPLOYMENT_URL,
          apiVersion = genAIHubConfig.CHAT_MODEL_API_VERSION,
          genAIDestName = genAIHubConfig.CHAT_MODEL_DESTINATION_NAME;

    const reqHeaders = {
        "Content-Type": "application/json",
        "AI-Resource-Group": resourceGroupname, 
    };
    const reqPayload = {
        messages: [
            {
              role: "user",
              content: userQuestion,
            },
            {
                role: "assistant",
                content: "Generate short summarization on the user input, no matter whether the user input is a question or not. The short summarization should be able to be used the conversation title."
            }
          ],
          temperature: 0.0,
    };

    const genAISrv = await cds.connect.to(genAIDestName);

    const response = await genAISrv.send({
        query: `POST ${modelDeploymentUri}/chat/completions?api-version=${apiVersion}`,
        headers: reqHeaders,
        data: reqPayload,
    });

    return response.choices[0].message.content;
}

module.exports = {
    handleMemoryBeforeRagCall,
    handleMemoryAfterRagCall
};