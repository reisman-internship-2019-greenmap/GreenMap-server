const rp = require('request-promise');

module.exports = {
  aliasesLookup: ({manufacturer: manufacturer}) => {
    let aliases = [];
    manufacturer = manufacturer.replace(/ /g, "%20");

    let wikirateRequestOptions = {
      url: "https://wikirate.org/" + manufacturer,
      headers: {
        'content-type': 'application/json'
      },
      json: true
    }

    return rp(wikirateRequestOptions)
      .then((response) => {
        if('aliases' in response) {
          aliases = response.aliases.content;
        }
        if(!(manufacturer in aliases)) {
          aliases.push(manufacturer);
        }
        return Promise.all(aliases);
      })
      .then((res) => {
        return {body: res};
      })
      .catch((err) => {
          aliases.push(manufacturer);
          console.log("couldn't find aliases");
          return {body: aliases};
      });
  },

  greenScoreLookup: ({aliases: aliases}) => {
    let allScores = [];
    for(let i = 0; i < aliases.length; i++) {
      alias = aliases[i].replace(/ /g, "%20");
      let greenscoreRequestOptions = {
        url: "https://wikirate.org/Newsweek+Newsweek_Green_Score+" + alias,
        headers: {
          'content-type': 'application/json'
        },
        json: true
      }
      allScores[i] = new Promise((resolve, reject) => {
        rp(greenscoreRequestOptions)
        .then((response) => {
          if('items' in response) {
            if('value' in response.items[0]) {
              resolve(response.items[0].value);
            }
          }
        })
        .catch((e) => {
          resolve(null);
        })   
      })
    }
    
    return Promise.all(allScores)
      .then((scores) => {
        for(let i = 0; i < scores.length; i++) {
          if(scores[i] != null) {
            return {body: scores[i]};
          }
        }
        return {body: null}
      })
      .catch((e) => {
        return {body: null};
      })
  }
}