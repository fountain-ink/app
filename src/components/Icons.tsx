"use client";

import { useTheme } from "next-themes";

export const FountainLogo = () => {
	const { theme } = useTheme();

	if (theme === "dark") {
		return (
			<svg
				width="13"
				height="26"
				viewBox="0 0 13 26"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="Group 5609">
					<title> </title>
					<path
						id="Vector"
						d="M6.6988 0.0039449C6.69828 0.00164082 6.69623 0 6.69387 0C6.69108 0 6.68881 0.00226472 6.68881 0.00505839V11.607C6.68881 12.6297 7.53068 13.6612 7.53068 14.6838C7.53068 15.4684 7.0155 16.1037 6.37915 16.1042C5.7428 16.1037 5.22762 15.4684 5.22762 14.6838C5.22762 13.6612 6.06949 12.6297 6.06949 11.607V0.00505837C6.06949 0.00226491 6.06722 0 6.06443 0C6.06207 0 6.06002 0.0016406 6.05949 0.0039445C4.9655 4.82591 3.15864 9.29141 0.892273 13.5273C0.345305 14.5495 0.308098 15.7608 0.645028 16.8702C0.812838 17.4227 0.957761 18.0075 1.07914 18.6255C1.44968 20.5121 2.99307 22.0257 4.91571 22.0257H7.84258C9.76523 22.0257 11.3086 20.5121 11.6792 18.6255C11.8005 18.0075 11.9455 17.4227 12.1133 16.8702C12.4502 15.7608 12.413 14.5495 11.866 13.5273C9.59966 9.29141 7.79279 4.82591 6.6988 0.0039449Z"
						className="fill-primary"
					/>
					<path
						id="Vector_2"
						d="M10.9188 24.1475C10.9188 24.792 10.3963 25.3145 9.75181 25.3145H3.00687C2.36234 25.3145 1.83984 24.792 1.83984 24.1475C1.83984 23.503 2.36234 22.9805 3.00687 22.9805H9.75181C10.3963 22.9805 10.9188 23.503 10.9188 24.1475Z"
						className="fill-primary"
					/>
				</g>
			</svg>
		);
	}
	return (
		<svg
			width="30"
			height="30"
			viewBox="0 0 30 30"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title> </title>
			<path
				className="fill-primary"
				d="M15.6988 2.00394C15.6983 2.00164 15.6962 2 15.6939 2C15.6911 2 15.6888 2.00226 15.6888 2.00506V13.607C15.6888 14.6297 16.5307 15.6612 16.5307 16.6838C16.5307 17.4684 16.0155 18.1037 15.3791 18.1042C14.7428 18.1037 14.2276 17.4684 14.2276 16.6838C14.2276 15.6612 15.0695 14.6297 15.0695 13.607V2.00506C15.0695 2.00226 15.0672 2 15.0644 2C15.0621 2 15.06 2.00164 15.0595 2.00394C13.9655 6.82591 12.1586 11.2914 9.89227 15.5273C9.34531 16.5495 9.3081 17.7608 9.64503 18.8702C9.81284 19.4227 9.95776 20.0075 10.0791 20.6255C10.4497 22.5121 11.9931 24.0257 13.9157 24.0257H16.8426C18.7652 24.0257 20.3086 22.5121 20.6792 20.6255C20.8005 20.0075 20.9455 19.4227 21.1133 18.8702C21.4502 17.7608 21.413 16.5495 20.866 15.5273C18.5997 11.2914 16.7928 6.82591 15.6988 2.00394Z"
			/>
			<path
				className="fill-primary"
				d="M19.9188 26.1475C19.9188 26.792 19.3963 27.3145 18.7518 27.3145H12.0069C11.3623 27.3145 10.8398 26.792 10.8398 26.1475C10.8398 25.503 11.3623 24.9805 12.0069 24.9805H18.7518C19.3963 24.9805 19.9188 25.503 19.9188 26.1475Z"
			/>
		</svg>
	);
};
