const http = require("http");
const Koa = require("koa");
const Busboy = require("busboy");
const app = new Koa();

app.use(async (ctx, next) => {
  if (!ctx.request.is('multipart/form-data')) {
    await next();
    return;
  }

  const parser = new Busboy({
    headers: ctx.req.headers
  })

  await new Promise((resolve, reject) => {
    const streams = [];

    parser.on("field", (fieldName, value) => {
      console.log("field", fieldName);
      resolve(streams)
    })

    parser.on("file", (fieldName, stream, filename, encoding, mimetype) => {
      console.log("file", fieldName);
      streams.push(stream);
    })

    ctx.req.pipe(parser)
  });

  await next();

  /*
  ctx.req.unpipe(parser);
  ctx.req.resume();
  parser.destroy();
  */
})

app.use(async (ctx, next) => {
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
