var Backbone = require('../node_modules/backbone/backbone');
var $ = require('../node_modules/jquery/dist/jquery');
var _ = require('../node_modules/underscore/underscore');

//=============================================
// model
//=============================================

var Item = Backbone.Model.extend({
  defaults: {
    text: '',
    isDone: false,
    editMode: false
  }
});
var Form = Backbone.Model.extend({
  defaults: {
    val: '',
    hasError: false,
    errorMsg: ''
  }
});

var Search = Backbone.Model.extend({
  defaults: {
    val: ''
  }
});
var form = new Form();
var search = new Search();

//=============================================
// collection
//=============================================
var LIST = Backbone.Collection.extend({
  model: Item
});

var item1 = new Item({ text: 'sample todo1' });
var item2 = new Item({ text: 'sample todo2' });
var list = new LIST([item1, item2]);


//=============================================
// view
//=============================================

var ItemView = Backbone.View.extend({
  template: _.template($('#template-list-item').html()),
  events: {
    'click .js-toggle-done': 'toggleDone',
    'click .js-click-trash': 'remove',
    'click .js-todo_list-text': 'showEdit',
    'keyup .js-todo_list-editForm': 'closeEdit'
  },
  initialize: function (option) {
    _.bindAll(this, 'toggleDone', 'render', 'remove', 'showEdit', 'closeEdit');
    //オブザーバーパターンを利用してモデルのイベントを参照
    this.model.bind('change', this.render);
    this.model.bind('destroy', this.remove);
    this.render();
  },
  update: function (text) {
    this.model.set({ text: text });
  },
  toggleDone: function () {
    this.model.set({ isDone: !this.model.get('isDone') });
  },
  remove: function () {
    $(this.el).remove();
    return this;

  },
  showEdit: function () {
    this.model.set({ editMode: true });
  },
  closeEdit: function (e) {
    if (e.keyCode === 13 && e.shiftKey === true) {
      this.model.set({ text: e.currentTarget.value, editMode: false });
    }
  },
  render: function () {
    console.log('render_item');
    var template = this.template(this.model.attributes);
    this.$el.html(template);
    return this;
  }
});

var ListView = Backbone.View.extend({
  el: $('.js-todo_list'),
  //collection: list,
  initialize: function () {
    _.bindAll(this, 'render', 'addItem', 'appendItem');
    this.collection.bind('add', this.appendItem);
    this.render();
  },
  addItem: function (text) {
    var model = new Item({ text: text });
    this.collection.add(model); // addイベントが発生し、this.appendItemが呼ばれる
  },
  appendItem: function (model) {
    var itemView = new ItemView({ model: model });
    this.$el.append(itemView.render().el);
  },
  render: function () {
    console.log('render_list');
    var that = this;
    this.collection.each(function (model, i) {
      that.appendItem(model);
    });
    return this;
  }
});

var listView = new ListView({ collection: list });

var FormView = Backbone.View.extend({
  el: $('.js-form'),
  template: _.template($('#template-form').html()),
  model: form,
  events: {
    'click .js-add-todo': 'addTodo'
  },
  initialize: function (option) {
    _.bindAll(this, 'render', 'addTodo');
    this.model.bind('change', this.render);
    this.render();
  },

  addTodo: function (e) {
    e.preventDefault();
    if ($('.js-get-val').val() === '') {
      this.model.set({ hasError: true, val: $('.js-get-val').val() });
    } else {
      this.model.set({ hasError: false, val: $('.js-get-val').val() });
      console.log(this.model.get('val'));
      listView.addItem(this.model.get('val'));
    }

  },
  render: function () {
    console.log('render_form');
    var template = this.template(this.model.attributes);
    this.$el.html(template);
    return this;
  }
});
new FormView();

var SearchView = Backbone.View.extend({
  el: $('.js-search_box'),
  template: _.template($('#template-search').html()),
  model: search,
  events: {
    'keyup .js-search': 'searchItem'
  },
  initialize: function (option) {
    _.bindAll(this, 'render', 'searchItem');
    this.model.bind('change', this.render);
    this.render();
  },

  searchItem: function () {
    var regexp = new RegExp('^' + $('.js-search').val());
    listView.collection.each(function (model, i) {
      if (model.get('text') && model.get('text').match(regexp)) {
        console.log('ok');
        $(listView.el).children().eq(i).show();
        return true;
      }
      console.log('no');
      $(listView.el).children().eq(i).hide();

    });
  },
  render: function () {
    var template = this.template(this.model.attributes);
    this.$el.html(template);
    return this;
  }
});

new SearchView();
