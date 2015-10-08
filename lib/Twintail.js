const fs = require('fs');

const default_opts = {
    listIndent: false
};
var opts = {};

const types = Object.create(null);
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

var inlineActions = Object.create(null);

inlineActions['*'] = function (match) {
    return createElement('b', match);
}
inlineActions['_'] = function (match) {
    return createElement('i', match);
}
inlineActions['-'] = function (match) {
    return createElement('strike', match);
}

function wordBounded(token) {
    return new RegExp(`(^|[ \n\r\t.,'"+!?-]+)${token}([ \n\r\t.,'"+!?-]+|$)`, 'g');
}

function findTokensOf(char) {
    char = "\\" + char;
    return wordBounded(char + '(.+?)' + char);
}

function noop(i) { return i }

function wrap(outer, inner) {
    return outer + inner + outer;
}

function renderAnchors(string) {
    var splat = string.split("[");
    if (splat.length < 2) return string;
    
    splat = splat.map(function (part) {
        var partSplat = part.split("]");
        if (partSplat.length < 2) {
            return partSplat[0];
        } else {
            var content = partSplat[0];
            var href;

            var rem;
            partSplat = partSplat[1].split("(");
            partSplat.forEach(function (other) {
                var otherSplat = other.split(")");
                if (otherSplat.length < 2) return;
                href = otherSplat[0];
                rem = otherSplat[1];
            });
            
            if (href && rem)
                return `<a href="${href}">${content}</a>${rem}`;
        }
            
    });
    
    return splat.join('');
}

function renderInline(string) {
    for (var action in inlineActions) {
        var actionRegex = findTokensOf(action);
        string = string.replace(actionRegex, function (full, prior, match, posterior) {
            var isEscaped = prior === '!';
            prior = isEscaped ? '' : prior;

            var format = isEscaped ? wrap.bind(null, action) : inlineActions[action];

            return prior + format(match) + posterior;
        });
    }
    
    string = renderAnchors(string);
    
    console.log(string);
    return string;
}

tokenActions.ul = function (token) {
    return ''
};
tokenActions.ol = function (token) {
    return ''
};

tokenActions.paragraph = function (token) {
    return createElement('p', renderInline(token.value));
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
    
    // console.log(rendered);
};

Twintail.read = function (file, user_opts) {
    return Twintail.render(fs.readFileSync(file, 'utf-8'), user_opts);
};
