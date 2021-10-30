// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import express = require('express');

import { promisify } from 'util';
import { hostname } from 'os';
import fs from 'fs';

const readFile = promisify(fs.readFile);

const app = express();
const port = 3000;

app.use("/schemas", async (req, res) => {
  try {
    let file = await readFile(__dirname + '/../schemas' + req.path, { encoding: 'utf8'});

    file = file.replace(/https:\/\/schema\.management\.azure\.com\/schemas\//g, `http://${hostname()}:${port}/schemas/`);

    res.header('Content-Type', 'application/json');
    res.send(file);
  } catch (err) {
    res.sendStatus(404);
  }
});

app.listen(port, () => console.log(`Listening on http://${hostname()}:${port}`));