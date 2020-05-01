create table public.files
(
	id serial not null
		constraint files_pk
			primary key,
	name text not null,
	type text not null,
	path text not null
);

alter table public.files owner to postgres;

