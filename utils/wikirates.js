const rp = require('request-promise');

module.exports = {
  greenScoreLookup: ({manufacturer: manufacturer}) => {
    manufacturer = manufacturer.replace(/ /g, "%20");
    let esg = [];
    let wikirateRequestOptions = {
      url : "https://wikirate.org/" + manufacturer,
      // method: 'GET',
      headers: {
        'content-type': 'application/json'
      },
      json: true

    }

    rp(wikirateRequestOptions)
    .then((response) => {
      if('aliases' in response) {
        aliases = response.aliases.content;
        if(!(manufacturer in aliases)) {
          aliases.push(manufacturer);
        }
        for (let i = 0; i < aliases.length; i++) {
          alias = aliases[i].replace(/ /g, "%20");
          if(alias.charAt(alias.length - 1) == ".") {
            alias = alias.substring(0, alias.length - 1);
          } 
          let greenscoreRequestOptions = {
            url: "https://wikirate.org/Newsweek+Newsweek_Green_Score+" + alias,
            headers: {
              'content-type': 'application/json'
            },
            json: true
          }

          rp(greenscoreRequestOptions)
            .then((response) => {
              if('items' in response) {
                if('value' in response.items[0]) {
                  esg.push(response.items[0].value);
                }
              }
            })
            .catch((error) => {
            })
          console.log(esg);
        }
      } else {
        // Do green score query on the manufacturer
          alias = manufacturer;
          if(alias.charAt(alias.length - 1) == ".") {
            alias = alias.substring(0, alias.length - 1);
          } 
          let greenscoreRequestOptions = {
            url: "https://wikirate.org/Newsweek+Newsweek_Green_Score+" + alias,
            headers: {
              'content-type': 'application/json'
            },
            json: true
          }

          rp(greenscoreRequestOptions)
            .then((response) => {
              if('items' in response) {
                if('value' in response.items[0]) {
                  return resizeBy.items[0];
                }
              }
            })
            .catch((error) => {
              console.log("Error finding response from wikirates");
              return null;
            })        
        }
    }).catch((error) => {
      console.log("Error finding response from wikirates");
      return null;
    })
  }
}