import { db, schema } from '@nuxthub/db'

export default defineTask({
  meta: {
    name: 'db:seed-large',
    description: 'Seed database with a larger set of books, patrons, and transactions'
  },
  async run() {
    console.log('Seeding database with expanded dataset...')

    // 1. Seed books
    const books = [
      {
        title: '1984',
        author: 'George Orwell',
        genre: 'Dystopian',
        isbn: '9780451524935',
        createdAt: new Date()
      },
      {
        title: 'Brave New World',
        author: 'Aldous Huxley',
        genre: 'Dystopian',
        isbn: '9780060850524',
        createdAt: new Date()
      },
      {
        title: 'The Name of the Wind',
        author: 'Patrick Rothfuss',
        genre: 'Fantasy',
        isbn: '9780756404741',
        createdAt: new Date()
      },
      {
        title: 'Mistborn: The Final Empire',
        author: 'Brandon Sanderson',
        genre: 'Fantasy',
        isbn: '9780765311788',
        createdAt: new Date()
      },
      {
        title: 'Foundation',
        author: 'Isaac Asimov',
        genre: 'Science Fiction',
        isbn: '9780553293357',
        createdAt: new Date()
      },
      {
        title: 'Neuromancer',
        author: 'William Gibson',
        genre: 'Science Fiction',
        isbn: '9780441569595',
        createdAt: new Date()
      },
      {
        title: 'Gone Girl',
        author: 'Gillian Flynn',
        genre: 'Mystery',
        isbn: '9780307588364',
        createdAt: new Date()
      },
      {
        title: 'The Girl with the Dragon Tattoo',
        author: 'Stieg Larsson',
        genre: 'Mystery',
        isbn: '9780307949486',
        createdAt: new Date()
      },
      {
        title: 'Big Little Lies',
        author: 'Liane Moriarty',
        genre: 'Thriller',
        isbn: '9780425274866',
        createdAt: new Date()
      },
      {
        title: 'The Silent Wife',
        author: 'A.S.A. Harrison',
        genre: 'Thriller',
        isbn: '9780143124588',
        createdAt: new Date()
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        genre: 'Nonfiction',
        isbn: '9780062316097',
        createdAt: new Date()
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        genre: 'Self-Help',
        isbn: '9780735211292',
        createdAt: new Date()
      },
      {
        title: 'Born a Crime',
        author: 'Trevor Noah',
        genre: 'Memoir',
        isbn: '9780399588174',
        createdAt: new Date()
      },
      {
        title: 'Untamed',
        author: 'Glennon Doyle',
        genre: 'Memoir',
        isbn: '9781984801258',
        createdAt: new Date()
      },
      {
        title: 'The Song of Achilles',
        author: 'Madeline Miller',
        genre: 'Historical Fiction',
        isbn: '9780062060624',
        createdAt: new Date()
      },
      {
        title: 'All the Light We Cannot See',
        author: 'Anthony Doerr',
        genre: 'Historical Fiction',
        isbn: '9781501173219',
        createdAt: new Date()
      },
      {
        title: 'The Martian',
        author: 'Andy Weir',
        genre: 'Science Fiction',
        isbn: '9780553418026',
        createdAt: new Date()
      },
      {
        title: 'Circe',
        author: 'Madeline Miller',
        genre: 'Fantasy',
        isbn: '9780316556347',
        createdAt: new Date()
      },
      {
        title: 'The Thursday Murder Club',
        author: 'Richard Osman',
        genre: 'Mystery',
        isbn: '9781984880986',
        createdAt: new Date()
      },
      {
        title: 'Where the Crawdads Sing',
        author: 'Delia Owens',
        genre: 'Fiction',
        isbn: '9780735219090',
        createdAt: new Date()
      }
    ]

    const insertedBooks = await db.insert(schema.books).values(books).returning()

    // 2. Seed patrons
    const patrons = [
      {
        name: 'Hana Suzuki',
        contactDetails: 'hana.suzuki@example.com',
        membershipId: 'MEM-1001',
        createdAt: new Date()
      },
      {
        name: 'Liam O\'Connor',
        contactDetails: 'liam.oconnor@example.com',
        membershipId: 'MEM-1002',
        createdAt: new Date()
      },
      {
        name: 'Fatima Al-Sayed',
        contactDetails: 'fatima.alsayed@example.com',
        membershipId: 'MEM-1003',
        createdAt: new Date()
      },
      {
        name: 'Noah Kim',
        contactDetails: 'noah.kim@example.com',
        membershipId: 'MEM-1004',
        createdAt: new Date()
      },
      {
        name: 'Isabella Rossi',
        contactDetails: 'isabella.rossi@example.com',
        membershipId: 'MEM-1005',
        createdAt: new Date()
      },
      {
        name: 'Ethan Walker',
        contactDetails: 'ethan.walker@example.com',
        membershipId: 'MEM-1006',
        createdAt: new Date()
      },
      {
        name: 'Sofia Petrova',
        contactDetails: 'sofia.petrova@example.com',
        membershipId: 'MEM-1007',
        createdAt: new Date()
      },
      {
        name: 'Kwame Mensah',
        contactDetails: 'kwame.mensah@example.com',
        membershipId: 'MEM-1008',
        createdAt: new Date()
      },
      {
        name: 'Mei Lin Chua',
        contactDetails: 'meilin.chua@example.com',
        membershipId: 'MEM-1009',
        createdAt: new Date()
      },
      {
        name: 'Rajesh Gupta',
        contactDetails: 'rajesh.gupta@example.com',
        membershipId: 'MEM-1010',
        createdAt: new Date()
      },
      {
        name: 'Zainab Hussain',
        contactDetails: 'zainab.hussain@example.com',
        membershipId: 'MEM-1011',
        createdAt: new Date()
      },
      {
        name: 'Carlos Mendoza',
        contactDetails: 'carlos.mendoza@example.com',
        membershipId: 'MEM-1012',
        createdAt: new Date()
      }
    ]

    const insertedPatrons = await db.insert(schema.patrons).values(patrons).returning()

    // 3. Seed transactions (a mix of returned and still-on-loan records)
    const now = Date.now()
    const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000)

    const transactions = [
      { bookId: insertedBooks[0]!.id, patronId: insertedPatrons[0]!.id, loanDate: daysAgo(45), returnDate: daysAgo(31), createdAt: daysAgo(45) },
      { bookId: insertedBooks[1]!.id, patronId: insertedPatrons[1]!.id, loanDate: daysAgo(40), returnDate: daysAgo(26), createdAt: daysAgo(40) },
      { bookId: insertedBooks[2]!.id, patronId: insertedPatrons[2]!.id, loanDate: daysAgo(38), returnDate: daysAgo(24), createdAt: daysAgo(38) },
      { bookId: insertedBooks[3]!.id, patronId: insertedPatrons[3]!.id, loanDate: daysAgo(35), returnDate: daysAgo(20), createdAt: daysAgo(35) },
      { bookId: insertedBooks[4]!.id, patronId: insertedPatrons[4]!.id, loanDate: daysAgo(33), returnDate: daysAgo(19), createdAt: daysAgo(33) },
      { bookId: insertedBooks[5]!.id, patronId: insertedPatrons[5]!.id, loanDate: daysAgo(30), returnDate: daysAgo(16), createdAt: daysAgo(30) },
      { bookId: insertedBooks[6]!.id, patronId: insertedPatrons[6]!.id, loanDate: daysAgo(29), returnDate: daysAgo(15), createdAt: daysAgo(29) },
      { bookId: insertedBooks[7]!.id, patronId: insertedPatrons[7]!.id, loanDate: daysAgo(27), returnDate: daysAgo(13), createdAt: daysAgo(27) },
      { bookId: insertedBooks[8]!.id, patronId: insertedPatrons[8]!.id, loanDate: daysAgo(25), returnDate: daysAgo(11), createdAt: daysAgo(25) },
      { bookId: insertedBooks[9]!.id, patronId: insertedPatrons[9]!.id, loanDate: daysAgo(24), returnDate: daysAgo(10), createdAt: daysAgo(24) },
      { bookId: insertedBooks[10]!.id, patronId: insertedPatrons[10]!.id, loanDate: daysAgo(22), returnDate: daysAgo(8), createdAt: daysAgo(22) },
      { bookId: insertedBooks[11]!.id, patronId: insertedPatrons[11]!.id, loanDate: daysAgo(21), returnDate: daysAgo(7), createdAt: daysAgo(21) },
      { bookId: insertedBooks[12]!.id, patronId: insertedPatrons[0]!.id, loanDate: daysAgo(19), returnDate: daysAgo(5), createdAt: daysAgo(19) },
      { bookId: insertedBooks[13]!.id, patronId: insertedPatrons[1]!.id, loanDate: daysAgo(18), returnDate: daysAgo(4), createdAt: daysAgo(18) },
      { bookId: insertedBooks[14]!.id, patronId: insertedPatrons[2]!.id, loanDate: daysAgo(17), returnDate: null, createdAt: daysAgo(17) },
      { bookId: insertedBooks[15]!.id, patronId: insertedPatrons[3]!.id, loanDate: daysAgo(16), returnDate: null, createdAt: daysAgo(16) },
      { bookId: insertedBooks[16]!.id, patronId: insertedPatrons[4]!.id, loanDate: daysAgo(15), returnDate: null, createdAt: daysAgo(15) },
      { bookId: insertedBooks[17]!.id, patronId: insertedPatrons[5]!.id, loanDate: daysAgo(12), returnDate: null, createdAt: daysAgo(12) },
      { bookId: insertedBooks[18]!.id, patronId: insertedPatrons[6]!.id, loanDate: daysAgo(10), returnDate: null, createdAt: daysAgo(10) },
      { bookId: insertedBooks[19]!.id, patronId: insertedPatrons[7]!.id, loanDate: daysAgo(9), returnDate: null, createdAt: daysAgo(9) },
      { bookId: insertedBooks[0]!.id, patronId: insertedPatrons[8]!.id, loanDate: daysAgo(8), returnDate: null, createdAt: daysAgo(8) },
      { bookId: insertedBooks[2]!.id, patronId: insertedPatrons[9]!.id, loanDate: daysAgo(7), returnDate: null, createdAt: daysAgo(7) },
      { bookId: insertedBooks[4]!.id, patronId: insertedPatrons[10]!.id, loanDate: daysAgo(6), returnDate: null, createdAt: daysAgo(6) },
      { bookId: insertedBooks[6]!.id, patronId: insertedPatrons[11]!.id, loanDate: daysAgo(4), returnDate: null, createdAt: daysAgo(4) },
      { bookId: insertedBooks[8]!.id, patronId: insertedPatrons[0]!.id, loanDate: daysAgo(3), returnDate: null, createdAt: daysAgo(3) },
      { bookId: insertedBooks[10]!.id, patronId: insertedPatrons[1]!.id, loanDate: daysAgo(2), returnDate: null, createdAt: daysAgo(2) },
      { bookId: insertedBooks[12]!.id, patronId: insertedPatrons[2]!.id, loanDate: daysAgo(2), returnDate: null, createdAt: daysAgo(2) },
      { bookId: insertedBooks[14]!.id, patronId: insertedPatrons[3]!.id, loanDate: daysAgo(1), returnDate: null, createdAt: daysAgo(1) },
      { bookId: insertedBooks[16]!.id, patronId: insertedPatrons[4]!.id, loanDate: daysAgo(1), returnDate: null, createdAt: daysAgo(1) },
      { bookId: insertedBooks[18]!.id, patronId: insertedPatrons[5]!.id, loanDate: daysAgo(0), returnDate: null, createdAt: daysAgo(0) }
    ]

    await db.insert(schema.transactions).values(transactions)

    return { result: 'Database seeded successfully with expanded dataset' }
  }
})
