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
  "software",
  "auto parts",
  "automotive industry",
  "mass media",

]

var SPARQL = `
  SELECT DISTINCT ?companyLabel
  WHERE
  {
    {
      ?product ?label \"` + "mass media" + `\"@en.
      ?prod ?code ?product.
      ?company wdt:P1056|wdt:P452 ?prod.
      SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
    }
  }`

var xmlHttp = new XMLHttpRequest();
var url2 = wdk.sparqlQuery(SPARQL);   //Generate the URL from an explicit SPARQL query
xmlHttp.open("GET", url2, false);     //Send the http request
xmlHttp.send(null);
console.log(url2);                    //Print the URL and results, both simplified and not.
console.log(xmlHttp.responseText);
var out = wdk.simplify.sparqlResults(xmlHttp.responseText);
console.log(out);
var i;
for(i = 0; i < out.length; i++){
  if(out[i].companyLabel.includes("Vi")){
    console.log(out[i].companyLabel);
  }
  if(out[i].companyLabel == "Vivendi"){
    console.log("------Found------");
    console.log(out[i]);
  }
}
console.log(out.length);
