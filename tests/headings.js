var twintail = require('../Twintail.js');
var expect = require('expect.js');

describe('Headings', function() {
  it('heading 1', function() {
    expect(twintail.render('# heading 1')).to.equal('<h1>heading 1</h1>');
  });
  
  it('heading 2', function() {
    expect(twintail.render('## heading 2')).to.equal('<h2>heading 2</h2>');
  });
  it('heading 3', function() {
    expect(twintail.render('### heading 3')).to.equal('<h3>heading 3</h3>');
  });
  it('heading 4', function() {
    expect(twintail.render('#### heading 4')).to.equal('<h4>heading 4</h4>');
  });
  it('heading 5', function() {
    expect(twintail.render('##### heading 5')).to.equal('<h5>heading 5</h5>');
  });
  it('heading 6', function() {
    expect(twintail.render('###### heading 6')).to.equal('<h6>heading 6</h6>');
  });
});