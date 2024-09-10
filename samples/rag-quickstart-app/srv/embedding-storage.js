/* Helper file to process and store vector embeddings in HANA Cloud */

const cds = require('@sap/cds');
const { INSERT, DELETE, SELECT } = cds.ql;
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');


// Helper method to convert embeddings to buffer for insertion
let array2VectorBuffer = (data) => {
  const sizeFloat = 4;
  const sizeDimensions = 4;
  const bufferSize = data.length * sizeFloat + sizeDimensions;

  const buffer = Buffer.allocUnsafe(bufferSize);
  // write size into buffer
  buffer.writeUInt32LE(data.length, 0);
  data.forEach((value, index) => {
    buffer.writeFloatLE(value, index * sizeFloat + sizeDimensions);
  });
  return buffer;
};

// Helper method to delete file if it already exists
const deleteIfExists = (filePath) => {
  try {
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log('File does not exist');
        } else {
          console.error('Error deleting file:', err);
        }
      } else {
        console.log('File deleted successfully');
      }
    });
  } catch (unlinkErr) {
    console.error('Error occurred while attempting to delete file:', unlinkErr);
  }
};


module.exports = function () {

  this.on('storeEmbeddings', async (req) => {
    try {

      const { uuid } = req.data;
      const db = await cds.connect.to('db');
      const { Files, DocumentChunk } = this.entities;
      const capllmplugin = await cds.connect.to("cap-llm-plugin");
      let textChunkEntries = [];
      const embeddingModelName = "text-embedding-ada-002";

      // Check if document exists
      const isDocumentPresent = await SELECT.from(Files).where({ ID: uuid });
      if (isDocumentPresent.length == 0) {
        throw new Error(`Document with uuid:  ${uuid} not yet persisted in database!`)
      }

      // Load pdf from HANA and create a temp pdf doc
      const stream = await db.stream(SELECT('content').from(Files, uuid));
      // const stream = await db.run(SELECT('content').from(Files).where({ ID: uuid }));
      // //const stream = await db.stream(SELECT('content').from(Files).where({ ID: uuid }));
      const fileName = await (SELECT('fileName').from(Files).where({ ID: uuid }));
      const fileNameString = fileName[0].fileName;
      const tempDocLocation = __dirname + `/${fileName[0].fileName}`;
      console.log("***********************************************************************************************\n");
      console.log(`Received the request to split the document ${fileNameString} and store it into SAP HANA Cloud!\n`);
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const pdfBytes = [];

      // Read PDF content and store it in pdfBytes array
      stream.on('data', (chunk) => {
        pdfBytes.push(chunk);
      });

      // Wait for the stream to finish
      await new Promise((resolve, reject) => {
        stream.on('end', () => {
          resolve();
        });
      });

      // Convert pdfBytes array to a single Buffer
      const pdfBuffer = Buffer.concat(pdfBytes);

      // Load PDF data into a document
      const externalPdfDoc = await PDFDocument.load(pdfBuffer);

      // Copy pages from external PDF document to the new document
      const pages = await pdfDoc.copyPages(externalPdfDoc, externalPdfDoc.getPageIndices());
      pages.forEach((page) => {
        pdfDoc.addPage(page);
      });

      // Save the PDF document to a new file
      const pdfData = await pdfDoc.save();
      await fs.writeFileSync(tempDocLocation, pdfData);

      console.log('Temporary PDF File restored and saved to:', tempDocLocation);

      // Delete existing embeddings 
      await DELETE.from(DocumentChunk);

      // Load the document to langchain text loader
      loader = new PDFLoader(tempDocLocation);
      const document = await loader.load();

      // Split the document into chunks
      console.log("Splitting the document into text chunks.");
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1500,
        chunkOverlap: 150,
        addStartIndex: true
      });

      const textChunks = await splitter.splitDocuments(document);
      console.log(`Documents split into ${textChunks.length} chunks.`);

      console.log("Leveraging the CAP LLM plugin to generate the vector embeddings for the text chunks.\n");
      // For each text chunk generate the embeddings
      for (const chunk of textChunks) {
        const embeddingModelConfig = cds.env.requires["gen-ai-hub"][embeddingModelName];
        const embeddingResult = await capllmplugin.getEmbeddingWithConfig(embeddingModelConfig, chunk.pageContent);
        let embedding = null;
        //using Azure OpenAI's text-embedding-ada-002 model.
        
        if (embeddingModelName === "text-embedding-ada-002"){
           embedding =  embeddingResult?.data[0]?.embedding;
        }
        //Parse the responses of other embedding models supported by the CAP LLM Plugin
        else{
          throw new Error(`Embedding model ${embeddingModelName} not supported!\n`)
        }
        const entry = {
          "text_chunk": chunk.pageContent,
          "metadata_column": fileName,
          "embedding": array2VectorBuffer(embedding)
        };
        textChunkEntries.push(entry);
      }

      console.log("Inserting text chunks with embeddings into SAP HANA Cloud's vector engine!\n");
      // Insert the text chunk with embeddings into db
      const insertStatus = await INSERT.into(DocumentChunk).entries(textChunkEntries);
      if (!insertStatus) {
        throw new Error("Insertion of text chunks into db failed!");
      }
      console.log(`RAG content generation for the document ${fileNameString} completed!\n`);
      // Delete temp document
      deleteIfExists(tempDocLocation);

    }
    catch (error) {
      // Handle any errors that occur during the execution
      console.log('Error while generating and storing vector embeddings:', error);
      throw error;
    }
    return "Embeddings stored successfully!";

  })


  this.on('deleteEmbeddings', async () => {
    try {
      // Delete any previous records in the table
      const { DocumentChunk } = this.entities;
      await DELETE.from(DocumentChunk);
      return "Success!"
    }
    catch (error) {
      // Handle any errors that occur during the execution
      console.log('Error while deleting the embeddings content in db:', error);
      throw error;
    }
  })


}