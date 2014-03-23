/*jshint loopfunc:true*/

var get = require('../../../../../build/instrument/lib/model/static/get'),
	errors = require('../../../../../build/instrument/lib/support/errors'),
	support = require('../../../../support/support'),
	Promise = require('bluebird');

exports.get = {
	normal: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableReady = Promise.resolve();
		Model.relations = {};
		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			})
		};

		Model.get('5', function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, { id: 5, name: 'John' });
			Model.get('5').then(function (instance) {
				test.deepEqual(instance.attributes, { id: 5, name: 'John' });
				test.done();
			});
		});
	},
	profile: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableReady = Promise.resolve();
		Model.relations = {};
		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, { profile: {}, value: { id: 5, name: 'John' } });
			})
		};

		Model.get('5', { profile: true }, function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance.attributes, { id: 5, name: 'John' });
			Model.get('5', { profile: true }).then(function (instance) {
				test.deepEqual(instance.attributes, { id: 5, name: 'John' });
				test.done();
			});
		});
	},
	null: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableReady = Promise.resolve();
		Model.relations = {};
		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, null);
			})
		};

		Model.get('5', function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance, null);
			Model.get('5').then(function (instance) {
				test.deepEqual(instance, null);
				test.done();
			});
		});
	},
	raw: function (test) {
		test.expect(3);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableReady = Promise.resolve();
		Model.relations = {};
		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			})
		};

		Model.get('5', { raw: true }, function (err, instance) {
			test.ifError(err);
			test.deepEqual(instance, { id: 5, name: 'John' });
			Model.get('5', { raw: true }).then(function (instance) {
				test.deepEqual(instance, { id: 5, name: 'John' });
				test.done();
			});
		});
	},
	primaryKey: function (test) {
		test.expect(18);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableReady = Promise.resolve();
		Model.relations = {};
		Model.tableName = 'test';
		Model.get = get;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			queue.push((function (j) {
				return Model.get(support.TYPES_EXCEPT_STRING[j]).then(function () {
					support.fail('Should have failed on ' + support.TYPES_EXCEPT_STRING[j]);
				})
					.catch(errors.IllegalArgumentError, function (err) {
						test.equal(err.type, 'IllegalArgumentError');
						test.deepEqual(err.errors, { actual: typeof support.TYPES_EXCEPT_STRING[j], expected: 'string' });
					})
					.error(function () {
						support.fail('Should not have an unknown error!');
					});
			})(i));
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	},
	options: function (test) {
		test.expect(8);

		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableReady = Promise.resolve();
		Model.relations = {};
		Model.tableName = 'test';
		Model.get = get;

		var queue = [];

		for (var i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			if (support.TYPES_EXCEPT_OBJECT[i] && typeof support.TYPES_EXCEPT_OBJECT[i] !== 'function') {
				queue.push((function (j) {
					return Model.get('5', support.TYPES_EXCEPT_OBJECT[j]).then(function () {
						support.fail('Should have failed on ' + support.TYPES_EXCEPT_OBJECT[j]);
					})
						.catch(errors.IllegalArgumentError, function (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { actual: typeof support.TYPES_EXCEPT_OBJECT[j], expected: 'object' });
						})
						.error(function () {
							support.fail('Should not have an unknown error!');
						});
				})(i));
			}
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	},
	callback: function (test) {
		test.expect(18);

		function Model(attrs) {
			this.attributes = attrs;
		}
		Model.get = get;
		var nonFunctionTypes = ['string', 123, 123.123, {}, [], true];

		//cb must be a function
		//TODO: determine why this does not work for everything in support.TYPES_EXCEPT_FUNCTION
		for (var i = 0; i < nonFunctionTypes.length; i++) {
			try {
				get(false, false, nonFunctionTypes[i]);
				test.ok(false, "get let through non-function value of " + typeof nonFunctionTypes[i] + " in callback");
			}
			catch (err) {
				test.equal(err.type, 'IllegalArgumentError');
				test.deepEqual(err.errors, { actual: typeof nonFunctionTypes[i], expected: 'function' });
				test.equal(err.message, 'Model.get(primaryKey[, options], cb): cb: Must be a function!');
			}
		}

		test.done();
	},
	badWith: function (test) {
		function Model(attrs) {
			this.attributes = attrs;
		}
		Model.tableReady = Promise.resolve();
		Model.relations = {};
		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			})
		};

		var queue = [];
		var nonArrayTypes = ['string', 123, 123.123, {}, true, function () {
		}];

		//options.with must be an array
		//TODO: determine why this does not work for everything in support.TYPES_EXCEPT_ARRAY
		for (var i = 0; i < nonArrayTypes.length; i++) {
			queue.push((function (j) {
				Model.get('5', { with: nonArrayTypes[j] }, function (err) {
					if (err) {
						test.equal(err.type, 'IllegalArgumentError');
						test.deepEqual(err.errors, { actual: typeof nonArrayTypes[j], expected: 'array' });
						test.equal(err.message, 'Model.get(primaryKey[, options], cb): options.with: Must be an array!');
					}
					else {
						test.ok(false, "get let through non-array value of " + typeof nonArrayTypes[j] + " in options.with");
					}
				});
			})(i));
		}
		Promise.all(queue).finally(function () {
			test.done();
		});
	},
	hasOneError: function (test) {
		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableReady = Promise.resolve();
		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			})
		};

		//non-existent hasOne relationship
		Model.relations = {
			hasOne: {
				Snap: {}
			}
		};
		Model.get('5', { with: ['Snap'] }, function (err) {
			test.equal(err.type, 'RuntimeError');
			test.equal(err.message, 'Model Model defined hasOne relationship to nonexistent Snap Model!');
		});

		test.done();
	},
	hasManyError: function (test) {
		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableReady = Promise.resolve();
		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			})
		};

		//non-existent hasMany relationship
		Model.relations = {
			hasMany: {
				Crackle: {}
			}
		};
		Model.get('5', { with: ['Snap'] }, function (err) {
			test.equal(err.type, 'RuntimeError');
			test.equal(err.message, 'Model Model defined hasMany relationship to nonexistent Crackle Model!');
		});

		test.done();
	},
	belongsToError: function (test) {
		function Model(attrs) {
			this.attributes = attrs;
		}

		Model.tableReady = Promise.resolve();
		Model.tableName = 'test';
		Model.get = get;
		Model.connection = {
			run: Promise.promisify(function (query, options, next) {
				next(null, { id: 5, name: 'John' });
			})
		};

		//non-existent belongsTo relationship
		Model.relations = {
			belongsTo: {
				Pop: {}
			}
		};
		Model.get('5', { with: ['Snap'] }, function (err) {
			test.equal(err.type, 'RuntimeError');
			test.equal(err.message, 'Model Model defined belongsTo relationship to nonexistent Pop Model!');
		});

		test.done();
	}
};
