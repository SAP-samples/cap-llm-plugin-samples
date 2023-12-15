const cds = require('@sap/cds')
const getPersonalizedEmail = require('./ai-core-service')

module.exports = cds.service.impl(function () {
  this.after('READ', 'Employee', async function (data) {
    const {
      Employee
    } = cds.entities;

    if (Object.keys(data).length === 1) {
      const actualData = data[0];

      //Retrieve the anonymized data from HANA Cloud
      const anonymizer = await cds.connect.to("cap-llm-plugin");
      let anonymizedEmployees = await anonymizer.getAnonymizedData("EmployeeService.Employee", [actualData.id]);

      //For each of the requested employees, generate the persoanlized email by passing the anonymized data to LLM. Then, replace the anonymized data with actaul employee data.
      const stringData = JSON.stringify(anonymizedEmployees);
      let personalizedLlmResponse = await getPersonalizedEmail(stringData);

      for (const [key, value] of Object.entries(actualData)) { personalizedLlmResponse = personalizedLlmResponse.replaceAll(`"` + key.toUpperCase() + `"`, value) }

        const n = await UPDATE(Employee).set({
          ID: actualData.id,
          REGION: actualData.region,
          TLEVEL: actualData.tlevel,
          GENDER: actualData.gender,
          AGE: actualData.age,
          SSN: actualData.ssn,
          PERSONALIZEDEMAIL: personalizedLlmResponse
        }).where({
          ID: actualData.id
        });
        n > 0 || req.error(404);
    }
  })

})
