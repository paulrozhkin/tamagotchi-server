create type roles as enum ('Manager', 'Client', 'Waiter', 'Cook');

alter type roles owner to postgres;

create table public.users
(
	id serial not null
		constraint users_pk
			primary key,
	login text not null,
	password text not null,
	role roles default 'Client'::roles not null,
	avatar integer
		constraint users_files_id_fk
			references public.files,
	is_blocked boolean,
	full_name text
);

alter table public.users owner to postgres;

create unique index users_login_uindex
	on public.users (login);

