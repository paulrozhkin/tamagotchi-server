create table public.menu
(
	id serial not null
		constraint menu_pk
			primary key,
	dish integer not null
		constraint menu_dishes_id_fk
			references public.dishes,
	restaurant integer not null
		constraint menu_restaurants_id_fk
			references public.restaurants,
	price integer not null,
	is_deleted boolean
);

alter table public.menu owner to postgres;

create unique index menu_id_uindex
	on public.menu (id);

