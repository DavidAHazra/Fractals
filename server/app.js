const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
app.set('port', 8080);

app.use(compression());
app.use(require(path.join(__dirname, 'routes', 'routes.js')));


// Start the server
app.listen(app.get('port'), () => {
    console.log("Server started at localhost:" + app.get('port'));
});