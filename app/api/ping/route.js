// app/api/users/route.js

// Handler untuk method GET
export const GET = async () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
  ];

  return new Response(JSON.stringify(users), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// app/api/users/route.js

// Handler untuk method POST
export const POST = async (request) => {
  // Ambil data dari body request
  const newUser = await request.json();

  // Lakukan sesuatu dengan data, misalnya menyimpannya ke database
  console.log('User baru:', newUser);

  // Kembalikan respons sukses
  return new Response(JSON.stringify({ message: 'User berhasil ditambahkan' }), {
    status: 201, // Status 201 Created
  });
};