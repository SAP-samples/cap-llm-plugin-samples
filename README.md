[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/cap-llm-plugin-samples)](https://api.reuse.software/info/github.com/SAP-samples/cap-llm-plugin-samples)


# CAP LLM Plugin

CAP LLM Plugin helps developers create tailored Generative AI based CAP applications:

1. Without exposing confidential data to LLM by anonymizing sensitive data leveraging SAP HANA Cloud Data Anonymization.
2. Seamlessly generate vector embeddings via SAP AI Core.
3. Easily retrieve Chat Completion response via SAP AI Core.
4. Effortlessly perform similarity search via SAP HANA Cloud Vector engine.
5. Simplified single RAG (retrieval-augmented generation) retrieval method powered by SAP AI Core and SAP HANA Cloud Vector Engine.
6. Access the harmonized chat completion API of the SAP AI Core Orchestration service.

## Architecture 

![architecture](./docs/images/Architecture.png)

## ✔️ Anonymization Features


|                         **Feature**                                                           |                                                           **Details**    
| :-------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------
|  Seamlessly anonymize sensitive data using a variety of SAP HANA Cloud's anonymization capabilities |   Effortlessly anonymize sensitive data within a CAP application by employing a single `@anonymize` annotation using a diverse range of SAP HANA Cloud's anonymization algorithms, including but not limited to: <li> [k-Anonymity](https://help.sap.com/docs/SAP_HANA_PLATFORM/f88e51df089949b2af06ac891c77abf8/205f52e73c4a422e91fb9a0fbd5f3ec6.html)</li><li> [l-Diversity](https://help.sap.com/docs/SAP_HANA_PLATFORM/f88e51df089949b2af06ac891c77abf8/eeb681e53a06434ca8a0fd20ab9c2b7c.html)</li><li> [Differential Privacy](https://help.sap.com/docs/SAP_HANA_PLATFORM/f88e51df089949b2af06ac891c77abf8/ace3f36bad754cc9bbfe2bf473fccf2f.html)</li></ul>|
| Effortlessly replace the anonymized data within the LLM response with  genuine information|  Given that the data provided to the LLM consists of anonymized information, the CAP LLM plugin ensures a seamless replacement of anonymized content within the LLM response with the corresponding authentic data.    

## 🎯 LLM Access Layer Features

|                         **Feature**                                                           |                                                           **Details**    
| :-------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------
|  Embedding generation via SAP AI Core | Easily connect to embedding models via SAP AI Core and generate embeddings seamlessly |
|  Similarity search  |  Leverage the SAP HANA Cloud's Vector engine to perform similarity search via CAP LLM Plugin |  
|  Chat LLM Access via SAP AI Core |   Simple access to LLM models via SAP AI Core with simplified method for chat completion |  
|  Streamlining RAG retrieval  |   Single method to streamline the entire RAG retrieval process leveraging SAP AI Core and SAP HANA Cloud Vector Engine |
|  :new: Orchestration Service Support | Support for SAP AI Core orchestration service's harmonized chat completion APIs


## 📚 Samples and documentation

For API documentation for the CAP LLM plugin, refer the [api-documentation](./docs/api-documentation.md).

For how to use Anonymization with CAP LLM plugin, refer the [anonymization-usage](./docs/anonymization-usage.md).

For sample use cases leveraging CAP LLM Plugin, refer to [Samples](./samples/).

## 👉 Guidance : 
When to use the SAP Cloud SDK for AI vs. the CAP LLM Plugin?

| **SAP Cloud SDK for AI** | **CAP LLM Plugin** |
|--------------------------|---------------------|
| [**SAP Cloud SDK for AI**](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/libraries-and-sdks) is the official SDK for SAP AI Core, generative AI hub, and orchestration. This is the recommended AI SDK for customers and partners. | [**CAP LLM Plugin**](https://github.com/SAP-samples/cap-llm-plugin-samples) is an open source community plugin for simplifying the development of SAP CAP applications. |
| - This SDK offers enterprise-grade integration with SAP AI Core and related GenAI platform services.<br>- Use this for all productive use cases requiring LLM access, chat completion, content filtering, grounding, data masking, orchestration, type safety, and business AI compliance.<br>- SDK has support for Java, JavaScript/TypeScript and Python.<br>- Fully endorsed and maintained by SAP for integration with SAP AI Core and related services. | - The plugin is not an official SAP product. It is released under the Apache 2.0 license and is published as a community contribution.<br>- Targeted for RAG-based CAP applications leveraging SAP HANA Cloud's [vector engine capabilities](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-vector-engine-guide/introduction?locale=en-US) and [anonymization capabilities](https://help.sap.com/docs/SAP_HANA_PLATFORM/b3ee5778bc2e4a089d3299b82ec762a7/6cf9d55f4d3d45b0bcdb41756d86629f.html?locale=en-US) through annotations in SAP CAP applications.<br>- Supports Node.js and can be used for rapid prototyping of CAP-based RAG applications. |
| **Resource:** [SAP CLoud SDK for AI](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/libraries-and-sdks) | **Resource:** [CAP LLM Plugin](https://github.com/SAP-samples/cap-llm-plugin-samples) |

## How to obtain support
[Create an issue](https://github.com/SAP-samples/cap-llm-plugin-samples/issues) in this repository if you find a bug from the plugin.
 
For other support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## License
Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
