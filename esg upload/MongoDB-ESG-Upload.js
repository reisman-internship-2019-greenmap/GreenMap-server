const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const request = require('request');
const fs = require('fs');

//Note: Usually doesn't halt, some company names just don't go through apparently.

//For making additional url requests, check PROMISE 3 for how the greenscore is grabbed. (In copying format)

var files = ["Corporate-Knight-Clean.txt", "Newsweek-500-Clean.txt", "Newsweek-500-2-Clean.txt", "Yearbook-Robecosam-Clean.txt", "Company-Master-List.txt"];

var companies = {}; //List of company objects that gets generated from the provided files.

var promise_ugh = new Promise(function(resolve, reject){  //So the first step is to read some files and make company objects with what data is available
  var total_file = 0;
  var h = 0;
  for(h; h < files.length; h++){
    console.log(files[h])
    var promise_file = new Promise(function(resolve, reject){   //Read a file, depending on which one it is we have a different format for reading.
      var count = h
      fs.readFile(files[count], "utf-8", (err, data) => {
        if(err){
          throw err;
        }
        data = data.split("\r\n")
        switch(count){
          case 0:                                   //Corporate Knight
            var g = 0;
            for(g = 0; g < data.length; g += 4){
              var name = data[g]
              if(name == ""){
                continue;
              }
              var type = data[g+2]
              var val = data[g+3]
              var next = {company: "",
                          alias: [],
                          category: [],
                          greenscore: "?",
                          dow: "?",
                          sustainable: "?"}
              if(companies.hasOwnProperty(name)){
                next = companies[name]
              }
              next["company"] = name
              next["category"].push(type)
              next["sustainable"] = val
              companies[name] = next
              console.log(name)
            }
            resolve();
            break;
          case 1:                                    //Newsweek 500
            var g = 0;
            for(g = 0; g < data.length; g += 4){
              var name = data[g+1]
              if(name == ""){
                continue;
              }
              var type = data[g+2]
              var next = {company: "",
                          alias: [],
                          category: [],
                          greenscore: "?",
                          dow: "?",
                          sustainable: "?"}
              if(companies.hasOwnProperty(name)){
                next = companies[name]
              }
              next["company"] = name
              next["category"].push(type)
              companies[name] = next
              console.log(name)
            }
            resolve();
            break;
          case 2:                                   //Newsweek 500 2
            var g = 0;
            for(g = 0; g < data.length; g += 4){
              var name = data[g+1]
              if(name == ""){
                continue;
              }
              var type = data[g+2]
              var next = {company: "",
                          alias: [],
                          category: [],
                          greenscore: "?",
                          dow: "?",
                          sustainable: "?"}
              if(companies.hasOwnProperty(name)){
                next = companies[name]
              }
              next["company"] = name
              next["category"].push(type)
              companies[name] = next
              console.log(name)
            }
            resolve();
            break;
          case 3:                                       //Yearbook Robecosam
            var g = 0;
            for(g = 0; g < data.length; g += 4){
              var name = data[g]
              if(name == ""){
                continue;
              }
              var type = data[g+1]
              var dow = data[g+3]
              var next = {company: "",
                          alias: [],
                          category: [],
                          greenscore: "?",
                          dow: "?",
                          sustainable: "?"}
              if(companies.hasOwnProperty(name)){
                next = companies[name]
              }
              next["company"] = name
              next["category"].push(type)
              next["dow"] = dow
              companies[name] = next
              console.log(name)
            }
            resolve();
            break;
        }
      });
    });

    promise_file.then(function(){     //After a file is read, iterate so we don't end too soon
      total_file++
      if(total_file == files.length){
        resolve()                 //After all four, then we're good to continue.
      }
    }).catch(function(){
      total_file++
    });
  }
});

promise_ugh.then(function(){        //Now for the network requests
  //This is for connecting to the MongoDB so we can insert documents
  const username = "patsy";
  const password = "patsy";
  const context = "greenmap";
  const dbName = "sample_test";
  const url = "mongodb+srv://" + username + ":" + password + "@" + context + "-crohe.gcp.mongodb.net/test?retryWrites=true"
  const collectionName = 'esg';

  //The files we read and base url for websites we query
  var file1 = "Company-Master-List.txt"
  var wikirate_url = "https://wikirate.org/"
  var greenscore_url = "https://wikirate.org/Newsweek+Newsweek_Green_Score+"

  var total_comp = 0;   //Some values to keep track of progress
  var processed = 0;
  var active = 0;

  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){    //Establish connection to the database
    assert.equal(null, err);
    console.log("Connected Succesfully");

    const db = client.db(dbName);
    const collection = db.collection(collectionName)          //Nab the collection for insertion

    var in_loop = function(collection, company, entry){       //For every single entry in the Company Master List file, we do this function

      //PROMISE 1

      var promise = new Promise(function(resolve, reject) {       //First promise is a query with wikirate for the alias/category information
        var company_url = company.replace(/ /g, "%20")
        request(wikirate_url + company_url + ".json", function(err, response, body){
          if(entry == undefined){                             //If no entry from the initial file processing, make a new one
            entry =  {company: "",
                        alias: [],
                        category: [],
                        greenscore: "?",
                        dow: "?",
                        sustainable: "?"}
            entry["company"] = company
            entry["alias"].push(company)
          }
          console.log("\nTerm: " + entry["company"]);
          try{
            var json = JSON.parse(body)           //JSON parse the result, if not in json format we try again forever (need better way, probably)
          }
          catch(err){
            return in_loop(collection, company_url, entry);
          }
          active++;             //Iterate until it has been inserted, then decrement (so we know how many are active)
          processed++           //Iterate so we know how many we've dealt with so far
          if(json.hasOwnProperty("aliases")){     //If the wikirates page has an alias category, include it in the entry
            if(json.aliases.hasOwnProperty("content")){
              entry["alias"] = json.aliases.content
            }
          }
          resolve(entry)
        });
      });

      console.log("Start")

      promise.then(function(entry_one){     //After PROMISE 1
        //console.log("First")
        entry_one["alias"].push(entry_one["company"])   //Make sure it is its own alias
        //console.log(entry_one["alias"])

        //PROMISE 2

        var promise_half = new Promise(function(resolve, reject){   //Greenscore request, for each alias entry for that company
          var com_url = ""

          var fail = 0                                            //Keep track of how many aliases we've tried to know when the promise is failed

          top:
          for(var j = 0; j < entry_one["alias"].length; j++){       //Specifically, we try each name in the alias list for a greenscore value to be safe
            com_url = entry_one["alias"][j].replace(/ /g, "%20")
            //console.log(greenscore_url + com_url + ".json")

            //PROMISE 3

            var promise_loop = new Promise(function(resolve, reject){   //Makes the specific request of that company's alias
              var in_line = com_url
              request(greenscore_url + com_url + ".json", function(err, response, body){
                if(err != null){
                  j--;
                  fail--;
                  reject()
                }
                //console.log(greenscore_url + in_line)
                //console.log(body)
                try{
                  var json = JSON.parse(body)
                  if(json.hasOwnProperty("items")){               //There can be many entries in 'items', the most recent greenscore is desired and consistently is at position 0
                    if(json.items.length > 0){
                      if(json.items[0].hasOwnProperty("value")){
                        //console.log("Success:" + json.name)
                        resolve(json.items[0].value)
                      }
                    }
                  }
                }
              catch(err){                         //If it messed up, return '?' as a stand-in
                resolve("?")
              }
                resolve("?")
              });
            });

            promise_loop.then(function(val){    //After PROMISE 3
              //console.log(val)
              entry_one["greenscore"] = val     //Assign the returned value
              resolve(entry_one)                //Resolve on PROMISE 2
            }).catch(function(){                //If rejected, increment fail and if all failed then just use '?'
              fail++
              if(fail == entry_one["alias"].length){
                entry_one["greenscore"] = "?"
                resolve(entry_one)
              }
            });
          }
        });

        promise_half.then(function(entry_two){  //After PROMISE 2
          //console.log("Second")

          //PROMISE 4

          var promise_two = new Promise(function(resolve, reject){  //Here we insert the company object as a document to the MongoDB
            collection.insertOne(entry_two, function(err, result){
              assert.equal(err, null);
              if(err != null){
                reject();
              }
              console.log(active + ": Inserted document " + entry_two["company"] + " to collection " + collectionName + ".");
              active--;
              resolve()
            });
          });

          promise_two.then(function(){  //After PROMISE 4
            //console.log("Third")
            if(active == 0 && processed == total_comp){
              client.close();
              console.log("Client Closed");
            }
          }).catch(function(){
            console.log("Fail?")
          });
        }).catch(function(){
          console.log("Failed on " + entry_one["company"])    //Ignore these catches, basically can't fail cause we can at least submit the name.
          active--;
          if(active == 0 && processed == total_comp){
            client.close();
            console.log("Client Closed");
          }
        })
      }).catch(function(){
        console.log("Failed on " + entry["company"])
        active--;
        if(active == 0 && processed == total_comp){
          client.close();
          console.log("Client Closed");
        }
      });
    }

    //WARNING: THIS DELETES THE COLLECTION FOR TESTING PURPOSES, PROBABLY WANT TO REMOVE IN REAL USAGE

    collection.deleteMany({}, function(err, result){
      assert.equal(err, null)
      console.log("Deletion Complete")
      var used = {}                       //Keep track of which companies we've processed so far to avoid duplicates (so many entries in files, gotta filter)


      fs.readFile(file1, 'utf-8', (err, data) => {    //Read the master file
        if(err){
          throw err;
        }
        data = data.split("\r\n")       //Make a list of each company name
        var i = 0;
        total_comp = data.length
        for(i; i < total_comp; i++){    //For each name in the list, call in_loop() to eventually insert a new document.
          company = data[i];
          if(company == "" || used.hasOwnProperty(company)){    //Skip if already done.
            continue;
          }
          used[company] = true
          company_url = company.replace(/ /g, "%20")

          in_loop(collection, company, companies[company])

        }
        //client.close();
      });
  })
  //Important note is that this is asynchronous, so the Client Closed message may appear before previous tasks complete.
  });

}).catch(function(){

})
