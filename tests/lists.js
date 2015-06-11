var twintail = require('..');
var expect = require('expect.js');

describe('Lists', function() {
    it('should render a unordered list with 2 items', function() {
      expect(twintail.render('* item\n* item')).to.equal('<ul>\n<li>item</li>\n<li>item</li>\n</ul>\n');
    });

    it('should render a ordered list with 2 items', function() {
      expect(twintail.render('1. item\n2. item')).to.equal('<ol>\n<li>item</li>\n<li>item</li>\n</ol>\n');
    });
});
