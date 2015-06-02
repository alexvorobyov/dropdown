var dropdown;
if (!dropdown) {
  dropdown = {};
}

dropdown.Dropdown = function(opts) {
  opts = opts || {};

  this.container = typeof opts.container === 'string' ? document.getElementById(opts.container) : opts.container;

  if (!this.container) {
    console.error('container is not initialized');
    return this;
  }

  this.container.style.position = 'relative';

  this.cssPrefix = opts.cssPrefix || 'vk';

  this.showAvatars = !!opts.showAvatars;
  this.singleSelect = !!opts.singleSelect;

  this.expanded = false;
  this.maxSize = opts.maxSize || 20;
  this.inputTimeout = opts.inputTimeout || 200;

  this.data = {};
  this.dataLength = 0;
  this.selectedItems = {};
  this.itemsIds = {};
  this.dataSourceUrl = opts.dataSourceUrl;

  this.highlightedItem = null;

  this.listeners = {
    click : null,
    inputKeyUp : null,
    inputBlur : null,
    inputFocus : null
  };

  this.loadData(opts.data || []);

  opts.autoRender && this.render();
};

dropdown.Dropdown.prototype.clearFilter = function() {
  if (this.input) {
    this.input.value = '';
  }
  delete this.filteredData;
};

dropdown.Dropdown.prototype.destroy = function() {
  delete this.data;
  delete this.filteredData;
  this.container.parentNode.removeChild(this.container);
};

dropdown.Dropdown.prototype.deselectItem = function(itemId) {
  if (this.selectedItems[itemId]) {
    delete this.selectedItems[itemId];
    this._removeSelectedItem(this.data[itemId]);
  }
};

dropdown.Dropdown.prototype.filter = function(query) {
  var filteredData = {};
  query = (query || '').toLowerCase().replace(/^\s+|\s+$/gm, '');
  if (query) {
    var versions = dropdown.helpers.textVersions(query);
    for (var itemId in this.data) {
      var item = this.data[itemId];

      if (this.selectedItems[itemId]) continue;

      var itemName = item._normalizedName;

      for (var i = 0, len = versions.length; i < len; i++) {
        var version = versions[i];
        if (version && new RegExp(version.replace(/([^A-Za-zА-Яа-я])/, '\\$1')).exec(itemName)) {
          filteredData[item._id] = item;
          break;
        }
      }
    }
    this.filteredData = filteredData;
  }
  else {
    this.clearFilter();
    return null;
  }

  return filteredData;
};

dropdown.Dropdown.prototype.getValue = function() {
  var ret = [];
  for (var itemId in this.selectedItems) ret.push(this.selectedItems[itemId]);
  return ret;
};

dropdown.Dropdown.prototype.hideList = function() {
  this.expanded = false;
  this.list.style.display = 'none';
};

dropdown.Dropdown.prototype.loadData = function(data, filtered) {
  for (var i = 0, item; item = data[i++];) {
    if (this.itemsIds[item.id]) {
      continue;
    }
    item._id = ('dropdown-' + Math.random()).replace('.', '');
    item._normalizedName = item.name.toLowerCase().replace(/й/g, 'и').replace(/ё/g, 'е').replace(/ь/g, '').replace(/ъ/g, '');
    this.data[item._id] = item;
    this.itemsIds[item.id] = true;
    this.dataLength++;

    if (filtered && this.filteredData) {
      this.filteredData[item._id] = item;
    }
  }
  return this;
};

dropdown.Dropdown.prototype.render = function() {
  if (!this.container) return;

  var dropDownHTML = '<div class="' + this.cssPrefix + '-dropdown-input">' +
    '<div class="' + this.cssPrefix + '-dropdown-selected"></div><input placeholder="Enter name or email" type="text" /><div class="' + this.cssPrefix + '-dropdown-arrow">&#9660;</div>' +
    '</div>' +
    '<div class="' + this.cssPrefix + '-dropdown-list"></div>';

  this.container.innerHTML = dropDownHTML;
  this.input = this.container.querySelector('input');
  this.selectedContainer = this.container.querySelector('.' + this.cssPrefix + '-dropdown-selected');
  this.arrow = this.container.querySelector('.' + this.cssPrefix + '-dropdown-arrow');
  this.arrowOffset = this.arrow.offsetLeft;
  this.list = this.container.querySelector('.' + this.cssPrefix + '-dropdown-list');

  this.list.style.width = this.container.offsetWidth + 'px';

  this._updateInput();

  dropdown.helpers.addEventListener(this.container, 'click', this.listeners.click = this._click.bind(this));
  dropdown.helpers.addEventListener(this.input, 'keydown', this.listeners.inputKeyUp = this._inputKeyUp.bind(this));
  dropdown.helpers.addEventListener(this.input, 'focus', this.listeners.inputFocus = this._inputFocus.bind(this));
  dropdown.helpers.addEventListener(this.input, 'blur', this.listeners.inputBlur = this._inputBlur.bind(this));
};

dropdown.Dropdown.prototype.selectItem = function(itemId) {
  if (!this.selectedItems[itemId] && this.data[itemId]) {

    if (this.singleSelect) {
      var selectedItemsIds = Object.keys(this.selectedItems);
      if (selectedItemsIds.length) {
        this._removeSelectedItem(this.data[selectedItemsIds[0]]);
        this.selectedItems = {};
      }
    }

    this.selectedItems[itemId] = this.data[itemId];
    this._addSelectedItem(this.data[itemId]);

    delete this.highlightedItem;
  }
};

dropdown.Dropdown.prototype.serverFilter = function(query) {
  if (!this.dataSourceUrl || !query.split(' ').join('')) return;

  if (this.activeQuery) {
    this.activeQuery.abort();
  }

  this.activeQuery = dropdown.xhr.xhr(this.dataSourceUrl + '?query=' + encodeURIComponent(query), null, function(error, data) {
    if (!error && data && data.length) {
      if (this.input.value) {
        this.loadData(data, true);
        this._renderItems();
      }
    }
  }.bind(this));
};

dropdown.Dropdown.prototype.showList = function() {
  this.expanded = true;
  this.list.style.display = 'block';
};

dropdown.Dropdown.prototype.toggleExpand = function() {
  if (!this.expanded) {
    this._renderItems();
  }
  this.list.style.display = this.expanded ? 'none' : 'block';
  this.expanded = !this.expanded;
};

dropdown.Dropdown.prototype._addSelectedItem = function(item) {
  var selectedItemDiv = document.createElement('div');
  selectedItemDiv.className = this.cssPrefix + '-dropdown-selected-item';
  selectedItemDiv.innerHTML = this._itemHTML(item) + '<span class="' + this.cssPrefix + '-dropdown-selected-item-close"/>';

  var existedItem = document.getElementById(item._id);
  if (existedItem) {
    existedItem.parentNode.removeChild(existedItem);
  }

  this.selectedContainer.appendChild(selectedItemDiv);

  this.toggleExpand();
  this.clearFilter();
  this._updateInput();
};

dropdown.Dropdown.prototype._click = function(event) {
  var target = event.target || event.srcElement;
  var elem;
  var prevent = false;

  if (~target.className.indexOf(this.cssPrefix + '-dropdown-arrow')) {
    this.toggleExpand();
    this.input[this.expanded ? 'focus' : 'blur']();
    prevent = true;
  }
  else if (~target.className.indexOf(this.cssPrefix + '-dropdown-selected-item-close')) {
    if (target.previousSibling && target.previousSibling.id) {
      this.deselectItem(target.previousSibling.id);
      prevent = true;
    }
  }
  else if (elem = this._findElementUp(target)) {
    this.selectItem(elem.id);
    prevent = true;
  }

  if (prevent) {
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
  }
};

dropdown.Dropdown.prototype._findElementUp = function(elem, count) {
  count = count || 0;

  if (count > 5 || elem === document.body) return null;

  count++;

  if (!elem.getAttribute('data-list-item')) {
    return this._findElementUp(elem.parentNode, count);
  }
  else {
    return elem;
  }
};

dropdown.Dropdown.prototype._handleArrowKeys = function(keyCode) {
  var data = {};
  if (this.filteredData) {
    data = this.filteredData;
  }
  else {
    for (var id in this.data) {
      if (!this.selectedItems[id]) data[id] = this.data[id];
    }
  }
  var ids = Object.keys(data);
  var highlight = null;
  var multiplier = keyCode == 40 ? 1 : -1;

  if (keyCode == 40 || keyCode == 38) {
    if (!('highlightedItem' in this)) {
      highlight = keyCode == 40 ? 0 : ids.length - 1;
    }
    else if (data[ids[this.highlightedItem + multiplier]]) {
      highlight = this.highlightedItem + multiplier;
    }
  }
  else if (keyCode == 13 && 'highlightedItem' in this) {
    this.selectItem(data[ids[this.highlightedItem]]._id);
  }

  if (highlight !== null) {
    if (!this.expanded) {
      this.toggleExpand();
    }
    if (this.prevHighlighted) {
      this.prevHighlighted.className = this.prevHighlighted.className.replace(this.cssPrefix + '-dropdown-item-highlighted', '');
    }
    var toHighlight = document.getElementById(data[ids[highlight]]._id);
    toHighlight.className += ' ' + this.cssPrefix + '-dropdown-item-highlighted';
    this.prevHighlighted = toHighlight;
    this.highlightedItem = highlight;
  }
};

dropdown.Dropdown.prototype._itemHTML = function(item) {
  return '<div class="' + this.cssPrefix + '-dropdown-item" id="' + item._id + '" data-list-item="1">' +
    (this.showAvatars && item.img ? '<img src="' + item.img + '" />' : '') +
    '<span>' + item.name + '</span>' +
    '</div>'
};

dropdown.Dropdown.prototype._inputKeyUp = function(event) {
  if (this.input.value && !this.expanded) {
    this.toggleExpand();
  }

  var keyCode = event.keyCode || event.which;
  if (keyCode == 27) {
    this.clearFilter();
    this.hideList();
    return;
  }
  else if (~[40, 38, 13].indexOf(keyCode)) {
    this._handleArrowKeys(keyCode);
    return;
  }

  clearTimeout(this.filterTimeout);
  this.filterTimeout = setTimeout(function() {
    this.filter(this.input.value);
    this._renderItems();
    this.serverFilter(this.input.value);
  }.bind(this), this.inputTimeout);
};

dropdown.Dropdown.prototype._inputBlur = function() {
  this.expanded && setTimeout(this.hideList.bind(this), 150);
};

dropdown.Dropdown.prototype._inputFocus = function() {
  !this.expanded && this.toggleExpand();
};

dropdown.Dropdown.prototype._renderItems = function() {
  if (!this.list) return;

  var dataToRender = this.filteredData || this.data;
  delete this.highlightedItem;

  var itemsHTML = [];
  var itemsCounter = 0;
  for (var itemId in dataToRender) {
    var item = this.data[itemId];

    if (this.selectedItems[itemId]) continue;

    itemsHTML.push(this._itemHTML(item));

    if (++itemsCounter > this.maxSize) {
      break;
    }
  }

  this.list.innerHTML = itemsHTML.length ? itemsHTML.join('') : (this.input.value ? '<div class="' + this.cssPrefix + '-dropdown-nothing-found">Nothing found</span>' : '');
};

dropdown.Dropdown.prototype._updateInput = function() {
  this.input.style.width = 'auto';
  this.input.style.width = (this.arrowOffset - this.input.offsetLeft - 10) + 'px';
};

dropdown.Dropdown.prototype._removeSelectedItem = function(item) {
  var selectedItem = document.getElementById(item._id);
  if (selectedItem) {
    selectedItem = selectedItem.parentNode;
    selectedItem.parentNode.removeChild(selectedItem);
  }
  this.hideList();
  this.clearFilter();

  this._updateInput();
};

