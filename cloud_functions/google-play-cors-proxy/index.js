var gplay = require('google-play-scraper');

function badRequest(res, error) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.status(400).send(error);
}

exports.process = (req, res) => {
  var appId = req.query && req.query['appId'];
  if (appId) {
    gplay.app({ appId }).then(
      success => {
        console.log({ Success: appId });
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET');
        res.status(200).send(success);
      },
      error => badRequest(res, error)
    );
  } else {
    badRequest(res, 'Invalid appId');
  }
};
