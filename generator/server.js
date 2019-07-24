const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use("/schemas", function (req, res) {
  try {
    let file = fs.readFileSync(__dirname + '/../schemas' + req.path, 'utf8');

    file = file.replace(/https:\/\/schema\.management\.azure\.com\/schemas\//g, `http://localhost:${port}/schemas/`);

    res.header('Content-Type', 'application/json');
    res.send(file);
  } catch (err) {
    res.sendStatus(404);
  }
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));