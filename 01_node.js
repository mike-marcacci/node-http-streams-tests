const fs = require("fs");
const http = require("http");
const https = require("https");
const http2 = require("http2");
const { Writable } = require("stream");

const form = `
  <html>
    <body>
      <script>
        const send = () => {
          const body = new FormData();
          body.append(
            'operations',
            JSON.stringify({
              variables: {
                file1: null
              }
            })
          )

          body.append(
            'map',
            JSON.stringify({
              1: ['variables.file1']
            })
          )
          body.append(1, document.querySelector("input[name='file1']").files[0]);
          fetch('/', { method: 'POST', body: body, headers: {Connection: 'keep-alive'} });
        }
      </script>
      <input name="file1" type="file" />
      <button type="button" onclick="send()">Fetch</button>
    </body>
  </html>
`;

http
.createServer(
  {},
  (req, res) => {
    req.pipe(new Writable({
      write (chunk, encoding, cb) {
        this._needDrain = true;
        this._cb = cb;
      }
    }));
    console.log("SENT")
    res.writeHead(200);
    res.end(form);
  }
)
.listen(8000, "localhost");

https
.createServer(
  {
    key: fs.readFileSync("./localhost.key"),
    cert: fs.readFileSync("./localhost.crt"),
  },
  (req, res) => {
    req.pipe(new Writable({
      write (chunk, encoding, cb) {
        this._needDrain = true;
        this._cb = cb;
      }
    }));
    res.writeHead(200);
    res.end(form);
  }
)
.listen(8001, "localhost");


http2
.createSecureServer(
  {
    key: fs.readFileSync("./localhost.key"),
    cert: fs.readFileSync("./localhost.crt"),
    allowHTTP1: false
  },
  (req, res) => {
    req.pipe(new Writable({
      write (chunk, encoding, cb) {
        this._needDrain = true;
        this._cb = cb;
      }
    }));
    res.writeHead(200);
    res.end(form);
  }
)
.listen(8002, "localhost");