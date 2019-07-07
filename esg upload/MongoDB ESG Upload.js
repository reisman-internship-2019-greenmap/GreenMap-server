const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const request = require('request');
const fs = require('fs');

//Custom values to connect to a specific MongoDB context, a database therein, and a collection in that database.


var files = ["Corporate Knight Clean.txt", "Newsweek 500 Clean.txt", "Newsweek 500 2 Clean.txt", "Yearbook Robecosam Clean.txt"];

var companies = {}; //List of company objects that gets generated from the provided files.

var promise_ugh = new Promise(function(resolve, reject){
  var total_file = 0;
  var h = 0;
  for(h; h < files.length; h++){
    console.log(files[h])
    var promise_file = new Promise(function(resolve, reject){
      var count = h
      fs.readFile(files[count], "utf-8", (err, data) => {
        if(err){
          throw err;
        }
        data = data.split("\r\n")
        switch(count){
          case 0:
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
          case 1:
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
          case 2:
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
          case 3:
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

    promise_file.then(function(){
      total_file++
      if(total_file == files.length){
        resolve()
      }
    }).catch(function(){
      total_file++
    });
  }
});

promise_ugh.then(function(){
  const username = "patsy";
  const password = "patsy";
  const context = "greenmap";
  const dbName = "sample_test";
  const url = "mongodb+srv://" + username + ":" + password + "@" + context + "-crohe.gcp.mongodb.net/test?retryWrites=true"

  var file1 = "Company Master List.txt"
  var wikirate_url = "https://wikirate.org/"
  var greenscore_url = "https://wikirate.org/Newsweek+Newsweek_Green_Score+"


  const collectionName = 'esg';

  var total_comp = 0;
  var processed = 0;
  var active = 0;

  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
    assert.equal(null, err);
    console.log("Connected Succesfully");

    const db = client.db(dbName);
    const collection = db.collection(collectionName)

    var in_loop = function(collection, company, entry){
      var promise = new Promise(function(resolve, reject) {
        var company_url = company.replace(/ /g, "%20")
        request(wikirate_url + company_url + ".json", function(err, response, body){
          if(entry == undefined){
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
            var json = JSON.parse(body)
          }
          catch(err){
            return in_loop(collection, company_url, entry);
          }
          active++;
          processed++
          if(json.hasOwnProperty("aliases")){
            if(json.aliases.hasOwnProperty("content")){
              entry["alias"] = json.aliases.content
            }
          }
          resolve(entry)
        });
      });

      console.log("Start")
      promise.then(function(entry_one){
        //console.log("First")
        entry_one["alias"].push(entry_one["company"])
        //console.log(entry_one["alias"])
        var promise_half = new Promise(function(resolve, reject){
          var com_url = ""

          var fail = 0

          top:
          for(var j = 0; j < entry_one["alias"].length; j++){
            com_url = entry_one["alias"][j].replace(/ /g, "%20")
            //console.log(greenscore_url + com_url + ".json")

            var promise_loop = new Promise(function(resolve, reject){
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
                  if(json.hasOwnProperty("items")){
                    if(json.items.length > 0){
                      if(json.items[0].hasOwnProperty("value")){
                        //console.log("Success:" + json.name)
                        resolve(json.items[0].value)
                      }
                    }
                  }
                }
              catch(err){
                resolve("?")
              }
                resolve("?")
              });
            });

            promise_loop.then(function(val){
              //console.log(val)
              entry_one["greenscore"] = val
              resolve(entry_one)
            }).catch(function(){
              fail++
              if(fail == entry_one["alias"].length){
                entry_one["greenscore"] = "?"
                resolve(entry_one)
              }
            });
          }
        });

        promise_half.then(function(entry_two){
          //console.log("Second")
          var promise_two = new Promise(function(resolve, reject){
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
          promise_two.then(function(){
            //console.log("Third")
            if(active == 0 && processed == total_comp){
              client.close();
              console.log("Client Closed");
            }
          }).catch(function(){
            console.log("Fail?")
          });
        }).catch(function(){
          console.log("Failed on " + entry_one["company"])
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

    collection.deleteMany({}, function(err, result){
      assert.equal(err, null)
      console.log("Deletion Complete")
      var used = {}


      fs.readFile(file1, 'utf-8', (err, data) => {
        if(err){
          throw err;
        }
        data = data.split("\r\n")
        var i = 0;
        total_comp = data.length
        for(i; i < total_comp; i++){
          company = data[i];
          if(company == "" || used.hasOwnProperty(company)){
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
