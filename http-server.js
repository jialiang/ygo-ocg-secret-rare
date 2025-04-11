import http from "http";
import url from "url";
import fs from "fs";
import mime from "mime";
import zlib from "zlib";

http
  .createServer((req, res) => {
    let pathname = decodeURI(url.parse(req.url).pathname);

    console.log(`Received request for ${pathname}.`);

    if (pathname === "/") pathname = "/index.html";

    const stream = fs.createReadStream("./docs" + pathname);
    const chunks = [];

    stream.on("error", (error) => {
      console.error(`Error reading ${pathname}:\n`, error);
      res.writeHead(404).end();
    });

    stream.on("open", () => {
      console.log(`Opened ${pathname} for reading...`);
    });

    stream.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    stream.on("end", () => {
      console.log(`Finished reading ${pathname}.`);

      zlib.gzip(Buffer.concat(chunks), (error, result) => {
        if (error) {
          console.error(`Error with gzip: ${error}`);
          res.writeHead(500).end();
        } else {
          res.setHeader("Content-Type", mime.getType(pathname));
          res.setHeader("Content-Encoding", "gzip");
          res.writeHead(200);
          res.end(result);
        }
      });
    });
  })
  .listen(8080);

console.log("Listening on port 8080...");
