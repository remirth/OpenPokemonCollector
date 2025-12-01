CREATE TYPE "public"."entity_kind_enum" AS ENUM('pokemon', 'energy', 'trainer');--> statement-breakpoint
CREATE TABLE "artists" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "artists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	CONSTRAINT "artists_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"externalId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"set_id" integer NOT NULL,
	"artist_id" integer,
	"rarity_id" integer,
	"number_in_set" varchar(255),
	"image_url" varchar(255),
	"image_large_url" varchar(255),
	CONSTRAINT "cards_externalId_unique" UNIQUE("externalId")
);
--> statement-breakpoint
CREATE TABLE "collection_entries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "collection_entries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"collection_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"quantity" integer DEFAULT 1,
	"created_at" date DEFAULT now(),
	"updated_at" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "collections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"updated_at" date DEFAULT now(),
	"created_at" date DEFAULT now(),
	"active" boolean DEFAULT true,
	CONSTRAINT "collections_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "entity_relations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "entity_relations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"entity_id" integer NOT NULL,
	"card_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "entities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"evolves_from" varchar(255),
	"evolves_to" text[],
	"entity_kind" "entity_kind_enum" NOT NULL,
	"pokedex_number" integer,
	"image_url" varchar(255),
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('simple', coalesce("entities"."name", '')), 'A')) STORED,
	CONSTRAINT "entities_name_unique" UNIQUE("name"),
	CONSTRAINT "entities_slug_unique" UNIQUE("slug"),
	CONSTRAINT "entities_pokedex_number_unique" UNIQUE("pokedex_number")
);
--> statement-breakpoint
CREATE TABLE "rarities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rarities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	CONSTRAINT "rarities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"series" varchar(255) NOT NULL,
	"total" integer NOT NULL,
	"printed_total" integer NOT NULL,
	"ptcgo_code" varchar(255),
	"release_date" date NOT NULL,
	"updated_at" date NOT NULL,
	"image_symbol" varchar(255) NOT NULL,
	"image_logo" varchar(255) NOT NULL,
	"external_id" varchar(255) NOT NULL,
	CONSTRAINT "sets_name_unique" UNIQUE("name"),
	CONSTRAINT "sets_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "subtypes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subtypes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"entity_kind" "entity_kind_enum" NOT NULL,
	CONSTRAINT "subtypes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "subtype_relations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subtype_relations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"subtype_id" integer NOT NULL,
	"card_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "type_relations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "type_relations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type_id" integer NOT NULL,
	"card_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	CONSTRAINT "types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_set_id_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_rarity_id_rarities_id_fk" FOREIGN KEY ("rarity_id") REFERENCES "public"."rarities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_entries" ADD CONSTRAINT "collection_entries_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_entries" ADD CONSTRAINT "collection_entries_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_relations" ADD CONSTRAINT "entity_relations_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_relations" ADD CONSTRAINT "entity_relations_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtype_relations" ADD CONSTRAINT "subtype_relations_subtype_id_subtypes_id_fk" FOREIGN KEY ("subtype_id") REFERENCES "public"."subtypes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtype_relations" ADD CONSTRAINT "subtype_relations_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type_relations" ADD CONSTRAINT "type_relations_type_id_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type_relations" ADD CONSTRAINT "type_relations_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "artists_name_idx" ON "artists" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "card_external_idx" ON "cards" USING btree ("externalId");--> statement-breakpoint
CREATE INDEX "card_rarity_idx" ON "cards" USING btree ("rarity_id");--> statement-breakpoint
CREATE INDEX "card_set_idx" ON "cards" USING btree ("set_id");--> statement-breakpoint
CREATE INDEX "card_artist_idx" ON "cards" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "collection_entry_idx" ON "collection_entries" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "collection_entry_card_idx" ON "collection_entries" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "collection_quantity_idx" ON "collection_entries" USING btree ("quantity");--> statement-breakpoint
CREATE INDEX "collection_entry_updated_idx" ON "collection_entries" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "collection_entry_created_idx" ON "collection_entries" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_name_idx" ON "collections" USING btree ("name");--> statement-breakpoint
CREATE INDEX "collections_updated_idx" ON "collections" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "collections_created_idx" ON "collections" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_relation_idx" ON "entity_relations" USING btree ("card_id","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_name_idx" ON "entities" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_slug_idx" ON "entities" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_pokedex_idx" ON "entities" USING btree ("pokedex_number");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_pokedex_name_idx" ON "entities" USING btree ("pokedex_number","name");--> statement-breakpoint
CREATE INDEX "entity_kind_idx" ON "entities" USING btree ("entity_kind");--> statement-breakpoint
CREATE INDEX "entity_search_idx" ON "entities" USING gin ("search");--> statement-breakpoint
CREATE UNIQUE INDEX "rarities_name_idx" ON "rarities" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "sets_name_idx" ON "sets" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "sets_external_idx" ON "sets" USING btree ("external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subtypes_name_idx" ON "subtypes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "subtype_kind_idx" ON "subtypes" USING btree ("entity_kind");--> statement-breakpoint
CREATE UNIQUE INDEX "subtype_relation_idx" ON "subtype_relations" USING btree ("card_id","subtype_id");--> statement-breakpoint
CREATE UNIQUE INDEX "type_relation_idx" ON "type_relations" USING btree ("card_id","type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "types_name_idx" ON "types" USING btree ("name");