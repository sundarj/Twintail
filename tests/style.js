var twintail = require('../Twintail.js');
var expect = require('expect.js');

String.prototype.repeat = function(n) {
    return new Array(n+1).join( this );
}

describe('Style', function() {
    it('should render a bold element', function() {
      expect(twintail.render('*bold*')).to.equal('<p><strong>bold</strong></p>\n');
    });

    it('should render a italic element', function() {
      expect(twintail.render('_italic_')).to.equal('<p><em>italic</em></p>\n');
    });

    it('should render a strikethrough element', function() {
      expect(twintail.render('-strikethrough-')).to.equal('<p><strike>strikethrough</strike></p>\n');
    });
});
