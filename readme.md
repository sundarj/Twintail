# Twintail ![](https://img.shields.io/travis/SundarJ/Twintail.svg?style=flat-square)

Compiler for the Anime Twist flavour of Markdown

### Usage

```js

var twintail = require('twintail');

var out = twintail.read('/path/to/file');

// or

var out = twintail.render('#hello');

```

### Syntax

```md

# heading 1
// or

heading 1
===========

// becomes
<h1>heading 1</h1>

## heading 2

//or

heading 2
---------

// becomes
<h2>heading 2</h2>

### heading 3
// becomes
<h3>heading 3</h3>

#### heading 4
// becomes
<h4>heading 4</h4>

#### heading 5
// becomes
<h5>heading 5</h5>

###### heading 6
// becomes
<h6>heading 6</h6>

I like pie
// becomes
<p>I like pie</p>

* apples
* oranges
* bananas

//becomes

<ul>
    <li>apples</li>
    <li>oranges</li>
    <li>bananas</li>
</ul>

1. one
2. two
3. three

// becomes

<ol>
    <li>one</li>
    <li>two</li>
    <li>three</li>
</ol>

(click me)[http://someurlthing]
//becomes
<a href="http://someurlthing">click me</a>

@fakku: dude
hello @fakku

//becomes

<p>hello dude</p>

*bold*
//becomes
<strong>bold</strong>

_italic_
//becomes
<em>italic</em>

-strikethrough-
//becomes
<strike>strikethrough</strike>

image.jpg
//becomes
<img src="image.jpg">

```