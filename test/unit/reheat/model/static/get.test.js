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

		//cb must be a function
		for (var i = 0; i < support.TYPES_EXCEPT_FUNCTION.length; i++) {
			if (support.TYPES_EXCEPT_FUNCTION[i]) {
				try {
					get(false, false, support.TYPES_EXCEPT_FUNCTION[i]);
					test.ok(false, "get let through non-function value of " + typeof support.TYPES_EXCEPT_FUNCTION[i] + " in callback");
				}
				catch (err) {
					test.equal(err.type, 'IllegalArgumentError');
					test.deepEqual(err.errors, { actual: typeof support.TYPES_EXCEPT_FUNCTION[i], expected: 'function' });
					test.equal(err.message, 'Model.get(primaryKey[, options], cb): cb: Must be a function!');
				}
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

		//options.with must be an array
		for (var i = 0; i < support.TYPES_EXCEPT_ARRAY.length; i++) {
			if (support.TYPES_EXCEPT_ARRAY[i]) {
				queue.push((function (j) {
					Model.get('5', { with: support.TYPES_EXCEPT_ARRAY[j] }, function (err) {
						if (err) {
							test.equal(err.type, 'IllegalArgumentError');
							test.deepEqual(err.errors, { actual: typeof support.TYPES_EXCEPT_ARRAY[j], expected: 'array' });
							test.equal(err.message, 'Model.get(primaryKey[, options], cb): options.with: Must be an array!');
						}
						else {
							test.ok(false, "get let through non-array value of " + typeof support.TYPES_EXCEPT_ARRAY[j] + " in options.with");
						}
					});
				})(i));
			}
		}
		Promise.all(queue).finally(function () {
			test.done();
		});
	},
	relationErrors: function (test) {
		var relationTypes = [{
			hasOne: {
				Snap: {}
			}
		}, {
			hasMany: {
				Crackle: {}
			}
		}, {
			belongsTo: {
				Pop: {}
			}
		}];
		var relationNames = ['hasOne', 'hasMany', 'belongsTo'];
		var objNames = ['Snap', 'Crackle', 'Pop'];
		var queue = [];

		for (var i = 0; i < relationTypes.length; i++) {
			queue.push((function (j) {
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
				Model.relations = relationTypes[j];

				Model.get('5', { with: [objNames[j]] }, function (err) {
					test.equal(err.type, 'RuntimeError');
					test.equal(err.message, 'Model Model defined ' + relationNames[j] + ' relationship to nonexistent ' + objNames[j] + ' Model!');
				});
			})(i));
		}

		Promise.all(queue).finally(function () {
			test.done();
		});
	}
};
