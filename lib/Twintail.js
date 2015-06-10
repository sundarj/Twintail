var fs = require('fs');

function f(file) {
    return fs.readFileSync(file, {encoding: 'utf-8'});
}

var view = '',
    storage = {
        vars: {},
        lastline: null
    };

function Twintail(append) {
    
    this.append = (function() {
        var o = {};
        append.split("\n").map(function(i) {
            return i.split(":").map(function(j) {
                return j.trim();  
            });
        }).map(function(pair) {
            o[pair[0]] = pair[1];  
        });
        return o;
    })();
    
};

    Twintail.prototype.utils = {
        trim: function(array) {
            return array.map(function(v) { return v.trim() });
        },
        wrap: function(tags, inner) {
            tags = tags.split(" ").reverse();
            var ret;
            tags.forEach(function(tag) {
                ret = '<tag>inner</tag>'.replace(/tag/g, tag).replace('inner', ret || inner);
            });
            return ret + '\n';
        }
    }

    Twintail.prototype.read = function(file) {
        return this.render(f(file));
    };

    Twintail.prototype.precompile = function(line) {
        
        if (!line) {
            return view += "\n";   
        }
        
        function VARIABLE(statement) {
        
            statement = this.utils.trim(statement.substr(1).split(":"));
            statement = [statement.shift(), statement.join(":")];
            storage.vars[statement[0]] = statement[1];
            
            return '';
        }
        
        var map = {
            
            paragraph: function(line) {
                  return this.utils.wrap('p', line);
            },
            multiline: {
                '=': function(line) {
                    var ret = this.utils.wrap('h1', storage.lastline);
                    return ret;
                },
                '-': function(line) {
                    var ret = this.utils.wrap('h2', storage.lastline); 
                    return ret;
                }
            },
            '@': VARIABLE,
            LI: function(line, li) {
                return this.utils.wrap('li', line.replace(/^([*\d+])\.? ?/, '$&'));
            },
            '#': function(line) {
                var reg = /^#+/g;
                var count = line.match(reg)[0];
                return this.utils.wrap('h'+count.length, line.replace(reg, '').trim());
            },
            IMG: function(line) {
                return '<img src="SRC" alt="breasticles">\n'.replace("SRC", line);
            }
            
        };
        
        function append(line) {
         
            return this.utils.wrap(this.append[line[0]], line.replace(line[0] + " ", ''));
            
        }
        
        var firstc = line[0];
        
        // starts with "number." or "*", but doesn't end with "*"
        var li = line.match(/^(?!.*\*$)[*\d+]\.?/);
        
        /* is the character in map.multiline and if so,
           is the line composed entirely of the character (multiline headers) ? */
        var multiline = ((line[0] in map.multiline) && line.match(new RegExp(line[0], 'g')).join('') === line);
        
        var img = line.match(/\.(png|svg|jpg|jpeg|jpg:large|gif|webp)$/);
        
        var self = this;
        
        if (li) {
            var action = map.LI;
        } else if (map[firstc])
              var action = map[firstc];
          else if (multiline)
              var action = map.multiline[firstc];
          else if (~Object.keys(this.append).indexOf(firstc))
              var action = append;
          else if (img)
              var action = map.IMG;
          else
              var action = map.paragraph;
        
        
        if (action) {
            view += action.call(this, line);
        }
        
        view = view.replace(/@[^]+?(?=\))/g, function(match) {
            match = match.replace("@", "");
            return storage.vars[match] || '';
        });
        
        storage.lastline = line;
    };

    Twintail.prototype.compile = function(line) {
        
        var striptags = /<\/?[^>]+?>/g;
        
        if (/^<li>/.test(line)) {
            var type = line.match(/>([*\d+])\.? ?/)[0].slice(1);
            var el = (type === '* ' ? 'ul' : 'ol');
            
            if (!/^<li>/.test(storage.lastline))
                view = view.replace(line, '<list>\n'.replace('list', el)+line);
        } else if (/^<li>/.test(storage.lastline)) {
            var type = storage.lastline.match(/>([*\d+])\.? ?/)[0].slice(1);
            var el = (type === '* ' ? 'ul' : 'ol');
            view = view.replace(storage.lastline, storage.lastline+'\n</list>'.replace('list', el));
        }
        
        
        // replace _italic_ with <em>italic</em>, etc.
        view = view.replace(/([_\*\-])([^_\*\-]+?)[_\*\-]/, function(match, syntax, text) {
            var formats = {
                '_': '<em>_</em>',
                '*': '<strong>*</strong>',
                '-': '<strike>-</strike>'
            }
            
            return formats[syntax].replace(syntax, text);
        });
        
        // links
        view = view.replace(/\[([^\]]+?)\]\(([^)]+?)\)/, function(match, linktext, href) {
            return '<a href="HREF">LINKTEXT</a>'.replace('HREF', href).replace('LINKTEXT', linktext);
        });
                
        // remove the extraneous multiline header line
        if (line.match(/^<h/) && (storage.lastline.replace(striptags, '') === line.replace(striptags, ''))) {
            view = view.replace(storage.lastline + '\n', '');   
        }
        storage.lastline = line;
    }

    Twintail.prototype.render = function(prerender) {
        // phase 1: block tags
        prerender.split("\n").forEach(this.precompile.bind(this));
        
        // phase 2: inline tags and cleanup
        view.split("\n").forEach(this.compile.bind(this));
        
        // li formatting tag removal
        view = view.replace(/<li>([*\d+]\.? ?)/g, '<li>')
        
        var v = view;
        
        view = '';
        storage.lastline = storage.vars = '';
        
        return v;
    };



module.exports = new Twintail(f(__dirname + '/Twintail.append'));