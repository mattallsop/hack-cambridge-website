module.exports = {
    "ui": false,
    "proxy": 'localhost:3000',
    "port": 8000,
    "logLevel": "none",
    "logConnections": false,
    "logFileChanges": false,
    "reloadOnRestart": true,
    "notify": false,
    "reloadDelay": 1000,
    "socket": {
        "clients": {
            "heartbeatTimeout": 10000
        }
    },
    "snippetOptions": {
      "rule": {
        "match": /<script id=['"]browsersync-snippet['"]><\/script>/,
        "fn": (snippet, match) => { return snippet }
      }
    }
};
