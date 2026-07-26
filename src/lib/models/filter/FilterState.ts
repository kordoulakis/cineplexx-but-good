import type { ViewMode } from './ViewMode';

export interface FilterState {
	date: string;
	cinemas: string[];
	techs: string[];
	showOnlyOv: boolean;
	query: string;
	view: ViewMode;
}
