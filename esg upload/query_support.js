const assert = require('assert');
const request = require('request');
const fs = require("fs")

/*
  This module provides several methods that support programs interacting with asynchronous behavior, such
  as file reading and url queries. Primarily, these methods generate Promise objects that can be resolved
  en masse with a Promise.all([]).then... command to help keep the flow of logic tidy when having to make
  many asynchronous requests for many distinct entities (such as ~4000 companies).

  In addition, several functions that encapsulate MongoDB collection behaviors in Promises are included
  as well; these require that a collection be available to pass as an argument, but otherwise handle the
  entire interaction for insertion, deletion, and updating (to) the collection.

  Included currently are:
    - get_url_company: Function to get .json of a url ending in a provided company name
    - get_url_json: Function to get .json of any provided url
    - get_file_data: Function to get data out of a file, broken up by a .split("\r\n") into an array
    - mongo_collection_insert_one: Function to insert a provided document into a provided MongoDB collection
    - mongo_collection_insert_many: Function to insert the provided documents into a provided MongoDB collection
    - mongo_collection_wipe: Function to remove all entries from a collection. WARNING: Totally erases the contents.
    - mongo_collection_delete_one: Function to delete a document from a collection matching some cue
    - mongo_collection_delete_many: Function to delete all documents from a collection matching some cue

  TODO:
   - mongo_collection_update_one: Function to manipulate an existing document matching some cue in a MongoDB collection
   - mongo_collection_update_many: Function to manipulate all existing documents matching some cue in a MongoDB collection

   NOTE: Add functions to the TODO if you want Ada or anyone else to write them; will probably want to either talk directly
   with the person on what it should do or write a descriptive header for it (Functionality, Parameters, what it Returns).

   Written by Ada Clevinger for the project Greenmap
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
      - verbose: Boolean to denote whether or not this function should ever print to the terminal
    Returns:
      - A Promise object that Resolves with:
        - Object of the following form:
          - {company: [the provided company name],
             body: [the retrieved .json object]}
       OR:
       - A Promise that Rejects with:
        - null
  */

  get_url_company : function(front_url, company, verbose){
    var company_url = company.replace(/ /g, "%20")      //urls don't like spaces, use %20 instead
    return new Promise(function(resolve, reject){       //Wrap a request in a promise so we can properly interact with it and await its completion
      request(front_url + company_url + ".json", function(err, response, body){
        try{
          assert.equal(err, null);
          resolve({company: company, body: JSON.parse(body)});           //JSON parse the result, if not in json format we try again forever (need better way, probably)
        }
        catch(err){
          if(verbose){
            console.log("ERROR LOG - TURN OFF VERBOSE TO STOP SEEING THIS");
            console.log(front_url);
            console.log(company);
            console.log(err);
          }
          reject(null);
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
    - A Promise object that Rejects with:
      - null in the case of an error

    ***UNTESTED***
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
          reject(null);
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
      - A Promise object that Rejects with:
        - null

  */

  get_file_data : function(file_path, verbose){
    return new Promise(function(resolve, reject){   //Read a file, depending on which one it is we have a different format for reading.
      fs.readFile(file_path, "utf-8", function(err, data){
        try{
          assert.equal(err, null)
          data = data.split("\n")
          resolve(data);
        }
        catch(err){
          if(verbose){
            console.log("ERROR LOG - TURN OFF VERBOSE TO STOP SEEING THIS");
            console.log(file_path);
            console.log(err);
          }
          reject(null)
        }
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
      - A Promise that Resolves with:
        - Nothing.
      OR:
      - A Promise that Rejects with:
        - Nothing
  */

  mongo_collection_insert_one : function(collection, doc, verbose){
    return new Promise(function(resolve, reject){
      collection.insertOne(doc, function(err, result){
        try{
          assert.equal(err, null);
          if(verbose){
            console.log("Inserted: " + doc);
          }
          resolve();
        }
        catch(err){
          if(verbose){
            console.log("ERROR LOG - TURN OFF VERBOSE TO STOP SEEING THIS");
            console.log(collection);
            console.log(doc);
            console.log(err);
          }
          reject();
        }
      });
    });
  },

  /*
    This function uses a provided MongoDB collection and documents to insert those documents into
    that collection (basically putting javascript objects into MongoDB storage). If desired,
    can print to the console each file that is inserted; useful for debugging.

    Parameters:
      - collection: A MongoDB Collection that we are inserting a document into
      - docs: Some objects that are being inserted into the MongoDB Collection provided
      - verbose: A Boolean value specifying whether information is printed to the terminal or not.

    Returns:
      - A Promise that Resolves with:
        - Nothing.
      OR:
      - A Promise that Rejects with:
        - Nothing

    ***UNTESTED***
  */

  mongo_collection_insert_many : function(collection, docs, verbose){
    return new Promise(function(resolve, reject){
      collection.insertMany(docs, function(err, result){
        try{
          assert.equal(err, null);
          if(verbose){
            console.log("Inserted:");
            var i;
            for(i = 0; i < docs.length; i++){
              console.log(docs[i]);
            }
          }
          resolve();
        }
        catch(err){
          if(verbose){
            console.log("ERROR LOG - TURN OFF VERBOSE TO STOP SEEING THIS");
            console.log(collection);
            console.log(docs);
            console.log(err);
          }
          reject();
        }
      });
    });
  },

  mongo_collection_retrieve : function(collection, field, key, verbose){
    return new Promise(function(resolve, reject){
      collection.find({[field] : key}).toArray(function(err, docs){
        try{
          assert.equal(err, null);
          if(verbose){
            console.log("Document retrieved");
          }
          resolve(docs);
        }
        catch(err){
          if(verbose){
            console.log("ERROR LOG - TURN OFF VERBOSE TO STOP SEEING THIS");
            console.log(collection);
            console.log(docs);
            console.log(err);
          }
          reject();
        }
      });
    });
  },

  mongo_collection_update_one : function(collection, find_field, find_key, update_field, update_key, verbose){
    return new Promise(function(resolve, reject){
      collection.updateOne({[find_field] : find_key}, {$set: {[update_field] : update_key}}, function(err, result){
        try{
          assert.equal(err, null);
          if(verbose){
            console.log("Document updated");
          }
          resolve();
        }
        catch(err){
          if(verbose){
            console.log("ERROR LOG - TURN OFF VERBOSE TO STOP SEEING THIS");
            console.log(collection);
            console.log(docs);
            console.log(err);
          }
          reject();
        }
      });
    });
  },

  /*
    This function provides an easy method for deleting all of the contents of a MongoDB
    collection that has been provided.

    Parameters:
      - collection: A MongoDB Collection that is meant to be wiped
      - verbose: Boolean value denoting whether or not to print contextual information to the terminal

    Returns:
      - A Promise that Resolves with:
        - Nothing
      OR:
      - A Promise that Rejects with:
        - Nothing

    ***UNTESTED***
  */

  mongo_collection_wipe : function(collection, verbose){
    return new Promise(function(resolve, reject){
      collection.deleteMany({}, function(err, result){
        try{
          assert.equal(err, null);
          if(verbose){
            console.log("Deletion of: ''" + collection + "' Complete");
          }
          resolve();
        }
        catch(err){
          if(verbose){
            console.log("ERROR LOG - TURN OFF VERBOSE TO STOP SEEING THIS");
            console.log(collection);
            console.log(err);
          }
          reject()
        }
      });
    });
  },

  /*
  This function deletes a single entry from a provided MongoDB collection, using the
  provided deletion_cue to describe which entry should be removed.

  Parameters:
    - collection: A MongoDB collection object that is having an item removed from it.
    - deletion_cue: Some object used to describe what object will be removed
      - Ex.: {a: 2} would remove any document in the collection with a field 'a' that has the value '2'
    - verbose: Boolean value denoting whether or not this function should print to the console

    Returns:
      - A Promise that Resolves with:
        - Nothing
      OR:
      - A Promise that Rejects with:
        - Nothing

    ***UNTESTED***
  */

  mongo_collection_delete_one : function(collection, deletion_cue, verbose){
    return new Promise(function(resolve, reject){
      collection.deleteOne(deletion_cue, function(err, result){
        try{
          assert.equal(err, null)
          if(verbose){
            console.log("Single Deletion Complete for Collection: '" + collection + "' with Cue: '" + deletion_cue + "'.")
          }
          resolve()
        }
        catch(err){
          if(verbose){
            console.log("ERROR LOG - TURN OFF VERBOSE TO STOP SEEING THIS")
            console.log(collection);
            console.log(deletion_cue);
            console.log(err);
          }
          reject()
        }
      });
    });
  },

  /*
  This function deletes all entries from a provided MongoDB collection that match tthe
  provided deletion_cue to describe which entries should be removed.

  Parameters:
    - collection: A MongoDB collection object that is having items removed from it.
    - deletion_cue: Some object used to describe what objects will be removed
      - Ex.: {a: 2} would remove any documents in the collection with a field 'a' that has the value '2'
    - verbose: Boolean value denoting whether or not this function should print to the console

    Returns:
      - A Promise that Resolves with:
        - Nothing
      OR:
      - A Promise that Rejects with:
        - Nothing

    ***UNTESTED***
  */

  mongo_collection_delete_many : function(collection, deletion_cue, verbose){
    return new Promise(function(resolve, reject){
      collection.deleteMany(deletion_cue, function(err, result){
        try{
          assert.equal(err, null)
          if(verbose){
            console.log("Multiple Deletion Complete for Collection: '" + collection + "' with Cue: '" + deletion_cue + "'.")
          }
          resolve()
        }
        catch(err){
          if(verbose){
            console.log("ERROR LOG - TURN OFF VERBOSE TO STOP SEEING THIS")
            console.log(collection);
            console.log(deletion_cue);
            console.log(err);
          }
          reject()
        }
      });
    });
  },

}
