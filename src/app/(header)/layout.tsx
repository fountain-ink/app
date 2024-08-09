import { Header } from "@/components/Header";

const HeaderLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Header />
			{children}
		</>
	);
};

export default HeaderLayout;
