function SchemaItem(ui_elem, get_value_func) { // constructor
  this.ui_elem = ui_elem;
  this.name = ui_elem.attr('name');

  this.behaviour = new Array();
  var closure_this = this;

  ui_elem.si_behave = function() {
    closure_this.behave();
  };

  ui_callback = 
    function() {
      CalcTool.change_callback(closure_this);
      ui_elem.si_behave();
    }
  ui_elem.blur(ui_callback);
  ui_elem.change(ui_callback);

  ui_elem.si_get_value = function() {
    return get_value_func(this);
  };

}

SchemaItem.prototype.get_value = function() {
  return this.ui_elem.si_get_value();
};

SchemaItem.prototype.behave = function() {
  var behaviour = this.behaviour;
  var empty_f = function(){};
  with (CalcTool) {
    for (var i =0; i < behaviour.length; ++i) {
      var bhv = behaviour[i];
      // it looks like very complex but it's short and simple
      // we call a condition (func at [0]) and by result of it select the
      // action or opposite ([1] or [2]) and call it, falling back to empty
      // function to avoid extra verifications and keep it short
      (bhv[bhv[0](this, data) ? 1 : 2] || empty_f)(this, data);
    }
  }
};

SchemaItem.prototype.add_behaviour = function(condition_f, action_f, opposite_act_f) {
  this.behaviour.push([condition_f, action_f, opposite_act_f]);
  return this;
};

var CalcTool = {
  do_remote: false, // indicates where the calculation done: locally via formula or remotely via calculate_url
  calculate_url: "/getmevalue.php", // example: url called with POST data=<JSON of CalcTool.data> if remote calculation
  formula: "2*Math.PI*radius*radius", // example: formula if local calculation
  data: {'radius': 1.44}, // example: initial data
  change_callback: null,

  schema_items: { },

  init: function(on_change_callback, init_hook) {
    if (init_hook) {
      init_hook(this);
    }
    this.change_callback = on_change_callback;
    this.change_callback();
  },

  register_item: function(schema_item) {
    schema_item.behave();
    this.schema_items[schema_item.name] = schema_item;
    this.register_data(schema_item);
  },

  register_data: function(schema_item) {
    this.data[schema_item.name] = schema_item.get_value();
  },

  calculate: function(ui_update_callback) {
    with (CalcTool) {
      for (name in schema_items) {
        register_data(schema_items[name])
      }
      if (do_remote) {
        ui_update_callback('??'); // so that user see calculation is in progress. FIXME: magic string
        jQuery.ajax({
          url:     calculate_url,
          type:    'POST',
          data:    'data=' + jQuery.toJSON(data),
        }).done(ui_update_callback);
      } else {
        with (data) {
          ui_update_callback(eval(formula));
        }
      }
    }
  }

};

// string minus number zero just typecast from string to number
// so you'll get correct 0.3 + 9 = 9.3 instead of "0.3" + 9 = "0.39"
function get_value_basic(ui_elem) {
  return ui_elem.attr('value') - 0;
}

function get_value_select(ui_elem) {
  return ui_elem.val() - 0;
}


