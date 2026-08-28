//tables will be defined here

import { integer, pgTable, varchar,uuid,text,boolean,timestamp } from "drizzle-orm/pg-core";
//first give name of table "users" here then actual columns
export const usersTable = pgTable("users", {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name',{length:45}).notNull(), //here this first_name will be the database name, in our application its firstName in databse its first_name
  lastName:varchar('last_name',{length:45}),
  emailVerified:boolean('email_verified').default(false).notNull(),

  age: integer().notNull(),
  email: varchar({ length: 322 }).notNull().unique(),
  password:varchar('password',{length:66}), //even password is not necessary because google login option
  salt:text('salt'),
  createdAt:timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),


});
