/**
 * Simple ping procedure to ensure server is listening and can talk.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a
 */
let ping = async (req, res) => {
    res.status(200);
    res.send('Ping!');
};

module.exports =  {
    ping: ping
};






