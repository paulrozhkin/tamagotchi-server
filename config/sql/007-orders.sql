create table public.orders
(
	id serial not null
		constraint orders_pk
			primary key,
	restaurant integer not null
		constraint orders_restaurants_id_fk
			references public.restaurants,
	client integer
		constraint orders_users_id_fk
			references public.users,
	dishes integer[],
	is_paid boolean not null,
	visit_time daterange not null,
	reserved_tables integer[],
	comment text,
	score integer
		constraint orders_scores_id_fk
			references public.scores
);

alter table public.orders owner to postgres;

