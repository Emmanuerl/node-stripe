const express = require("express");
const http = require("node:http");
const env = require("./config/env");
const { connectMysql } = require("./config/mysql");

async function start() {
  const db = await connectMysql();
  console.log("successfully connected to mysql");

  const app = express();
  const server = http.createServer(app);

  server.listen(env.port);
  server.on("listening", () => console.log("App running on port " + env.port));
}

start();
