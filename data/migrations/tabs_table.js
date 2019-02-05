exports.up = function(knex, Promise) {
  return knex.schema.createTable("tabs", tbl => {
      
    tbl.increments();

    tbl.text("url", 500).notNullable();

    tbl.string("Title", 255).notNullable();

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
