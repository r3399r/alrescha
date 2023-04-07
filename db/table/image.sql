CREATE TABLE image (
	id UUID NOT NULL DEFAULT gen_random_uuid(),
	user_id STRING NOT NULL,
	status STRING NOT NULL,
	predict_id STRING NULL,
	predict_time FLOAT NULL,
	date_created TIMESTAMP NULL,
	date_updated TIMESTAMP NULL,
	PRIMARY KEY (id ASC)
);