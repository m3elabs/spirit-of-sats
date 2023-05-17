import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  const token = request.cookies.get('token')
  console.log(request.url)
//   if (request.url === "http://localhost:3000/" && token?.value !== "" && token?.value !== undefined ) {
//     return NextResponse.redirect(new URL("/chat", request.url));
//   }
//   if (request.url === "http://localhost:3000/chat") {
//     if (token?.value === "" || token?.value === undefined) {
//       return NextResponse.redirect(new URL("/", request.url));
//     } else {
//         return NextResponse.next();
//     }
 
//   }


  if (request.url === "https://spirit-0f-satoshi.vercel.app/" && token?.value !== "" && token?.value !== undefined ) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }
  if (request.url === "https://spirit-0f-satoshi.vercel.app/chat") {
    if (token.value === "" || token.value === undefined) {
      return NextResponse.redirect(new URL("/", request.url));
    } else {
        return NextResponse.next();
    }
 
  }
}

// See "Matching Paths" below to learn more

