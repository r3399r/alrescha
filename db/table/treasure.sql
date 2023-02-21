CREATE TABLE treasure (
	id UUID NOT NULL DEFAULT gen_random_uuid(),
	user_id STRING NOT NULL,
	display_name STRING NOT NULL,
	stage FLOAT NOT NULL,
	status STRING NOT NULL,
	date_created TIMESTAMP NULL,
	date_updated TIMESTAMP NULL,
	PRIMARY KEY (id ASC)
);