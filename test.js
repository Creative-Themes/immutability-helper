var update = require('./');
var expect = require('expect');

describe('update', function() {

  describe('$push', function() {
    it('pushes an array', function() {
      var originalData = [1];

      update(originalData, {$push: [7]});

      expect(originalData).toEqual([1, 7]);
    });

    it('mutates the original object', function() {
      var obj = [1];
      update(obj, {$push: [7]});
      expect(obj).toEqual([1, 7]);
    });

    it('only pushes an array', function() {
      expect(update.bind(null, [], {$push: 7})).toThrow(
        'update(): expected spec of $push to be an array; got 7. Did you ' +
        'forget to wrap your parameter in an array?'
      );
    });

    it('only pushes unto an array', function() {
      expect(update.bind(null, 1, {$push: 7})).toThrow(
        'update(): expected target of $push to be an array; got 1.'
      );
    });
    it('keeps reference equality', function() {
      var original = ['x'];
      expect(update(original, {$push: []})).toBe(original)
    });
  });

  describe('$unshift', function() {
    it('unshifts', function() {
      let originalData = [1];
      update(originalData, {$unshift: [7]});

      expect(originalData).toEqual([7, 1]);
    });

    it('does mutate the original object', function() {
      var obj = [1];
      update(obj, {$unshift: [7]});
      expect(obj).toEqual([7, 1]);
    });

    it('only unshifts an array', function() {
      expect(update.bind(null, [], {$unshift: 7})).toThrow(
        'update(): expected spec of $unshift to be an array; got 7. Did you ' +
        'forget to wrap your parameter in an array?'
      );
    });

    it('only unshifts unto an array', function() {
      expect(update.bind(null, 1, {$unshift: 7})).toThrow(
        'update(): expected target of $unshift to be an array; got 1.'
      );
    });

    it('keeps reference equality when possible', function() {
      var original = ['x'];
      expect(update(original, {$unshift: []})).toBe(original)
    });
  });

  describe('$splice', function() {
    it('splices', function() {
      expect(update([1, 4, 3], {$splice: [[1, 1, 2]]})).toEqual([1, 2, 3]);
    });

    it('does mutate the original object', function() {
      var obj = [1, 4, 3];
      update(obj, {$splice: [[1, 1, 2]]});

      expect(obj).toEqual([1, 2, 3]);
    });
    it('only splices an array of arrays', function() {
      expect(update.bind(null, [], {$splice: 1})).toThrow(
        'update(): expected spec of $splice to be an array of arrays; got 1. ' +
        'Did you forget to wrap your parameters in an array?'
      );
      expect(update.bind(null, [], {$splice: [1]})).toThrow(
        'update(): expected spec of $splice to be an array of arrays; got 1. ' +
        'Did you forget to wrap your parameters in an array?'
      );
    });
    it('only splices unto an array', function() {
      expect(update.bind(null, 1, {$splice: 7})).toThrow(
        'Expected $splice target to be an array; got 1'
      );
    });
    it('keeps reference equality when possible', function() {
      var original = ['x'];
      expect(update(original, {$splice: [[]]})).toBe(original)
    });
  });

  describe('$merge', function() {
    it('merges', function() {
      var obj = {a: 'b'};

      update(obj, {$merge: {c: 'd'}});

      expect(obj).toEqual({a: 'b', c: 'd'});
    });

    it('does mutate the original object', function() {
      var obj = {a: 'b'};

      update(obj, {$merge: {c: 'd'}});

      expect(obj).toEqual({a: 'b', c: 'd'});
    });
    it('only merges with an object', function() {
      expect(update.bind(null, {}, {$merge: 7})).toThrow(
        'update(): $merge expects a spec of type \'object\'; got 7'
      );
    });
    it('only merges with an object', function() {
      expect(update.bind(null, 7, {$merge: {a: 'b'}})).toThrow(
        'update(): $merge expects a target of type \'object\'; got 7'
      );
    });
    it('keeps reference equality when possible', function() {
      var original = {a: {b: {c: true}}};
      expect(update(original, {a: {$merge: {}}})).toBe(original);
      expect(update(original, {a: {$merge: { b: original.a.b }}})).toBe(original);

      // Merging primatives of the same value should return the original.
      expect(update(original, {a: {b: { $merge: {c: true} }}})).toBe(original);
    });

  });

  describe('$set', function() {
    it('throws if path not found', function() {
      var obj = {a: 3};

      expect(update.bind(null, obj, {a: {b: {$set: {c: 'd'}}}})).toThrow(
        '$set path not found'
      );
    });

    it('sets', function() {
      var obj = {a: {b: 3}};

      update(obj, {a: {b: {$set: {c: 'd'}}}})

      expect(obj).toEqual({a: {b: {c: 'd'}}});
    });

    it('should be nested under an accessor', function() {
      expect(update.bind(null, {a: {b: 2}}, {$set: 2})).toThrow(
        '$set should be nested in an accessor'
      );
    });

    it('does mutate the original object', function() {
      var obj = {a: 'b'};
      update(obj, {a: {$set: {c: 'd'}}});
      expect(obj).toEqual({a: {c: 'd'}});
    });

    it('keeps reference equality when possible', function() {
      var original = {a: 1};
      expect(update(original, {a: {$set: 1}})).toBe(original);
    });
  });

  describe('$unset', function() {
    it('unsets', function() {
      var obj = {a: 'b'};

      update(obj, {$unset: ['a']})

      expect(obj.a).toBe(undefined);
    });

    it('removes multiple keys from the object', function() {
      var obj = {a: 'b', c: 'd', e: 'f'};
      update(obj, {$unset: ['a', 'e']});

      expect('a' in obj).toBe(false);
      expect('e' in obj).toBe(false);
      expect('c' in obj).toBe(true);
    });

    it('does not remove keys from the inherited properties', function() {
      function Parent() { this.foo = 'Parent'; }
      function Child() {}
      Child.prototype = new Parent()
      var child = new Child();

      expect(update(child, {$unset: ['foo']}).foo).toEqual('Parent');
    });

    it('keeps reference equality when possible', function() {
      var original = {a: 1};
      expect(update(original, {$unset: ['b']})).toBe(original);
    });
  });

  describe('$apply', function() {
    var applier = function(value) {
      return value * 2;
    };

    function identity(val) {
      return val;
    }

    it('applies', function() {
      var obj = {v: 2};

      update(obj, {v: {$apply: applier}});

      expect(obj).toEqual({v: 4});
    });

    it('throws when not in path', function() {
      expect(update.bind(null, {v: 2}, {$apply: identity})).toThrow(
        '$apply should be nested in an accessor'
      );
    });

    it('does mutate the original object', function() {
      var obj = {v: 2};
      update(obj, {v: {$apply: applier}});
      expect(obj).toEqual({v: 4});
    });

    it('only applies a function', function() {
      expect(update.bind(null, 2, {$apply: 123})).toThrow(
        'update(): expected spec of $apply to be a function; got 123.'
      );
    });

    it('keeps reference equality when possible', function() {
      var original = {a: {b: {}}};

      expect(update(original, {a: {$apply: identity}})).toBe(original);
    });
  });

  describe('deep update', function() {
    it('works', function() {
      var obj = {
        a: 'b',
        c: {
          d: 'e',
          f: [1],
          g: [2],
          h: [3],
          i: {j: 'k'},
          l: 4,
        },
      };

      update(obj, {
        c: {
          f: {$push: [5]},
          g: {$unshift: [6]},
          h: {$splice: [[0, 1, 7]]},
          i: {$merge: {n: 'o'}},
          l: {$apply: function(x) { return x * 2 }},
        },
      })

      expect(obj).toEqual({
        a: 'b',
        c: {
          d: 'e',
          f: [1, 5],
          g: [6, 2],
          h: [7],
          i: {j: 'k', n: 'o'},
          l: 8,
        },
      });
    });
  });

  it('should accept array spec to modify arrays', function() {
    var original = {value: [{a: 0}]};

    update(original, {value: [{a: {$set: 5}}]});

    expect(original).toEqual({value: [{a: 5}]});
  });

  it('should accept object spec to modify arrays', function() {
    var original = {value: [{a: 0}]};
    var modified = update(original, {value: {'0': {a: {$set: 1}}}});
    expect(modified).toEqual({value: [{a: 1}]});
  });

  it('should reject arrays except as values of specific commands', function() {
    var specs = [
      [],
      {a: []},
      {a: {$set: []}, b: [[]]},
    ];
    specs.forEach(function(spec) {
      expect(update.bind(null, {a: 'b'}, spec)).toThrow(
        'update(): You provided an invalid spec to update(). The spec ' +
        'may not contain an array except as the value of $set, $push, ' +
        '$unshift, $splice or any custom command allowing an array value.'
      );
    });
  });

  it('should reject non arrays from $unset', function() {
    expect(update.bind(null, {a: 'b'}, {$unset: 'a'})).toThrow(
      'update(): expected spec of $unset to be an array; got a. ' +
      'Did you forget to wrap the key(s) in an array?'
    );
  });

  it('should require a plain object spec containing command(s)', function() {
    var specs = [
      null,
      false,
      {a: 'c'},
      {a: {b: 'c'}},
    ];
    specs.forEach(function(spec) {
      expect(update.bind(null, {a: 'b'}, spec)).toThrow(
        'update(): You provided an invalid spec to update(). The spec ' +
        'and every included key path must be plain objects containing one ' +
        'of the following commands: $push, $unshift, $splice, $set, $unset, ' +
        '$merge, $apply.'
      );
    });
  });
});

describe('update', function() {
  // TODO: make it work with symbols
  return;
  if (typeof Symbol === 'function' && Symbol('TEST').toString() === 'Symbol(TEST)') {
    describe('works with symbols', function() {
      it('in the source object', function() {
        var obj = {a: 1};
        obj[Symbol.for('b')] = 2;
        expect(update(obj, {c: {$set: 3}})[Symbol.for('b')]).toEqual(2);
      });
      it('in the spec object', function() {
        var obj = {a: 1};
        obj[Symbol.for('b')] = 2;
        var spec = {};
        spec[Symbol.for('b')] = {$set: 2};
        expect(update(obj, spec)[Symbol.for('b')]).toEqual(2);
      });
      it('in the $merge command', function() {
        var obj = {a: 1};
        obj[Symbol.for('b')] = {c: 3};
        obj[Symbol.for('d')] = 4;
        var spec = {};
        spec[Symbol.for('b')] = { $merge: {} };
        spec[Symbol.for('b')].$merge[Symbol.for('e')] = 5;
        var updated = update(obj, spec);
        expect(updated[Symbol.for('b')][Symbol.for('e')]).toEqual(5);
        expect(updated[Symbol.for('d')]).toEqual(4);
      });
    });
  }

});
