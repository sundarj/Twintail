var twintail = require('../Twintail.js');
var expect = require('expect.js');

describe('Lists', function() {
    it('should render a unordered list with 1 item', function() {
      expect(twintail.render('* item')).to.equal('<ul><li>item</li></ul>\n');
    });

    it('should render a ordered list with 1 item', function() {
      expect(twintail.render('* item')).to.equal('<ol><li>item</li></ol>\n');
    });

    it('should render a unordered list with 1 item', function() {
      expect(twintail.render('\n* item')).to.equal('<ul><li>item</li></ul>\n');
    });

    it('should render a ordered list with 1 item', function() {
      expect(twintail.render('\n* item')).to.equal('<ol><li>item</li></ol>\n');
    });
});
