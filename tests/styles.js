var twintail = require('..');
var expect = require('expect.js');

describe('Styles', function() {
    it('should render a bold element', function() {
      expect(twintail.render('*bold*')).to.equal('<p><strong>bold</strong></p>\n');
    });

    it('should render a italic element', function() {
      expect(twintail.render('_italic_')).to.equal('<p><em>italic</em></p>\n');
    });

    it('should render a strikethrough element', function() {
      expect(twintail.render('-strikethrough-')).to.equal('<p><strike>strikethrough</strike></p>\n');
    });
    
    it('should escape the formatting', function() {
      expect(twintail.render('\\*bold*')).to.equal('<p>*bold*</p>\n');
      expect(twintail.render('\\_italic_')).to.equal('<p>_italic_</p>\n'); 
      expect(twintail.render('\\-strikethrough-')).to.equal('<p>-strikethrough-</p>\n'); 
    });
});
