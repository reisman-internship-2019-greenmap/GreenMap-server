const query_support = require("./query_support.js");

var url = ["https://wikirate.org/", "https://wikirate.org/Newsweek+Newsweek_Green_Score+"]
var li = ["Apple Inc", "Shire"]
var ou = []

var i, j;
for(i = 0; i < li.length; i++){
  for(j = 0; j < url.length; j++){
    ou.push(query_support.get_url_json(url[j], li[i]));
  }
}

Promise.all(ou).then(function(values){
  var j;
  for(j = 0; j < values.length; j++){
    switch(j % url.length){
      case 0: console.log(values[j].aliases.content); break;
      case 1: console.log(values[j].items[0].value); break;
    }
  }
})
