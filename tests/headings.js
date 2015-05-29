var twintail = require('../Twintail.js');
var expect = require('expect.js');

describe('Headings', function() {
    
    for (var i=1; i<=6; i++) {
        it('should render a h' + i + ' element', function() {
            expect(twintail.render('#'.repeat(i) + ' title')).to.equal('<hn>title</hn>'.replace('hn', 'h'+i)); 
        });
    }
    
});