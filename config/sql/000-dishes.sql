create table public.dishes
(
	id serial not null
		constraint dishes_pk
			primary key,
	name text not null,
	photos integer[],
	description text
);

alter table public.dishes owner to postgres;

