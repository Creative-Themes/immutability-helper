var invariant = require('invariant');

var hasOwnProperty = Object.prototype.hasOwnProperty;
var splice = Array.prototype.splice;

var assign = Object.assign || /* istanbul ignore next */ function assign(target, source) {
  getAllKeys(source).forEach(function(key) {
    if (hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  });
  return target;
};

var getAllKeys = typeof Object.getOwnPropertySymbols === 'function' ?
  function(obj) { return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj)) } :
  /* istanbul ignore next */ function(obj) { return Object.keys(obj) };

/* istanbul ignore next */
function copy(object) {
  if (object instanceof Array) {
    return object.slice();
  } else if (object && typeof object === 'object') {
    return assign(new object.constructor(), object);
  } else {
    return object;
  }
}

function newContext() {
  var commands = assign({}, defaultCommands);
  update.extend = function(directive, fn) {
    commands[directive] = fn;
  };

  return update;

  function update(object, spec, originalSpec, originalObject) {
    if (!(Array.isArray(object) && Array.isArray(spec))) {
      invariant(
        !Array.isArray(spec),
        'update(): You provided an invalid spec to update(). The spec may ' +
        'not contain an array except as the value of $set, $push, $unshift, ' +
        '$splice or any custom command allowing an array value.'
      );
    }

    invariant(
      typeof spec === 'object' && spec !== null,
      'update(): You provided an invalid spec to update(). The spec and ' +
      'every included key path must be plain objects containing one of the ' +
      'following commands: %s.',
      Object.keys(commands).join(', ')
    );

    var specKeys = getAllKeys(spec);

    getAllKeys(spec).forEach(function(key) {
      if (hasOwnProperty.call(commands, key)) {
        commands[key](spec[key], object, spec, originalSpec || spec, originalObject || object);
      } else {
        update(object[key], spec[key], originalSpec || spec, originalObject || object);
      }
    })

    return object;
  }

}

var defaultCommands = {
  $push: function(value, nextObject, spec) {
    invariantPushAndUnshift(nextObject, spec, '$push');

    nextObject.push[
      value.length ? 'apply' : 'call'
    ](nextObject, value)
  },

  $unshift: function(value, object, spec) {
    invariantPushAndUnshift(object, spec, '$unshift');
    object.unshift.apply(object, value);
  },

  $splice: function(value, object, spec) {
    invariantSplices(object, spec);

    value.forEach(function(args) {
      invariantSplice(args);
      splice.apply(object, args);
    });
  },

  $set: function(value, object, spec, originalSpec, originalObject) {
    invariantSet(spec, originalSpec);

    var stack = searchForSubnode("", originalObject, object);

    if (! stack) {
      throw "$set path not found"
    }

    stack = stack.split('/');

    stack.splice(0, 1);

    var pointer = originalObject; // points to the current nested object

    for (var i = 0, len = stack.length; i < len; i++) {
        var path = stack[i];

        if (pointer.hasOwnProperty(path)) {
            if (i === len - 1) { // terminating condition
                pointer[path] = value;
            } else {
                pointer = pointer[path];
            }
        } else {
          throw "$set path not found"
        }
    }
  },

  $unset: function(value, object, spec, originalSpec, originalObject) {
    invariant(
      Array.isArray(value),
      'update(): expected spec of $unset to be an array; got %s. ' +
      'Did you forget to wrap the key(s) in an array?',
      value
    );

    value.forEach(function(key) {
      if (Object.hasOwnProperty.call(object, key)) {
        delete object[key];
      }
    });
  },

  $merge: function(value, object, spec) {
    invariantMerge(object, value);

    getAllKeys(value).forEach(function(key) {
      if (value[key] !== object[key]) {
        object[key] = value[key];
      }
    });
  },

  $apply: function(fn, object, spec, originalSpec, originalObject) {
    invariantApply(fn, spec, originalSpec);

    var stack = searchForSubnode("", originalObject, object);

    if (! stack) {
      throw "$set path not found"
    }

    stack = stack.split('/');

    stack.splice(0, 1);

    var pointer = originalObject; // points to the current nested object

    for (var i = 0, len = stack.length; i < len; i++) {
        var path = stack[i];

        if (pointer.hasOwnProperty(path)) {
            if (i === len - 1) { // terminating condition
                pointer[path] = fn(pointer[path]);
            } else {
                pointer = pointer[path];
            }
        } else {
          if (! object) {
            throw "$set path not found"
          }
        }
    }
  },
};

module.exports = newContext();
module.exports.newContext = newContext;

// invariants

function invariantPushAndUnshift(value, spec, command) {
  invariant(
    Array.isArray(value),
    'update(): expected target of %s to be an array; got %s.',
    command,
    value
  );
  var specValue = spec[command];
  invariant(
    Array.isArray(specValue),
    'update(): expected spec of %s to be an array; got %s. ' +
    'Did you forget to wrap your parameter in an array?',
    command,
    specValue
  );
}

function invariantSplices(value, spec) {
  invariant(
    Array.isArray(value),
    'Expected $splice target to be an array; got %s',
    value
  );
  invariantSplice(spec['$splice']);
}

function invariantSplice(value) {
  invariant(
    Array.isArray(value),
    'update(): expected spec of $splice to be an array of arrays; got %s. ' +
    'Did you forget to wrap your parameters in an array?',
    value
  );
}

function invariantApply(fn, spec, originalSpec) {
  invariant(
    typeof fn === 'function',
    'update(): expected spec of $apply to be a function; got %s.',
    fn
  );

  invariant(
    (spec !== originalSpec && !originalSpec['$apply']),
    '$apply should be nested in an accessor'
  );
}

function invariantSet(spec, originalSpec) {
  invariant(
    Object.keys(spec).length === 1,
    'Cannot have more than one key in an object with $set'
  );

  invariant(
    (spec !== originalSpec && !originalSpec['$set']),
    '$set should be nested in an accessor'
  );
}

function invariantMerge(target, specValue) {
  invariant(
    specValue && typeof specValue === 'object',
    'update(): $merge expects a spec of type \'object\'; got %s',
    specValue
  );
  invariant(
    target && typeof target === 'object',
    'update(): $merge expects a target of type \'object\'; got %s',
    target
  );
}


// https://stackoverflow.com/questions/8790607/javascript-json-get-path-to-given-subnode
function searchForSubnode(path, obj, target) {
    for (var k in obj) {
        if (obj.hasOwnProperty(k))
            if (obj[k] === target)
                return path + '/' + k;
            else if (typeof obj[k] === "object") {
                var result = searchForSubnode(path + '/' + k, obj[k], target);
                if (result)
                    return result;
            }
    }

    return false;
}

