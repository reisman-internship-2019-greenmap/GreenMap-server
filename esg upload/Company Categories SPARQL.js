const wdk = require('wikidata-sdk');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const query_support = require("./query_support.js");
const MongoClient = require('mongodb').MongoClient;

//P452 for industry
//P1056 for products

var products = [
  "computer hardware",
  "information technology",
  "electronics",
  "home appliance",
  "shipbuilding",
  "aviation industry",
  "finance",
  "chemistry",
  "entertainment",
  "mobile phone",
  "computing",
  "computer keyboard",
  "mouse",
  "trackball",
  "microphone",
  "game controller",
  "webcam",
  "computer speaker",
  "MP3 player",
  "mobile phone",
  "software",
  "auto parts",
  "automotive industry",
  "mass media",
  "photo industry",
  "information technology",
  "networking hardware",
  "consumer electronics",
  "multimedia",
  "video games",
  "films",
  "tv shows",
  "music",
  "telecommunications equipment",
  "semiconductors",
  "desktops",
  "laptops",
  "netbooks",
  "graphics cards",
]

var xmlHttp = new XMLHttpRequest();
var collec = {};
console.log("Making SPARQL Queries");
var i;
for(i = 0; i < products.length; i++){
  var SPARQL = `
    SELECT DISTINCT ?companyLabel
    WHERE
    {
      {
        ?product ?label \"` + products[i] + `\"@en.
        ?prod ?code ?product.
        ?company wdt:P1056|wdt:P452 ?prod.
        SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
      }
    }`

    var url2 = wdk.sparqlQuery(SPARQL);   //Generate the URL from an explicit SPARQL query
    xmlHttp.open("GET", url2, false);     //Send the http request
    xmlHttp.send(null);
    var out = wdk.simplify.sparqlResults(xmlHttp.responseText);
    collec[products[i]] = [];
    var j;
    for(j = 0; j < out.length; j++){
      if(collec[out[j].companyLabel] == null){
        collec[out[j].companyLabel] = [];
      }
      if(collec[out[j].companyLabel].indexOf(products[i]) == -1){
        collec[out[j].companyLabel].push(products[i]);
      }
    }
}
console.log("Completed SPARQL Queries");

const username = "dummy";                                 //Relevant information to access our MongoDB collection
const password = "dummy";                                 //Change this information for uploading to a different database
const context = "dummy";
const database_name = "sample_test";
const url = "mongodb+srv://" + username + ":" + password + "@" + context + "-crohe.gcp.mongodb.net/test?retryWrites=true"
const collection_name = 'esg';

//{"alias" : { $all: ["HP"] } }

MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){    //Establish connection to the database
  console.log("MongoDB Client Open")
  const db = client.db(database_name);                                      //Get the Database
  const collection = db.collection(collection_name);                        //Get the collection we want to insert to

  promises = []
  console.log("Generating Promises: MongoDB Retrieve")
  for(i = 0; i < Object.keys(collec).length; i++){                       //Generate promises for inserting to our collection using the query_support module
    var id = Object.keys(collec)[i];
    promises.push(query_support.mongo_collection_retrieve(collection, "alias", { $all: [id]}, false));
  }

  Promise.all(promises.map(p => p.catch(() => undefined))).then(function(values){            //After all promises resolved, close MongoDB connection and end
    promises = [];
    console.log("Processing Results of MongoDB Retrieve - Generating Promises: MongoDB Update");
    for(i = 0; i < values.length; i++){
      var val = values[i];
      if(val != null && val != undefined && val.length > 0){
        val = val[0];
        var category = val.category;
        var j;
        for(j = 0; j < val.alias.length; j++){
          if(collec[val.alias[j]] != undefined && collec[val.alias[j]] != null && collec[val.alias[j]].length > 0){
            var k;
            for(k = 0; k < collec[val.alias[j]].length; k++){
              if(category.indexOf(collec[val.alias[j]][k]) == -1){
                category.push(collec[val.alias[j]][k]);
              }
            }
            continue;
          }
        }
        console.log(val.company);
        console.log(category);
        promises.push(query_support.mongo_collection_update_one(collection, "alias", {$all:[val.company]}, "category", category, false));
      }
    }
    Promise.all(promises.map(p => p.catch(() => undefined))).then(function(values){
      console.log("Processing Results of MongoDB Update");
      client.close();
      console.log("MongoDB Client Closed")
    });
  });
});
