create table restaurant_tables
(
	id serial
		constraint restaurant_tables_pk
			primary key,
	name text,
	description text,
	restaurant int not null
		constraint restaurant_tables_restaurants_id_fk
			references restaurants,
	photos int[],
	number_of_places int not null,
	is_deleted boolean
);

alter table public.restaurant_tables owner to postgres;