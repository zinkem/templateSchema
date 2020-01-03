const Ajv = require('ajv');
const mustache = require('mustache');
const yaml = require('js-yaml');

const fs = require('fs');

let validateSchema = null;
const yamlOrString = (view) => typeof view === 'string' ? yaml.safeLoad(view) : view

fs.readFile('./schema.yml', 'utf8', (err, data) => {
  if(err) throw err;
  console.log('meta-schema file loaded')

  const schema = yaml.safeLoad(data);
  console.log('meta-schema yaml to json conversion successful')

  const schemaValidator = new Ajv();
  // meta-schema uses a mustache format, so when the actual spec
  // is validated, associated mustache code is run to validate
  schemaValidator.addFormat('mustache', {
    type: 'string',
    validate: function(a) {
      try  {
        const parsed = mustache.parse(a);
        console.log('mustache validation complete');
        //JSON.stringify(parsed, null, 2));
        return true;
      } catch(e) {
        console.log('!!ERROR!! Could not parse mustache template', a, e);
        return false;
      }
    }
  });
  validateSchema = schemaValidator.compile(schema);
  console.log('meta-schema compiled');

});



const compileEngine = (spec_data) => {

    const spec = yaml.safeLoad(spec_data);
    console.log('primary view schema yaml to json successful:', spec.title);

    const valid = validateSchema(spec);
    if(!valid)
      throw JSON.stringify(validateSchema.errors, null, 2);
    console.log('primary view schema adheres to the meta-schema:', spec.title);

    // spec is validated, lets build up the system:
    // 1. engine for the template renderer
    // 2. view schema
    // 3. compiled validator
    const handledParsed = (parsed) => {
      console.log(parsed);
      const schema = parsed.reduce((a, c) => {
        switch( c[0] ) {
          case 'name':
            a.properties[c[1]] = {
              type: 'string',
              label: 'untyped'
            }
            //a.required.push(c[1])
            break;
          case '>':
            console.log(spec.definitions, c[1])
            const partialParsed = mustache.parse(spec.definitions[c[1]].template);
            const partialProps = handledParsed(partialParsed);
            if( partialProps.properties )
              Object.keys(partialProps.properties).forEach((p) => {
                a.properties[p] = partialProps.properties[p];
                //a.required.push(p)
              })
            else {
              a.properties['.'] = true;
            }
            break;
          case '#':
            const hashParsed = {
              type: 'array',
              items: handledParsed(c[4]),
              label: 'iterator'
            };

            console.log('DEBUG', hashParsed)
            if( hashParsed.items.properties
                && Object.keys(hashParsed.items.properties).length < 1 ) {
                  hashParsed.items = {
                    type: 'string',
                    label: 'primitive array member'
                  }
                }
            a.properties[c[1]] = hashParsed;

          case 'text':
          default:
        }
        return a;
      }, {
        type: 'object',
        properties: {},
        required: []
      })

      if( schema.properties['.']
        && Object.keys(schema.properties).length === 1 )
        return {
          type: 'string',
          label: 'dot reference'
        }
      if( Object.keys(schema.properties).length < 1 )
        return {
          type: 'string',
          label: 'raw'
        }
      return schema;
    };

    const buildEngine = (spec) => {
      const partials = Object.keys(spec.definitions || {})
        .reduce((a, c) => {
          a[c] = spec.definitions[c].template
          return a;
        }, {})
      console.log('partials', partials);
      const template = spec.template;

      const parsed = mustache.parse(template)
      const view_schema = handledParsed(parsed);
      console.log(view_schema);
      return {
        schema: view_schema,
        render: (view) => mustache.render(template, view, partials)
      }
    }

    const system = buildEngine(spec);

    console.log('derived view schema generated')
    console.log(JSON.stringify(system.schema, null, 2));

    const viewValidator = new Ajv({ coerceTypes: true });
    const validateView = viewValidator.compile(system.schema);
    console.log('derived view schema compiled')
    return {
      spec: spec,
      schema: system.schema,
      render: (view) => system.render(yamlOrString(view)),
      validate: (view) =>  {
        const valid = validateView(yamlOrString(view));
        if( !valid )
          throw new Error(JSON.stringify(validateView.errors))
        return view;
      }
    }
};

const loadFromFile = (fname, view) => {
  return new Promise((resolve, reject) => {
    fs.readFile(fname, 'utf8', (err, data) => {
      if(err) reject(err);
      console.log('view schema file loaded', fname);
      try {
        const newEngine = compileEngine(data);
        resolve(newEngine);
      } catch(e) {
        console.log('EEERROROROROR', e);
        reject(e)
      }
    });
  });
}

module.exports = {
  loadFromFile
}
