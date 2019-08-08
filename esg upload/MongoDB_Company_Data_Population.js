const query_support = require("./query_support.js");
const MongoClient = require('mongodb').MongoClient;

/*
  This program populates a MongoDB database with information about companies by processing local files
  to generate objects that additional information is appended to via requests to wikirates for that
  company's aliases as well as its Greenscore.

  Due to the number of queries performed and the existence of timeouts for their failure, this program
  will take around five minutes to complete. It uploads ~4000 documents to the specified database, and
  writes to the console to alert the user of its progress.

  tldr; takes 5 minutes to complete. (287.686 seconds in my test case)

  In order of Behavior:
   - Read local Files
     - Master List to generate all unique objects immediately
     - 4 Files that have additional information which is appended to the previously generated company objects
  - Query Wikirates for the Aliases associated to each company
    - Will sometimes miss due to the name not being correct, can't do much about that. Many will hit, though.
  - Query Wikirates for the Greenscore values associated to each company
    - Again, will sometimes miss but previously obtained data from the 4 Files gives us some context.
  - Connect to MongoDB Database, retrieve Collection, and insert all Company objects as Documents to it

  Further Work:
    - Decide if we want to filter the produced company list by those which have wikirates pages; this could
    potentially help remove duplicate company objects that have one another as aliases, or simply remove
    companies that we don't have much information on.

  Written by Ada Clevinger for the project Greenmap
*/

var files = ["Company-Master-List.txt", "Corporate-Knight-Clean.txt", "Newsweek-500-Clean.txt", "Newsweek-500-2-Clean.txt", "Yearbook-Robecosam-Clean.txt"];

var alias_url = "https://wikirate.org/"
var greenscore_url = "https://wikirate.org/Newsweek+Newsweek_Green_Score+"

var companies = []      //Holds company objects as information is added on to them
var promises = []       //Holds promises for Promise.all([]), gets re-used and reset for different promises along the way

var i;

for(i = 0; i < files.length; i++){    //Make file reading promises
  promises.push(query_support.get_file_data("esg upload/"  + files[i], false));   //Calls function from query_support module to get promises
}

Promise.all(promises.map(p => p.catch(() => undefined))).then(function(values){  //Read files, make company objects from them
  console.log("Reading Files")
  for(i = 0; i < values.length; i++){
    console.log("Reading File: " + i)
    var ls = values[i]                        //Represents list of data from the file, each entry being one line
    var j;
    for(j = 0; j < ls.length; j++){
      var name = ls[j];
      switch(i){                                  //Different conventions in the files place the name on separate line than default ls[j]
        case 2:
        case 3:
          name = ls[j+1];
          break;
        default:
          break;
      }
      if(name == '' || name == undefined){        //Sometimes something weird happens, just ignore and move on
        continue;
      }
      switch(i){                          //Based on which file we're looking at, we do different things (usually what data to pull)
        case 0:                           //Master List, make all of our base company objects
          var next = {company: name,
                    alias: [name],
                    category: [],
                    greenscore: "?",
                    dow: "?",
                    sustainable: "?"};
          companies[name] = next;
          break;
        case 1:                           //Corporate Knight, get sustainability score and a category type
          companies[name].category.push(ls[j+2]);
          companies[name].sustainable = ls[j+3];
          j += 3;                         //This and the following file formats are grouped in sets of 4, so iterate
          break;
        case 2:                           //Newsweek, get a category type
          companies[name].category.push(ls[j+2]);
          j += 3;
          break;
        case 3:
          name = ls[j+1]                  //Newsweek, get a category type
          companies[name].category.push(ls[j+2]);
          j += 3;
          break;
        case 4:                           //Yearbook Robecosam, get dow jones score and a category type
          companies[name].category.push(ls[j+1]);
          companies[name].dow = ls[j+3]
          j += 3;
          break;
      }
    }
  }
  promises = []
  num_companies = 100; //Object.keys(companies).length;
  console.log("Generating Promises: Alias URL")
  for(i = 0; i < num_companies; i++){      //Make alias promises
    promises.push(query_support.get_url_company(alias_url, Object.keys(companies)[i]));  //Module method to get generic .json from url query
  }

  Promise.all(promises.map(p => p.catch(() => undefined))).then(function(values){  //Query wikirates for company aliases
    console.log("Processing Results of Promises: Alias URL")
    for(i = 0; i < values.length; i++){
      if(values[i] != null){
        try{
          if(values[i].body.hasOwnProperty("aliases")){             //Avoids most errors, awkward and annoying to check each one but eh
            if(values[i].body.aliases.hasOwnProperty("content")){
              for(j = 0; j < values[i].body.aliases.content.length; j++){
                companies[values[i].company].alias.push(values[i].body.aliases.content[j]);    //Append aliases to company object
              }
            }
          }
        }
        catch(err){
          console.log(err);
        }
      }
    }
    promises = []
    console.log("Generating Promises: Greenscore URL")
    for(i = 0; i < num_companies; i++){    //Make greenscore promises
      promises.push(query_support.get_url_company(greenscore_url, Object.keys(companies)[i], true)); //Module method, get generic .json from a different url
    }

    Promise.all(promises.map(p => p.catch(() => undefined))).then(function(values){    //Query wikirates for company greenscores
      console.log("Processing Results of Promises: Greenscore URL")
      for(i = 0; i < values.length; i++){
        if(values[i] != null){
          try{
            if(values[i].body.hasOwnProperty("items")){
              if(values[i].body.items.length > 0){
                companies[values[i].company].greenscore = values[i].body.items[0].value;   //Set the greenscore value we found from the url
              }
            }
          }
          catch(err){
            console.log(err);
          }
        }
      }

      

      const username = "patsy";                                 //Relevant information to access our MongoDB collection
      const password = "patsy";                                 //Change this information for uploading to a different database
      const context = "greenmap";
      const database_name = "sample_test";
      const url = "mongodb+srv://" + username + ":" + password + "@" + context + "-crohe.gcp.mongodb.net/test?retryWrites=true"
      const collection_name = 'esg3';

      MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){    //Establish connection to the database
        console.log("MongoDB Client Open")
        const db = client.db(database_name);                                      //Get the Database
        const collection = db.collection(collection_name);                        //Get the collection we want to insert to

        promises = []
        console.log("Generating Promises: MongoDB Insert")
        for(i = 0; i < num_companies; i++){                       //Generate promises for inserting to our collection using the query_support module
          promises.push(query_support.mongo_collection_insert_one(collection, companies[Object.keys(companies)[i]], false));
        }

        Promise.all(promises.map(p => p.catch(() => undefined))).then(function(values){            //After all promises resolved, close MongoDB connection and end
          console.log("Processing Results of Promises: MongoDB Insert")
          client.close();
          console.log("MongoDB Client Closed")
        });
      });
    });
  });
});
