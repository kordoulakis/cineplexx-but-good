export interface Saal {
	id: number | string;
	seats: number;
	rows?: number;
	screen_m2?: number | null;
	screen_type?: string;
	special: string[];
}

export interface CinemaLocation {
	/** URL-friendly id used for the /cinemas/[slug] detail route. For cinemas that
	 *  also appear in the showtime schedule, this matches their key in
	 *  `cinemas` (src/lib/types/types.ts) so the two data sources line up. */
	slug: string;
	name: string;
	address: string;
	notes?: string;
	total_saals?: number;
	saals: Saal[];
}

// Static data for the Cineplexx (and partner) cinemas in Vienna.
export const cinemaLocations: CinemaLocation[] = [
	{
		slug: 'apollo',
		name: 'Apollo – Das Kino',
		address: 'Gumpendorferstraße 63, 1060 Wien',
		saals: [
			{
				id: 1,
				seats: 388,
				screen_m2: 161,
				special: ['IMAX', 'IMAX 3D', 'IMAX Immersive Sound', 'Laser']
			},
			{ id: 2, seats: 279, screen_m2: 90, special: ['RealD 3D', '4K', 'HFR'] },
			{ id: 3, seats: 184, screen_m2: 59, special: ['RealD 3D'] },
			{ id: 4, seats: 70, screen_m2: null, special: [] },
			{ id: 5, seats: 70, screen_m2: null, special: [] },
			{ id: 6, seats: 90, screen_m2: null, special: ['RealD 3D'] },
			{ id: 7, seats: 65, screen_m2: null, special: [] },
			{ id: 8, seats: 68, screen_m2: null, special: [] },
			{ id: 9, seats: 142, screen_m2: null, special: [] },
			{ id: 10, seats: 85, screen_m2: null, special: ['RealD 3D'] },
			{ id: 11, seats: 204, screen_m2: null, special: ['RealD 3D'] },
			{ id: 12, seats: 215, screen_m2: null, special: ['RealD 3D'] }
		]
	},
	{
		slug: 'artis',
		name: 'Artis International',
		address: 'Schultergasse 5, 1010 Wien',
		notes: 'OV-only',
		saals: [
			{
				id: 1,
				seats: 256,
				rows: 16,
				screen_m2: 60,
				special: ['RealD Ultimate Screen', 'JBL Blu Link', '4K', 'HFR', 'RealD 3D']
			},
			{ id: 2, seats: 100, rows: 11, screen_m2: 13, special: ['JBL Blu Link', 'RealD 3D'] },
			{ id: 3, seats: 119, rows: 9, screen_m2: 31, special: ['JBL Blu Link', 'RealD 3D'] },
			{ id: 4, seats: 95, rows: 14, screen_m2: 11, special: ['JBL Blu Link'] },
			{ id: 5, seats: 56, rows: 11, screen_m2: 10, special: ['JBL Blu Link'] }
		]
	},
	{
		slug: 'donauzentrum',
		name: 'Cineplexx Donau Zentrum',
		address: 'Wagramerstraße 79, 1220 Wien',
		total_saals: 13,
		notes: '3 saals data unavailable',
		saals: [
			{
				id: 1,
				seats: 478,
				rows: 16,
				screen_m2: 219,
				special: ['IMAX', 'IMAX 3D', 'IMAX Immersive Sound', 'Laser', 'HFR', 'Cinegold']
			},
			{
				id: 2,
				seats: 390,
				rows: 17,
				screen_m2: 178,
				special: ['4K', 'HFR', 'RealD 3D', 'Dolby Atmos', 'Cinegold']
			},
			{
				id: 3,
				seats: 384,
				rows: 17,
				screen_m2: 123,
				special: ['Dolby Atmos', 'RealD 3D', 'Cinegold']
			},
			{ id: 4, seats: 270, rows: 13, screen_m2: 140, special: ['RealD 3D', 'Cinegold'] },
			{ id: 5, seats: 172, rows: 9, screen_m2: 71, special: ['RealD 3D'] },
			{ id: 6, seats: 154, rows: 11, screen_m2: 41, special: [] },
			{ id: 7, seats: 144, rows: 11, screen_m2: 41, special: [] },
			{ id: 8, seats: 103, rows: 10, screen_m2: 38, special: [] },
			{ id: 9, seats: 88, rows: 8, screen_m2: 34, special: [] },
			{ id: 10, seats: 78, rows: 8, screen_m2: 57, special: ['RealD 3D', 'Cinegold', 'OPERA'] }
		]
	},
	{
		slug: 'millennium',
		name: 'Cineplexx Millennium City',
		address: 'Handelskai, 1200 Wien',
		saals: [
			{
				id: 1,
				seats: 585,
				rows: 23,
				screen_m2: 256,
				special: [
					'RealD Ultimate Screen',
					'RGB Laser',
					'Dolby Atmos',
					'4K',
					'HFR',
					'RealD 3D',
					'Cinegold',
					'Cinegold Deluxe',
					'Cinegold Luxury',
					'Cinegold Lounge'
				]
			},
			{
				id: 2,
				seats: 322,
				rows: 17,
				screen_m2: 167,
				special: ['Dolby Vision', 'Dolby 3D', 'Dolby Atmos', 'Laser', 'Cinegold']
			},
			{
				id: 3,
				seats: 296,
				rows: 18,
				screen_m2: 130,
				special: [
					'RealD Ultimate Screen',
					'Laser',
					'Dolby Atmos',
					'RealD 3D',
					'Cinegold',
					'Cinegold Luxury'
				]
			},
			{ id: 4, seats: 119, rows: 10, screen_m2: 65, special: ['RealD 3D', 'Laser', 'Cinegold'] },
			{ id: 5, seats: 119, rows: 10, screen_m2: 65, special: ['Laser', 'Cinegold'] },
			{ id: 6, seats: 119, rows: 10, screen_m2: 65, special: ['RealD 3D', 'Laser', 'Cinegold'] },
			{ id: 7, seats: 104, rows: 10, screen_m2: 65, special: ['MX4D', 'RealD 3D', 'Laser', 'HFR'] },
			{ id: 8, seats: 135, rows: 10, screen_m2: 65, special: ['RealD 3D', 'Laser', 'Cinegold'] },
			{
				id: 9,
				seats: 178,
				rows: 15,
				screen_m2: 70,
				special: ['RealD 3D', 'Laser', 'Cinegold', 'Cinegold Luxury', 'OPERA']
			},
			{
				id: 10,
				seats: 178,
				rows: 15,
				screen_m2: 70,
				special: ['RealD 3D', 'Laser', 'Cinegold', 'Cinegold Luxury']
			},
			{
				id: 11,
				seats: 178,
				rows: 15,
				screen_m2: 70,
				special: ['RealD 3D', 'Laser', 'Cinegold', 'Cinegold Luxury']
			},
			{
				id: 12,
				seats: 178,
				rows: 15,
				screen_m2: 70,
				special: ['Laser', 'Cinegold', 'Cinegold Luxury']
			},
			{ id: 13, seats: 135, rows: 10, screen_m2: 65, special: ['Laser', 'Cinegold'] }
		]
	},
	{
		slug: 'auhof',
		name: 'Cineplexx Wien Auhof',
		address: 'Albert-Schweitzer-Gasse 6, 1140 Wien',
		saals: [
			{ id: 1, seats: 277, rows: 16, screen_m2: 92, special: ['RealD 3D'] },
			{ id: 2, seats: 261, rows: 15, screen_m2: 81, special: ['RealD 3D'] },
			{ id: 3, seats: 155, rows: 10, screen_m2: 41, special: ['RealD 3D'] },
			{ id: 4, seats: 155, rows: 10, screen_m2: 41, special: [] },
			{ id: 5, seats: 148, rows: 13, screen_m2: 33, special: ['RealD 3D'] },
			{ id: 6, seats: 148, rows: 13, screen_m2: 33, special: [] },
			{ id: 7, seats: 142, rows: 12, screen_m2: 36, special: [] }
		]
	},
	{
		slug: 'wienerberg',
		name: 'Cineplexx Wienerberg',
		address: 'Wienerbergstraße 11, 1100 Wien',
		saals: [
			{
				id: 1,
				seats: 339,
				rows: 15,
				screen_m2: 164,
				special: [
					'RealD Ultimate Screen',
					'RGB Laser',
					'Dolby Atmos',
					'4K',
					'HFR',
					'RealD 3D',
					'Cinegold',
					'Cinegold Luxury',
					'Cinegold Lounge'
				]
			},
			{
				id: 2,
				seats: 219,
				rows: 10,
				screen_m2: 65,
				special: ['RealD Ultimate Screen', 'Cinegold']
			},
			{
				id: 3,
				seats: 218,
				rows: 11,
				screen_m2: 89,
				special: ['OPERA', 'JBL Blu Link', 'RealD 3D', 'Cinegold', 'Cinegold Luxury']
			},
			{
				id: 4,
				seats: 205,
				rows: 10,
				screen_m2: 119,
				special: ['JBL Blu Link', 'RealD 3D', 'Cinegold', 'Cinegold Luxury']
			},
			{
				id: 5,
				seats: 196,
				rows: 10,
				screen_m2: 91,
				special: ['JBL Blu Link', 'Cinegold', 'Cinegold Luxury']
			},
			{
				id: 6,
				seats: 193,
				rows: 12,
				screen_m2: 55,
				screen_type: 'LED',
				special: ['Onyx Cinema LED', 'Dolby Atmos', 'Cinegold']
			},
			{ id: 7, seats: 147, rows: 8, screen_m2: 70, special: ['Cinegold'] },
			{ id: 8, seats: 129, rows: 7, screen_m2: 78, special: ['Cinegold'] },
			{
				id: 9,
				seats: 127,
				rows: 8,
				screen_m2: 52,
				special: ['JBL Blu Link', 'RealD 3D', 'Cinegold']
			},
			{ id: 10, seats: 125, rows: 8, screen_m2: 50, special: ['Cinegold'] }
		]
	},
	{
		slug: 'urania',
		name: 'Urania Kino',
		address: 'Uraniastraße 1, 1010 Wien',
		notes: 'Single-screen arthouse, cultural/documentary focus',
		saals: [{ id: 'Großer Saal', seats: 268, rows: 11, screen_m2: 36, special: [] }]
	},
	{
		slug: 'village',
		name: 'Village Cinema Wien Mitte',
		address: 'Landstraßer Hauptstraße 2a, 1030 Wien',
		notes: 'Screen sizes for Säle 1-9 not published',
		saals: [
			{ id: 1, seats: 117, screen_m2: null, special: ['RealD 3D', 'Laser', 'HFR'] },
			{ id: 2, seats: 123, screen_m2: null, special: ['RealD 3D', 'Laser', 'HFR'] },
			{ id: 3, seats: 123, screen_m2: null, special: ['Laser', 'HFR'] },
			{ id: 4, seats: 117, screen_m2: null, special: ['4K', 'Laser', 'HFR'] },
			{ id: 5, seats: 367, screen_m2: null, special: ['4K', 'RealD 3D', 'Laser', 'HFR'] },
			{ id: 6, seats: 117, screen_m2: null, special: ['Laser', 'HFR'] },
			{ id: 7, seats: 123, screen_m2: null, special: ['RealD 3D', 'Laser', 'HFR'] },
			{ id: 8, seats: 123, screen_m2: null, special: ['RealD 3D', 'Laser', 'HFR'] },
			{ id: 9, seats: 117, screen_m2: null, special: ['Laser', 'HFR'] },
			{
				id: 'Dolby Cinema',
				seats: 287,
				rows: 16,
				screen_m2: 101,
				special: ['Dolby Vision', 'Dolby 3D', 'Dolby Atmos', 'Laser', '4K', 'HFR', 'Cinegold']
			}
		]
	}
];

/** Look up a single cinema by its URL slug (used by the /cinemas/[slug] route). */
export function getCinemaBySlug(slug: string): CinemaLocation | undefined {
	return cinemaLocations.find((c) => c.slug === slug);
}
