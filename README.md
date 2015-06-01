# Dropdown
UI dropdown replacement for html select with suggestions feature: see filtered options while you type into the field!

# Usage
## Initialization exapmle

```javascript
var data = [];

data.push({
    id : 1,
    name : 'Foo Bar',
    img : 'img/1.jpg'
});
data.push({
    id : 1,
    name : 'Foo Bar',
    img : 'img/1.jpg'
});

var d = new dropdown.Dropdown({
    container : "dropdown-container-1",
    autoRender : true,
    data : data,
    showAvatars : true,
    dataSourceUrl : '/suggest'
});
```

## Options
<table>
    <tr>
        <td>autoRender</td><td>If true dropdown will be auto rendered after creating. Defaults to false. You can call render() manually.</td>
    </tr>
    <tr>
        <td>container</td><td>Id of node or node itself where dropdown will be rendered.</td>
    </tr>
    <tr>
        <td>data</td><td>Array of data for dropdown.</td>
    </tr>
    <tr>
        <td>dataSourceUrl</td><td>Url to fetch additional data from server while you type.</td>
    </tr>
    <tr>
        <td>inputTimeout</td><td>The length of time in milliseconds after user input ends to start the filtering. Defaults to 200.</td>
    </tr>
    <tr>
        <td>maxSize</td><td>Maximum number of elements to show in expanded list. Defaults to 20.</td>
    </tr>
    <tr>
        <td>cssPrefix</td><td>Prefix of dropdown css classes. Defaults to 'vk'.</td>
    </tr>
    <tr>
        <td>singleSelect</td><td>Set to true if only one element selection is allowed. Defaults to false.</td>
    </tr>
</table>

## API
<table>
    <tr>
        <td>deselectItem(itemId)</td><td>To deselect one of dropdown items. itemId is internal auto-generated id of dropdown item.</td>
    </tr>
    <tr>
        <td>destroy()</td><td>Destroys dropdown.</td>
    </tr>
    <tr>
        <td>filter(query)</td><td>To filter dropdown items by name with text query.</td>
    </tr>
    <tr>
        <td>getValue()</td><td>Get array of currently selected dropdown items.</td>
    </tr>
    <tr>
        <td>render()</td><td>Manually render the dropdown.</td>
    </tr>
    <tr>
        <td>selectItem(itemId)</td><td>To select one of dropdown items. itemId is internal auto-generated id of dropdown item.</td>
    </tr>
</table>

# Demo

http://alexvorobyov.ru/vk/

# Server
Test nodejs server is also provided and can be found in "server" folder. You can run it with nodejs and use as data source for dropdown suggestions.

# Browser support
IE8+, Chrome, Firefox, Safari, Opera 12+