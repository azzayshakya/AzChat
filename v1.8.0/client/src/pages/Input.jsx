import React from "react";

export function Input() {
  return (
    <div>
      <form action="/submit" method="POST">
        <input type="text" name="username" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
// import React, { useState } from "react";

// export default function Input() {
//   const [username, setUsername] = useState("ajay");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log(username);
//   };

//   return (
//     <>
//       <div>
//         <form action="/submit" method="POST">
//           <input type="text" name="username" />
//           <button type="submit">Submit</button>
//         </form>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />

//           <button type="submit">Submit</button>
//         </form>
//       </div>
//     </>
//   );
// }
