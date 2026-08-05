CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" serial NOT NULL,
	"patron_id" serial NOT NULL,
	"rating" serial NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_patron_id_patrons_id_fk" FOREIGN KEY ("patron_id") REFERENCES "public"."patrons"("id") ON DELETE no action ON UPDATE no action;