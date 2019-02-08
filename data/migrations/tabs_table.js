exports.up = function(knex, Promise) {
  return knex.schema.createTable("tabs", tbl => {

    tbl.increments();

    tbl.string("url", 500).notNullable();

    tbl.string("category", 255).notNullable();

    tbl.string("importance", 255);

    tbl
      .string("Creator")
      .unsigned()
      .notNullable()
      .references("username")
      .inTable("users");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("tabs");
};
