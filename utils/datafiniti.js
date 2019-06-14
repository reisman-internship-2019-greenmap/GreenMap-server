const rp = require('request-promise');

module.exports = {
  datafinitilookup: ({api_key: api_key, barcode: barcode}) => {
    let request_options = {
      url: 'https://api.datafiniti.co/v4/products/search',
      method: 'POST',
      json: {
        'query': ('upc:' + barcode + " OR " + "ean:" + barcode + " OR " + "isbn:" + barcode),
        'format': "JSON",
        'num_records': 1,
        'download': false
      },
      headers: {
        'Authorization': 'Bearer ' + api_key,
        'Content-Type': 'application/json'
      },
      resolveWithFullResponse: true
    }

    return rp(request_options)
      .then((response) => {
        return Promise.all([response.statusCode, response.body]);
      })
      .then((res) => {
        return { status: res[0], body: res[1] };
      })
      .catch((error) => {
        return { status: 400, data: error };
      })
  }
}
