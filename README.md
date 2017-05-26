mutability-helper
===

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

Mutate a piece of data in place leveraging a convenient set of commands.
Based on [`immutability-helper`](https://github.com/kolodny/immutability-helper).

```js
import update from 'mutability-helper';

const state1 = ['x'];
update(state1, {$push: ['y']});
// state1 === ['x', 'y']
```

## Overview

Originally, the `immutability-helper`'s selling point was the fact that it
didn't mutated the piece of data at all, returning a mutated copy of it to be
used instead.

But, sometimes you may want to update a piece of data in place, leveraging
those nice and convenient commands from that come from `immutability-helper`
(and they were originally inspired by [MongoDB's query language](http://docs.mongodb.org/manual/core/crud-introduction/#query)).

That is why this project exists and it uses the same commands API from the
original `immutability-helper`.

## `update()`

`update()` provides simple syntactic sugar around this pattern to make writing this code easier. This code becomes:

```js
import update from 'immutability-helper';

update(myData, {
  x: {y: {z: {$set: 7}}},
  a: {b: {$push: [9]}}
});

// myData is changed here
```

## An Introduction to Commands

An nice introduction to commands API is available in original [`immutability-helpers` repo](https://github.com/kolodny/immutability-helper#update), which also covers how to create additional commands.

[npm-image]: https://img.shields.io/npm/v/mutability-helper.svg?style=flat-square
[npm-url]: https://npmjs.org/package/mutability-helper
[travis-image]: https://img.shields.io/travis/Creative-Themes/mutability-helper.svg?style=flat-square
[travis-url]: https://travis-ci.org/Creative-Themes/mutability-helper
[coveralls-image]: https://img.shields.io/coveralls/Creative-Themes/mutability-helper.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/Creative-Themes/mutability-helper
[downloads-image]: http://img.shields.io/npm/dm/mutability-helper.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/mutability-helper
