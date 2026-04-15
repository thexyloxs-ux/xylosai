import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'dark' | 'light';

function createThemeStore() {
	const initial: Theme = browser
		? (localStorage.getItem('theme') as Theme) ?? 'dark'
		: 'dark';

	const { subscribe, set } = writable<Theme>(initial);

	return {
		subscribe,
		toggle() {
			const root = document.documentElement;
			const current = root.classList.contains('light') ? 'light' : 'dark';
			const next: Theme = current === 'dark' ? 'light' : 'dark';
			root.classList.remove('dark', 'light');
			root.classList.add(next);
			localStorage.setItem('theme', next);
			set(next);
		},
		set(theme: Theme) {
			if (browser) {
				const root = document.documentElement;
				root.classList.remove('dark', 'light');
				root.classList.add(theme);
				localStorage.setItem('theme', theme);
			}
			set(theme);
		}
	};
}

export const theme = createThemeStore();
