create table public.files
(
	id serial not null
		constraint files_pk
			primary key,
	name text,
	extension text not null,
	file_data pg_largeobject
);

alter table public.files owner to postgres;

