const fs = require('fs');

var types = Object.create(null);
types['^#'] = 'header'
types['^\\*'] = 'ul';
types['\\d+\\.'] = 'ol';
types['^@'] = 'variable';

function determineType(line) {
    var determined = 'paragraph';
    
    for (var type in types) {
        var reg = new RegExp(type);
        if (reg.test(line))
            determined = types[type];
    };
        
    return determined;
};

function createElement(name, content) {
    return `<${name}>${content}</${name}>`;
}

var typeActions = Object.create(null);

typeActions.header = function (line) {
    var size = line.match(/#/g).length;
    
    line = line.replace(/^#+ ?/g, '');
    
    return createElement('h'+size, line);
}

typeActions.ul = function (line) {
    return line;
}

typeActions.ol = function (line) {
    return line;
}

typeActions.variable = (function () {
    var vars = Object.create(null);
    return function (line) {
        return '';
    };
})();

var formats = Object.create(null);
formats['-'] = 'strike';
formats['_'] = 'i';
formats['*'] = 'b';

typeActions.paragraph = function (line) {
    return createElement('p', line);
}

function feed (line) {
    var type = determineType(line.trim());
    var action = typeActions[type];
    
    if (action)
        line = action(line);
        
    line = line.replace(/(<.+?>)!/, '$1');

    console.log(line);
    
    return line;
}


exports = module.exports = Twintail;

function Twintail() { };

Twintail.render = function (string) {
    var lines = string.split("\n").filter(function (line) {
        return line.length;
    }).map(feed);
    
    return lines.join('\n');
};

Twintail.read = function (file) {
    return Twintail.render(fs.readFileSync(file, 'utf-8'));
};
