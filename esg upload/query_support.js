const assert = require('assert');
const request = require('request');
const fs = require("fs")

module.exports = {
  get_url_json : function(front_url, company){
    var company_url = company.replace(/ /g, "%20")
    return new Promise(function(resolve, reject){
      request(front_url + company_url + ".json", function(err, response, body){
        try{
          resolve({company: company, body: JSON.parse(body)});           //JSON parse the result, if not in json format we try again forever (need better way, probably)
        }
        catch(err){
          reject(null);
        }
      });
    });
  },

  get_file_data : function(file_path){
    return new Promise(function(resolve, reject){   //Read a file, depending on which one it is we have a different format for reading.
      fs.readFile(file_path, "utf-8", (err, data) => {
        data = data.split("\r\n")
        resolve(data);
      });
    });
  },

  mongo_collection_insert : function(collection, doc, verbose){
    return new Promise(function(resolve, reject){
      collection.insertOne(doc, function(err, result){
        if(verbose){
          console.log("Inserted: " + doc[i])
        }
        resolve();
      });
    });
  }
}
