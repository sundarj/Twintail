var twintail = require('../Twintail.js');
var expect = require('expect.js');

String.prototype.repeat = function(n) {
    return new Array(n+1).join( this );
}

describe('Headings', function() {

    for (var i=1; i<=6; i++) {
        it('should render a h'+i + ' element', function() {
            expect(twintail.render('#'.repeat(i) + ' title')).to.equal('<hn>title</hn>\n'.replace(/hn/g, 'h'+i));
        });
    }

    it('should render a h1 element', function() {
      expect(twintail.render('title\n=====')).to.equal('<h1>title</h1>\n');
    });

    it('should render a h2 element', function() {
      expect(twintail.render('title\n-----')).to.equal('<h2>title</h2>\n');
    });

});
