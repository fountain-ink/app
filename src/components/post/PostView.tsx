import { AnyPublication } from "@lens-protocol/react-web";

export const PostView = ({ publication }: { publication: AnyPublication }) => {
	return <div>{publication.id}</div>;
};
