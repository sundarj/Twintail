const fs = require('fs');

var default_opts = {
    listIndent: false
};
var opts = {};

var types = Object.create(null);
types['^#'] = 'header';
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


var vars = Object.create(null);

typeActions.variable = function (line) {
    var parts = line.slice(1).split(":");
    vars[parts[0]] = parts[1].trim();
    return '';
};

typeActions.header = function (line) {
    var size = line.match(/#/g).length;
    
    line = line.replace(/^#+ ?/, '');
    
    return createElement('h'+size, line);
}

var formats = Object.create(null);
formats['-'] = 'strike';
formats['_'] = 'i';
formats['*'] = 'b';

function createList(regex, tagname) {
    var first = true;
    return function (line, nextline) {
        line = line.replace(regex, '');
        var listItem = (opts.listIndent? opts.listIndent : '') +
                       createElement('li', line);
        if (first) {
            line = '<' + tagname + '>\n' + listItem;
            first = false;
        } else {
            var last = regex.test(nextline);
            line = listItem + (last ? '' : '\n</' + tagname + '>');
        }
        return line;
    }
}

typeActions.ul = createList(/^\* ?/, 'ul');
typeActions.ol = createList(/^\d+\. ?/, 'ol');

typeActions.paragraph = function (line) {
    return createElement('p', line);
}


function renderBlock (line, index, all) {
    var type = determineType(line.trim());
    var action = typeActions[type];
    
    var nextline = all[index + 1];
    
    if (action)
        line = action(line, nextline);
        
    line = line.replace(/(<.+?>)!/, '$1');
    
    return line;
}


var variableRegex = /(!)?@(.+)/g;

function addVariables(line) {
    line = line.replace(variableRegex, function (match, escaped, varname) {
        console.log(vars, varname);
        if (!escaped)
            return vars[varname];
        return match;
    });
    return line;
}

function renderInline(line) {
    line = addVariables(line);
    //line = addFormats(line);
    // line = addLinks(line);
    // line = addImages(line);
    
    console.log(line);
}

function notEmpty(line) { return line.length > 0 }


exports = module.exports = Twintail;

function Twintail() { };

Twintail.render = function (string, user_opts) {
    opts = Object.assign(opts, user_opts);
    
    var lines = string.split("\n")
        .filter(notEmpty)
        .map(renderBlock)
        .filter(notEmpty)
        .map(renderInline);
    
    return lines.join('\n');
};

Twintail.read = function (file, user_opts) {
    return Twintail.render(fs.readFileSync(file, 'utf-8'), user_opts);
};
