import { getBaseUrl } from "./getBaseUrl";

const url = getBaseUrl();
export const isDevEnvironment =
	process.env.NODE_ENV === "development" || url.includes("dev.");
export const isProdEnvironment = process.env.NODE_ENV === "production";
export const isTestEnvironment = process.env.NODE_ENV === "test";
