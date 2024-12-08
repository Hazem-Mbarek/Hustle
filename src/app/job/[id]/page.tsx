import { notFound } from "next/navigation";

export default function Profile({ params }: { params: { id: string } }) {
  // Check if the id is greater than 10
  if (parseInt(params.id) > 10) {
    notFound(); 
    return null; 
  }

  return (
    <main>
      <h1>Profile {params.id}</h1>
   
    </main>
  );
}
