CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"genre" text NOT NULL,
	"isbn" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "books_isbn_unique" UNIQUE("isbn")
);
--> statement-breakpoint
CREATE TABLE "patrons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact_details" text NOT NULL,
	"membership_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patrons_membership_id_unique" UNIQUE("membership_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" serial NOT NULL,
	"patron_id" serial NOT NULL,
	"loan_date" timestamp NOT NULL,
	"return_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_patron_id_patrons_id_fk" FOREIGN KEY ("patron_id") REFERENCES "public"."patrons"("id") ON DELETE no action ON UPDATE no action;