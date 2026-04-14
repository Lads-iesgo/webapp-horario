export default function Header(props: { title: string }) {
	return (
		<header className='sticky top-0 z-30 h-16 bg-blue-100 flex justify-center px-4 lg:px-8 lg:ml-72 lg:w-[calc(100%-18rem)]'>
			<h1 className='text-blue-950 font-bold text-xl lg:text-2xl flex items-center'>
				{props.title}
			</h1>
		</header>
	);
}
