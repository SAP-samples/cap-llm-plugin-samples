using { Currency, managed, sap } from '@sap/cds/common';
namespace sap.cap;


@anonymize : `ALGORITHM 'K-ANONYMITY' PARAMETERS '{"k" : 2, "recoding":"multi_dimensional_relaxed", "data_change_strategy": "static"}'`
entity Employee {
  key id : Integer @anonymize : `{"is_sequence": true}`;
  name : String ;
  region : String  @anonymize: `{"is_quasi_identifier" : true,  "hierarchy": {"embedded" : [["APJ"],["EMEA"],["NA"]]}}`;
  tlevel : String  @anonymize :`{"is_quasi_identifier" : true,  "hierarchy": {"embedded" : [["T1","T1-T2"],["T2","T1-T2"],["T3","T2-T3"]]}}`;
  gender : String @anonymize : `{"is_quasi_identifier" : true, "hierarchy": {"embedded" : [["Female"],["Male"]]}}`;
  age: String @anonymize : `{"is_quasi_identifier" : true, "hierarchy": {"embedded" : [["27", "15"], ["42", "45"], ["50", "45"], ["12", "15"]]}}`;
  ssn : String  ;
  personalizedEmail : String;
} 
