/*jshint loopfunc:true*/

var reheat = require('../../../build/instrument/lib/'),
	errors = require('../../../build/instrument/lib/support/errors'),
	support = require('../../support/support'),
	Connection = require('../../../build/instrument/lib/connection');

exports.index = {
	defineModel: function (test) {
		test.expect(141);
		var connection = new Connection();

		//name of model must be a string
		for (var i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel(support.TYPES_EXCEPT_STRING[i], {
						connection: connection
					});
				},
				errors.IllegalArgumentError
			);
		}

		//defining an already existing model should throw an error
		reheat.defineModel('Dummy', {
			connection: connection
		});
		test.throws(
			function () {
				reheat.defineModel('Dummy', {
					connection: connection
				});
			},
			errors.RuntimeError
		);
		//this Dummy model will be used in later tests

		//staticProps tests
		for (i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						idAttribute: support.TYPES_EXCEPT_STRING[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		for (i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						tableName: support.TYPES_EXCEPT_STRING[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		for (i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						timestamps: support.TYPES_EXCEPT_BOOLEAN[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		for (i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						softDelete: support.TYPES_EXCEPT_BOOLEAN[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		for (i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						connection: connection,
						relations: support.TYPES_EXCEPT_OBJECT[i]
					});
				},
				errors.IllegalArgumentError
			);
		}

		//hasOne must be an object
		for (i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						connection: connection,
						relations: {
							hasOne: support.TYPES_EXCEPT_OBJECT[i]
						}
					});
				},
				errors.IllegalArgumentError
			);
		}

		//hasMany must be an object
		for (i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						connection: connection,
						relations: {
							hasMany: support.TYPES_EXCEPT_OBJECT[i]
						}
					});
				},
				errors.IllegalArgumentError
			);
		}

		//belongsTo must be an object
		for (i = 0; i < support.TYPES_EXCEPT_OBJECT.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						connection: connection,
						relations: {
							belongsTo: support.TYPES_EXCEPT_OBJECT[i]
						}
					});
				},
				errors.IllegalArgumentError
			);
		}

		//localField for hasOne must be a string
		for (i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						connection: connection,
						relations: {
							hasOne: {
								Dummy: {
									localField: support.TYPES_EXCEPT_STRING[i]
								}
							}
						}
					});
				},
				errors.IllegalArgumentError
			);
		}

		//foreignKey for hasOne must be a string
		for (i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						connection: connection,
						relations: {
							hasOne: {
								Dummy: {
									foreignKey: support.TYPES_EXCEPT_STRING[i]
								}
							}
						}
					});
				},
				errors.IllegalArgumentError
			);
		}

		//if localField or foreignKey is not provided for hasOne, it must be populated with default name
		test.doesNotThrow(
			function () {
				reheat.defineModel('Post', {
					connection: connection,
					relations: {
						hasOne: {
							Dummy: {}
						}
					}
				});
			}
		);
		//TODO: test the names for spec
		reheat.unregisterModel('Post');

		//localField for belongsTo must be a string
		for (i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						connection: connection,
						relations: {
							belongsTo: {
								Dummy: {
									localField: support.TYPES_EXCEPT_STRING[i]
								}
							}
						}
					});
				},
				errors.IllegalArgumentError
			);
		}

		//localKey for belongsTo must be a string
		for (i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						connection: connection,
						relations: {
							belongsTo: {
								Dummy: {
									localKey: support.TYPES_EXCEPT_STRING[i]
								}
							}
						}
					});
				},
				errors.IllegalArgumentError
			);
		}

		//if localField or localKey is not provided for belongsTo, it must be populated with default name
		test.doesNotThrow(
			function () {
				reheat.defineModel('Post', {
					connection: connection,
					relations: {
						belongsTo: {
							Dummy: {}
						}
					}
				});
			}
		);
		//TODO: test the names for spec
		reheat.unregisterModel('Post');

		//localField for hasMany must be a string
		for (i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						connection: connection,
						relations: {
							hasMany: {
								Dummy: {
									localField: support.TYPES_EXCEPT_STRING[i]
								}
							}
						}
					});
				},
				errors.IllegalArgumentError
			);
		}

		//foreignKey for hasMany must be a string
		for (i = 0; i < support.TYPES_EXCEPT_STRING.length; i++) {
			test.throws(
				function () {
					reheat.defineModel('Post', {
						connection: connection,
						relations: {
							hasMany: {
								Dummy: {
									foreignKey: support.TYPES_EXCEPT_STRING[i]
								}
							}
						}
					});
				},
				errors.IllegalArgumentError
			);
		}

		//if localField or foreignKey is not provided for hasMany, it must be populated with default name
		test.doesNotThrow(
			function () {
				reheat.defineModel('Post', {
					connection: connection,
					relations: {
						hasMany: {
							Dummy: {}
						}
					}
				});
			}
		);
		//TODO: test the names for spec
		reheat.unregisterModel('Post');

		test.throws(
			function () {
				reheat.defineModel('Post', {});
			},
			errors.IllegalArgumentError
		);

		for (i = 0; i < support.TYPES_EXCEPT_BOOLEAN.length; i++) {
			if (!support.TYPES_EXCEPT_BOOLEAN[i]) {
				continue;
			}
			test.throws(
				function () {
					reheat.defineModel('Post', {
						schema: support.TYPES_EXCEPT_BOOLEAN[i],
						connection: connection
					});
				},
				errors.IllegalArgumentError
			);
		}
		test.doesNotThrow(
			function () {
				reheat.defineModel('Post', {
					connection: connection
				});
			}
		);


		reheat.unregisterModel('Dummy');
		reheat.unregisterModel('Post');

		connection.drain();
		test.done();
	}
};
