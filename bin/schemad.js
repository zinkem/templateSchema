#!/usr/bin/env node

const http = require('http');

const loadFromFile = require('..').loadFromFile;

const d = http.createServer((req, res) => {
  console.log(req.url)
  //TODO: parse URL and use query parameters as view
  const view = {};

  if(req.url === '/favicon.ico') {
    res.end();
    return;
  };

  loadFromFile('.'+req.url)
    .then((engine) => {
      const view = engine.spec.view;
      console.log('view constructed', view);

      const viewValid = engine.validate(view);
      if(!viewValid)
        throw JSON.stringify(engine.validate.errors, null, 2);

      console.log('view is valid html component');

      const final = engine.render(view);
      console.log('artifact rendered from view');
      console.log(final)

      return final;
    })
    .then((html) => {
      res.write(html);
      res.end();
    })
    .catch((e) => {
      console.log('!!ERROR!!', e)
      console.log('!!ERROR!!', e.stackTrace)      
      res.write(e);
      res.end();
    })

});

d.listen(8080);
