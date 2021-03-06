import { createElement, Children, Component } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import createContext from 'create-react-context';
import cloneDeep from 'lodash.clonedeep';
import toPath from 'lodash.topath';
import isEqual from 'react-fast-compare';
import warning from 'warning';
import { polyfill } from 'react-lifecycles-compat';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

var FormikProvider = (_a = createContext({}), _a.Provider), FormikConsumer = _a.Consumer;
function connect(Comp) {
    var C = function (props) { return (createElement(FormikConsumer, null, function (formik) { return createElement(Comp, __assign({}, props, { formik: formik })); })); };
    C.WrappedComponent = Comp;
    return hoistNonReactStatics(C, Comp);
}
var _a;

function getIn(obj, key, def, p) {
    if (p === void 0) { p = 0; }
    var path = toPath(key);
    while (obj && p < path.length) {
        obj = obj[path[p++]];
    }
    return obj === undefined ? def : obj;
}
function setIn(obj, path, value) {
    var res = {};
    var resVal = res;
    var i = 0;
    var pathArray = toPath(path);
    for (; i < pathArray.length - 1; i++) {
        var currentPath = pathArray[i];
        var currentObj = getIn(obj, pathArray.slice(0, i + 1));
        if (resVal[currentPath]) {
            resVal = resVal[currentPath];
        }
        else if (currentObj) {
            resVal = resVal[currentPath] = cloneDeep(currentObj);
        }
        else {
            var nextPath = pathArray[i + 1];
            resVal = resVal[currentPath] =
                isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {};
        }
    }
    resVal[pathArray[i]] = value;
    return __assign({}, obj, res);
}
function setNestedObjectValues(object, value, visited, response) {
    if (visited === void 0) { visited = new WeakMap(); }
    if (response === void 0) { response = {}; }
    for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
        var k = _a[_i];
        var val = object[k];
        if (isObject(val)) {
            if (!visited.get(val)) {
                visited.set(val, true);
                response[k] = Array.isArray(val) ? [] : {};
                setNestedObjectValues(val, value, visited, response[k]);
            }
        }
        else {
            response[k] = value;
        }
    }
    return response;
}
var isFunction = function (obj) {
    return typeof obj === 'function';
};
var isObject = function (obj) {
    return obj !== null && typeof obj === 'object';
};
var isInteger = function (obj) {
    return String(Math.floor(Number(obj))) === obj;
};
var isString = function (obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
};
var isNaN = function (obj) { return obj !== obj; };
var isEmptyChildren = function (children) {
    return Children.count(children) === 0;
};
var isPromise = function (value) {
    return isObject(value) && isFunction(value.then);
};
var isEvent = function (value) {
    return isObject(value) && isObject(value.target);
};
function getActiveElement(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : undefined);
    if (typeof doc === 'undefined') {
        return null;
    }
    try {
        return doc.activeElement || doc.body;
    }
    catch (e) {
        return doc.body;
    }
}

var Formik = (function (_super) {
    __extends(Formik, _super);
    function Formik(props) {
        var _this = _super.call(this, props) || this;
        _this.hcCache = {};
        _this.hbCache = {};
        _this.registerField = function (name, resetFn) {
            _this.fields[name] = resetFn;
        };
        _this.unregisterField = function (name) {
            delete _this.fields[name];
        };
        _this.setErrors = function (errors) {
            _this.setState({ errors: errors });
        };
        _this.setTouched = function (touched) {
            _this.setState({ touched: touched }, function () {
                if (_this.props.validateOnBlur) {
                    _this.runValidations(_this.state.values);
                }
            });
        };
        _this.setValues = function (values) {
            _this.setState({ values: values }, function () {
                if (_this.props.validateOnChange) {
                    _this.runValidations(values);
                }
            });
        };
        _this.setStatus = function (status) {
            _this.setState({ status: status });
        };
        _this.setError = function (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn("Warning: Formik's setError(error) is deprecated and may be removed in future releases. Please use Formik's setStatus(status) instead. It works identically. For more info see https://github.com/jaredpalmer/formik#setstatus-status-any--void");
            }
            _this.setState({ error: error });
        };
        _this.setSubmitting = function (isSubmitting) {
            _this.setState({ isSubmitting: isSubmitting });
        };
        _this.runValidationSchema = function (values, onSuccess) {
            var validationSchema = _this.props.validationSchema;
            var schema = isFunction(validationSchema)
                ? validationSchema()
                : validationSchema;
            validateYupSchema(values, schema).then(function () {
                _this.setState({ errors: {} });
                if (onSuccess) {
                    onSuccess();
                }
            }, function (err) {
                return _this.setState({ errors: yupToFormErrors(err), isSubmitting: false });
            });
        };
        _this.runValidations = function (values) {
            if (values === void 0) { values = _this.state.values; }
            if (_this.props.validationSchema) {
                _this.runValidationSchema(values);
            }
            if (_this.props.validate) {
                var maybePromisedErrors = _this.props.validate(values);
                if (isPromise(maybePromisedErrors)) {
                    maybePromisedErrors.then(function () {
                        _this.setState({ errors: {} });
                    }, function (errors) { return _this.setState({ errors: errors, isSubmitting: false }); });
                }
                else {
                    _this.setErrors(maybePromisedErrors);
                }
            }
        };
        _this.handleChange = function (value, fieldName) {
            var field = fieldName;
            var val = value;
            if (isEvent(value)) {
                var event_1 = value;
                if (event_1.persist) {
                    event_1.persist();
                }
                var _a = event_1.target, type = _a.type, name_1 = _a.name, id = _a.id, targetValue = _a.value, checked = _a.checked, outerHTML = _a.outerHTML;
                var parsed = void 0;
                field = name_1 || id;
                if (!field && process.env.NODE_ENV !== 'production') {
                    warnAboutMissingIdentifier({
                        htmlContent: outerHTML,
                        documentationAnchorLink: 'handlechange-e-reactchangeeventany--void',
                        handlerName: 'handleChange',
                    });
                }
                val = /number|range/.test(type)
                    ? ((parsed = parseFloat(targetValue)), isNaN(parsed) ? '' : parsed)
                    : /checkbox/.test(type) ? checked : targetValue;
            }
            if (field) {
                _this.setState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, field, val) })); }, _this.executeChange);
                var newValues = setIn(_this.state.values, field, val);
                if (_this.props.validateOnChange) {
                    _this.runValidations(newValues);
                }
            }
        };
        _this.setFieldValue = function (field, value, shouldValidate) {
            if (shouldValidate === void 0) { shouldValidate = true; }
            _this.setState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, field, value) })); }, function () {
                if (_this.props.validateOnChange && shouldValidate) {
                    _this.runValidations(_this.state.values);
                }
            });
        };
        _this.handleSubmit = function (e) {
            if (e && e.preventDefault) {
                e.preventDefault();
            }
            if (process.env.NODE_ENV !== 'production' &&
                typeof document !== 'undefined') {
                var activeElement = getActiveElement();
                if (activeElement !== null &&
                    activeElement instanceof HTMLButtonElement) {
                    warning(!!(activeElement.attributes &&
                        activeElement.attributes.getNamedItem('type')), 'You submitted a Formik form using a button with an unspecified `type` attribute.  Most browsers default button elements to `type="submit"`. If this is not a submit button, please add `type="button"`.');
                }
            }
            _this.submitForm();
        };
        _this.submitForm = function () {
            _this.setState(function (prevState) { return ({
                touched: setNestedObjectValues(prevState.values, true),
                isSubmitting: true,
                submitCount: prevState.submitCount + 1,
            }); });
            if (_this.props.validate) {
                var maybePromisedErrors = _this.props.validate(_this.state.values) || {};
                if (isPromise(maybePromisedErrors)) {
                    maybePromisedErrors.then(function () {
                        _this.setState({ errors: {} });
                        _this.executeSubmit();
                    }, function (errors) { return _this.setState({ errors: errors, isSubmitting: false }); });
                    return;
                }
                else {
                    var isValid = Object.keys(maybePromisedErrors).length === 0;
                    _this.setState({
                        errors: maybePromisedErrors,
                        isSubmitting: isValid,
                    });
                    if (isValid) {
                        _this.executeSubmit();
                    }
                }
            }
            else if (_this.props.validationSchema) {
                _this.runValidationSchema(_this.state.values, _this.executeSubmit);
            }
            else {
                _this.executeSubmit();
            }
        };
        _this.executeSubmit = function () {
            _this.props.onSubmit(_this.state.values, _this.getFormikActions());
        };
        _this.executeChange = function () {
            if (_this.props.onChange) {
                _this.props.onChange(_this.state.values);
            }
        };
        _this.handleBlur = function (eventOrString) {
            var executeBlur = function (e, path) {
                if (e.persist) {
                    e.persist();
                }
                var _a = e.target, name = _a.name, id = _a.id, outerHTML = _a.outerHTML;
                var field = path ? path : name ? name : id;
                if (!field && process.env.NODE_ENV !== 'production') {
                    warnAboutMissingIdentifier({
                        htmlContent: outerHTML,
                        documentationAnchorLink: 'handleblur-e-any--void',
                        handlerName: 'handleBlur',
                    });
                }
                _this.setState(function (prevState) { return ({
                    touched: setIn(prevState.touched, field, true),
                }); });
                if (_this.props.validateOnBlur) {
                    _this.runValidations(_this.state.values);
                }
            };
            if (isString(eventOrString)) {
                return isFunction(_this.hbCache[eventOrString])
                    ? _this.hbCache[eventOrString]
                    : (_this.hbCache[eventOrString] = function (event) {
                        return executeBlur(event, eventOrString);
                    });
            }
            else {
                executeBlur(eventOrString);
            }
        };
        _this.setFieldTouched = function (field, touched, shouldValidate) {
            if (touched === void 0) { touched = true; }
            if (shouldValidate === void 0) { shouldValidate = true; }
            _this.setState(function (prevState) { return (__assign({}, prevState, { touched: setIn(prevState.touched, field, touched) })); }, function () {
                if (_this.props.validateOnBlur && shouldValidate) {
                    _this.runValidations(_this.state.values);
                }
            });
        };
        _this.setFieldError = function (field, message) {
            _this.setState(function (prevState) { return (__assign({}, prevState, { errors: setIn(prevState.errors, field, message) })); });
        };
        _this.resetForm = function (nextValues) {
            var values = nextValues ? nextValues : _this.props.initialValues;
            _this.initialValues = values;
            _this.setState({
                isSubmitting: false,
                errors: {},
                touched: {},
                error: undefined,
                status: undefined,
                values: values,
                submitCount: 0,
            });
            Object.keys(_this.fields).map(function (f) { return _this.fields[f](values); });
        };
        _this.handleReset = function () {
            if (_this.props.onReset) {
                var maybePromisedOnReset = _this.props.onReset(_this.state.values, _this.getFormikActions());
                if (isPromise(maybePromisedOnReset)) {
                    maybePromisedOnReset.then(_this.resetForm);
                }
                else {
                    _this.resetForm();
                }
            }
            else {
                _this.resetForm();
            }
        };
        _this.setFormikState = function (s, callback) {
            return _this.setState(s, callback);
        };
        _this.getFormikActions = function () {
            return {
                resetForm: _this.resetForm,
                submitForm: _this.submitForm,
                validateForm: _this.runValidations,
                setError: _this.setError,
                setErrors: _this.setErrors,
                setFieldError: _this.setFieldError,
                setFieldTouched: _this.setFieldTouched,
                setFieldValue: _this.setFieldValue,
                setStatus: _this.setStatus,
                setSubmitting: _this.setSubmitting,
                setTouched: _this.setTouched,
                setValues: _this.setValues,
                setFormikState: _this.setFormikState,
            };
        };
        _this.getFormikComputedProps = function () {
            var isInitialValid = _this.props.isInitialValid;
            var dirty = !isEqual(_this.initialValues, _this.state.values);
            return {
                dirty: dirty,
                isValid: dirty
                    ? _this.state.errors && Object.keys(_this.state.errors).length === 0
                    : isInitialValid !== false && isFunction(isInitialValid)
                        ? isInitialValid(_this.props)
                        : isInitialValid,
                initialValues: _this.initialValues,
            };
        };
        _this.getFormikBag = function () {
            return __assign({}, _this.state, _this.getFormikActions(), _this.getFormikComputedProps(), { registerField: _this.registerField, unregisterField: _this.unregisterField, handleBlur: _this.handleBlur, handleChange: _this.handleChange, handleReset: _this.handleReset, handleSubmit: _this.handleSubmit, validateOnChange: _this.props.validateOnChange, validateOnBlur: _this.props.validateOnBlur });
        };
        _this.getFormikContext = function () {
            return __assign({}, _this.getFormikBag(), { validationSchema: _this.props.validationSchema, validate: _this.props.validate });
        };
        _this.state = {
            values: props.initialValues || {},
            errors: {},
            touched: {},
            isSubmitting: false,
            submitCount: 0,
        };
        _this.fields = {};
        _this.initialValues = props.initialValues || {};
        warning(!(props.component && props.render), 'You should not use <Formik component> and <Formik render> in the same <Formik> component; <Formik render> will be ignored');
        warning(!(props.component && props.children && !isEmptyChildren(props.children)), 'You should not use <Formik component> and <Formik children> in the same <Formik> component; <Formik children> will be ignored');
        warning(!(props.render && props.children && !isEmptyChildren(props.children)), 'You should not use <Formik render> and <Formik children> in the same <Formik> component; <Formik children> will be ignored');
        return _this;
    }
    Formik.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.enableReinitialize &&
            !isEqual(prevProps.initialValues, this.props.initialValues)) {
            this.initialValues = this.props.initialValues;
            this.resetForm(this.props.initialValues);
        }
    };
    Formik.prototype.render = function () {
        var _a = this.props, component = _a.component, render = _a.render, children = _a.children;
        var props = this.getFormikBag();
        var ctx = this.getFormikContext();
        return (createElement(FormikProvider, { value: ctx }, component
            ? createElement(component, props)
            : render
                ? render(props)
                : children
                    ? typeof children === 'function'
                        ? children(props)
                        : !isEmptyChildren(children)
                            ? Children.only(children)
                            : null
                    : null));
    };
    Formik.defaultProps = {
        validateOnChange: true,
        validateOnBlur: true,
        isInitialValid: false,
        enableReinitialize: false,
    };
    return Formik;
}(Component));
function warnAboutMissingIdentifier(_a) {
    var htmlContent = _a.htmlContent, documentationAnchorLink = _a.documentationAnchorLink, handlerName = _a.handlerName;
    console.error("Warning: Formik called `" + handlerName + "`, but you forgot to pass an `id` or `name` attribute to your input:\n\n    " + htmlContent + "\n\n    Formik cannot determine which value to update. For more info see https://github.com/jaredpalmer/formik#" + documentationAnchorLink + "\n  ");
}
function yupToFormErrors(yupError) {
    var errors = {};
    for (var _i = 0, _a = yupError.inner; _i < _a.length; _i++) {
        var err = _a[_i];
        if (!errors[err.path]) {
            errors = setIn(errors, err.path, err.message);
        }
    }
    return errors;
}
function validateYupSchema(values, schema, sync, context) {
    if (sync === void 0) { sync = false; }
    if (context === void 0) { context = {}; }
    var validateData = {};
    for (var k in values) {
        if (values.hasOwnProperty(k)) {
            var key = String(k);
            validateData[key] = values[key] !== '' ? values[key] : undefined;
        }
    }
    return schema[sync ? 'validateSync' : 'validate'](validateData, {
        abortEarly: false,
        context: context,
    });
}

var FieldInner = (function (_super) {
    __extends(FieldInner, _super);
    function FieldInner(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (value) {
            var _a = _this.props, validate = _a.validate, name = _a.name;
            var _b = _this.props.formik, handleChange = _b.handleChange, validateOnChange = _b.validateOnChange;
            handleChange(value, name);
            if (!!validateOnChange && !!validate) {
                var val = isEvent(value) ? value.target.value : value;
                _this.runFieldValidations(val);
            }
        };
        _this.handleBlur = function (e) {
            var _a = _this.props.formik, handleBlur = _a.handleBlur, validateOnBlur = _a.validateOnBlur;
            handleBlur(e);
            if (!!validateOnBlur && !!_this.props.validate) {
                _this.runFieldValidations(e.target.value);
            }
        };
        _this.runFieldValidations = function (value) {
            var setFieldError = _this.props.formik.setFieldError;
            var _a = _this.props, name = _a.name, validate = _a.validate;
            var maybePromise = validate(value);
            if (isPromise(maybePromise)) {
                maybePromise.then(function () { return setFieldError(name, undefined); }, function (error) { return setFieldError(name, error); });
            }
            else {
                setFieldError(name, maybePromise);
            }
        };
        var _a = _this.props, render = _a.render, children = _a.children, component = _a.component;
        warning(!(component && render), 'You should not use <Field component> and <Field render> in the same <Field> component; <Field component> will be ignored');
        warning(!(component && children && isFunction(children)), 'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.');
        warning(!(render && children && !isEmptyChildren(children)), 'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored');
        return _this;
    }
    FieldInner.prototype.render = function () {
        var _a = this.props, validate = _a.validate, name = _a.name, render = _a.render, children = _a.children, _b = _a.component, component = _b === void 0 ? 'input' : _b, formik = _a.formik, props = __rest(_a, ["validate", "name", "render", "children", "component", "formik"]);
        var _validate = formik.validate, _validationSchema = formik.validationSchema, restOfFormik = __rest(formik, ["validate", "validationSchema"]);
        var field = {
            value: props.type === 'radio' || props.type === 'checkbox'
                ? props.value
                : getIn(formik.values, name),
            name: name,
            onChange: this.handleChange,
            onBlur: this.handleBlur,
        };
        var bag = { field: field, form: restOfFormik };
        if (render) {
            return render(bag);
        }
        if (isFunction(children)) {
            return children(bag);
        }
        if (typeof component === 'string') {
            var innerRef = props.innerRef, rest = __rest(props, ["innerRef"]);
            return createElement(component, __assign({ ref: innerRef }, field, rest, { children: children }));
        }
        return createElement(component, __assign({}, bag, props, { children: children }));
    };
    return FieldInner;
}(Component));
var Field = connect(FieldInner);

var Form = connect(function (_a) {
    var handleSubmit = _a.formik.handleSubmit, props = __rest(_a, ["formik"]);
    return (createElement("form", __assign({ onSubmit: handleSubmit }, props)));
});
Form.displayName = 'Form';

function withFormik(_a) {
    var _b = _a.mapPropsToValues, mapPropsToValues = _b === void 0 ? function (vanillaProps) {
        var val = {};
        for (var k in vanillaProps) {
            if (vanillaProps.hasOwnProperty(k) &&
                typeof vanillaProps[k] !== 'function') {
                val[k] = vanillaProps[k];
            }
        }
        return val;
    } : _b, config = __rest(_a, ["mapPropsToValues"]);
    return function createFormik(Component$$1) {
        var componentDisplayName = Component$$1.displayName ||
            Component$$1.name ||
            (Component$$1.constructor && Component$$1.constructor.name) ||
            'Component';
        var C = (function (_super) {
            __extends(C, _super);
            function C() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.validate = function (values) {
                    return config.validate(values, _this.props);
                };
                _this.validationSchema = function () {
                    return isFunction(config.validationSchema)
                        ? config.validationSchema(_this.props)
                        : config.validationSchema;
                };
                _this.handleSubmit = function (values, actions) {
                    return config.handleSubmit(values, __assign({}, actions, { props: _this.props }));
                };
                _this.renderFormComponent = function (formikProps) {
                    return createElement(Component$$1, __assign({}, _this.props, formikProps));
                };
                return _this;
            }
            C.prototype.render = function () {
                return (createElement(Formik, __assign({}, this.props, config, { validate: config.validate && this.validate, validationSchema: config.validationSchema && this.validationSchema, initialValues: mapPropsToValues(this.props), onSubmit: this.handleSubmit, render: this.renderFormComponent })));
            };
            C.displayName = "WithFormik(" + componentDisplayName + ")";
            return C;
        }(Component));
        return hoistNonReactStatics(C, Component$$1);
    };
}

var move = function (array, from, to) {
    var copy = (array || []).slice();
    var value = copy[from];
    copy.splice(from, 1);
    copy.splice(to, 0, value);
    return copy;
};
var swap = function (array, indexA, indexB) {
    var copy = (array || []).slice();
    var a = copy[indexA];
    copy[indexA] = copy[indexB];
    copy[indexB] = a;
    return copy;
};
var insert = function (array, index, value) {
    var copy = (array || []).slice();
    copy.splice(index, 0, value);
    return copy;
};
var replace = function (array, index, value) {
    var copy = (array || []).slice();
    copy[index] = value;
    return copy;
};
var FieldArrayInner = (function (_super) {
    __extends(FieldArrayInner, _super);
    function FieldArrayInner(props) {
        var _this = _super.call(this, props) || this;
        _this.updateArrayField = function (fn, alterTouched, alterErrors) {
            var _a = _this.props, name = _a.name, validateOnChange = _a.validateOnChange, _b = _a.formik, setFormikState = _b.setFormikState, validateForm = _b.validateForm, values = _b.values, touched = _b.touched, errors = _b.errors;
            setFormikState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, name, fn(getIn(values, name))), errors: alterErrors
                    ? setIn(prevState.errors, name, fn(getIn(errors, name)))
                    : prevState.errors, touched: alterTouched
                    ? setIn(prevState.touched, name, fn(getIn(touched, name)))
                    : prevState.touched })); }, function () {
                if (validateOnChange) {
                    validateForm();
                }
            });
        };
        _this.push = function (value) {
            return _this.updateArrayField(function (array) { return (array || []).concat([value]); }, false, false);
        };
        _this.handlePush = function (value) { return function () { return _this.push(value); }; };
        _this.swap = function (indexA, indexB) {
            return _this.updateArrayField(function (array) { return swap(array, indexA, indexB); }, false, false);
        };
        _this.handleSwap = function (indexA, indexB) { return function () {
            return _this.swap(indexA, indexB);
        }; };
        _this.move = function (from, to) {
            return _this.updateArrayField(function (array) { return move(array, from, to); }, false, false);
        };
        _this.handleMove = function (from, to) { return function () { return _this.move(from, to); }; };
        _this.insert = function (index, value) {
            return _this.updateArrayField(function (array) { return insert(array, index, value); }, false, false);
        };
        _this.handleInsert = function (index, value) { return function () { return _this.insert(index, value); }; };
        _this.replace = function (index, value) {
            return _this.updateArrayField(function (array) { return replace(array, index, value); }, false, false);
        };
        _this.handleReplace = function (index, value) { return function () {
            return _this.replace(index, value);
        }; };
        _this.unshift = function (value) {
            var arr = [];
            _this.updateArrayField(function (array) {
                arr = array ? [value].concat(array) : [value];
                return arr;
            }, false, false);
            return arr.length;
        };
        _this.handleUnshift = function (value) { return function () { return _this.unshift(value); }; };
        _this.handleRemove = function (index) { return function () { return _this.remove(index); }; };
        _this.handlePop = function () { return function () { return _this.pop(); }; };
        _this.remove = _this.remove.bind(_this);
        _this.pop = _this.pop.bind(_this);
        return _this;
    }
    FieldArrayInner.prototype.remove = function (index) {
        var result;
        this.updateArrayField(function (array) {
            var copy = array ? array.slice() : [];
            if (!result) {
                result = copy[index];
            }
            if (isFunction(copy.splice)) {
                copy.splice(index, 1);
            }
            return copy;
        }, true, true);
        return result;
    };
    FieldArrayInner.prototype.pop = function () {
        var result;
        this.updateArrayField(function (array) {
            var tmp = array;
            if (!result) {
                result = tmp && tmp.pop && tmp.pop();
            }
            return tmp;
        }, true, true);
        return result;
    };
    FieldArrayInner.prototype.render = function () {
        var arrayHelpers = {
            push: this.push,
            pop: this.pop,
            swap: this.swap,
            move: this.move,
            insert: this.insert,
            replace: this.replace,
            unshift: this.unshift,
            remove: this.remove,
            handlePush: this.handlePush,
            handlePop: this.handlePop,
            handleSwap: this.handleSwap,
            handleMove: this.handleMove,
            handleInsert: this.handleInsert,
            handleReplace: this.handleReplace,
            handleUnshift: this.handleUnshift,
            handleRemove: this.handleRemove,
        };
        var _a = this.props, component = _a.component, render = _a.render, children = _a.children, name = _a.name, _b = _a.formik, _validate = _b.validate, _validationSchema = _b.validationSchema, restOfFormik = __rest(_b, ["validate", "validationSchema"]);
        var props = __assign({}, arrayHelpers, { form: restOfFormik, name: name });
        return component
            ? createElement(component, props)
            : render
                ? render(props)
                : children
                    ? typeof children === 'function'
                        ? children(props)
                        : !isEmptyChildren(children) ? Children.only(children) : null
                    : null;
    };
    FieldArrayInner.defaultProps = {
        validateOnChange: true,
    };
    return FieldArrayInner;
}(Component));
var FieldArray = connect(FieldArrayInner);

function isEqualExceptForKey(a, b, path) {
    return isEqual(setIn(a, path, undefined), setIn(b, path, undefined));
}
var FastFieldInner = (function (_super) {
    __extends(FastFieldInner, _super);
    function FastFieldInner(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (e) {
            e.persist();
            var _a = _this.props.formik, validateOnChange = _a.validateOnChange, validate = _a.validate, values = _a.values, validationSchema = _a.validationSchema, errors = _a.errors, setFormikState = _a.setFormikState;
            var _b = e.target, type = _b.type, value = _b.value, checked = _b.checked;
            var val = /number|range/.test(type)
                ? parseFloat(value)
                : /checkbox/.test(type) ? checked : value;
            if (validateOnChange) {
                if (_this.props.validate) {
                    var maybePromise = _this.props.validate(value);
                    if (isPromise(maybePromise)) {
                        _this.setState({ value: val });
                        maybePromise.then(function () { return _this.setState({ error: undefined }); }, function (error) { return _this.setState({ error: error }); });
                    }
                    else {
                        _this.setState({ value: val, error: maybePromise });
                    }
                }
                else if (validate) {
                    var maybePromise_1 = validate(setIn(values, _this.props.name, val));
                    if (isPromise(maybePromise_1)) {
                        _this.setState({ value: val });
                        maybePromise_1.then(function () { return _this.setState({ error: undefined }); }, function (error) {
                            if (isEqualExceptForKey(maybePromise_1, errors, _this.props.name)) {
                                _this.setState({ error: getIn(error, _this.props.name) });
                            }
                            else {
                                setFormikState(function (prevState) { return (__assign({}, prevState, { errors: error })); });
                            }
                        });
                    }
                    else {
                        if (isEqualExceptForKey(maybePromise_1, errors, _this.props.name)) {
                            _this.setState({
                                value: val,
                                error: getIn(maybePromise_1, _this.props.name),
                            });
                        }
                        else {
                            _this.setState({
                                value: val,
                            });
                            setFormikState(function (prevState) { return (__assign({}, prevState, { errors: maybePromise_1 })); });
                        }
                    }
                }
                else if (validationSchema) {
                    var schema = isFunction(validationSchema)
                        ? validationSchema()
                        : validationSchema;
                    var mergedValues = setIn(values, _this.props.name, val);
                    try {
                        validateYupSchema(mergedValues, schema, true);
                        _this.setState({
                            value: val,
                            error: undefined,
                        });
                    }
                    catch (e) {
                        if (e.name === 'ValidationError') {
                            _this.setState({
                                value: val,
                                error: getIn(yupToFormErrors(e), _this.props.name),
                            });
                        }
                        else {
                            _this.setState({
                                value: val,
                            });
                            validateYupSchema(mergedValues, schema).then(function () { return _this.setState({ error: undefined }); }, function (err) {
                                return _this.setState(function (s) { return (__assign({}, s, { error: getIn(yupToFormErrors(err), _this.props.name) })); });
                            });
                        }
                    }
                }
                else {
                    _this.setState({ value: val });
                }
            }
            else {
                _this.setState({ value: val });
            }
        };
        _this.handleBlur = function () {
            var _a = _this.props.formik, validateOnBlur = _a.validateOnBlur, setFormikState = _a.setFormikState;
            var _b = _this.props, name = _b.name, validate = _b.validate;
            if (validateOnBlur && validate) {
                var maybePromise_2 = validate(_this.state.value);
                if (isPromise(maybePromise_2)) {
                    maybePromise_2.then(function () {
                        return setFormikState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, name, _this.state.value), errors: setIn(prevState.errors, name, undefined), touched: setIn(prevState.touched, name, true) })); });
                    }, function (error) {
                        return setFormikState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, name, _this.state.value), errors: setIn(prevState.errors, name, error), touched: setIn(prevState.touched, name, true) })); });
                    });
                }
                else {
                    setFormikState(function (prevState) { return (__assign({}, prevState, { values: setIn(prevState.values, name, _this.state.value), errors: setIn(prevState.errors, name, maybePromise_2), touched: setIn(prevState.touched, name, true) })); });
                }
            }
            else {
                setFormikState(function (prevState) { return (__assign({}, prevState, { errors: setIn(prevState.errors, name, _this.state.error), values: setIn(prevState.values, name, _this.state.value), touched: setIn(prevState.touched, name, true) })); });
            }
        };
        _this.state = {
            value: getIn(props.formik.values, props.name),
            error: getIn(props.formik.errors, props.name),
        };
        _this.reset = function (nextValues) {
            _this.setState({
                value: getIn(nextValues, props.name),
                error: getIn(props.formik.errors, props.name),
            });
        };
        props.formik.registerField(props.name, _this.reset);
        var render = props.render, children = props.children, component = props.component;
        warning(!(component && render), 'You should not use <FastField component> and <FastField render> in the same <FastField> component; <FastField component> will be ignored');
        warning(!(props.component && children && isFunction(children)), 'You should not use <FastField component> and <FastField children> as a function in the same <FastField> component; <FastField component> will be ignored.');
        warning(!(render && children && !isEmptyChildren(children)), 'You should not use <FastField render> and <FastField children> in the same <FastField> component; <FastField children> will be ignored');
        return _this;
    }
    FastFieldInner.getDerivedStateFromProps = function (nextProps, prevState) {
        var nextFieldValue = getIn(nextProps.formik.values, nextProps.name);
        var nextFieldError = getIn(nextProps.formik.errors, nextProps.name);
        var nextState = null;
        if (!isEqual(nextFieldValue, prevState.value)) {
            nextState = __assign({}, prevState, { value: nextFieldValue });
        }
        if (!isEqual(nextFieldError, prevState.error)) {
            nextState = __assign({}, prevState, { error: nextFieldError });
        }
        return nextState;
    };
    FastFieldInner.prototype.componentWillUnmount = function () {
        this.props.formik.unregisterField(this.props.name);
    };
    FastFieldInner.prototype.render = function () {
        var _a = this.props, validate = _a.validate, name = _a.name, render = _a.render, children = _a.children, _b = _a.component, component = _b === void 0 ? 'input' : _b, formik = _a.formik, props = __rest(_a, ["validate", "name", "render", "children", "component", "formik"]);
        var _validate = formik.validate, _validationSchema = formik.validationSchema, restOfFormik = __rest(formik, ["validate", "validationSchema"]);
        var field = {
            value: props.type === 'radio' || props.type === 'checkbox'
                ? props.value
                : this.state.value,
            name: name,
            onChange: this.handleChange,
            onBlur: this.handleBlur,
        };
        var bag = {
            field: field,
            form: restOfFormik,
            meta: { touched: getIn(formik.touched, name), error: this.state.error },
        };
        if (render) {
            return render(bag);
        }
        if (isFunction(children)) {
            return children(bag);
        }
        if (typeof component === 'string') {
            var innerRef = props.innerRef, rest = __rest(props, ["innerRef"]);
            return createElement(component, __assign({ ref: innerRef }, field, rest, { children: children }));
        }
        return createElement(component, __assign({}, bag, props, { children: children }));
    };
    return FastFieldInner;
}(Component));
var FastField = connect(polyfill(FastFieldInner));

export { Formik, yupToFormErrors, validateYupSchema, Field, Form, withFormik, move, swap, insert, replace, FieldArray, getIn, setIn, setNestedObjectValues, isFunction, isObject, isInteger, isString, isNaN, isEmptyChildren, isPromise, isEvent, getActiveElement, FastField, FormikProvider, FormikConsumer, connect };
//# sourceMappingURL=formik.es6.js.map
