import FormButton from "./FromButton";
import ButtonCadastro from "./ButtonCadastro";

import { FormCadastroProps } from "../interfaces/types";

export default function FormCadastro({
	children,
	onSubmit,
}: FormCadastroProps) {
	return (
		<div className='flex items-center justify-center min-h-screen ml-0 lg:ml-72 px-4'>
			<div className='w-full max-w-sm sm:max-w-md lg:max-w-lg px-2 sm:px-4'>
				<form
					onSubmit={onSubmit}
					className='w-full flex flex-col items-center mb-4'
				>
					{children}

					<FormButton>
						<ButtonCadastro
							text='Voltar'
							bgColor='bg-white hover:bg-gray-200'
							textColor='text-black'
							style='border-2'
						/>
						<ButtonCadastro text='Cadastrar' />
					</FormButton>
				</form>
			</div>
		</div>
	);
}
