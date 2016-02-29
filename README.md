# ng-server-validate

##Install

```
bower install ng-server-validate --save
```

##Usage
Add dependency 'ng-server-validate' in your application module declaration.

```js
angular.module('yourApp', [
    'ng-server-validate'
])
```

For errors response like this:

```json
{  
   "message": "Validation error",
   "errors": {
       "errors_internal_bla": {  
           "username": [  
              "Username is required and can't be empty"
           ]
       }
   }
}
```

use this configuration

```js
.config(function (ngServerValidateConfigProvider) {
    ngServerValidateConfigProvider.setConfig({
        root: 'errors.errors_internal_bla', // root element for all errors
        field: '__key__', // __key__ -> field (input's name in HTML)
    });
});
```

For errors like this:

```json
[
    {"field_name": "username", "message_name": "Username is required and can't be empty"}
]
```

use this configuration

```js
.config(function (ngServerValidateConfigProvider) {
    ngServerValidateConfigProvider.setConfig({
        root: null, // no root element
        field: 'field_name', // name -> field (input's name in HTML)
        message: 'message_name'
    });
});
```

In your template add the 'ng-server-validate' attribute to the form in which you would like to receive server-side validation errors.

```html
<form data-ng-submit="form.submit()" name="form" role="form" novalidate data-ng-server-validate>
    <div class="form-group" data-ng-class="{'has-error': (form.$submitted || form.email.$dirty) && form.email.$invalid}">
        <input data-ng-model="form.username" name="username" type="text" required>
        <div data-ng-messages="form.username.$error" role="alert" data-ng-if="form.$submitted || form.username.$dirty">
            <span data-ng-message="required" class="help-block">Username cannot be blank.</span>
            <span data-ng-message="server" class="help-block">{{form.username.$error.server}}</span>
        </div>
    </div>
</form>
```