const http = require("http");
const Koa = require("koa");
const { Writable } = require("stream");
const app = new Koa();

app.use(async (ctx, next) => {
  const writable = new Writable({
    write (chunk, encoding, cb) {
      this._needDrain = true;
      this._cb = cb;
    }
  });

  ctx.req.pipe(writable);
  ctx.body = `
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

  await next();
});

http
.createServer({}, app.callback())
.listen(8000, "localhost");
