create table public.restaurants
(
	id serial not null
		constraint restaurants_pk
			primary key,
	name text not null,
	position_latitude integer not null,
	position_longitude integer not null,
	address text,
	photos integer[],
	is_parking_present boolean,
	is_card_payment_present boolean,
	is_wifi_present boolean
);

alter table public.restaurants owner to postgres;

