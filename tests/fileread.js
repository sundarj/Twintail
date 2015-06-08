var twintail = require('..');
var expect = require('expect.js');
var fs = require('fs');

describe('File reading', function() {
    it('should render the html correctly from the file', function() {
       expect(twintail.read('example/tatoeba.twin')).to.equal(fs.readFileSync('tests/expected.html', 'utf-8'));
    });
});