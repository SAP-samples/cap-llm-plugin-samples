const cds = require('@sap/cds');
const { DELETE } = cds.ql;
const sf_connection_util = require("./sf-connection-util")
const { handleMemoryBeforeRagCall, handleMemoryAfterRagCall } = require('./memory-helper');

userId = cds.env.requires["SUCCESS_FACTORS_CREDENTIALS"]["USER_ID"]

const tableName = 'SAP_TISCE_DEMO_DOCUMENTCHUNK'; 
const embeddingColumn  = 'EMBEDDING'; 
const contentColumn = 'TEXT_CHUNK';

const systemPrompt = 
`Your task is to classify the user question into either of the two categories: leave-request-query or generic-query\n

 If the user wants to take or apply leave with a timeline or time information , return the response as json with the following format:
 {
    "category" : "leave-request-query"
    "dates" : "yyyy/mm/dd-yyyy/mm/dd"
 } 

 For all other queries, return the response as json as follows
 {
    "category" : "generic-query"
 } 

Rules:

1. If the user does not provide any time information consider it as a generic category.
2. If the category of the user question is "leave-request-query", 
a. if the user does not input exact dates and only mentions months, fill the dates as "[start date of the month]-[end date of the month]".
b. if the user does not input exact dates and only mentions week, fill the dates as "[start date of the week]-[end date of the week]".

EXAMPLES:

EXAMPLE1: 

user input: Can I take leave between January 1 to January 10 ?
response:  {
    "category" : "leave-request-query"
    "dates" : "2024/01/01-2024/01/10"
 } 

EXAMPLE2: 

user input: What is the maternity leave policy ?
response:  {
    "category" : "generic-query"
 } 

EXAMPLE3: 

user input:  Can I take leave in March ?
response:  {
    "category" : "leave-request-query"
    "dates" : "2024/03/01-2024/03/31"
 } 

EXAMPLE4: 

user input:  Can I take leave this week ?
response:  {
    "category" : "leave-request-query"
    "dates" : "2024/02/26-2024/03/01"
 } 

EXAMPLE5: 

 user input:  Can I take leave next week ?
 response:  {
     "category" : "leave-request-query"
     "dates" : "2024/03/04-2024/03/08"
  } 

EXAMPLE6:
user input: Can I take leave ?
response: {
    "category" : "generic-query"
 } 

`;

const hrRequestPrompt = 
`You are a chatbot. Answer the user question based on the following information
1. HR policy, delimited by triple backticks. \n 
2. If there are any team specific leave guidelines in the HR policy, consider the user as member of the following team and check the team members leave schedule in json format delimited by double backticks.

Team Member Leave Schedule\n

{ "name" : [[ leave_start_date - leave_end_date]] }\n

Rules: \n 
1. Ask follow up questions if you need additional information from user to answer the question.\n 
2. If the team members leave schedule is {} or empty , then none of the team members are on leave.\n
3. Be more formal in your response. \n
4. Keep the answers concise. 
`
;

const genericRequestPrompt = 
'You are a chatbot. Answer the user question based only on the context, delimited by triple backticks\n ';
;

const taskCategory = {
    "leave-request-query" : hrRequestPrompt,
    "generic-query" : genericRequestPrompt
}

function getFormattedDate (timeStamp)
{
    const timestamp = Number(timeStamp);
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'GMT',
      }).format(date);
}




module.exports = function () {

    this.on('getChatRagResponse', async (req) => {
        try {
            //request input data
            const { conversationId, messageId, message_time, user_id, user_query } = req.data;
            const { Conversation, Message } = this.entities;
            const vectorplugin = await cds.connect.to("cap-llm-plugin");
            let hrLeavePrompt = "";

            let determinationPayload = [{
                "role" : "system",
                "content" : `${systemPrompt}`
              }];

            const userQuestion = [
                {
                  "role": "user",
                  "content": `${user_query}`
                }
              ]
            
            determinationPayload.push(...userQuestion);
            let payload = {
                "messages": determinationPayload
            };

            const determinationResponse = await vectorplugin.getChatCompletion(payload)
            const determinationJson = JSON.parse(determinationResponse.content);
            const category = determinationJson?.category ;

            if (! taskCategory.hasOwnProperty(category)) {
                throw new Error(`${category} is not in the supported`);
              }
            
            if (category === "leave-request-query")
            {
                
                const [startDateStr, endDateStr] = determinationJson?.dates?.split('-');
                let data = await sf_connection_util.
                getPeersVacationTimeByUserId(
                    userId,
                    startDateStr.replace(/\//g, '-')+'T00:00:00', //2024-03-10T00:00:00
                    endDateStr.replace(/\//g, '-')+'T00:00:00', //2024-03-10T00:00:00
                    30
                )

                const teamLeaveDates = {}
                data.forEach(item => {
                    const formattedData = [];
                    item.vacations.forEach(vacation => {

                        formattedData.push([getFormattedDate (vacation.startDate), getFormattedDate (vacation.endDate) ]);
                    });
                    if ( formattedData.length > 0 ) { teamLeaveDates[item.displayName] = formattedData; }
                });
                
                const teamLeaveDataString = JSON.stringify(teamLeaveDates);

                hrLeavePrompt = hrRequestPrompt + ` \`\`${teamLeaveDataString}\`\` \n`
            }
            
            

            //handle memory before the RAG LLM call
            const memoryContext = await handleMemoryBeforeRagCall (conversationId , messageId, message_time, user_id , user_query, Conversation, Message );
            
            /*Single method to perform the following :
            - Embed the input query
            - Perform similarity search based on the user query 
            - Construct the prompt based on the system instruction and similarity search
            - Call chat completion model to retrieve relevant answer to the user query
            */

            const promptCategory  = {
                "leave-request-query" : hrLeavePrompt,
                "generic-query" : genericRequestPrompt
            }

            const chatRagResponse = await vectorplugin.getRagResponse(
                user_query,
                tableName,
                embeddingColumn,
                contentColumn,
                promptCategory[category] ,
                memoryContext .length > 0 ? memoryContext : undefined,
                30
            );

            //handle memory after the RAG LLM call
            const responseTimestamp = new Date().toISOString();
            await handleMemoryAfterRagCall (conversationId , responseTimestamp, chatRagResponse.completion, Message, Conversation);

            const response = {
                "role" : chatRagResponse.completion.role,
                "content" : chatRagResponse.completion.content,
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