# **CAP LLM Plugin**

CAP LLM Plugin helps developers create tailored Generative AI based CAP applications without exposing confidential data to LLM by anonymizing sensitive data leveraging SAP HANA Cloud Data Anonymization.

## **Prerequisites**

- Install the CAP LLM plugin in your CAP project using the following npm command:  

    `npm install cap-llm-plugin`

- You will need SAP HANA Cloud attached to your CAP application already. Refer [here](https://developers.sap.com/group.hana-cloud-cap-setup.html).

- A cloud foundry environment to deploy your CAP application to. Refer [here](https://help.sap.com/docs/DIGITALPAYMENTS/a5c364402f8d4c0b99f6a4c7de385a56/223db7192df44425b66bba122110779b.html) to enable Cloud Foundry in your SAP BTP subaccount.

- Set up default permissions for HDI container in your CAP application. In the db section of the CAP application, perform the steps specified in the "how" section of the [blog](https://blogs.sap.com/2022/01/19/modifying-the-default-access_role-in-hdi-containers/).

- Add the cds "cap-llm-plugin" service in the cds requires section of package.json in your CAP application as follows:

```
    "cds": {
    "requires": {
      "cap-llm-plugin": true
    }
  }
```


## **How to use the CAP LLM Plugin for anonymization:**
 
For information on what anonymization means, please refer to the following link [here](https://help.sap.com/docs/SAP_HANA_PLATFORM/b3ee5778bc2e4a089d3299b82ec762a7/6cf9d55f4d3d45b0bcdb41756d86629f.html).
 
In a CAP Application, there are usually 3 folders - app, db, and srv.
- `db` is where you define the entity.
- `srv` is where you expose it and use the entity.

### **Defining an Anonymized Entity**
This is the `db` folder in your CAP Application.

This annotation is at the entity level and at column level

Annotating at the entity level: You will need to annotate the entity you want to anonymize with the `@anonymize` annotation and provide the algorithm and parameters needed.

Annotating at the column level: You will need to annotate which columns act as a sequence with `{"is_sequence": true}` and how to anonymize each column. You do not have to anonymize all columns. For hierarchy, you can provide 3 different kinds - embedded hierarchy, external hierarchy, and hierarchy function. If you choose to provide a hierarchy function, please define it in db/src with .hdbfunction as the file extension. In addition, do not include the create or replace statement at the top of the function (an example will be provided below).

For more information on the parameters passed, please refer to the [SAP HANA Cloud Data Anonymization Documentation](https://help.sap.com/docs/SAP_HANA_PLATFORM/f88e51df089949b2af06ac891c77abf8/ee693d6584d243e1a0daf7c137f9600c.html)

You can use the annotation as follows in the cds file under db folder. Please note the annotation above the Employee entity and next to columns id, region, gender.

```
using { Currency, managed, sap } from '@sap/cds/common';
namespace sap.cap;
 

@anonymize : `ALGORITHM 'K-ANONYMITY' PARAMETERS '{"k" : 3}'`
entity Employee {
  key id : Integer @anonymize : `{"is_sequence": true}`;
  name : String ;
  region : String  @anonymize: `{"is_quasi_identifier" : true,  "hierarchy": {"embedded" : [["APJ"],["EMEA"],["NA"]]}}`;
  tlevel : String;
  gender : String @anonymize : `{"is_quasi_identifier" : true, "hierarchy": {"embedded" : [["Female"],["Male"]]}}`;
  age: Integer;
  ssn : String;
  personalizedEmail : String;
}
```    

For Hierarchy Functions, suppose your function is defined as follows in a file called `groupage.hdbfunction` in db/src folder.
```
FUNCTION "GROUP_AGE" (age NVARCHAR(20), level INTEGER)
RETURNS outValue NVARCHAR(50)
AS 
BEGIN
  DECLARE defineValue INTEGER DEFAULT 5;
  DECLARE interval INTEGER;
  DECLARE rangeFrom INTEGER;
  IF (level > 0) THEN 
    interval := defineValue * power(2, level - 1);
    rangeFrom = FLOOR(age / interval) * interval;
    outValue := '[' || rangeFrom || '-' || rangeFrom + interval - 1 || ']';
  ELSE
    outValue := age;
  END IF;
END;
```
You will then define the entity as follows, providing the hierarchy function in the parameters for the column (age in this case).

```
using { Currency, managed, sap } from '@sap/cds/common';
namespace sap.cap;
 

@anonymize : `ALGORITHM 'K-ANONYMITY' PARAMETERS '{"k" : 3}'`
entity Employee {
  key id : Integer @anonymize : `{"is_sequence": true}`;
  name : String ;
  region : String  @anonymize: `{"is_quasi_identifier" : true,  "hierarchy": {"embedded" : [["APJ"],["EMEA"],["NA"]]}}`;
  tlevel : String;
  gender : String @anonymize : `{"is_quasi_identifier" : true, "hierarchy": {"embedded" : [["Female"],["Male"]]}}`;
  age: String @anonymize: `{"is_quasi_identifier":true, "hierarchy":{"schema":"ANON_TEST", "function":"HIERARCHYFUNCTION", "levels": 4}}`;
  ssn : String;
  personalizedEmail : String;
}
```
### **Exposing and Using the Anonymized Entity**
This is the `srv` folder in your CAP Application.

In srv, you need to expose the entity as service to use it in the .cds file

To use the anonymized data, in the .js file for the entity as a service, you will need to connect to the cds "cap-llm-plugin" service and use method   

`getAnonymizedData("<serviceName>.<entityName>", [<optional list of ids>])`  

where serviceName is the service name you provide in the matching .cds file and entityName is the entity name you also provided in the matching .cds file. If you want to only retrieve specific records for the entity, you can provide a list of id(s) to the function.

Here is an example. First we are defining the service in the srv/employee-service.cds file as follows:

```
using { sap.cap as cap } from '../db/schema';
service EmployeeService @(path:'/browse') {
  entity Employee as projection on cap.Employee;
}
```

Next, in our srv/employee-service.js file we can use the getAnonymizeData method of the cds "cap-llm-plugin" service to retrieve the Employee entity as defined by the EmployeeService

```
const anonymizer = await cds.connect.to("cap-llm-plugin");
let response = await anonymizer.getAnonymizedData("EmployeeService.Employee")
```  

To get specific records for the entity, you can do the following. 

This will retrieve the record with id=1.
```
const anonymizer = await cds.connect.to("cap-llm-plugin");
let response = await anonymizer.getAnonymizedData("EmployeeService.Employee",[1])
```  

This will retrieve the record with id=1 or id=2.
```
const anonymizer = await cds.connect.to("cap-llm-plugin");
let response = await anonymizer.getAnonymizedData("EmployeeService.Employee",[1,2])
``` 
