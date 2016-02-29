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

For errors response:
###Custom errors response
```json
{  
   "errors": {
       "errors_internal_bla": {  
           "username": [  
              "Username is required and can't be empty",
              "Username should contain latin letters only"
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

If errors messages more than 1, always be displayed first message (in case from above will be displayed - ``Username is required and can't be empty``)

###Yii2 RESTApi style:  

```json
[
    {"field": "username", "message": "Username is required and can't be empty"}
]
```

use this configuration

```js
.config(function (ngServerValidateConfigProvider) {
    ngServerValidateConfigProvider.setConfig({
        root: null, // no root element
        field: 'field',     // field key from JSON response, also it is input's name in HTML -> <input name="username" type="text">
        message: 'message'  // message key from JSON response. Will be displayed as error message fpr specified input
    });
});
```

###ZF2 apigility style

```json
{
    "detail": "Failed Validation",
    "status": 422,
    "title": "Unprocessable Entity",
    "type": "http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html",
    "validation_messages": {
        "message": {
            "isEmpty": "Value is required and can't be empty"
        },
        "username": {
            "regexNotMatch": "Invalid user supplied."
        }
    }
}
```

use this configuration

```js
.config(function (ngServerValidateConfigProvider) {
    ngServerValidateConfigProvider.setConfig({
        root: 'validation_messages',
        field: '__key__'
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