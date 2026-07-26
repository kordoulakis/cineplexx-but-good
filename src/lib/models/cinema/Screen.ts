export interface Screen {
	id: number | string;
	seats: number;
	rows?: number;
	screen_m2?: number | null;
	screen_type?: string;
	special: string[];
}
