import Table from "@/components/Table";
import NavBar from "@/components/NavBar";
import Header from "@/components/Header";

export default function Home() {
	return (
		<div className='h-screen overflow-hidden'>
			<Header title='Home' />
			<NavBar />
			<main className='h-[calc(100vh-4rem)] lg:ml-72 overflow-hidden bg-gray-100'>
				<Table />
			</main>
		</div>
	);
}
