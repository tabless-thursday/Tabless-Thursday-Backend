exports.up = function(knex, Promise) {
  return knex.schema.createTable("users", tbl => {
    tbl.increments();

	tbl
      .string("name", 255)
    tbl
      .string("username", 255)
      .notNullable()
      .unique();

    tbl
      .string("email", 255)
      .notNullable()
      .unique();

    tbl.string("password", 255).notNullable();

    tbl.string("phone", 255).notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("users");
};
