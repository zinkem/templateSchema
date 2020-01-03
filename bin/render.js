#!/usr/bin/env node

const fs = require('fs');

const loadFromFile = require('..').loadFromFile;

console.log(process.argv, process.argv.length);

if( process.argv.length < 3) {
  console.log(`
    usage:
      render <template_schema> [<view>]
    `)
  process.exit(1);
}

const viewfname = process.argv.length >= 4
  ? process.argv.pop()
  : null;

const fname = process.argv.pop();

loadFromFile(fname)
  .then((engine) => {
    const view = viewfname
      ? fs.readFileSync(viewfname, 'utf8')
      : engine.spec.view;
    console.log('view loaded');

    const viewValid = engine.validate(view);
    console.log('view is valid template');

    const final = engine.render(view);
    console.log('document rendered from view:\n', final);

    return final;
  })
  .catch((e) => {
    console.log('!!ERROR!!', e)
    console.log('!!ERROR!!', e.stack)
  })
