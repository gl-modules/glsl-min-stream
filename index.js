module.exports = minifier

var lang = require('cssauron-glsl')
  , is_variable = lang('decl > decllist > ident')
  , is_function = lang('decl > function > ident')
  , is_named_struct = lang('struct > ident')
  , through = require('through')
  , shortest = require('shortest')

function minifier(safe_words, mutate_storages) {
  safe_words = safe_words || ['main']

  var _ = {}
    , seen_names = {}
    , non_free_variables = {}
    , counter

  for(var i = 0, len = safe_words.length; i < len; ++i)
    _[safe_words[i]] = true
  safe_words = _

  counter = shortest()

  return through(mutate)

  function freeVariable () {
    var variable;
    do {
      variable = counter();
    } while (variable in non_free_variables);
    return variable;
  }

  function mutate(node) {
    if(should_mutate(node)) {
      var t = node.parent.parent.children[1]
      if(mutate_storages || (t.type === 'placeholder' || t.token.data === 'const')) {
        var x = seen_names[node.token.data] || freeVariable()
        seen_names[node.token.data] = x
        node.data = x
      }
      else {
        non_free_variables[node.token.data] = t.token.data;
      }
    }

    this.emit('data', node)
  }

  function should_mutate(node) {
    var base = (
      is_variable(node) ||
      is_function(node) ||
      is_named_struct(node)
    )

    return base &&
          !safe_words.hasOwnProperty(node.token.data)
  }
}
