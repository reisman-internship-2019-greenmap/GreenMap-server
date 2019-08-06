const wdk = require('wikidata-sdk');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

//P452 for industry
//P1056 for products

var products = [
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
  "software"
]

var SPARQL = `
  SELECT ?superclassLabel
  WHERE
  {
    {
      ?product ?label \"` + "mouse" + `\"@en.
      ?prod ?code ?product.
      ?superclass wdt:P1056 ?prod.
      SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
    }
  }
  group by ?superclassLabel`

var xmlHttp = new XMLHttpRequest();
var url2 = wdk.sparqlQuery(SPARQL);   //Generate the URL from an explicit SPARQL query
xmlHttp.open("GET", url2, false);     //Send the http request
xmlHttp.send(null);
console.log(url2);                    //Print the URL and results, both simplified and not.
console.log(xmlHttp.responseText);
console.log(wdk.simplify.sparqlResults(xmlHttp.responseText));
console.log(' ');
