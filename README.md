# CAP LLM Plugin

CAP LLM Plugin helps developers create tailored Generative AI based CAP applications without exposing confidential data to LLM by anonymizing sensitive data leveraging SAP HANA Cloud Data Anonymization.


## 📚 Samples and documentation

For documentation on the use of the CAP LLM plugin, refer the [documentation](docs/usage.md).

For sample use cases leveraging CAP LLM Plugin, refer the [samples](./samples).

## ✔️ Highlighting Features  


|                         **Feature**                                                           |                                                           **Details**    
| :-------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------
|  Seamlessly anonymize sensitive data using a variety of SAP HANA Cloud's anonymization capabilities |   Effortlessly anonymize sensitive data within a CAP application by employing a single `@anonymize` annotation using a diverse range of SAP HANA Cloud's anonymization algorithms, including but not limited to: <li> [k-Anonymity](https://help.sap.com/docs/SAP_HANA_PLATFORM/f88e51df089949b2af06ac891c77abf8/205f52e73c4a422e91fb9a0fbd5f3ec6.html)</li><li> [l-Diversity](https://help.sap.com/docs/SAP_HANA_PLATFORM/f88e51df089949b2af06ac891c77abf8/eeb681e53a06434ca8a0fd20ab9c2b7c.html)</li><li> [Differential Privacy](https://help.sap.com/docs/SAP_HANA_PLATFORM/f88e51df089949b2af06ac891c77abf8/ace3f36bad754cc9bbfe2bf473fccf2f.html)</li></ul>|
| Effortlessly replace the anonymized data within the LLM response with  genuine information|  Given that the data provided to the LLM consists of anonymized information, the CAP LLM plugin ensures a seamless replacement of anonymized content within the LLM response with the corresponding authentic data.    

## 🎯 Roadmap Features  

|                         **Feature**                                                           |                                                           **Details**    
| :-------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------
|  Integration with SAP HANA Cloud’s Vector Store/Engine |   Integration with SAP HANA Cloud’s Vector Store/Engine to effortlessly store vector embeddings in SAP HANA Cloud and seamlessly perform similarity search.|  
|  Integration with Joule                                          |     Integration with Joule, the natural language, generative AI copilot to leverage the full potential of conversational AI with SAP systems.

## How to obtain support
[Create an issue](https://github.com/SAP-samples/<repository-name>/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.