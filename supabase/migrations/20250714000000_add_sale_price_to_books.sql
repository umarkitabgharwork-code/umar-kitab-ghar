-- Optional discounted sale price for books (original price remains in books.price)
ALTER TABLE books
ADD COLUMN IF NOT EXISTS sale_price numeric NULL;
