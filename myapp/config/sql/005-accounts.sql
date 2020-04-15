create type roles as enum ('Manager', 'Client', 'Waiter', 'Cook');

alter type roles owner to postgres;

create table public.accounts
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
	is_blocked integer,
	full_name text
);

alter table public.accounts owner to postgres;

create unique index accounts_login_uindex
	on public.accounts (login);

