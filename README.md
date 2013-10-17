Percival
=================

A boolean syntax tree editor for AngularJS. A demo is available [here](http://lorem--ipsum.github.io/percival/).

### What's that ? ###
It's a directive that allows the user to edit boolean expression, just like the Apple iTunes smart playlists creator.

### What does it do ? ###
It takes an Abstract Syntax Tree :
```js
var ast = {
  or: [
    {
      and: [
        {field: "an_int_field", op: {id: "eq", text: "=="}, rhs: {realtype: "int", value: {}}}
      ]
    },
    {
      field: "an_int_field",
      op: {id: "eq", text: "=="},
      rhs: {realtype: "int", value: "tutu"}
    }
  ]
};
```

and creates an user-friendly form to edit it.

### How to use ###
This is taken from the sample app (see the gh-pages branch).

Include the `percival.min.js` somewhere in your project, add the module to your app's dependencies and you're almost done.

In your HTML file, just add the following line :
```html
<editor types="my_types" conditions="ast"></editor>
```

#### Types
The types describe what kind of field the boolean expression can contain, and how Percival should handle them. They should look like this :

```js
$scope.types = [
  {realtype: 'int', field: 'an_int_field', label: 'Integer'},
  {realtype: 'string', field: 'a_string_field', label: 'String'},
  {realtype: 'datems', field: 'a_date_field', label: 'Date'}
];
```
+ `realtype` : this indicates to Percival what primitive type this type really is. You may want Percival to distinguish two types even if they are both dates.
+ `field` : this is the type's id.
+ `label` : this is what will be shown in the type selection box.


#### Conditions
The conditions (also called ast for Abstract Syntax Tree) should look like this :

```js
$scope.ast = {
  or: [
    {
      and: [
        {field: "an_int_field", op: {id: "eq", text: "=="}, rhs: {realtype: "int", value: {}}}
      ]
    },
    {
      field: "an_int_field",
      op: {id: "eq", text: "=="},
      rhs: {realtype: "int", value: "tutu"}
    }
  ]
}
```

You can also give an empty object : `{}`. Percival will create an empty root group for you.

### Tests ###
It is well-tested thanks to Karma, PhantomJS, and Jasmine.
