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
        
        var img = line.match(/\.(png|svg|jpg|jpeg|jpg:large|gif|webp)$/);
        
        var self = this;
        
        if (li) {
            var action = map.LI;
        } else if (map[firstc])
              var action = map[firstc];
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

    var first;

    Twintail.prototype.compile = function(line) {
        
        var striptags = /<\/?[^>]+?>/g;
        
        if (/^<li>/.test(line)) {
            
            var prefix = line.replace(striptags, '').match(/^\*/) ? 'ul' : 'ol';
            
            if (!/^<(li|[uo]l)>/.test(storage.lastline))
                first = true;
            else
                first = false;
            
            if (first) {
                line = '<list>\n'.replace('list', prefix)+line;
            }
            
        } else if (/^<li>/.test(storage.lastline)) {
            
            var prefix = storage.lastline.replace(striptags, '').match(/^\*/) ? 'ul' : 'ol';
            
            line = '<\/list>\n'.replace('list', prefix)+line;
            
        }
        
        
        // replace _italic_ with <em>italic</em>, etc.
        var lastmatch;
        line = line.replace(/(\\)?([_\*\-])([^_\*\-(<\/?p>)]+?)[_\*\-]/g, function(match, escape, syntax, text) {
            var formats = {
                '_': '<em>_</em>',
                '*': '<strong>*</strong>',
                '-': '<strike>-</strike>'
            };
            
            if (escape) return match.slice(1);
            return formats[syntax].replace(syntax, text);
        });
        
        // links
        line = line.replace(/\[([^\]]+?)\]\(([^)]+?)\)/, function(match, linktext, href) {
            return '<a href="HREF">LINKTEXT</a>'.replace('HREF', href).replace('LINKTEXT', linktext);
        });
        
        storage.lastline = line;  
        return line;
    }

    Twintail.prototype.render = function(prerender) {
        // phase 1: block tags
        prerender.split("\n").forEach(this.precompile.bind(this));
        
        var self = this;
        // phase 2: inline tags and cleanup
        view = view.split("\n").map(function(line) {
            return self.compile(line);
        }).join("\n");
        
        // li formatting tag removal
        view = view.replace(/<li>([*\d+]\.? ?)/g, '<li>')
        
        var v = view;
        
        view = '';
        storage.lastline = storage.vars = '';
        
        return v;
    };



module.exports = new Twintail(f(__dirname + '/Twintail.append'));