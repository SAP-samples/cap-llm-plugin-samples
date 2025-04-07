using {sap.tisce.demo as db} from '../db/schema';

service EmbeddingStorageService @(requires: 'authenticated-user') {

  entity DocumentChunk as
    projection on db.DocumentChunk
    excluding {
      embedding
    };

  entity Files @(restrict: [{
    grant: [
      'READ',
      'WRITE',
      'UPDATE',
      'DELETE'
    ],
    where: 'createdBy = $user'
  }])                  as projection on db.Files;

  action   storeEmbeddings(uuid : String) returns String;
  function deleteEmbeddings()             returns String;

}
