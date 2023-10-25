# CAP LLM Plugin

CAP LLM Plugin helps developers create tailored Generative AI based CAP applications without exposing confidential data to LLM by anonymizing sensitive data leveraging SAP HANA Cloud Data Anonymization.


## 📚 Documentation

For documentation on the use of the CAP LLM plugin, refer the [documentation](docs/usage.md)

## ✔️ Highlighting Features  


|                         **Feature**                                                           |                                                           **Details**    
| :-------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------
|  Seamlessly anonymize sensitive data using a variety of SAP HANA Cloud's anonymization capabilities |   Effortlessly anonymize sensitive data within a CAP application by employing a single `@anonymize` annotation using a diverse range of SAP HANA Cloud's anonymization algorithms, including but not limited to: <li> [k-Anonymity](https://help.sap.com/docs/SAP_HANA_PLATFORM/f88e51df089949b2af06ac891c77abf8/205f52e73c4a422e91fb9a0fbd5f3ec6.html)</li><li> [l-Diversity](https://help.sap.com/docs/SAP_HANA_PLATFORM/f88e51df089949b2af06ac891c77abf8/eeb681e53a06434ca8a0fd20ab9c2b7c.html)</li><li> [Differential Privacy](https://help.sap.com/docs/SAP_HANA_PLATFORM/f88e51df089949b2af06ac891c77abf8/ace3f36bad754cc9bbfe2bf473fccf2f.html)</li></ul>|
| Securely connect to LLM via SAP Private Link Service                                          |    Establish a secure connection to the LLM by utilizing the SAP Private Link service within the CAP application. Exposing just the anonymized data to the LLM via the private link ensures a high level of data privacy. For additional details on setting up the SAP private link, comprehensive information is available [here](https://help.sap.com/docs/private-link/private-link1/what-is-sap-private-link-service)
| Effortlessly replace the anonymized data within the LLM response with  genuine information|  Given that the data provided to the LLM consists of anonymized information, the CAP LLM plugin ensures a seamless replacement of anonymized content within the LLM response with the corresponding authentic data.  

## How to obtain support
[Create an issue](https://github.com/SAP-samples/<repository-name>/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
