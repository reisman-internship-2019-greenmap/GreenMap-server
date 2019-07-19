const assert = require('assert');
const request = require('request');

module.exports = {
  get_url_json : function(front_url, company){
    var company_url = company.replace(/ /g, "%20")
    return new Promise(function(resolve, reject){
      request(front_url + company_url + ".json", function(err, response, body){
        try{
          resolve(JSON.parse(body));           //JSON parse the result, if not in json format we try again forever (need better way, probably)
        }
        catch(err){
          reject(null);
        }
      });
    });
  },

}
