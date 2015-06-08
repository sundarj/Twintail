var twintail = require('..');
var expect = require('expect.js');

describe('Hyperlinks', function() {
    it('should render an a tag', function() {
        expect(twintail.render('[test](http://google.co.uk)')).to.equal('<p><a href="http://google.co.uk">test</a></p>\n')
    });
});