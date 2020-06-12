//Install express server
const express = require("express");
const path = require("path");

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + "/dist/notch-angular"));

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname + "/dist/notch-angular/index.html"));
});

const port = process.env.APP_TEST_PORT || 8081;

/* eslint-disable no-console */
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  // models.sequelize.sync({ force: true });
});
