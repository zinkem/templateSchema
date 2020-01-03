
const fs = require('fs');

const loadFromFile = require('..').loadFromFile;
console.log(loadFromFile)
describe('Render Tests', function() {
  const test_cases = fs.readdirSync('./test_cases')
  console.log(test_cases);

  for( fname in test_cases)
    it('Test Case: '+test_cases[fname], function(done) {
      loadFromFile('./test_cases/'+test_cases[fname])
        .then((engine) => {
          const r = engine.render(engine.spec.view);
          console.log(r);
          done();
        })
        .catch((e) => {
          console.error('ERROR loading tests', e)
          done(e);
        })
    });
});
