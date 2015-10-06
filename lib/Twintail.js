const fs = require('fs');

var default_opts = {
    listIndent: false
};
var opts = {};

var types = Object.create(null);
types['^#+'] = 'header';
types['^\\*'] = 'ul';
types['\\d+\\.'] = 'ol';
types['^@'] = 'variable';

function determineType(line) {
    var determined = 'paragraph';
    
    var regex;
    
    for (var type in types) {
        var reg = new RegExp(type);
        if (reg.test(line)) {
            regex = reg;
            determined = types[type];
        }
    };
        
    return {
        type: determined,
        regex: regex
    };
};

function createElement(name, content) {
    return `<${name}>${content}</${name}>`;
}

var tokenActions = Object.create(null);


var vars = Object.create(null);

tokenActions.variable = function (token) {
    var parts = token.value.split(":").map(function (p) {
        return p.trim();
    });
    vars[parts[0]] = parts[1];
    return '';
};

tokenActions.header = function (token) {
    return createElement('h' + token.size, token.value);
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

tokenActions.ul = function (token) {
    return ''
};
tokenActions.ol = function (token) {
    return ''
};

tokenActions.paragraph = function (token) {
    return createElement('p', token.value);
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

function notEmpty(string) { return string.length > 0 }
function htmlEscaped(string) {
    return string.replace(/[<>&]/g, function (char) {
        return ({
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;'
        })[char];
    });
};

function lex(string) {
    return string.split("\n").map(function (line) {
        
        var determined = determineType(line);
        var size;
        
        if (determined.regex) {
            size = line.match(determined.regex);
            size = size && size[0].length;
            line = line.replace(determined.regex, '').trim();
        }
        
        var ret = {
            type: determined.type,
            value: line
        };
        
        if (ret.type === 'header') {
            ret.size = size
        }
        
        return ret;
    }).filter(function (token) {
        return notEmpty(token.value)
    });
}

function compile(token) {
    var compiled = tokenActions[token.type](token);
    return compiled;
}


exports = module.exports = Twintail;

function Twintail() { };

Twintail.render = function (string, user_opts) {
    opts = Object.assign(opts, user_opts);
    string = htmlEscaped(string);
    
    var rendered = lex(string)
        .map(compile)
        .filter(notEmpty)
        .join("\n");
        /*.filter(notEmpty)
        .map(renderBlock)
        .filter(notEmpty)
        .map(renderInline);*/
    
    console.log(rendered);
};

Twintail.read = function (file, user_opts) {
    return Twintail.render(fs.readFileSync(file, 'utf-8'), user_opts);
};
