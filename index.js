const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;
const pathToFile = path.resolve("./data.json");
const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());

console.log(pathToFile);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/resources", (req, res) => {
  const resources = getResources();
  res.send(resources);
});

app.get("/api/activeresource", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );
  res.send(activeResource);
});

app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const resource = resources.find((resource) => resource.id === id);
  console.log("Requested content: " + JSON.stringify(resource));
  res.send(resource);
});

app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;

  resource.createdAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toString();
  resources.unshift(resource);

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file");
    }

    return res.send("Data has been saved");
  });
});

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const index = resources.findIndex((resource) => resource.id === id);
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );

  if (resources[index].status === "complete") {
    return res.status(422).send("Cannot update because status is marked complete");
  }

  resources[index] = req.body;

  // only activate if there's no other active resource
  if (req.body.status === "active") {
    if (activeResource) {
      console.log("Active resource exists");
      return res.status(422).send("There is already an active resource.");
    }

    resources[index].status = "active";
    resources[index].activationTime = new Date();
  }

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file");
    }
    console.log("Updated content: " + JSON.stringify(resources[index]));

    return res.send("Data has been updated");
  });
});

app.listen(PORT, () => {
  console.log("server is listening on port:" + PORT);
});
