CREATE TABLE "user" (
	id STRING NOT NULL,
	name STRING NOT NULL,
	quota FLOAT NOT NULL,
	codeformer_fidelity FLOAT NOT NULL,
	background_enhance BOOLEAN NOT NULL,
	face_upsample BOOLEAN NOT NULL,
	upscale FLOAT NOT NULL,
	date_created TIMESTAMP NULL,
	date_updated TIMESTAMP NULL,
	PRIMARY KEY (id ASC)
);