export interface SocialLink {
	id?: number;
	name: string;
	link: string;
	iconLight: string;
	iconDark: string;
}

export interface Friend {
	id: number;
	name: string;
	image: string;
	description: string;
	pinned: boolean;
	socialLinks: SocialLink[];
	createdAt: Date;
	updatedAt: Date;
}

export interface Pic {
	id: number;
	title: string;
	src: string;
	button?: string | null;
	link?: string | null;
	newTab?: boolean;
}

export interface Project {
	id: number;
	name: string;
	description: string;
	link: string;
	iconLight: string;
	iconDark: string;
}
