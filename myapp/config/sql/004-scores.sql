create table public.scores
(
	id serial not null
		constraint scores_pk
			primary key,
	payment_amount money
);

alter table public.scores owner to postgres;

