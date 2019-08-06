const wdk = require('wikidata-sdk');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const query_support = require("./query_support.js");
const MongoClient = require('mongodb').MongoClient;

/*
  This program performs a number of SPARQL queries, specifically finding companies for whom the list of
  products is either an Industry or Manufactured Product associated to it on Wikidata.

  Using that generated paired list of {Company_Name : [Products,...]}, we then retrieve the document in our
  MongoDB database and specifically take its 'category' field (an array). We append the data we retrieved from
  our SPARQL query relating to that company to the 'category' object we took, and then update that same document
  in the MongoDB with the new 'category' object.

*/

//SPARQL code values for making the query
//P452 for industry
//P1056 for products

//List of product types to use as entries for company categories. Add to it! Don't even have to avoid duplicates, it gets handled below.
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

var xmlHttp = new XMLHttpRequest(); //Open up xmlHttp
var collec = {};                    //Collection of {company : [category,...] } pairings
console.log("Making SPARQL Queries");
var i;
for(i = 0; i < products.length; i++){     //So first we make the SPARQL queries and populate the collec object
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
    var j;
    for(j = 0; j < out.length; j++){            //For all companies matching the SPARQL query:
      if(collec[out[j].companyLabel] == null){  //If it's not in collec, add it
        collec[out[j].companyLabel] = [];
      }                                         //If the category is not already present, then add it
      if(collec[out[j].companyLabel].indexOf(products[i]) == -1){
        collec[out[j].companyLabel].push(products[i]);
      }
    }
}
console.log("Completed SPARQL Queries");

const username = "patsy";                                 //Relevant information to access our MongoDB collection
const password = "patsy";                                 //Change this information for uploading to a different database
const context = "greenmap";
const database_name = "sample_test";
const url = "mongodb+srv://" + username + ":" + password + "@" + context + "-crohe.gcp.mongodb.net/test?retryWrites=true"
const collection_name = 'esg';

//Nomenclature for searching by a term existing in an array: {"alias" : { $all: ["HP"] } }

MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){    //Establish connection to the database
  console.log("MongoDB Client Open")
  const db = client.db(database_name);                                      //Get the Database
  const collection = db.collection(collection_name);                        //Get the collection we want to insert to

  promises = []
  console.log("Generating Promises: MongoDB Retrieve")    //Populate an array of promises so that program continues after the asynchronous processes finish
  for(i = 0; i < Object.keys(collec).length; i++){                       //Generate promises for retrieving a document from the collection
    var id = Object.keys(collec)[i];
    promises.push(query_support.mongo_collection_retrieve(collection, "alias", { $all: [id]}, false));
  }

  Promise.all(promises.map(p => p.catch(() => undefined))).then(function(values){            //After all promises resolved, close MongoDB connection and end
    promises = [];
    console.log("Processing Results of MongoDB Retrieve - Generating Promises: MongoDB Update");
    for(i = 0; i < values.length; i++){                         //For each generated value from the Promises (each index is one promise)
      var val = values[i];
      if(val != null && val != undefined && val.length > 0){    //If we actually got anything back from doing our prior retrieval, do a thing.
        val = val[0];
        var category = val.category;                  //Get the category field so we can update it and later throw it back in the collection
        var j;
        for(j = 0; j < val.alias.length; j++){        //For each alias from the document we grabbed, search collec for it to get the categories
          if(collec[val.alias[j]] != undefined && collec[val.alias[j]] != null && collec[val.alias[j]].length > 0){
            var k;
            for(k = 0; k < collec[val.alias[j]].length; k++){   //For each category type associated to the company, add it to the category list we took from the collection
              if(category.indexOf(collec[val.alias[j]][k]) == -1){    //Avoid duplicates
                category.push(collec[val.alias[j]][k]);
              }
            }
            continue;       //Once we get a hit, skip ahead
          }
        }
        console.log(val.company);
        console.log(category);          //We now generate the promises for updating the category field of the associated company
        promises.push(query_support.mongo_collection_update_one(collection, "alias", {$all:[val.company]}, "category", category, false));
      }
    }
    Promise.all(promises.map(p => p.catch(() => undefined))).then(function(values){ //We don't do anything afterwards besides closing the connection
      console.log("Processing Results of MongoDB Update");
      client.close();
      console.log("MongoDB Client Closed")
    });
  });
});
