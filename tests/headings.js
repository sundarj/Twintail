var twintail = require('..');
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

});
