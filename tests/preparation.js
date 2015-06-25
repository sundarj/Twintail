var twintail = require('..');
var expect = require('expect.js');

describe('Preparation', function() {
    it('should escape html tags', function() {
        expect(twintail.render('\n*<3*')).to.equal('\n<p><strong>&lt;3</strong></p>\n');
    });
});