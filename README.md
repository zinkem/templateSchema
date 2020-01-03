# templateSchema

templateSchema is a library that takes yaml files containing mustache templates and template fragments to be used as partials. The library will generate a schema for a given mustache template, and if a 'view' object is provided in the template definition, it can be rendered.

## Getting started

```
$ git clone https://github.com/zinkem/templateSchema.git
$ cd templateSchema
$ npm ci
```

## Hello World

```
view:
  message: Hello!
template: |
  <html>
    <body>
    {{message}}
    </body>
  </html>
```

The basic yaml specification has two properties, 'template' - a mustache template and 'view' - a set of defaults for the template.

With the provided view, the rendered output is:

```
<html>
  <body>
  Hello!
  </body>
</html>
```


## Contents of this repository

```
./bin        - utility scripts
./lib        - core code
./test_cases - examples used when running tests

./schema.yml - the templateSchema meta-schema
```

## Running Tests

```
$ npx test
```

This will run the tempate engine on all files in ./test_cases. The tests will all ostensibly pass, but they are quite chatty. Piping the output to `less` or saving to a file will allow further inspection. The logs will show fragments of parsed mustache templates, the generated schema for the template, and an example render based on the 'view' provided in the template definition.

**Known Issue: recursive.yml does not currently compile due to the way schema is generated.**

## Rendering a templates

```
Usage:
 ./bin/render.js <filename>

$ ./bin/render.js ./test_cases/hello.yml
```

This command will validate and render the templateSchema based on the view provided in the schema.

## Serving templates

```
$ ./bin/schemad.js
```

Then point your browser at: http://localhost:8080/test_cases/simple.yml

This utility serves the templates as rendered HTML. It is only provided for demo purposes and must be run from the project's root.
