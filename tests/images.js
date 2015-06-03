var twintail = require('../Twintail.js');
var expect = require('expect.js');

describe('File reading', function() {
    it('should render an image element', function() {
       expect(twintail.render('Twintail.png')).to.equal('<img src="Twintail.png" alt="breasticles">\n') 
    });
});