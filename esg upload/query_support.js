const assert = require('assert');
const request = require('request');
const fs = require("fs")

/*
  This module provides several methods that support programs interacting with asynchronous behavior, such
  as file reading and url queries. Primarily, these methods generate Promise objects that can be resolved
  en masse with a Promise.all([]).then... command to help keep the flow of logic tidy when having to make
  many asynchronous requests for many distinct entities (such as ~4000 companies).

  Included currently are:
    - get_url_company: Function to get .json of a url ending in a provided company name
    - get_url_json: Function to get .json of any provided url
    - get_file_data: Function to get data out of a file, broken up by a .split("\r\n") into an array
    - mongo_collection_insert: Function to insert a provided document into a similarly provided MongoDB collection
*/

module.exports = {

  /*
    This function takes a generic url and a specific company title to retrieve the .json from the
    specified site; makes assumptions about its usage such that it is going to append the provided
    company to the given url after substituting any ' ' in the company for '%20', and returns an
    object with the company's name as a field and the resulting .json its body.

    Parameters:
      - front_url: url of a website to retrieve specified data from
      - company: name of a company to specify the retrieval of via the front_url
    Returns:
      - A Promise object that Resolves with:
        - Object of the following form:
          - {company: [the provided company name],
             body: [the retrieved .json object]}
         OR:
        - null if an error occurs
  */

  get_url_company : function(front_url, company){
    var company_url = company.replace(/ /g, "%20")      //urls don't like spaces, use %20 instead
    return new Promise(function(resolve, reject){       //Wrap a request in a promise so we can properly interact with it and await its completion
      request(front_url + company_url + ".json", function(err, response, body){
        try{
          resolve({company: company, body: JSON.parse(body)});           //JSON parse the result, if not in json format we try again forever (need better way, probably)
        }
        catch(err){
          resolve(null);
        }
      });
    });
  },

  /*
  This function takes any provided url, ensures that it ends in ".json", and then
  makes a request to retrieve the .json object that the url leads to. This is a
  very generic format that relies on the provided url to be accurate, unlike
  get_url_company which does some processing and formatting of its parameters.

  Parameters:
    - url: String representing a url to query to retireve a .json object
    - verbose: Boolean value denoting whether or not to print information to the console that is relevant;
    in this case being error messages.

  Returns:
    - A Promise object that Resolves with:
      - .json object retrieved from the url
      OR:
      - null in the case of an error

  */

  get_url_json: function(url, verbose){
    return new Promise(function(resolve, reject){
      if(!url.match(".*\.json")){
        url = url + ".json"
      }
      request(url, function(err, response, body){
        try{
          resolve(JSON.parse(body));
        }
        catch(err){
          if(verbose){
            console.log(url);
            console.log(err);
          }
          resolve(null);
        }
      });
    });

  },

  /*
    This function accesses a file denoted by the provided file_path and returns an array
    containing that file's contents, each entry in the array being a line from the file
    split using "\r\n".

    Parameters:
      - file_path: a string representing a file location on the computer running this function

    Returns:
      - A Promise object that Resolves with:
        - data: an array containing the contents of the specified file, split using "\r\n".

  */

  get_file_data : function(file_path){
    return new Promise(function(resolve, reject){   //Read a file, depending on which one it is we have a different format for reading.
      fs.readFile(file_path, "utf-8", (err, data) => {
        if(err != null){
          resolve([]);
        }
        data = data.split("\r\n")
        resolve(data);
      });
    });
  },

  /*
    This function uses a provided MongoDB collection and document to insert the document into
    that collection (basically putting a javascript object into MongoDB storage). If desired,
    can print to the console each file that is inserted along with what was inserted, useful
    for debugging.

    Parameters:
      - collection: A MongoDB Collection that we are inserting a document into
      - doc: Some object that is being inserted into the MongoDB Collection provided
      - verbose: A Boolean value specifying whether information is printed to the terminal or not.

    Returns:
      - A Promise that Resolves with Nothing.


  */

  mongo_collection_insert : function(collection, doc, verbose){
    return new Promise(function(resolve, reject){
      collection.insertOne(doc, function(err, result){
        if(verbose){
          console.log("Inserted: " + doc)
        }
        resolve();
      });
    });
  }
}
