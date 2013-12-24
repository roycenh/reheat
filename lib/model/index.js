'use strict';

var deepMixIn = require('mout/object/deepMixIn'),
	cForEach = require('mout/collection/forEach'),
	extend = require('./../support/extend'),
	meld = require('meld');

var Model = module.exports = function Model(attrs) {

	this.attributes = {};
	attrs = attrs || {};
	deepMixIn(this.attributes, attrs);

	// A hash of attributes whose current and previous value differ.
	this.changed = null;

	// The value returned during the last failed validation.
	this.validationError = null;

	this.initialize.apply(this, arguments);
};

Model.extend = extend;

// Mix in instance stuff
deepMixIn(Model.prototype, require('./prototype'));

// Mix in static stuff
deepMixIn(Model, require('./static'));

var hooks = {
	beforeValidate: function (attrs, cb) {
		cb(null, attrs);
	},

	validate: function (attrs, cb) {
		cb(null, attrs);
	},

	afterValidate: function (attrs, cb) {
		cb(null, attrs);
	},

	beforeCreate: function (attrs, cb) {
		cb(null, attrs);
	},

	afterCreate: function (attrs, meta, cb) {
		cb(null, attrs, meta);
	},

	beforeUpdate: function (attrs, cb) {
		cb(null, attrs);
	},

	afterUpdate: function (attrs, meta, cb) {
		cb(null, attrs, meta);
	},

	beforeDestroy: function (options, cb) {
		cb(null, options);
	},

	afterDestroy: function (options, meta, cb) {
		cb(null, options, meta);
	}
};

var updateLifecycleHooks = ['beforeSave', 'afterValidate', 'validate', 'beforeValidate'];

// Setup Model#save lifecycle hooks
cForEach(updateLifecycleHooks, function (hook) {
	meld.around(Model.prototype, 'save', function (jp) {
		var method;
		if (hook === 'beforeSave') {
			method = jp.target.isNew() ? jp.target.beforeCreate || hooks.beforeCreate : jp.target.beforeUpdate || hooks.beforeUpdate;
		} else {
			method = jp.target[hook] || hooks[hook];
		}
		method.apply(jp.target, [jp.target.attributes, function (err, attrs) {
			if (err) {
				jp.args[jp.args.length - 1](err);
			} else {
				jp.proceed(attrs, jp.args[jp.args.length - 1]);
			}
		}]);
	});
});

meld.around(Model.prototype, 'save', function (jp) {
	jp.proceed(jp.args.attrs, jp.args.meta, function (err, attrs, meta) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			var method = jp.target.isNew() ? jp.target.afterCreate || hooks.afterCreate : jp.target.afterUpdate || hooks.afterUpdate;
			method.apply(jp.target, [attrs, meta, jp.args[jp.args.length - 1]]);
		}
	});
});

// Setup Model#destroy lifecycle hooks
meld.around(Model.prototype, 'destroy', function (jp) {
	(jp.target.beforeDestroy || hooks.beforeDestroy).apply(jp.target, [function (err) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			jp.proceed(jp.args[jp.args.length - 1]);
		}
	}]);
});

meld.around(Model.prototype, 'destroy', function (jp) {
	jp.proceed(jp.args.meta, function (err, meta) {
		if (err) {
			jp.args[jp.args.length - 1](err);
		} else {
			(jp.target.afterDestroy || hooks.afterDestroy).apply(jp.target, [meta, jp.args[jp.args.length - 1]]);
		}
	});
});