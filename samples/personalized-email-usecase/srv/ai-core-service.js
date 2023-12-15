const resourceGroupId = `<resourceGroupId>`;
const deploymentId = "<deploymentId>";
const AI_CORE_DESTINATION = "<AI_CORE_DESTINATION_NAME>";
const API_VERSION = "<API_VERSION>";

async function getPersonalizedEmail(data)
{
    const template = `
                    You are Christian, CEO of Azira. 

                    Generate a personalized message to the employee congratulating them on their contribution to the team. 

                    The employee information is formatted  as a dictionary. The key in the dictionary is "Employee Attribute" and value is "Employee value". 

                    Here is the employee information is formatted  as a dictionary
                    ${data}

                    Include atleast two paragraphs. The email should be written with these values in mind. 

                    Important: Instead of using employee value in the email use the corresponding employee attribute with double quotes. This is very important as the next steps depend on it.

                    Do not include any additional information apart from the email body. Address the employee using "NAME" enclosed in double quotes.

                    Finally, double-check if the generated email contains any employee value, if so replace it with corresponding employee attribute with double quotes. 
                    `
    if (deploymentId) {
    const aiCoreService = await cds.connect.to(AI_CORE_DESTINATION);
    const payload = {
        messages: [{ role: "user", content: template }],
        max_tokens: 16000,
        temperature: 0.0,
    };
    const headers = {
        "Content-Type": "application/json",
        "AI-Resource-Group": resourceGroupId,
    };
    const response = await aiCoreService.send({
        // @ts-ignore
        query: `POST /inference/deployments/${deploymentId}/chat/completions?api-version=${API_VERSION}`,
        data: payload,
        headers: headers,
    });
    console.log(JSON.stringify(response));
    return response["choices"][0]?.message?.content;
    } else {
    return `No deployment found for this tenant`;
    }
}

module.exports=getPersonalizedEmail;