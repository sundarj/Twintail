var twintail = require('..');
var expect = require('expect.js');

describe('Lists', function() {
    it('should render a unordered list with 1 item', function() {
      expect(twintail.render('* item').replace(/\n/g, '')).to.equal('<ul><li>item</li></ul>');
    });

    it('should render a ordered list with 1 item', function() {
      expect(twintail.render('1. item').replace(/\n/g, '')).to.equal('<ol><li>item</li></ol>');
    });
});
