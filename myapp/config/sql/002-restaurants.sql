create table public.restaurants
(
	id serial not null
		constraint restaurants_pk
			primary key,
	position_latitude double precision not null,
	position_longitude double precision not null,
	address text not null,
	photos integer[],
	is_parking_present boolean,
	is_card_payment_present boolean,
	is_wifi_present boolean,
	is_deleted boolean
);

alter table public.restaurants owner to postgres;

