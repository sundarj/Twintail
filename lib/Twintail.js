const fs = require('fs');

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

var inlineFormats = Object.create(null);

inlineFormats['*'] = function (match) {
    return createElement('b', match);
}
inlineFormats['_'] = function (match) {
    return createElement('i', match);
}
inlineFormats['-'] = function (match) {
    return createElement('strike', match);
}

function wordBounded(token) {
    return new RegExp(`(^|[ \n\r\t.,'"+!?-]+)${token}([ \n\r\t.,'"+!?-]+|$)`, 'gi');
}

function findTokensOf(char) {
    char = "\\" + char;
    return wordBounded(char + '(.+?)' + char);
}

function noop(i) { return i }

function wrap(outer, inner) {
    return outer + inner + outer;
}

function renderImages(string) {
    var imgExts = [
        'svg', 'png', 'gif', 'jpg',
        'jpeg', 'jpg:large', 'bmp', 'webp'
    ].map(function (ext) { return '\\.' + ext }).join('|');
    
    string = string.replace(wordBounded('(.+('+imgExts+'))'), function (full, prior, match, ext, posterior) {
        return `<img src="${full}">`;
    });
    
    return string;
}

function renderAnchors(string) {
    var splat = string.split("[");
    if (splat.length < 2) return string;
    
    splat = splat.map(function (part) {
        var partSplat = part.split("]");
        
        if (partSplat.length < 2) {
            return partSplat[0];
        }
        
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
            return `<a href="${href}">${renderImages(content)}</a>${rem}`;
            
    });
    
    return splat.join('');
}

function renderInline(string) {
    // bold, italic, strike
    for (var format in inlineFormats) {
        var formatRegex = findTokensOf(format);
        string = string.replace(formatRegex, function (full, prior, match, posterior) {
            var isEscaped = prior.trim() === '!';
            prior = isEscaped ? prior.match(/^|\s/g).join('') : prior;
            
            var action = isEscaped ? wrap.bind(null, format) : inlineFormats[format];
            return prior + action(match) + posterior;
        });
    }
    
    
    
    // variables
    string = string.replace(wordBounded('@(.+)'), function (full, prior, match, posterior) {
        var variable = vars[match.trim()];
        
        return (variable? prior + variable + posterior : full);
    });
    
    // images
    
    string = renderImages(string);
    
    // links
    string = renderAnchors(string);
    
    return string;
}

function makeList() {
    var accul = '';
    
    return function (token, index, all) {
        var li = '\n' + createElement('li', token.value);
        accul += li;
        
        all[index + 1] = all[index + 1] || { type: '' }
        
        if (all[index + 1].type != token.type) {
            var lis = accul;
            accul = '';
            return createElement(token.type, lis + '\n');
        }

        return '';
    }
}

tokenActions.ul = makeList();
tokenActions.ol = makeList();

tokenActions.paragraph = function (token) {
    return createElement('p', renderInline(token.value).replace(/^!/, ''));
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

function compile(token, index, all) {
    var compiled = tokenActions[token.type](token, index, all);
    return compiled;
}


exports = module.exports = Twintail;

function Twintail() { };

Twintail.render = function (string) {
    string = htmlEscaped(string);
    
    var rendered = lex(string)
        .map(compile)
        .filter(notEmpty)
        .join("\n\n");
        /*.filter(notEmpty)
        .map(renderBlock)
        .filter(notEmpty)
        .map(renderInline);*/
    
    console.log(rendered);
};

Twintail.read = function (file) {
    return Twintail.render(fs.readFileSync(file, 'utf-8'));
};
